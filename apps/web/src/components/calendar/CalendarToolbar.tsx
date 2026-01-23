import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { ToolbarProps } from 'react-big-calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CalendarToolbar({ date, onNavigate, onView, view }: ToolbarProps) {
  const navigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    onNavigate(action);
  };

  const handleViewChange = (value: string) => {
    onView(value as any);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
      <div className="flex items-center space-x-4 w-full md:w-auto">
        <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('PREV')}
            className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('TODAY')}
            className="h-8 px-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('NEXT')}
            className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 ml-4 hidden md:block">
          {format(date, 'MMMM yyyy')}
        </h2>
      </div>

      <div className="flex items-center w-full md:w-auto justify-between md:justify-end gap-2">
        <h2 className="text-lg font-bold text-gray-800 md:hidden">
          {format(date, 'MMM yyyy')}
        </h2>
        
        <div className="relative">
          <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
          <Select value={view} onValueChange={handleViewChange} className="w-[130px] pl-9">
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="agenda">Agenda</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
