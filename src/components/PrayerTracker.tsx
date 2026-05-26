/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar as CalIcon, Flame, CheckCircle, XCircle, Clock, AlertCircle, Share2, Clipboard } from 'lucide-react';
import { toBanglaNum } from '../utils/calculations';
import { Language, TrackerDay } from '../types';

interface TrackerProps {
  language: Language;
}

const PRAYERS_LIST = [
  { id: 'fajr', labelBn: 'ফজর', labelEn: 'Fajr' },
  { id: 'dhuhr', labelBn: 'যোহর', labelEn: 'Dhuhr' },
  { id: 'asr', labelBn: 'আসর', labelEn: 'Asr' },
  { id: 'maghrib', labelBn: 'মাগরিব', labelEn: 'Maghrib' },
  { id: 'isha', labelBn: 'ইশা', labelEn: 'Isha' }
];

export default function PrayerTracker({ language }: TrackerProps) {
  const [history, setHistory] = useState<TrackerDay[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [streak, setStreak] = useState<number>(0);
  const [summaryStats, setSummaryStats] = useState({ prayed: 0, qaza: 0, missed: 0, total: 0 });
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  const [weeklyRating, setWeeklyRating] = useState({ score: 0, levelBn: 'কোনো ডাটা নেই', levelEn: 'No data', played: 0, total: 0, missed: 0 });
  const [monthlyRating, setMonthlyRating] = useState({ score: 0, levelBn: 'কোনো ডাটা নেই', levelEn: 'No data', played: 0, total: 0, missed: 0 });

  // Check if a prayer has passed for a given date string
  const isPrayerPassed = (dateStr: string, prayerId: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (dateStr < todayStr) return true; // past dates always passed
    if (dateStr > todayStr) return false; // future dates never passed now
    
    // For today, compare current hour
    const currentHour = today.getHours();
    
    const endHour: Record<string, number> = {
      fajr: 6,       // Fajr passes after 6 AM
      dhuhr: 15,     // Dhuhr passes by 3:00 PM
      asr: 17,       // Asr passes by 5:00 PM
      maghrib: 19,   // Maghrib passes by 7:00 PM
      isha: 23        // Isha passes by 11:00 PM
    };
    
    return currentHour >= (endHour[prayerId] || 24);
  };

  const computePeriodicScore = (daysCount: number, activeProg: TrackerDay[]) => {
    let played = 0;
    let missed = 0;
    let totalProposed = 0;

    const today = new Date();

    for (let i = 0; i < daysCount; i++) {
      const current = new Date();
      current.setDate(today.getDate() - i);
      const dateStr = current.toISOString().split('T')[0];

      const record = activeProg.find(d => d.date === dateStr);
      
      PRAYERS_LIST.forEach(p => {
        const status = record ? record.prayers[p.id] : 'untracked';
        const passed = isPrayerPassed(dateStr, p.id);

        if (status === 'prayed') {
          played++;
          totalProposed++;
        } else if (status === 'qaza' || status === 'missed') {
          missed++;
          totalProposed++;
        } else {
          // untracked
          if (passed) {
            // passed and untracked counts as Missed under "AUTO MINUS" check!
            missed++;
            totalProposed++;
          }
        }
      });
    }

    const percentage = totalProposed > 0 ? Math.round((played / totalProposed) * 100) : 0;
    
    let levelBn = 'মনোযোগ বাড়াতে হবে ⚠️';
    let levelEn = 'Needs Attention ⚠️';
    if (percentage >= 95) {
      levelBn = 'মুমতাজ (অসাধারণ) 🌟🌟🌟🌟🌟';
      levelEn = 'Excellent (Mumtaz) 🌟🌟🌟🌟🌟';
    } else if (percentage >= 85) {
      levelBn = 'জায়্যিদ জিদ্দান (খুবই উত্তম) 🌟🌟🌟🌟';
      levelEn = 'Very Good 🌟🌟🌟🌟';
    } else if (percentage >= 70) {
      levelBn = 'জায়্যিদ (উতকৃষ্ট) 🌟🌟🌟';
      levelEn = 'Good 🌟🌟🌟';
    } else if (percentage >= 45) {
      levelBn = 'মাকবুল (চলতি) 🌟🌟';
      levelEn = 'Satisfactory 🌟🌟';
    }

    return { score: percentage, levelBn, levelEn, played, total: totalProposed, missed };
  };

  // Load tracker history data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('namaz_tracker_v1');
    if (saved) {
      try {
        const parsed: TrackerDay[] = JSON.parse(saved);
        // Retain only past 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const filtered = parsed.filter(day => new Date(day.date) >= ninetyDaysAgo);
        setHistory(filtered);
        calculateStreakAndStats(filtered);
      } catch (err) {
        console.error('Error loading tracker history:', err);
      }
    } else {
      // populate seed if empty
      const emptySeed: TrackerDay[] = [];
      setHistory(emptySeed);
    }
  }, [selectedDateStr]);

  // Streak counter: consecutive days where ALL 5 prayers are marked as 'prayed'
  const calculateStreakAndStats = (activeProg: TrackerDay[]) => {
    let currentStreak = 0;
    const sorted = [...activeProg].sort((a, b) => b.date.localeCompare(a.date)); // descending date order

    const isDayFullyPrayed = (day: TrackerDay) => {
      return PRAYERS_LIST.every(p => day.prayers[p.id] === 'prayed');
    };

    // Calculate streak from today/yesterday backwards
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let hasStreakAnchor = false;
    let scanDateStr = todayStr;

    // Check if streak was kept up to yesterday or today
    const hasToday = sorted.find(s => s.date === todayStr);
    const hasYesterday = sorted.find(s => s.date === yesterdayStr);

    if (hasToday && isDayFullyPrayed(hasToday)) {
      hasStreakAnchor = true;
      scanDateStr = todayStr;
    } else if (hasYesterday && isDayFullyPrayed(hasYesterday)) {
      hasStreakAnchor = true;
      scanDateStr = yesterdayStr;
    }

    if (hasStreakAnchor) {
      let scanDate = new Date(scanDateStr);
      while (true) {
        const currentScanStr = scanDate.toISOString().split('T')[0];
        const dayRecord = sorted.find(s => s.date === currentScanStr);
        if (dayRecord && isDayFullyPrayed(dayRecord)) {
          currentStreak++;
          scanDate.setDate(scanDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    setStreak(currentStreak);

    // Calculate overall stats of tracking
    let totalPrayed = 0;
    let totalQaza = 0;
    let totalMissed = 0;
    let grandTotal = 0;

    activeProg.forEach(day => {
      PRAYERS_LIST.forEach(p => {
        const status = day.prayers[p.id];
        if (status === 'prayed') totalPrayed++;
        else if (status === 'qaza') totalQaza++;
        else if (status === 'missed') totalMissed++;
        if (status && status !== 'untracked') grandTotal++;
      });
    });

    setSummaryStats({ prayed: totalPrayed, qaza: totalQaza, missed: totalMissed, total: grandTotal });

    // Compute weekly and monthly scores
    const weekly = computePeriodicScore(7, activeProg);
    const monthly = computePeriodicScore(30, activeProg);
    setWeeklyRating(weekly);
    setMonthlyRating(monthly);
  };

  // Get current active selection day record
  const selectedDayRecord = history.find(d => d.date === selectedDateStr) || {
    date: selectedDateStr,
    prayers: { fajr: 'untracked', dhuhr: 'untracked', asr: 'untracked', maghrib: 'untracked', isha: 'untracked' }
  };

  // Change individual prayer status
  const updateStatus = (prayerId: string, status: 'prayed' | 'missed' | 'qaza' | 'untracked') => {
    let updatedHistory = [...history];
    const existingIdx = updatedHistory.findIndex(h => h.date === selectedDateStr);

    if (existingIdx > -1) {
      updatedHistory[existingIdx] = {
        ...updatedHistory[existingIdx],
        prayers: {
          ...updatedHistory[existingIdx].prayers,
          [prayerId]: status
        }
      };
    } else {
      const newDay: TrackerDay = {
        date: selectedDateStr,
        prayers: {
          fajr: 'untracked', dhuhr: 'untracked', asr: 'untracked', maghrib: 'untracked', isha: 'untracked',
          [prayerId]: status
        }
      };
      updatedHistory.push(newDay);
    }

    setHistory(updatedHistory);
    localStorage.setItem('namaz_tracker_v1', JSON.stringify(updatedHistory));
    calculateStreakAndStats(updatedHistory);
  };

  // Export 90 days stats summary
  const copyExportSummary = () => {
    let report = `🕌 BANGLADESH NAMAZ TRACKER SUMMARY 🕌\nGenerated on: ${new Date().toLocaleDateString()}\n\n`;
    report += `🔥 All-Prayed Streak: ${streak} Days\n`;
    report += `✅ Total Prayed: ${summaryStats.prayed}\n`;
    report += `⏳ Total Qaza: ${summaryStats.qaza}\n`;
    report += `❌ Total Missed: ${summaryStats.missed}\n\n`;
    
    // Detailed list of past 7 days
    report += `📅 LAST 7 DAYS DETAILED LIST:\n`;
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const str = date.toISOString().split('T')[0];
      const record = history.find(d => d.date === str);
      
      report += `• ${str}: `;
      if (record) {
        const statuses = PRAYERS_LIST.map(p => `${p.labelEn}: ${record.prayers[p.id] || 'N/A'}`).join(', ');
        report += `${statuses}\n`;
      } else {
        report += `No entries tracking.\n`;
      }
    }

    navigator.clipboard.writeText(report).then(() => {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    });
  };

  // Past 28 days grids calculations for calendar view (GitHub contribution style dots)
  const getDotClass = (dateStr: string) => {
    const record = history.find(h => h.date === dateStr);
    if (!record) return 'bg-gray-100 dark:bg-zinc-800';
    
    const statuses = PRAYERS_LIST.map(p => record.prayers[p.id]);
    const allPrayed = statuses.every(s => s === 'prayed');
    const nonePrayed = statuses.every(s => s === 'missed' || s === 'untracked');

    if (allPrayed) return 'bg-emerald-600 dark:bg-emerald-500 shadow-sm shadow-emerald-500/20';
    if (nonePrayed) return 'bg-red-500/50';
    return 'bg-amber-500 dark:bg-amber-400';
  };

  const contributionDots: string[] = [];
  for (let i = 27; i >= 0; i--) {
    const temp = new Date();
    temp.setDate(temp.getDate() - i);
    contributionDots.push(temp.toISOString().split('T')[0]);
  }

  const displayStreak = language === 'bn' ? toBanglaNum(streak) : streak;
  const displayPrayed = language === 'bn' ? toBanglaNum(summaryStats.prayed) : summaryStats.prayed;
  const displayQaza = language === 'bn' ? toBanglaNum(summaryStats.qaza) : summaryStats.qaza;
  const displayMissed = language === 'bn' ? toBanglaNum(summaryStats.missed) : summaryStats.missed;

  return (
    <div id="prayer-tracker-section" className="bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm select-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            {language === 'bn' ? 'ব্যক্তিগত নামাজ ট্র্যাকার' : 'Personal Prayer Tracker'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {language === 'bn'
              ? 'দৈনিক ৫ ওয়াক্ত ফরজ নামাজের হিসাব ও ধারাবাহিকতা ট্র্যাক করুন'
              : 'Track and retain your 5 daily obligatory prayer routines'}
          </p>
        </div>

        {/* Streak Flame indicator */}
        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 py-1.5 px-3 rounded-full border border-amber-500/10 text-amber-600 dark:text-amber-400">
          <Flame className="w-4 h-4 fill-amber-500 stroke-amber-600" />
          <span className="text-xs font-bold font-mono">
            {displayStreak} {language === 'bn' ? 'দিন অনাবিল' : 'Days Streak'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left column: today's selector and interactive status check */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
              {language === 'bn' ? 'তারিখ নির্বাচন:' : 'Select Tracker Date:'}
            </span>
            <input
              type="date"
              value={selectedDateStr}
              onChange={(e) => setSelectedDateStr(e.target.value)}
              className="py-1 px-3 text-xs font-medium border border-emerald-100 dark:border-neutral-800 bg-emerald-50/10 dark:bg-zinc-950 text-emerald-900 dark:text-emerald-100 rounded-lg outline-none select-all focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-3">
            {PRAYERS_LIST.map((p) => {
              const activeStatus = selectedDayRecord.prayers[p.id] || 'untracked';

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/5 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                      {language === 'bn' ? p.labelBn : p.labelEn} ওয়াক্ত
                    </span>
                    {activeStatus === 'untracked' && isPrayerPassed(selectedDateStr, p.id) && (
                      <span className="text-[10px] text-red-500 font-bold mt-1.5 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/30 w-fit text-center sm:text-left select-none">
                        {language === 'bn' ? '⚠️ অটো মাইনাস (হাজিরা অনুপস্থিত)' : '⚠️ Auto Minus (Absent)'}
                      </span>
                    )}
                  </div>

                  {/* Status switches */}
                  <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 border border-emerald-100/60 dark:border-neutral-800 rounded-xl">
                    <button
                      onClick={() => updateStatus(p.id, 'prayed')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1 transition-all pointer-events-auto cursor-pointer ${
                        activeStatus === 'prayed'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/10'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {language === 'bn' ? 'পড়েছি' : 'Prayed'}
                    </button>

                    <button
                      onClick={() => updateStatus(p.id, 'qaza')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1 transition-all pointer-events-auto cursor-pointer ${
                        activeStatus === 'qaza'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-950/10'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {language === 'bn' ? 'কাযা' : 'Qaza'}
                    </button>

                    <button
                      onClick={() => updateStatus(p.id, 'missed')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1 transition-all pointer-events-auto cursor-pointer ${
                        activeStatus === 'missed'
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/10'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {language === 'bn' ? 'পড়িনি' : 'Missed'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Stats graphs dots and Export action */}
        <div className="md:col-span-5 flex flex-col gap-6">
          
          {/* Quick numbers totals */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {language === 'bn' ? 'পড়া হয়েছে' : 'Prayed'}
              </span>
              <h5 className="text-base font-bold font-mono text-emerald-600 mt-0.5">
                {displayPrayed}
              </h5>
            </div>
            <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {language === 'bn' ? 'কাযা ওয়াক্ত' : 'Qaza'}
              </span>
              <h5 className="text-base font-bold font-mono text-amber-500 mt-0.5">
                {displayQaza}
              </h5>
            </div>
            <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {language === 'bn' ? 'পড়া হয়নি' : 'Missed'}
              </span>
              <h5 className="text-base font-bold font-mono text-red-500 mt-0.5">
                {displayMissed}
              </h5>
            </div>
          </div>

          {/* GitHub contribution style grid (dots) history representation */}
          <div className="p-5 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-2xl border border-emerald-500/5">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-3.5 flex items-center justify-between">
              <span>{language === 'bn' ? 'বিগত ২৮ দিনের চিত্র' : 'Past 28 Days Tracker Graph'}</span>
              <span className="text-[9px] text-gray-400 font-normal">
                {language === 'bn' ? 'সবুজ = সব পড়েছি' : 'Green = All prayed'}
              </span>
            </h4>
            
            <div className="grid grid-cols-7 gap-2">
              {contributionDots.map((dotDate) => (
                <button
                  key={dotDate}
                  onClick={() => setSelectedDateStr(dotDate)}
                  title={dotDate}
                  className={`w-full aspect-square rounded-md transition-all hover:scale-110 pointer-events-auto cursor-pointer ${getDotClass(dotDate)}`}
                />
              ))}
            </div>
          </div>

          {/* Attendance and rating dashboard */}
          <div className="p-5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-950/20 dark:to-teal-950/10 rounded-2xl border border-emerald-500/10 flex flex-col gap-4 select-none">
            <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
              {language === 'bn' ? '📊 হাজিরার রেটিং ও মূল্যায়ন রিপোর্ট' : '📊 Attendance Rating & Report'}
            </h4>

            {/* Weekly Rating Card */}
            <div className="p-3 bg-white dark:bg-zinc-950/40 rounded-xl border border-emerald-500/5 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-450">
                  {language === 'bn' ? 'সাপ্তাহিক হাজিরার হার (৭ দিন)' : 'Weekly Attendance (7 Days)'}
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {language === 'bn' ? toBanglaNum(weeklyRating.score) : weeklyRating.score}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${weeklyRating.score}%` }}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-1 text-[10px]">
                <span className="font-semibold text-gray-450">
                  {language === 'bn' 
                    ? `উপস্থিতি: ${toBanglaNum(weeklyRating.played)} ওয়াক্ত | মিস: ${toBanglaNum(weeklyRating.missed)}`
                    : `Prayed: ${weeklyRating.played} | Missed: ${weeklyRating.missed}`}
                </span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/5 px-1.5 py-0.5 rounded text-[9px]">
                  {language === 'bn' ? weeklyRating.levelBn : weeklyRating.levelEn}
                </span>
              </div>
            </div>

            {/* Monthly Rating Card */}
            <div className="p-3 bg-white dark:bg-zinc-950/40 rounded-xl border border-emerald-500/5 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-450">
                  {language === 'bn' ? 'মাসিক হাজিরার হার (৩০ দিন)' : 'Monthly Attendance (30 Days)'}
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {language === 'bn' ? toBanglaNum(monthlyRating.score) : monthlyRating.score}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${monthlyRating.score}%` }}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-1 text-[10px]">
                <span className="font-semibold text-gray-450">
                  {language === 'bn' 
                    ? `উপস্থিতি: ${toBanglaNum(monthlyRating.played)} ওয়াক্ত | মিস: ${toBanglaNum(monthlyRating.missed)}`
                    : `Prayed: ${monthlyRating.played} | Missed: ${monthlyRating.missed}`}
                </span>
                <span className="font-extrabold text-teal-700 dark:text-teal-300 bg-teal-500/10 dark:bg-teal-500/5 px-1.5 py-0.5 rounded text-[9px]">
                  {language === 'bn' ? monthlyRating.levelBn : monthlyRating.levelEn}
                </span>
              </div>
            </div>
            
            {/* Auto-minus disclaimer note */}
            <p className="text-[9px] text-gray-400 dark:text-gray-500 leading-normal text-center italic">
              {language === 'bn'
                ? '* নামাযের ওয়াক্ত অতিবাহিত হলে এবং ট্র্যাকিং না থাকলে তা গণনা থেকে মাইনাস বা মিস হিসেবে গণ্য করা হয়।'
                : '* Unmarked expired slots are factored in as automatically missed/minus in ratings.'}
            </p>
          </div>

          {/* Export text summary button */}
          <button
            onClick={copyExportSummary}
            id="export-tracker-btn"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
          >
            <Clipboard className="w-4 h-4" />
            {copiedSuccess
              ? language === 'bn' ? 'ক্লিপবোর্ডে কপি সম্পন্ন!' : 'Summary Copied Successfully!'
              : language === 'bn' ? 'নামাজের ডাটা রিপোর্ট কপি করুন' : 'Export and Copy Tracking Logs'}
          </button>
        </div>

      </div>
    </div>
  );
}
