/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, Clock, Heart } from 'lucide-react';
import { getHijriDate, getDaysUntilNextRamadan } from '../utils/calendar';
import { toBanglaNum } from '../utils/calculations';
import { Language } from '../types';

interface RamadanDashboardProps {
  language: Language;
  fajrTime: string; // "HH:MM" represents Suhoor end
  maghribTime: string; // "HH:MM" represents Iftar
  hijriOffset?: number;
}

interface RamadanDua {
  titleBn: string;
  titleEn: string;
  arabic: string;
  transliterationBn: string;
  transliterationEn: string;
  meaningBn: string;
  meaningEn: string;
}

const RAMADAN_DUAS: RamadanDua[] = [
  {
    titleBn: 'সেহরির নিয়ত',
    titleEn: 'Suhoor Intent (Niyyah)',
    arabic: 'وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
    transliterationBn: 'নাওয়াইতু আন আসুমা গাদাম মিন শাহরি রামাদানা।',
    transliterationEn: 'Wa bi-sawmi ghadinn nawaytu min shahri Ramadan.',
    meaningBn: 'হে আল্লাহ! আগামীকাল পবিত্র রমজান মাসে আপনার ফরজ রোজা রাখার নিয়ত করলাম।',
    meaningEn: 'I intend to keep the fast tomorrow for the month of Ramadan.'
  },
  {
    titleBn: 'ইফতারের দোয়া',
    titleEn: 'Iftar Supplication',
    arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    transliterationBn: 'আল্লাহুম্মা লাকা সুমতু ওয়া আলা রিজকিকা আফতারতু।',
    transliterationEn: 'Allahumma laka sumtu wa \'ala rizqika aftartu.',
    meaningBn: 'হে আল্লাহ! আমি আপনারই সন্তুষ্টির জন্য রোজা রেখেছি এবং আপনারই দেওয়া রিযিক দ্বারা ইফতার করছি।',
    meaningEn: 'O Allah, I fasted for You and with Your provision I break my fast.'
  }
];

export default function RamadanDashboard({ language, fajrTime, maghribTime, hijriOffset }: RamadanDashboardProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const hijri = getHijriDate(currentDate, hijriOffset !== undefined ? hijriOffset : -1);
  const isRamadan = hijri.month === 9;

  // Countdown calculations
  const daysUntilRamadan = getDaysUntilNextRamadan(currentDate);

  // Minutes calculations for Suhoor or Iftar countdowns
  const [minutesLeft, setMinutesLeft] = useState<number>(0);
  const [countdownTarget, setCountdownTarget] = useState<'suhoor' | 'iftar' | null>(null);

  useEffect(() => {
    if (!isRamadan) return;

    const timer = setInterval(() => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentSec = now.getSeconds();
      const totalSecondsNow = currentH * 3600 + currentM * 60 + currentSec;

      const [fH, fM] = fajrTime.split(':').map(Number);
      const [mH, mM] = maghribTime.split(':').map(Number);

      const fSecs = fH * 3600 + fM * 60;
      const mSecs = mH * 3600 + mM * 60;

      // Determine next countdown target
      if (totalSecondsNow < fSecs) {
        setCountdownTarget('suhoor');
        setMinutesLeft(Math.floor((fSecs - totalSecondsNow) / 60));
      } else if (totalSecondsNow >= fSecs && totalSecondsNow < mSecs) {
        setCountdownTarget('iftar');
        setMinutesLeft(Math.floor((mSecs - totalSecondsNow) / 60));
      } else {
        setCountdownTarget('suhoor');
        const tomorrowSecsLeft = (24 * 3600 - totalSecondsNow) + fSecs;
        setMinutesLeft(Math.floor(tomorrowSecsLeft / 60));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRamadan, fajrTime, maghribTime]);

  const displayDaysUntil = language === 'bn' ? toBanglaNum(daysUntilRamadan) : daysUntilRamadan;
  const displayRamadanDay = language === 'bn' ? toBanglaNum(hijri.day) : hijri.day;

  // Format countdown string
  const formatCountdownMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (language === 'bn') {
      if (h > 0) return `${toBanglaNum(h)} ঘণ্টা ${toBanglaNum(m)} মিনিট`;
      return `${toBanglaNum(m)} মিনিট`;
    } else {
      if (h > 0) return `${h} hr ${m} min`;
      return `${m} min`;
    }
  };

  return (
    <div id="ramadan-dashboard-section" className="select-none">
      
      {/* 1. Ramadan IS Active right now */}
      {isRamadan ? (
        <div className="bg-primary-green text-white rounded-3xl p-6 border border-accent-gold/20 shadow-lg relative overflow-hidden">
          
          {/* Subtle Islamic dome SVG background watermark */}
          <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-5 flex items-center justify-end pointer-events-none select-none text-4xl">
            🌙
          </div>

          <div className="flex items-center gap-2 mb-4 z-10 relative">
            <span className="p-1 px-3 text-[10px] bg-accent-gold font-extrabold text-primary-green rounded-full flex items-center gap-1 uppercase tracking-wider animate-bounce">
              <Sparkles className="w-3 h-3 fill-primary-green" />
              {language === 'bn' ? 'রমজানুল মোবারক' : 'Ramadan Mubarak'}
            </span>
            <span className="text-xs text-accent-gold font-bold">
              {language === 'bn' ? `${displayRamadanDay} রোজা` : `Day ${displayRamadanDay} of Ramadan`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center z-10 relative">
            
            {/* Quick Suhoor / Iftar cards */}
            <div className="flex flex-col gap-3.5">
              <h2 className="text-lg font-black uppercase tracking-wider text-white">
                {language === 'bn' ? 'রহমতের রমজান ড্যাশবোর্ড' : 'Holy Ramadan Tracker'}
              </h2>

              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                  <span className="text-[10px] text-accent-gold uppercase tracking-widest font-black flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-accent-gold" />
                    {language === 'bn' ? 'সেহরি শেষ' : 'Suhoor End'}
                  </span>
                  <span className="text-lg font-black font-mono text-white mt-1">
                    {language === 'bn' ? toBanglaNum(fajrTime) : fajrTime}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                  <span className="text-[10px] text-accent-gold uppercase tracking-widest font-black flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-accent-gold" />
                    {language === 'bn' ? 'ইফতারের সময়' : 'Iftar Time'}
                  </span>
                  <span className="text-lg font-black font-mono text-white mt-1">
                    {language === 'bn' ? toBanglaNum(maghribTime) : maghribTime}
                  </span>
                </div>
              </div>

              {/* Countdown ticker */}
              {countdownTarget && (
                <div className="flex items-center gap-2 bg-[#0c180e]/50 p-3 rounded-xl border border-[#0c180e]/40 mt-1">
                  <Clock className="w-4 h-4 text-accent-gold" />
                  <span className="text-xs font-semibold text-white/95">
                    {countdownTarget === 'suhoor'
                      ? language === 'bn' ? 'সেহরির বাকিঃ' : 'Time until Suhoor:'
                      : language === 'bn' ? 'ইফতারের বাকিঃ' : 'Time until Iftar:'}
                  </span>
                  <span className="text-xs font-bold text-accent-gold font-mono">
                    {formatCountdownMinutes(minutesLeft)}
                  </span>
                </div>
              )}
            </div>

            {/* Ramadan Duas carousel within the block */}
            <div className="bg-[#0c180e]/30 border border-white/5 p-4 rounded-2xl">
              <h4 className="text-xs font-black text-accent-gold flex items-center gap-1.5 mb-2.5 uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 text-accent-gold" />
                {language === 'bn' ? 'সেহরি ও ইফতারের আমল' : 'Ramadan Devotional Duas'}
              </h4>
              
              <div className="flex flex-col gap-4">
                {RAMADAN_DUAS.map((d, index) => (
                  <div key={index} className="pb-3 border-b border-white/5 last:border-b-0 last:pb-0">
                    <span className="text-[10px] font-black text-accent-gold block mb-1">
                      {language === 'bn' ? d.titleBn : d.titleEn}
                    </span>
                    <p className="font-arabic text-sm text-white font-semibold">
                      {d.arabic}
                    </p>
                    <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">
                      {language === 'bn' ? d.meaningBn : d.meaningEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Progress bar */}
          <div className="mt-5 pt-3 border-t border-accent-gold/10 flex flex-col gap-1.5 z-10 relative">
            <div className="flex justify-between text-[11px] text-[#81c784] font-semibold">
              <span>{language === 'bn' ? 'রমজানুল মোবারক অগ্রগতি' : 'Ramadan Progress'}</span>
              <span>{displayRamadanDay} / ৩০ {language === 'bn' ? 'দিন সম্পূর্ণ' : 'days completed'}</span>
            </div>
            <div className="w-full bg-[#0c180e]/60 rounded-full h-2 overflow-hidden border border-[#0c180e]/40">
              <div
                className="bg-accent-gold h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(hijri.day / 30) * 100}%` }}
              />
            </div>
          </div>

        </div>
      ) : (
        /* 2. Ramadan IS NOT active, show countdown */
        <div className="bg-white dark:bg-zinc-900 border border-primary-green/10 dark:border-neutral-800 rounded-3xl p-5 shadow-sm relative overflow-hidden flex items-center gap-4">
          <div className="p-3 bg-[#0c180e]/5 text-primary-green dark:bg-accent-gold/5 dark:text-accent-gold rounded-2xl">
            <Moon className="w-5 h-5 fill-accent-gold/10 stroke-accent-gold animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest font-black text-primary-green dark:text-[#f1f8e9] flex items-center gap-1.5 flex-wrap">
              {language === 'bn' ? 'রমজানের আর বাকি...' : 'Ramadan Countdown'}
              <span className="py-0.5 px-2 bg-primary-green/5 dark:bg-accent-gold/10 text-primary-green dark:text-accent-gold rounded-full text-[9px] font-black tracking-widest uppercase font-mono">
                {displayDaysUntil} {language === 'bn' ? 'দিন' : 'Days'}
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed font-sans">
              {language === 'bn'
                ? `পবিত্র মাহে রমজান আসতে কাঙ্ক্ষিত ${displayDaysUntil} দিন বাকি রয়েছে ইনশাআল্লাহ`
                : `Approximately ${displayDaysUntil} days until next holy fasting month begins.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
