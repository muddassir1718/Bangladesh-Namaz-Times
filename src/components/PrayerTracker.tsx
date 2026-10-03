/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Flame, CheckCircle, XCircle, Clock, Sliders,
  Clipboard, RotateCcw, ShieldAlert, Sparkles, Check, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import { toBanglaNum } from '../utils/calculations';
import { Language, TrackerDay, TrackerCustomizationConfig } from '../types';

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

const DEFAULT_CONFIG: TrackerCustomizationConfig = {
  showPrayedBtn: true,
  showQazaBtn: true,
  showMissedBtn: true,
  autoMinusEnabled: true,
  labelPrayedBn: 'পড়েছি',
  labelPrayedEn: 'Prayed',
  labelQazaBn: 'কাযা',
  labelQazaEn: 'Qaza',
  labelMissedBn: 'পড়িনি',
  labelMissedEn: 'Missed'
};

export default function PrayerTracker({ language }: TrackerProps) {
  const [history, setHistory] = useState<TrackerDay[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [streak, setStreak] = useState<number>(0);
  const [summaryStats, setSummaryStats] = useState({ prayed: 0, qaza: 0, missed: 0, total: 0 });
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);

  // User customizable button toggles and auto-minus configuration
  const [config, setConfig] = useState<TrackerCustomizationConfig>(() => {
    const saved = localStorage.getItem('namaz_tracker_config_v2');
    if (saved) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse tracker config:', e);
      }
    }
    return DEFAULT_CONFIG;
  });

  const [weeklyRating, setWeeklyRating] = useState({
    score: 0,
    levelBn: 'কোনো ডাটা নেই',
    levelEn: 'No data',
    played: 0,
    total: 0,
    missed: 0,
    autoMinusDeduction: 0
  });

  const [monthlyRating, setMonthlyRating] = useState({
    score: 0,
    levelBn: 'কোনো ডাটা নেই',
    levelEn: 'No data',
    played: 0,
    total: 0,
    missed: 0,
    autoMinusDeduction: 0
  });

  // Save config changes to localStorage
  const updateConfig = (update: Partial<TrackerCustomizationConfig>) => {
    const newConfig = { ...config, ...update };
    setConfig(newConfig);
    localStorage.setItem('namaz_tracker_config_v2', JSON.stringify(newConfig));
    calculateStreakAndStats(history, newConfig);
  };

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

  // Compute attendance score with Auto-Minus logic
  const computePeriodicScore = (daysCount: number, activeProg: TrackerDay[], currentConfig: TrackerCustomizationConfig) => {
    let played = 0;
    let missed = 0;
    let totalProposed = 0;
    let autoMinusDeduction = 0;

    const today = new Date();

    for (let i = 0; i < daysCount; i++) {
      const current = new Date();
      current.setDate(today.getDate() - i);
      const dateStr = current.toISOString().split('T')[0];

      const record = activeProg.find(d => d.date === dateStr);
      let dayPrayedCount = 0;
      
      PRAYERS_LIST.forEach(p => {
        const status = record ? record.prayers[p.id] : 'untracked';
        const passed = isPrayerPassed(dateStr, p.id);

        if (status === 'prayed') {
          played++;
          dayPrayedCount++;
          totalProposed++;
        } else if (status === 'qaza' || status === 'missed') {
          missed++;
          totalProposed++;
          if (currentConfig.autoMinusEnabled) {
            autoMinusDeduction++;
          }
        } else {
          // Untracked passed prayers
          if (passed) {
            missed++;
            totalProposed++;
            if (currentConfig.autoMinusEnabled) {
              autoMinusDeduction++;
            }
          }
        }
      });

      // If a full passed day had 0 prayers attended, penalize heavily
      if (dateStr < today.toISOString().split('T')[0] && dayPrayedCount === 0 && currentConfig.autoMinusEnabled) {
        // entire day missing
      }
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

    return { score: percentage, levelBn, levelEn, played, total: totalProposed, missed, autoMinusDeduction };
  };

  // Streak counter: consecutive days where ALL 5 prayers are marked as 'prayed'
  const calculateStreakAndStats = (activeProg: TrackerDay[], activeConfig: TrackerCustomizationConfig = config) => {
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
    const weekly = computePeriodicScore(7, activeProg, activeConfig);
    const monthly = computePeriodicScore(30, activeProg, activeConfig);
    setWeeklyRating(weekly);
    setMonthlyRating(monthly);
  };

  // Load tracker history data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('namaz_tracker_v1');
    if (saved) {
      try {
        const parsed: TrackerDay[] = JSON.parse(saved);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const filtered = parsed.filter(day => new Date(day.date) >= ninetyDaysAgo);
        setHistory(filtered);
        calculateStreakAndStats(filtered, config);
      } catch (err) {
        console.error('Error loading tracker history:', err);
      }
    } else {
      const emptySeed: TrackerDay[] = [];
      setHistory(emptySeed);
    }
  }, [selectedDateStr]);

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
      // Toggle off if clicked same active status
      const currentStatus = updatedHistory[existingIdx].prayers[prayerId];
      const newStatus = currentStatus === status ? 'untracked' : status;

      updatedHistory[existingIdx] = {
        ...updatedHistory[existingIdx],
        prayers: {
          ...updatedHistory[existingIdx].prayers,
          [prayerId]: newStatus
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
    calculateStreakAndStats(updatedHistory, config);

    // Mobile haptic pulse if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(40);
      } catch (e) {
        // ignore
      }
    }
  };

  // Export 90 days stats summary
  const copyExportSummary = () => {
    let report = `🕌 BANGLADESH NAMAZ TRACKER SUMMARY 🕌\nGenerated on: ${new Date().toLocaleDateString()}\n\n`;
    report += `🔥 All-Prayed Streak: ${streak} Days\n`;
    report += `✅ Total Prayed: ${summaryStats.prayed}\n`;
    report += `⏳ Total Qaza: ${summaryStats.qaza}\n`;
    report += `❌ Total Missed: ${summaryStats.missed}\n`;
    report += `⚡ Auto-Minus System: ${config.autoMinusEnabled ? 'Active' : 'Disabled'}\n\n`;
    
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

  // Past 28 days dots styling
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

  // Selected day auto-minus count
  const autoMinusedPrayersToday = PRAYERS_LIST.filter(p => {
    const status = selectedDayRecord.prayers[p.id] || 'untracked';
    return (status === 'missed' || (status === 'untracked' && isPrayerPassed(selectedDateStr, p.id)));
  });

  return (
    <div id="prayer-tracker-section" className="bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-sm select-none">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-100">
              {language === 'bn' ? 'ব্যক্তিগত নামাজ ট্র্যাকার ও হাজিরা' : 'Personal Prayer Tracker'}
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {language === 'bn'
              ? 'দৈনিক ৫ ওয়াক্ত ফরজ নামাজের হাজিরা, অন/অফ বাটন কাস্টমাইজেশন ও অটো মাইনাস সিস্টেম'
              : 'Daily obligatory prayer attendance, toggleable custom buttons & auto-minus system'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Customization Toggle Button */}
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              showConfigPanel
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-zinc-950 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'বাটন কাস্টমাইজ' : 'Customize Buttons'}</span>
            {showConfigPanel ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>

          {/* Streak Flame indicator */}
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 py-1.5 px-3 rounded-xl border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Flame className="w-4 h-4 fill-amber-500 stroke-amber-600 animate-pulse" />
            <span className="text-xs font-bold font-mono">
              {displayStreak} {language === 'bn' ? 'দিন অনাবিল' : 'Days Streak'}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. BUTTON CUSTOMIZATION & AUTO-MINUS ON/OFF DRAWER      */}
      {/* ======================================================== */}
      {showConfigPanel && (
        <div className="mb-6 p-5 bg-emerald-50/30 dark:bg-zinc-950/60 border border-emerald-500/20 rounded-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'হাজিরা বাটন ও অটো মাইনাস কাস্টমাইজেশন' : 'Attendance Buttons & Auto-Minus Controls'}</span>
            </h4>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              {language === 'bn' ? 'যেসব বাটন বন্ধ করবেন তা স্ক্রিনে দেখাবে না' : 'Disabled buttons will be hidden'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Prayed Button On/Off & Label */}
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-500/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  {language === 'bn' ? 'পড়েছি বাটন' : 'Prayed Button'}
                </span>
                <button
                  onClick={() => updateConfig({ showPrayedBtn: !config.showPrayedBtn })}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition ${
                    config.showPrayedBtn ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'
                  }`}
                >
                  {config.showPrayedBtn ? (language === 'bn' ? 'অন (ON)' : 'ON') : (language === 'bn' ? 'অফ (OFF)' : 'OFF')}
                </button>
              </div>
              <input
                type="text"
                value={language === 'bn' ? config.labelPrayedBn : config.labelPrayedEn}
                onChange={(e) => {
                  if (language === 'bn') updateConfig({ labelPrayedBn: e.target.value });
                  else updateConfig({ labelPrayedEn: e.target.value });
                }}
                placeholder={language === 'bn' ? 'বাটন লেবেল (যেমন: পড়েছি)' : 'Button Label'}
                className="w-full text-xs py-1.5 px-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-neutral-800 rounded-lg outline-none"
              />
            </div>

            {/* 2. Qaza Button On/Off & Label */}
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-amber-500/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {language === 'bn' ? 'কাযা বাটন' : 'Qaza Button'}
                </span>
                <button
                  onClick={() => updateConfig({ showQazaBtn: !config.showQazaBtn })}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition ${
                    config.showQazaBtn ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'
                  }`}
                >
                  {config.showQazaBtn ? (language === 'bn' ? 'অন (ON)' : 'ON') : (language === 'bn' ? 'অফ (OFF)' : 'OFF')}
                </button>
              </div>
              <input
                type="text"
                value={language === 'bn' ? config.labelQazaBn : config.labelQazaEn}
                onChange={(e) => {
                  if (language === 'bn') updateConfig({ labelQazaBn: e.target.value });
                  else updateConfig({ labelQazaEn: e.target.value });
                }}
                placeholder={language === 'bn' ? 'বাটন লেবেল (যেমন: কাযা)' : 'Button Label'}
                className="w-full text-xs py-1.5 px-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-neutral-800 rounded-lg outline-none"
              />
            </div>

            {/* 3. Missed Button On/Off & Label */}
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-red-500/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                  {language === 'bn' ? 'পড়িনি বাটন' : 'Missed Button'}
                </span>
                <button
                  onClick={() => updateConfig({ showMissedBtn: !config.showMissedBtn })}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition ${
                    config.showMissedBtn ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'
                  }`}
                >
                  {config.showMissedBtn ? (language === 'bn' ? 'অন (ON)' : 'ON') : (language === 'bn' ? 'অফ (OFF)' : 'OFF')}
                </button>
              </div>
              <input
                type="text"
                value={language === 'bn' ? config.labelMissedBn : config.labelMissedEn}
                onChange={(e) => {
                  if (language === 'bn') updateConfig({ labelMissedBn: e.target.value });
                  else updateConfig({ labelMissedEn: e.target.value });
                }}
                placeholder={language === 'bn' ? 'বাটন লেবেল (যেমন: পড়িনি)' : 'Button Label'}
                className="w-full text-xs py-1.5 px-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-neutral-800 rounded-lg outline-none"
              />
            </div>
          </div>

          {/* Auto-Minus System Main Toggle */}
          <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                  {language === 'bn' ? 'অটো মাইনাস সিস্টেম (Auto Minus System)' : 'Auto-Minus Attendance System'}
                </h5>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {language === 'bn'
                    ? 'যেদিন নামাজ পড়া হবে না বা বাদ যাবে, সেদিন হাজিরা স্বয়ংক্রিয়ভাবে মাইনাস হবে।'
                    : 'Days/slots where prayer is skipped will automatically deduct attendance points.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => updateConfig({ autoMinusEnabled: !config.autoMinusEnabled })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition shrink-0 ${
                config.autoMinusEnabled
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {config.autoMinusEnabled
                ? (language === 'bn' ? 'স্বয়ংক্রিয় মাইনাস চালু ✓' : 'Auto-Minus Active ✓')
                : (language === 'bn' ? 'অটো মাইনাস বন্ধ' : 'Auto-Minus OFF')}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MAIN TRACKER BODY: LEFT CHECKLIST & RIGHT REPORTS     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left column: today's selector and interactive status check */}
        <div className="md:col-span-7 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
              {language === 'bn' ? 'তারিখ নির্বাচন:' : 'Select Tracker Date:'}
            </span>
            <input
              type="date"
              value={selectedDateStr}
              onChange={(e) => setSelectedDateStr(e.target.value)}
              className="py-1 px-3 text-xs font-medium border border-emerald-100 dark:border-neutral-800 bg-emerald-50/10 dark:bg-zinc-950 text-emerald-900 dark:text-emerald-100 rounded-lg outline-none select-all focus:border-emerald-500 cursor-pointer"
            />
          </div>

          {/* Auto-minus badge warning if any prayers are missed today */}
          {config.autoMinusEnabled && autoMinusedPrayersToday.length > 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center justify-between gap-3 text-xs text-red-700 dark:text-red-400">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-bold">
                  {language === 'bn'
                    ? `⚠️ অটো মাইনাস সক্রিয়: ${toBanglaNum(autoMinusedPrayersToday.length)}টি ওয়াক্তে অনুপস্থিতি থাকায় হাজিরা কর্তন করা হয়েছে!`
                    : `⚠️ Auto-Minus active: ${autoMinusedPrayersToday.length} prayer(s) unprayed/missed deducted from attendance!`}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {PRAYERS_LIST.map((p) => {
              const activeStatus = selectedDayRecord.prayers[p.id] || 'untracked';
              const passed = isPrayerPassed(selectedDateStr, p.id);
              const isAutoMinusSlot = activeStatus === 'untracked' && passed && config.autoMinusEnabled;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    isAutoMinusSlot
                      ? 'bg-red-500/5 border-red-500/20'
                      : activeStatus === 'prayed'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-emerald-50/20 dark:bg-zinc-950/40 border-emerald-500/10'
                  }`}
                >
                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                    <span className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                      {language === 'bn' ? p.labelBn : p.labelEn} ওয়াক্ত
                    </span>
                    
                    {/* Status hint badge */}
                    {isAutoMinusSlot && (
                      <span className="text-[10px] text-red-600 dark:text-red-400 font-bold mt-1 bg-red-100 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/40">
                        {language === 'bn' ? '⚠️ অটো মাইনাস (হাজিরা অনুপস্থিত)' : '⚠️ Auto Minus (Absent)'}
                      </span>
                    )}

                    {activeStatus === 'prayed' && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {language === 'bn' ? 'হাজিরা সম্পন্ন' : 'Attendance Verified'}
                      </span>
                    )}
                  </div>

                  {/* Status switches respecting user customization */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-1 bg-white dark:bg-zinc-900 p-1 border border-emerald-100/60 dark:border-neutral-800 rounded-xl w-full sm:w-auto">
                    
                    {/* 1. Prayed Button (Only shown if toggled ON) */}
                    {config.showPrayedBtn && (
                      <button
                        onClick={() => updateStatus(p.id, 'prayed')}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                          activeStatus === 'prayed'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? (config.labelPrayedBn || 'পড়েছি') : (config.labelPrayedEn || 'Prayed')}</span>
                      </button>
                    )}

                    {/* 2. Qaza Button (Only shown if toggled ON) */}
                    {config.showQazaBtn && (
                      <button
                        onClick={() => updateStatus(p.id, 'qaza')}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                          activeStatus === 'qaza'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? (config.labelQazaBn || 'কাযা') : (config.labelQazaEn || 'Qaza')}</span>
                      </button>
                    )}

                    {/* 3. Missed Button (Only shown if toggled ON) */}
                    {config.showMissedBtn && (
                      <button
                        onClick={() => updateStatus(p.id, 'missed')}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                          activeStatus === 'missed'
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/20'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? (config.labelMissedBn || 'পড়িনি') : (config.labelMissedEn || 'Missed')}</span>
                      </button>
                    )}

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
                {language === 'bn' ? (config.labelPrayedBn || 'পড়া হয়েছে') : 'Prayed'}
              </span>
              <h5 className="text-base font-black font-mono text-emerald-600 mt-0.5">
                {displayPrayed}
              </h5>
            </div>
            <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {language === 'bn' ? (config.labelQazaBn || 'কাযা ওয়াক্ত') : 'Qaza'}
              </span>
              <h5 className="text-base font-black font-mono text-amber-500 mt-0.5">
                {displayQaza}
              </h5>
            </div>
            <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {language === 'bn' ? (config.labelMissedBn || 'পড়া হয়নি') : 'Missed'}
              </span>
              <h5 className="text-base font-black font-mono text-red-500 mt-0.5">
                {displayMissed}
              </h5>
            </div>
          </div>

          {/* GitHub contribution style grid (dots) history representation */}
          <div className="p-5 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-2xl border border-emerald-500/10">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-3.5 flex items-center justify-between">
              <span>{language === 'bn' ? 'বিগত ২৮ দিনের চিত্র' : 'Past 28 Days Tracker Graph'}</span>
              <span className="text-[9px] text-gray-400 font-normal">
                {language === 'bn' ? 'সবুজ = ৫ ওয়াক্ত পড়েছি' : 'Green = All prayed'}
              </span>
            </h4>
            
            <div className="grid grid-cols-7 gap-2">
              {contributionDots.map((dotDate) => (
                <button
                  key={dotDate}
                  onClick={() => setSelectedDateStr(dotDate)}
                  title={dotDate}
                  className={`w-full aspect-square rounded-md transition-all hover:scale-110 cursor-pointer ${getDotClass(dotDate)}`}
                />
              ))}
            </div>
          </div>

          {/* Attendance and rating dashboard */}
          <div className="p-5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-950/20 dark:to-teal-950/10 rounded-2xl border border-emerald-500/10 flex flex-col gap-4 select-none">
            <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center justify-between">
              <span>{language === 'bn' ? '📊 হাজিরার রেটিং ও মূল্যায়ন রিপোর্ট' : '📊 Attendance Rating & Report'}</span>
              {config.autoMinusEnabled && (
                <span className="text-[9px] bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  {language === 'bn' ? 'অটো মাইনাস সক্রিয়' : 'Auto-Minus ON'}
                </span>
              )}
            </h4>

            {/* Weekly Rating Card */}
            <div className="p-3 bg-white dark:bg-zinc-950/40 rounded-xl border border-emerald-500/10 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                  {language === 'bn' ? 'সাপ্তাহিক হাজিরার হার (৭ দিন)' : 'Weekly Attendance (7 Days)'}
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {language === 'bn' ? toBanglaNum(weeklyRating.score) : weeklyRating.score}%
                </span>
              </div>
              
              <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${weeklyRating.score}%` }}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-1 text-[10px]">
                <span className="font-semibold text-gray-500 dark:text-gray-400">
                  {language === 'bn' 
                    ? `উপস্থিতি: ${toBanglaNum(weeklyRating.played)} ওয়াক্ত | মিস: ${toBanglaNum(weeklyRating.missed)}`
                    : `Prayed: ${weeklyRating.played} | Missed: ${weeklyRating.missed}`}
                </span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[9px]">
                  {language === 'bn' ? weeklyRating.levelBn : weeklyRating.levelEn}
                </span>
              </div>
            </div>

            {/* Monthly Rating Card */}
            <div className="p-3 bg-white dark:bg-zinc-950/40 rounded-xl border border-emerald-500/10 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                  {language === 'bn' ? 'মাসিক হাজিরার হার (৩০ দিন)' : 'Monthly Attendance (30 Days)'}
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {language === 'bn' ? toBanglaNum(monthlyRating.score) : monthlyRating.score}%
                </span>
              </div>
              
              <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${monthlyRating.score}%` }}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-1 text-[10px]">
                <span className="font-semibold text-gray-500 dark:text-gray-400">
                  {language === 'bn' 
                    ? `উপস্থিতি: ${toBanglaNum(monthlyRating.played)} ওয়াক্ত | মিস: ${toBanglaNum(monthlyRating.missed)}`
                    : `Prayed: ${monthlyRating.played} | Missed: ${monthlyRating.missed}`}
                </span>
                <span className="font-extrabold text-teal-700 dark:text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded text-[9px]">
                  {language === 'bn' ? monthlyRating.levelBn : monthlyRating.levelEn}
                </span>
              </div>
            </div>
            
            {/* Auto-minus disclaimer note */}
            <p className="text-[9px] text-gray-400 dark:text-gray-500 leading-normal text-center italic">
              {language === 'bn'
                ? '* অটো মাইনাস নিয়ম অনুযায়ী: নামায না পড়লে বা বাদ গেলে হাজিরার হার ও স্কোর থেকে স্বয়ংক্রিয়ভাবে পয়েন্ট মাইনাস হয়।'
                : '* Under Auto-Minus rules: unprayed or missed prayer days automatically subtract from attendance rates.'}
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
