/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Volume2, VolumeX, Star, BarChart2 } from 'lucide-react';
import { toBanglaNum } from '../utils/calculations';
import { Language, TasbihHistory } from '../types';

interface TasbihProps {
  language: Language;
}

interface DhikrPreset {
  id: string;
  nameBn: string;
  nameEn: string;
  transliterationBn: string;
  transliterationEn: string;
  target: number;
}

const PRESETS: DhikrPreset[] = [
  { id: 'subhanallah', nameBn: 'سُبْحَانَ اللَّهِ (সুবহানাল্লাহ)', nameEn: 'Subhanallah', transliterationBn: 'পবিত্রতা মহান আল্লাহর', transliterationEn: 'Glory be to Allah', target: 33 },
  { id: 'alhamdulillah', nameBn: 'الْحَمْدُ لِلَّهِ (আলহামদুলিল্লাহ)', nameEn: 'Alhamdulillah', transliterationBn: 'সকল প্রশংসা আল্লাহর', transliterationEn: 'Praise be to Allah', target: 33 },
  { id: 'allahuakbar', nameBn: 'اللَّهُ أَكْبَرُ (আল্লাহু আকবার)', nameEn: 'Allahu Akbar', transliterationBn: 'আল্লাহ সর্বশ্রেষ্ঠ', transliterationEn: 'Allah is the Greatest', target: 34 },
  { id: 'lailahaillallah', nameBn: 'لَا إِلَهَ إِلَّا اللَّهُ (লা ইলাহা ইল্লাল্লাহ)', nameEn: 'La ilaha illallah', transliterationBn: 'আল্লাহ ছাড়া কোনো মাবুদ নাই', transliterationEn: 'There is no god but Allah', target: 100 },
  { id: 'astaghfirullah', nameBn: 'أَسْتَغْفِرُ اللَّهِ (আস্তাগফিরুল্লাহ)', nameEn: 'Astaghfirullah', transliterationBn: 'আমি আল্লাহর কাছে ক্ষমা চাই', transliterationEn: 'I seek forgiveness from Allah', target: 100 },
  { id: 'durood', nameBn: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ (দরূদ শরিফ)', nameEn: 'Salallahu Alaihi Wasallam', transliterationBn: 'আল্লাহ তাঁর ওপর রহমত বর্ষণ করুন', transliterationEn: 'May Allah bless him', target: 100 },
  { id: 'custom', nameBn: 'কাস্টম তাসবিহ (Custom)', nameEn: 'Custom Tasbih', transliterationBn: '', transliterationEn: '', target: 99 }
];

export default function Tasbih({ language }: TasbihProps) {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [customRange, setCustomRange] = useState<number>(99);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [totalToday, setTotalToday] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const autoAdvanceTimeoutRef = useRef<any>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const activePreset = PRESETS[selectedPresetIndex];
  const target = activePreset.id === 'custom' ? customRange : activePreset.target;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  // Load stats from localStorage
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem('tasbih_history');
    if (saved) {
      try {
        const parsed: TasbihHistory[] = JSON.parse(saved);
        const todayTots = parsed
          .filter(h => h.date === todayStr)
          .reduce((acc, curr) => acc + curr.count, 0);
        setTotalToday(todayTots);
      } catch (err) {
        console.error('Error parsing tasbih history:', err);
      }
    }
  }, [count]);

  // Click Sound generator using Web Audio API
  const playClickSound = () => {
    if (!isSoundOn) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      
      // Keep state running
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.error('Web Audio click error:', e);
    }
  };

  // Completion sound generator (chord beep)
  const playCompletionSound = () => {
    if (!isSoundOn) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(120, ctx.currentTime + index * 0.08 + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.08 + 0.25);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.3);
      });
    } catch (e) {
      console.error('Completion sound error:', e);
    }
  };

  const handleTap = () => {
    if (isCompleted) {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
      handleReset();
      return;
    }

    const nextCount = count + 1;
    setCount(nextCount);
    playClickSound();

    if (navigator.vibrate) {
      navigator.vibrate(40);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem('tasbih_history') || '[]';
    try {
      const parsed: TasbihHistory[] = JSON.parse(saved);
      const matchedIdx = parsed.findIndex(h => h.date === todayStr && h.dhikrId === activePreset.id);
      if (matchedIdx > -1) {
        parsed[matchedIdx].count += 1;
      } else {
        parsed.push({ date: todayStr, dhikrId: activePreset.id, count: 1 });
      }
      localStorage.setItem('tasbih_history', JSON.stringify(parsed));
      setTotalToday(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }

    if (nextCount >= target) {
      setIsCompleted(true);
      playCompletionSound();
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      // Auto-advance to the next preset after 900ms (except custom preset)
      if (activePreset.id !== 'custom') {
        const nextIndex = (selectedPresetIndex + 1) % PRESETS.length;
        // Skip 'custom' preset in auto loop rotation
        const actualNextIndex = PRESETS[nextIndex].id === 'custom' ? 0 : nextIndex;

        if (autoAdvanceTimeoutRef.current) {
          clearTimeout(autoAdvanceTimeoutRef.current);
        }
        autoAdvanceTimeoutRef.current = setTimeout(() => {
          setSelectedPresetIndex(actualNextIndex);
          setCount(0);
          setIsCompleted(false);
          autoAdvanceTimeoutRef.current = null;
        }, 900);
      }
    }
  };

  const handleReset = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setCount(0);
    setIsCompleted(false);
  };

  const percent = Math.min(100, Math.floor((count / target) * 100));

  const selectPreset = (idx: number) => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setSelectedPresetIndex(idx);
    setCount(0);
    setIsCompleted(false);
  };

  const displayCount = language === 'bn' ? toBanglaNum(count) : count;
  const displayTarget = language === 'bn' ? toBanglaNum(target) : target;
  const displayTotalToday = language === 'bn' ? toBanglaNum(totalToday) : totalToday;

  return (
    <div id="tasbih-section" className="bg-white dark:bg-zinc-900 border border-primary-green/10 dark:border-neutral-800 rounded-3xl p-6 shadow-sm select-none relative overflow-hidden">
      
      {/* Decorative background vectors representing geometric theme */}
      <div className="absolute top-0 right-0 w-24 h-24 border border-primary-green/5 rounded-full pointer-events-none"></div>

      {/* Top Controls Header */}
      <div className="flex items-center justify-between mb-5 z-10 relative">
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider text-primary-green dark:text-[#f1f8e9]">
            {language === 'bn' ? 'ডিজিটাল তাসবিহ' : 'Digital Tasbih'}
          </h2>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#81c784] mt-0.5">
            {language === 'bn' ? 'স্মার্ট তাসবিহ ও জিকির ট্র্যাকার' : 'Smart dhikr statistics & counting loop'}
          </p>
        </div>
        
        {/* Sound toggle & Reset */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSoundOn(!isSoundOn)}
            id="dhikr-sound-toggle"
            title={language === 'bn' ? 'শব্দ অন/অফ' : 'Sound ON/OFF'}
            className="p-2.5 rounded-xl text-primary-green dark:text-accent-gold hover:bg-emerald-50 dark:hover:bg-neutral-800 transition pointer-events-auto cursor-pointer"
          >
            {isSoundOn ? <Volume2 className="w-5 h-5 text-primary-green dark:text-accent-gold" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
          </button>
          
          <button
            onClick={handleReset}
            id="dhikr-reset-btn"
            title={language === 'bn' ? 'রিসেট' : 'Reset counter'}
            className="p-2.5 rounded-xl text-gray-550 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition pointer-events-auto cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preset dhikr select pills */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-accent-gold scrollbar-track-transparent">
        {PRESETS.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => selectPreset(idx)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap border transition-all duration-300 pointer-events-auto cursor-pointer ${
              idx === selectedPresetIndex
                ? 'bg-primary-green text-white border-primary-green shadow-sm shadow-primary-green/15 ring-2 ring-accent-gold/40'
                : 'bg-white dark:bg-zinc-800 text-primary-green dark:text-accent-gold/90 border-primary-green/10 dark:border-neutral-800 hover:border-accent-gold/30'
            }`}
          >
            {language === 'bn' ? p.nameBn.split(' ').pop() || p.nameEn : p.nameEn}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center py-4 z-10 relative">
        {/* Arabic texts display & Translation for active dhikr */}
        {activePreset.id !== 'custom' && (
          <div className="text-center max-w-sm mb-6 min-h-[4.5rem] flex flex-col justify-center">
            <h3 className="font-arabic text-2xl text-primary-green dark:text-[#f1f8e9] font-bold tracking-wide">
              {activePreset.nameBn.match(/\((.*?)\)/)?.[0] || activePreset.nameBn}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-semibold">
              {language === 'bn' ? activePreset.transliterationBn : activePreset.transliterationEn}
            </p>
          </div>
        )}

        {/* Custom Target Setter */}
        {activePreset.id === 'custom' && (
          <div className="flex items-center gap-3 mb-6 bg-white dark:bg-zinc-950 p-2.5 border border-primary-green/15 dark:border-neutral-800 rounded-2xl shadow-sm">
            <span className="text-xs text-primary-green dark:text-[#f1f8e9] font-bold px-2">
              {language === 'bn' ? 'টার্গেট সেট করুন:' : 'Set Target:'}
            </span>
            <input
              type="number"
              min="1"
              max="9999"
              value={customRange}
              onChange={(e) => {
                setCustomRange(Math.max(1, Number(e.target.value)));
                setCount(0);
                setIsCompleted(false);
              }}
              className="w-16 py-1 px-2 border border-primary-green/20 dark:border-neutral-700 bg-white dark:bg-zinc-800 rounded-xl h-8 text-center text-xs text-primary-green dark:text-[#f1f8e9] font-black font-mono outline-none"
            />
          </div>
        )}

        {/* Radial Progress Circle/Tappable Ring */}
        <div className="relative w-64 h-64 flex items-center justify-center select-none">
          {/* Main Massive Circular Tap Touch Area */}
          <button
            onClick={handleTap}
            id="tasbih-touch-ring"
            className={`absolute w-52 h-52 rounded-full flex flex-col items-center justify-center border shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-300 cursor-pointer ${
              isCompleted
                ? 'bg-accent-gold/10 hover:bg-accent-gold/20 border-accent-gold shadow-[0_0_20px_rgba(230,175,46,0.3)] animate-pulse'
                : 'bg-white dark:bg-zinc-950 hover:bg-white/90 dark:hover:bg-zinc-900 border-primary-green/10 shadow-[0_4px_15px_rgba(0,0,0,0.02)]'
            }`}
          >
            {/* Display Big Counter */}
            <span className={`text-5xl font-black font-mono transition-colors duration-300 ${isCompleted ? 'text-accent-gold' : 'text-primary-green dark:text-accent-gold/90'}`}>
              {displayCount}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black tracking-widest mt-2 block uppercase">
              {language === 'bn' ? `টার্গেট: ${displayTarget}` : `Target: ${displayTarget}`}
            </span>
          </button>

          {/* SVG Progress Arc Ring surrounding the circle */}
          <svg className="w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="128"
              cy="128"
              r="112"
              className="stroke-primary-green/5 dark:stroke-neutral-800 fill-none"
              strokeWidth="6"
            />
            <circle
              cx="128"
              cy="128"
              r="112"
              className={`fill-none transition-all duration-500 ease-out ${isCompleted ? 'stroke-accent-gold' : 'stroke-primary-green'}`}
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 112}
              strokeDashoffset={2 * Math.PI * 112 * (1 - percent / 100)}
              strokeLinecap="round"
            />
          </svg>

          {/* Success complete star badge */}
          {isCompleted && (
            <div className="absolute top-2 right-2 scale-110 p-2 bg-accent-gold text-white rounded-full shadow-lg animate-bounce border border-white/20">
              <Star className="w-4 h-4 fill-white" />
            </div>
          )}
        </div>

        {/* Counter bottom note */}
        {isCompleted ? (
          <p className="text-sm font-black text-accent-gold mt-6 animate-pulse text-center">
            🎉 {language === 'bn' ? 'মাশাআল্লাহ! টার্গেট সম্পূর্ণ হয়েছে। পুনরায় শুরু করতে ট্যাপ করুন।' : 'Ma sha Allah! Loop completed. Tap to repeat.'}
          </p>
        ) : (
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-6 md:hidden">
            💡 {language === 'bn' ? 'মোবাইলে রিংটির মধ্যে যেকোনো জায়গায় চাপুন' : 'Tap inside the circular ring to count'}
          </p>
        )}

        {/* Stats Dashboard footer within the card */}
        <div className="w-full mt-6 pt-4 border-t border-primary-green/10 dark:border-neutral-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5 font-bold text-gray-400">
            <BarChart2 className="w-4 h-4 text-primary-green dark:text-accent-gold" />
            {language === 'bn' ? 'আজকের মোট জিকির:' : 'Today\'s Total Loops:'}
          </span>
          <span className="font-extrabold text-primary-green dark:text-accent-gold text-base font-mono">
            {displayTotalToday}
          </span>
        </div>
      </div>
    </div>
  );
}
