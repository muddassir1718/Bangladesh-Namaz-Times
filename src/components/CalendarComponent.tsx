/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Star, Sparkles } from 'lucide-react';
import { getHijriDate, getBanglaDate, HIJRI_MONTHS_BN, HIJRI_MONTHS_EN, ISLAMIC_EVENTS } from '../utils/calendar';
import { toBanglaNum } from '../utils/calculations';
import { Language } from '../types';

interface CalendarProps {
  language: Language;
  hijriOffset?: number;
}

// Find Gregorian date representing a certain Hijri Day & Month & Year
export function findGregorianForHijri(hDay: number, hMonth: number, hYear: number, offset: number = -1): Date {
  // Let's use search scan approximation starting 1 year before up to 2 years after today
  const scanStart = new Date();
  scanStart.setDate(scanStart.getDate() - 400); // scan from ~1 year ago
  
  for (let i = 0; i < 800; i++) {
    const calculated = getHijriDate(scanStart, offset);
    if (calculated.year === hYear && calculated.month === hMonth && calculated.day === hDay) {
      return new Date(scanStart);
    }
    // step 1 day forward
    scanStart.setDate(scanStart.getDate() + 1);
  }
  return new Date(); // fallback
}

// Get the actual duration of a given Hijri month based on Kuwaiti approximation rules
export function getHijriMonthLength(hMonth: number, hYear: number): number {
  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  const cycleYear = hYear % 30;
  const isLeap = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29].includes(cycleYear);
  if (isLeap && hMonth === 12) {
    return 30;
  }
  return monthLengths[hMonth - 1];
}

export default function CalendarComponent({ language, hijriOffset }: CalendarProps) {
  const hOffset = hijriOffset !== undefined ? hijriOffset : -1;
  const [currentHijri, setCurrentHijri] = useState(() => getHijriDate(new Date(), hOffset));
  const [activeHYear, setActiveHYear] = useState<number>(currentHijri.year);
  const [activeHMonth, setActiveHMonth] = useState<number>(currentHijri.month); // 1-indexed

  // Sync calendar with dynamic offset configurations
  useEffect(() => {
    const h = getHijriDate(new Date(), hOffset);
    setCurrentHijri(h);
    setActiveHYear(h.year);
    setActiveHMonth(h.month);
  }, [hOffset]);

  // Calculate parameters for the monthly sheet
  const firstDayG = findGregorianForHijri(1, activeHMonth, activeHYear, hOffset);
  const startWeekday = firstDayG.getDay(); // 0 is Sunday
  const daysInMonth = getHijriMonthLength(activeHMonth, activeHYear);

  // Month sheet arrays
  const daysArray: (number | null)[] = [];
  // previous padding days
  for (let i = 0; i < startWeekday; i++) {
    daysArray.push(null);
  }
  // current month days
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  const navigateMonth = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      if (activeHMonth === 12) {
        setActiveHMonth(1);
        setActiveHYear(prev => prev + 1);
      } else {
        setActiveHMonth(prev => prev + 1);
      }
    } else {
      if (activeHMonth === 1) {
        setActiveHMonth(12);
        setActiveHYear(prev => prev - 1);
      } else {
        setActiveHMonth(prev => prev - 1);
      }
    }
  };

  // Convert numbers based on selected language
  const displayHYear = language === 'bn' ? toBanglaNum(activeHYear) : activeHYear;
  const displayHMonthName = language === 'bn' ? HIJRI_MONTHS_BN[activeHMonth - 1] : HIJRI_MONTHS_EN[activeHMonth - 1];

  // Weekdays header
  const WEEKDAYS_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
  const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const displayWeekdays = language === 'bn' ? WEEKDAYS_BN : WEEKDAYS_EN;

  // Render events lists for active Hijri Month
  const currentMonthEvents = ISLAMIC_EVENTS.filter(e => e.month === activeHMonth);

  return (
    <div id="hijri-calendar-section" className="bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm select-none">
      
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
            <CalIcon className="w-5 h-5 text-emerald-600" />
            {language === 'bn' ? 'হিজরি চন্দ্র ক্যালেন্ডার' : 'Islamic Hijri Month Sheet'}
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {language === 'bn' ? 'হিজরি, বাংলা ও ইংরেজি তারিখের সমন্বিত রূপ' : 'Aligned Hijri, Bengali and English monthly view'}
          </p>
        </div>

        {/* Navigator buttons */}
        <div className="flex items-center gap-2 bg-emerald-50/60 dark:bg-zinc-800/40 p-1 border border-emerald-100/60 dark:border-neutral-800 rounded-xl">
          <button
            onClick={() => navigateMonth('prev')}
            id="prev-month-btn"
            className="p-1 px-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded-lg text-emerald-700 dark:text-emerald-300 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="px-3 text-sm font-extrabold text-emerald-900 dark:text-emerald-100 min-w-[7.5rem] text-center">
            {displayHMonthName} {displayHYear}
          </div>

          <button
            onClick={() => navigateMonth('next')}
            id="next-month-btn"
            className="p-1 px-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded-lg text-emerald-700 dark:text-emerald-300 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Days grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-7 gap-1.5 text-center font-bold text-xs text-emerald-800 dark:text-emerald-400 border-b border-emerald-500/10 pb-3 mb-3">
            {displayWeekdays.map((w, index) => (
              <div key={index} className={language === 'bn' && index === 5 ? 'text-amber-600' : ''}>
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {daysArray.map((dayVal, cellIndex) => {
              if (dayVal === null) {
                return (
                  <div
                    key={`empty-${cellIndex}`}
                    className="aspect-square bg-gray-50/20 dark:bg-zinc-950/20 rounded-xl"
                  />
                );
              }

              // Calculate equivalent Gregorian and Bengali dates for this day cell
              const cellGDate = findGregorianForHijri(dayVal, activeHMonth, activeHYear);
              const cellBDate = getBanglaDate(cellGDate);

              const isToday =
                new Date().toDateString() === cellGDate.toDateString();

              // Check if any Islamic occasion falls in this cell
              const cellHasEvent = currentMonthEvents.some(e => e.day === dayVal);

              const displayCellHDay = language === 'bn' ? toBanglaNum(dayVal) : dayVal;
              const displayCellGDay = language === 'bn' ? toBanglaNum(cellGDate.getDate()) : cellGDate.getDate();
              const displayCellBDay = language === 'bn' ? toBanglaNum(cellBDate.day) : cellBDate.day;

              return (
                <div
                  key={`cell-${dayVal}`}
                  className={`relative aspect-square p-1.5 flex flex-col justify-between rounded-xl border transition-all pointer-events-auto cursor-pointer ${
                    isToday
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-[1.03] z-10'
                      : cellHasEvent
                      ? 'bg-amber-500/10 dark:bg-amber-950/10 border-amber-300 dark:border-amber-900/60'
                      : 'bg-emerald-50/10 dark:bg-zinc-950/40 border-emerald-500/5 hover:border-emerald-200'
                  }`}
                >
                  {/* Top line: Hijri Day (Big) */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[13px] font-extrabold ${isToday ? 'text-white' : 'text-emerald-950 dark:text-emerald-100'}`}>
                      {displayCellHDay}
                    </span>
                    {cellHasEvent && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-amber-500'}`} />
                    )}
                  </div>

                  {/* Bottom details: Gregorian and Bengali Day */}
                  <div className="flex items-center justify-between text-[8px] font-medium leading-none opacity-80 select-none">
                    <span className={isToday ? 'text-white/90' : 'text-gray-400 dark:text-gray-500 font-mono font-bold'}>
                      E{displayCellGDay}
                    </span>
                    <span className={isToday ? 'text-white/90' : 'text-emerald-700/80 dark:text-emerald-400'}>
                      ব{displayCellBDay}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Month Events & Occasions */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="p-5 bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-500/10 rounded-2xl">
            <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wider uppercase flex items-center gap-1.5 mb-3.5">
              <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
              {language === 'bn' ? `${displayHMonthName} মাসের বিশেষ উম্মাহ দিবস সমূহ` : `Occasions in ${displayHMonthName}`}
            </h3>

            {currentMonthEvents.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {currentMonthEvents.map((ev, index) => {
                  const evGDate = findGregorianForHijri(ev.day, activeHMonth, activeHYear);
                  const displayDay = language === 'bn' ? toBanglaNum(ev.day) : ev.day;
                  const displayDateStr = language === 'bn'
                    ? `${toBanglaNum(evGDate.getDate())} ${['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'][evGDate.getMonth()]}`
                    : evGDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

                  return (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-500/5 shadow-sm flex items-start justify-between gap-2"
                    >
                      <div>
                        <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100 leading-relaxed">
                          {language === 'bn' ? ev.nameBn : ev.nameEn}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                          {language === 'bn' ? `হিজরি তারিখ: ${displayDay} ${displayHMonthName}` : `Hijri date: ${displayDay} ${displayHMonthName}`}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold py-1 px-2.5 bg-emerald-500/10 text-emerald-600 rounded-lg whitespace-nowrap font-sans uppercase">
                        {displayDateStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                <Sparkles className="w-5 h-5 mx-auto text-emerald-300 mb-2" />
                {language === 'bn' ? 'চলতি হিজরি মাসে কোনো বিশেষ ইসলামিক দিবস পাওয়া যায়নি।' : 'No major Islamic events of note this month.'}
              </div>
            )}
          </div>

          {/* Quick instructions for understanding date tags */}
          <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-neutral-800 text-[10px] text-gray-500 dark:text-gray-400 select-none">
            <span className="font-semibold">{language === 'bn' ? 'কিলোগ্রাফ নির্দশক:' : 'Legend Indicator:'}</span>
            <div className="flex items-center gap-4 mt-2 font-medium">
              <span className="flex items-center gap-1">
                <span className="font-bold text-gray-400">E:</span> {language === 'bn' ? 'ইংরেজি তারিখ (English)' : 'English date'}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-bold text-emerald-600">ব:</span> {language === 'bn' ? 'বাংলা তারিখ (Bengali)' : 'Bengali date'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
