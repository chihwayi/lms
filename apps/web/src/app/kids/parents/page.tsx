'use client';

import { useState, useEffect } from 'react';
import { KidsLayout } from '@/components/kids/KidsLayout';
import { Button } from '@/components/ui/button';
import { ParentalGate } from '@/components/kids/ParentalGate';
import { Settings, Clock, BarChart, Shield, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

export default function ParentDashboard() {
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(true);
  
  // Settings State (Mock)
  const [settings, setSettings] = useState({
    screenTimeLimit: true,
    backgroundMusic: false,
    soundEffects: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient('kids-settings');
        if (res.ok) {
          const data = await res.json();
          setSettings({
            screenTimeLimit: !!data.screen_time_limit,
            backgroundMusic: !!data.background_music,
            soundEffects: !!data.sound_effects,
          });
        }
      } catch {}
    };
    fetchSettings();
  }, []);

  const updateSetting = async (patch: Partial<{ screen_time_limit: boolean; background_music: boolean; sound_effects: boolean }>) => {
    try {
      await apiClient('kids-settings', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
    } catch {}
  };

  if (isLocked) {
    return (
      <KidsLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
             <h1 className="text-2xl font-bold mb-4">Parent Dashboard</h1>
             <Button onClick={() => setIsLocked(true)} variant="outline" className="hidden">Reset</Button> {/* Hidden trigger if needed */}
             
             {/* Auto-open gate on mount or show a button to open it */}
             <div className="text-center space-y-4">
               <div className="bg-gray-100 p-8 rounded-full inline-flex">
                 <Shield className="w-16 h-16 text-gray-400" />
               </div>
               <p className="text-gray-500">This area is protected.</p>
               <Button onClick={() => {}} className="pointer-events-none opacity-50">
                 Verify to Access
               </Button>
             </div>

             <ParentalGate 
               isOpen={isLocked} 
               onClose={() => router.push('/kids')} 
               onSuccess={() => setIsLocked(false)} 
             />
        </div>
      </KidsLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Custom Header for Parent View - cleaner/more professional than KidsLayout */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <Button variant="ghost" onClick={() => router.push('/kids')} className="gap-2">
               <ArrowLeft className="w-4 h-4" />
               Exit to Kids Mode
             </Button>
             <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
          </div>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Verified Parent
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Stats Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-blue-500" />
              Activity Report
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Time Spent Today</span>
                <span className="font-bold text-gray-900">45 mins</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Lessons Completed</span>
                <span className="font-bold text-gray-900">3</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Stickers Earned</span>
                <span className="font-bold text-gray-900">12</span>
              </div>
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              Controls & Preferences
            </h2>
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Daily Time Limit</Label>
                  <p className="text-sm text-gray-500">Limit usage to 1 hour per day</p>
                </div>
                <Switch 
                  checked={settings.screenTimeLimit}
                  onCheckedChange={(checked: boolean) => {
                    setSettings(s => ({ ...s, screenTimeLimit: checked }));
                    updateSetting({ screen_time_limit: checked });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Background Music</Label>
                  <p className="text-sm text-gray-500">Play playful background tunes</p>
                </div>
                <Switch 
                  checked={settings.backgroundMusic}
                  onCheckedChange={(checked: boolean) => {
                    setSettings(s => ({ ...s, backgroundMusic: checked }));
                    updateSetting({ background_music: checked });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Sound Effects</Label>
                  <p className="text-sm text-gray-500">Interaction sounds and voiceovers</p>
                </div>
                <Switch 
                  checked={settings.soundEffects}
                  onCheckedChange={(checked: boolean) => {
                    setSettings(s => ({ ...s, soundEffects: checked }));
                    updateSetting({ sound_effects: checked });
                  }}
                />
              </div>

            </div>
          </div>

          {/* Recent Work */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Recent Activity
            </h2>
            <div className="text-center py-8 text-gray-500">
              No recent submissions to review.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
