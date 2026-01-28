'use client';

import { useEffect, useState } from 'react';
import { KidsLayout } from '@/components/kids/KidsLayout';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Sticker {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at: string;
}

export default function StickerBookPage() {
  const router = useRouter();
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStickers = async () => {
      try {
        const res = await apiClient('gamification/stickers');
        if (res.ok) {
          const data = await res.json();
          setStickers(data);
        }
      } catch (error) {
        console.error('Failed to fetch stickers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStickers();
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-400 border-yellow-600';
      case 'epic': return 'bg-purple-400 border-purple-600';
      case 'rare': return 'bg-blue-400 border-blue-600';
      default: return 'bg-gray-200 border-gray-400';
    }
  };

  return (
    <KidsLayout>
      <div className="max-w-6xl mx-auto pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            className="text-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold gap-2 rounded-full px-6 py-6"
            onClick={() => router.push('/kids')}
          >
            <ArrowLeft className="w-8 h-8" />
            Back
          </Button>
          <h1 className="text-4xl font-black text-gray-800 flex items-center gap-3">
            <Star className="w-10 h-10 text-yellow-500 fill-current" />
            My Sticker Book
          </h1>
        </div>

        {/* Sticker Grid */}
        <div className="bg-amber-100 rounded-[3rem] p-8 md:p-12 shadow-xl border-8 border-amber-200 min-h-[60vh] relative overflow-hidden">
          
          {/* Decorative binding */}
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-amber-800/10 border-r-4 border-amber-900/10 flex flex-col justify-evenly py-8 items-center">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="w-4 h-16 bg-amber-900/20 rounded-full" />
             ))}
          </div>

          <div className="ml-12 md:ml-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-white/50 rounded-full animate-pulse" />
              ))
            ) : stickers.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <div className="text-8xl mb-4">😢</div>
                <h2 className="text-3xl font-black text-amber-800/60">No stickers yet!</h2>
                <p className="text-xl text-amber-800/50 mt-2">Complete lessons to earn stickers!</p>
              </div>
            ) : (
              stickers.map((sticker) => (
                <motion.div
                  key={sticker.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex flex-col items-center"
                >
                  <div className={cn(
                    "w-40 h-40 rounded-full flex items-center justify-center border-8 shadow-lg bg-white relative group cursor-pointer transition-all",
                    getRarityColor(sticker.rarity)
                  )}>
                    <span className="text-6xl">{sticker.image_url}</span> {/* Using emoji/text for now as URL */}
                    
                    {/* Tooltip */}
                    <div className="absolute -bottom-16 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                      {sticker.description}
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="bg-white/80 px-4 py-1 rounded-full font-bold text-amber-900 shadow-sm border border-amber-200">
                      {sticker.name}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
            
            {/* Empty Slots Teaser */}
            {stickers.length > 0 && Array.from({ length: Math.max(0, 8 - stickers.length) }).map((_, i) => (
               <div key={`empty-${i}`} className="w-40 h-40 rounded-full border-4 border-dashed border-amber-900/20 flex items-center justify-center mx-auto opacity-50">
                 <Lock className="w-12 h-12 text-amber-900/30" />
               </div>
            ))}
          </div>
        </div>
      </div>
    </KidsLayout>
  );
}
