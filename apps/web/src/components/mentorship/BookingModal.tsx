'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { format, addDays, isSameDay, parse } from 'date-fns';
import { apiClient } from '@/lib/api-client';

interface BookingModalProps {
  mentorId: string;
  mentorName: string;
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
  children: React.ReactNode;
}

export function BookingModal({ mentorId, mentorName, availability, children }: BookingModalProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate available slots for the selected date
  const getAvailableSlots = (selectedDate: Date) => {
      if (!availability) return [];
      const dayOfWeek = selectedDate.getDay();
      const dayConfig = availability.find(a => a.dayOfWeek === dayOfWeek);
      
      if (!dayConfig) return [];

      const slots = [];
      let current = parse(dayConfig.startTime, 'HH:mm', selectedDate);
      const end = parse(dayConfig.endTime, 'HH:mm', selectedDate);

      while (current < end) {
          slots.push(format(current, 'HH:mm'));
          // Add 30 mins
          current = new Date(current.getTime() + 30 * 60000);
      }
      return slots;
  };

  const slots = date ? getAvailableSlots(date) : [];

  const handleBook = async () => {
    if (!date || !selectedSlot) return;

    setLoading(true);
    try {
        // Construct start and end time
        const startTime = parse(selectedSlot, 'HH:mm', date);
        const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 min session

        const res = await apiClient('/mentorship/sessions', {
            method: 'POST',
            body: JSON.stringify({
                mentorId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                notes
            })
        });

        if (res.ok) {
            toast.success('Session booked successfully!');
            setOpen(false);
        } else {
            const err = await res.json();
            toast.error(err.message || 'Failed to book session');
        }
    } catch (error) {
        toast.error('Something went wrong');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book a Session with {mentorName}</DialogTitle>
          <DialogDescription>
            Choose a time slot for your mentorship session.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
            <div className="space-y-2">
                <Label>Select Date</Label>
                <div className="border rounded-md p-2 flex gap-2 overflow-x-auto">
                    {Array.from({ length: 14 }).map((_, i) => {
                        const d = addDays(new Date(), i);
                        const isSelected = date && isSameDay(date, d);
                        const hasAvailability = availability?.some(a => a.dayOfWeek === d.getDay());
                        
                        return (
                            <button
                                key={i}
                                onClick={() => setDate(d)}
                                disabled={!hasAvailability}
                                className={`
                                    flex flex-col items-center justify-center min-w-[70px] p-3 rounded-xl border transition-all duration-200
                                    ${isSelected 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105' 
                                        : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm text-slate-700'}
                                    ${!hasAvailability ? 'opacity-40 cursor-not-allowed bg-slate-50' : ''}
                                `}
                            >
                                <span className="text-xs font-medium uppercase tracking-wider opacity-80">{format(d, 'EEE')}</span>
                                <span className="text-xl font-bold mt-1">{format(d, 'd')}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {date && (
                <div className="space-y-2">
                    <Label>Available Slots</Label>
                    {slots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {slots.map(slot => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`
                                        px-3 py-2 text-sm rounded-md border transition-all
                                        ${selectedSlot === slot 
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium' 
                                            : 'border-slate-200 hover:border-indigo-300 text-slate-600'}
                                    `}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 italic">No available slots on this day.</p>
                    )}
                </div>
            )}

            <div className="space-y-2">
                <Label>Topic / Notes</Label>
                <Textarea 
                    placeholder="What would you like to discuss?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>

            <Button 
                onClick={handleBook} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={!date || !selectedSlot || loading}
            >
                {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
