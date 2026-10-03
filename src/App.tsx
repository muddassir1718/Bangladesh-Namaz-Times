/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin, Clock, Sun, Moon, Volume2, VolumeX, Menu, X, BookOpen, ChevronRight,
  Printer, Smartphone, Compass as CompIcon, Calendar as CalIcon, Settings as SetIcon,
  Heart, CheckCircle, Search, Copy, Share2, Compass, Award, ExternalLink
} from 'lucide-react';

import { AppSettings, Language, Theme, Madhab, CalcMethod, District, PrayerTime } from './types';
import { DISTRICTS_LIST } from './data/districts';
import { DUAS_LIST } from './data/duas';
import { calculatePrayerTimes, checkForbiddenStatus, toBanglaNum, formatCountdown, formatCountdownHMS } from './utils/calculations';
import { getHijriDate, getBanglaDate } from './utils/calendar';

import CompassComponent from './components/Compass';
import TasbihComponent from './components/Tasbih';
import CalendarComponent from './components/CalendarComponent';
import ZakatCalculator from './components/ZakatCalculator';
import PrayerTracker from './components/PrayerTracker';
import SettingsPanel, { MUEZZIN_LIST } from './components/SettingsPanel';
import RamadanDashboard from './components/RamadanDashboard';
import { HIJRI_MONTH_VIRTUES, DAILY_HADITH_DUAS } from './data/hijriLessons';

// Default initial settings
const DEFAULT_SETTINGS: AppSettings = {
  language: 'bn',
  theme: 'dark',
  preset: 'madina-emerald',
  customPrimary: '#0F6B4F',
  customAccent: '#D4AF37',
  customBgLight: '#F4F8F5',
  customBgDark: '#07150C',
  customText: '#111827',
  customTextSecondary: '#4B5563',
  customBorder: '#163D24',
  backgroundPattern: '8-point-star',
  buttonShape: 'soft-rounded',
  buttonBgStyle: 'solid-vibrant',
  buttonTextColor: 'bright-white',
  customButtonTextColor: '#FFFFFF',
  buttonShadow: 'subtle-shadow',
  buttonHoverEffect: 'smooth-lift',
  fontFamily: 'sans',
  fontColorTone: 'default',
  ambientMotionEnabled: true,
  motionIntensity: 'calm',
  showFloatingParticles: true,
  showRotatingRosette: true,
  madhab: 'shafi',
  calcMethod: 'MWL',
  clockFormat: '12h',
  volume: 0.8,
  selectedMuezzin: 'makkah',
  hapticFeedback: true,
  notificationSettings: {}
};

export default function App() {
  // Global Clock States live
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // App Settings saved in localStorage
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Selected District & GPS states
  const [selectedDistrict, setSelectedDistrict] = useState<District>(DISTRICTS_LIST[0]); // default Dhaka
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Page Nav Tabs (Mobile bottom bar, Desktop sidebar)
  const [activeTab, setActiveTab] = useState<'prayer' | 'qibla' | 'tasbih' | 'calendar' | 'more'>('prayer');
  // Sub navigation inside "More" tab
  const [moreSubTab, setMoreSubTab] = useState<'duas' | 'zakat' | 'tracker' | 'settings'>('duas');

  // Duas Search and Bookmarks Filters
  const [duasSearch, setDuasSearch] = useState<string>('');
  const [selectedDuaCat, setSelectedDuaCat] = useState<string>('all');
  const [savedDuaIds, setSavedDuaIds] = useState<string[]>([]);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState<boolean>(false);

  // Custom schedule month planner district offsets State
  const [scheduleDistrict, setScheduleDistrict] = useState<District>(DISTRICTS_LIST[0]);

  // Toast Alerts & Notification audio controls
  const [toastMessage, setToastMessage] = useState<{ bn: string; en: string } | null>(null);
  const [adjanAudioObj, setAdjanAudioObj] = useState<HTMLAudioElement | null>(null);
  const [isAdjanPlaying, setIsAdjanPlaying] = useState<boolean>(false);
  const lastTriggeredMin = useRef<string>('');

  // 1. Initial configuration loader
  useEffect(() => {
    // Determine system elements themes
    const saved = localStorage.getItem('namaz_times_settings_v1');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (err) {
        console.error('Settings load error:', err);
      }
    }

    const savedDistrictId = localStorage.getItem('namaz_times_district_v1');
    if (savedDistrictId) {
      const match = DISTRICTS_LIST.find(d => d.id === savedDistrictId);
      if (match) setSelectedDistrict(match);
    }

    const savedBookmarks = localStorage.getItem('namaz_times_bookmarks_v1');
    if (savedBookmarks) {
      try {
        setSavedDuaIds(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error(e);
      }
    }

    // Try background GPS lock on startup
    requestGpsLocation(true);
  }, []);

  // 2. Setting theme changes classes injectors
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.add('light');
    } else {
      // Auto
      const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(sysDark ? 'dark' : 'light');
    }

    // Set attributes for CSS styling
    root.setAttribute('data-preset', settings.preset || 'madina-emerald');
    root.setAttribute('data-pattern', settings.backgroundPattern || '8-point-star');
    root.setAttribute('data-btn-shape', settings.buttonShape || 'soft-rounded');
    root.setAttribute('data-btn-bg-style', settings.buttonBgStyle || 'solid-vibrant');
    root.setAttribute('data-btn-text', settings.buttonTextColor || 'bright-white');
    root.setAttribute('data-btn-shadow', settings.buttonShadow || 'subtle-shadow');
    root.setAttribute('data-btn-hover', settings.buttonHoverEffect || 'smooth-lift');
    root.setAttribute('data-font-family', settings.fontFamily || 'sans');
    root.setAttribute('data-font-tone', settings.fontColorTone || 'default');
    root.setAttribute('data-motion-enabled', String(settings.ambientMotionEnabled !== false));
    root.setAttribute('data-motion-intensity', settings.motionIntensity || 'calm');

    // Set custom CSS variables
    if (settings.customPrimary) root.style.setProperty('--brand-primary', settings.customPrimary);
    if (settings.customAccent) root.style.setProperty('--brand-accent', settings.customAccent);
    if (settings.customBgDark) root.style.setProperty('--brand-bg-dark', settings.customBgDark);
    if (settings.customBgLight) root.style.setProperty('--brand-bg-light', settings.customBgLight);
    if (settings.customText) root.style.setProperty('--brand-text-custom', settings.customText);
    if (settings.customTextSecondary) root.style.setProperty('--brand-text-sec', settings.customTextSecondary);
    if (settings.customBorder) root.style.setProperty('--brand-border', settings.customBorder);
    if (settings.customButtonTextColor) root.style.setProperty('--custom-btn-text', settings.customButtonTextColor);
  }, [
    settings.theme,
    settings.preset,
    settings.customPrimary,
    settings.customAccent,
    settings.customBgDark,
    settings.customBgLight,
    settings.customText,
    settings.customTextSecondary,
    settings.customBorder,
    settings.backgroundPattern,
    settings.buttonShape,
    settings.buttonBgStyle,
    settings.buttonTextColor,
    settings.customButtonTextColor,
    settings.buttonShadow,
    settings.buttonHoverEffect,
    settings.fontFamily,
    settings.fontColorTone,
    settings.ambientMotionEnabled,
    settings.motionIntensity
  ]);

  // 3. Live ticking timer every 1s
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Background Adhan scheduler check
      triggerAdhanCheck(now);
    }, 1000);

    return () => clearInterval(interval);
  }, [settings, selectedDistrict]);

  // Adjust volume dynamically if audio is playing
  useEffect(() => {
    if (adjanAudioObj) {
      adjanAudioObj.volume = settings.volume;
    }
  }, [settings.volume, adjanAudioObj]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    localStorage.setItem('namaz_times_settings_v1', JSON.stringify(updated));
  };

  const handleToggleLanguage = () => {
    updateSettings({ language: settings.language === 'bn' ? 'en' : 'bn' });
  };

  const handleSelectDistrict = (district: District) => {
    setSelectedDistrict(district);
    localStorage.setItem('namaz_times_district_v1', district.id);
  };

  // Coordinates nearest district auto detection calculations
  const calculateNearestDistrict = (lat: number, lng: number) => {
    let nearest: District = DISTRICTS_LIST[0];
    let minDistance = Infinity;

    DISTRICTS_LIST.forEach(d => {
      // Euclidean distance simple metric for quick sort
      const dist = Math.pow(d.lat - lat, 2) + Math.pow(d.lng - lng, 2);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = d;
      }
    });

    return nearest;
  };

  const requestGpsLocation = (silent: boolean = false) => {
    if (!navigator.geolocation) {
      if (!silent) {
        showToast('জিপিএস আপনার ব্রাউজারে সমর্থিত নয়', 'GPS is not supported by your browser');
      }
      return;
    }

    if (!silent) setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        setGpsStatus('granted');
        const { latitude, longitude } = pos.coords;
        const nearest = calculateNearestDistrict(latitude, longitude);
        handleSelectDistrict(nearest);
        if (!silent) {
          showToast(
            `অবস্থান সনাক্ত করা হয়েছে: ${nearest.nameBn}`,
            `Location detected: ${nearest.nameEn}`
          );
        }
      },
      (error) => {
        setGpsLoading(false);
        setGpsStatus('denied');
        console.warn('Geolocation error:', error);
        if (!silent) {
          showToast(
            'জিপিএস অনুমতি প্রত্যাখ্যাত। অনুগ্রহ করে ম্যানুয়ালি জেলা নির্বাচন করুন।',
            'GPS access denied. Please select your district manually.'
          );
        }
      },
      { timeout: 8000 }
    );
  };

  // Toast Helper
  const showToast = (bn: string, en: string) => {
    setToastMessage({ bn, en });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Audio Adhan triggers
  const triggerAdhanCheck = (now: Date) => {
    const dayTimes = calculatePrayerTimes(
      now,
      selectedDistrict.lat,
      selectedDistrict.lng,
      6,
      settings.madhab,
      settings.calcMethod
    );

    const checkMinHour = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const currentSecondStr = now.toLocaleTimeString('en-US', { hour12: false, second: '2-digit' });

    // Ensure we only fire once within the target minute transition
    if (lastTriggeredMin.current === checkMinHour) return;

    // We check core fard prayers: Fajr, Dhuhr, Asr, Maghrib, Isha
    const fardPrayers = dayTimes.filter(p => p.type === 'fard');

    fardPrayers.forEach((p) => {
      if (p.time === checkMinHour && currentSecondStr === '00') {
        lastTriggeredMin.current = checkMinHour;
        fireAdhanNotification(p);
      }
    });
  };

  const fireAdhanNotification = (prayer: PrayerTime) => {
    const pName = settings.language === 'bn' ? prayer.nameBn : prayer.nameEn;
    const title = settings.language === 'bn' ? `${pName} এর আযানের সময় হয়েছে` : `Time for ${pName} Prayer`;
    const body = settings.language === 'bn' ? 'আসুন নামাজের দিকে...' : 'Hurry to Success...';

    // 1. Browser Push Notifications
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          silent: true // handle audio separately
        });
      } catch (err) {
        console.error(err);
      }
    } else if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // 2. Play Adhan Audio Based on settings
    triggerAdhanAudioPlay();
  };

  const triggerAdhanAudioPlay = () => {
    if (isAdjanPlaying) return;

    try {
      setIsAdjanPlaying(true);
      // Play selected Muezzin Adhan MP3
      const selectedObj = MUEZZIN_LIST.find(m => m.id === settings.selectedMuezzin);
      const audioUrl = selectedObj ? selectedObj.audioUrl : 'https://www.islamcan.com/audio/adhan/azan1.mp3';
      const audio = new Audio(audioUrl);
      audio.volume = settings.volume;
      setAdjanAudioObj(audio);

      audio.play().catch(err => {
        console.warn('Audio play blocked or unavailable. Falling back to synthetic buzzer:', err);
        // Fallback to Web Audio synthesised beep
        playSyntheticBuzzer();
      });

      audio.onended = () => {
        setIsAdjanPlaying(false);
        setAdjanAudioObj(null);
      };
    } catch (e) {
      console.error(e);
      setIsAdjanPlaying(false);
    }
  };

  const stopActiveAdhan = () => {
    if (adjanAudioObj) {
      adjanAudioObj.pause();
      adjanAudioObj.currentTime = 0;
      setIsAdjanPlaying(false);
      setAdjanAudioObj(null);
    }
  };

  const playSyntheticBuzzer = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // Standard A note

      // double pulse alarm
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.5, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Computation outputs
  const dateTimesOfToday = calculatePrayerTimes(
    currentTime,
    selectedDistrict.lat,
    selectedDistrict.lng,
    6,
    settings.madhab,
    settings.calcMethod
  );

  // Calculate Current / Next Prayer status and precise countdowns with seconds
  const calculateCurrentNextPrayer = () => {
    const currentH = currentTime.getHours();
    const currentM = currentTime.getMinutes();
    const currentS = currentTime.getSeconds();
    const totalSecondsNow = currentH * 3600 + currentM * 60 + currentS;

    // Convert HH:MM list to relative seconds
    const timesWithSecs = dateTimesOfToday.map(p => {
      const [h, m] = p.time.split(':').map(Number);
      return {
        ...p,
        secs: h * 3600 + m * 60,
        mins: h * 60 + m
      };
    });

    // Fard prayers sorted chronologically
    const fardTimes = timesWithSecs.filter(p => p.type === 'fard');

    let currentPrayer = fardTimes[fardTimes.length - 1]; // default Isha
    let nextPrayer = fardTimes[0]; // default Fajr of tomorrow
    let secondsRemaining = 0;

    for (let i = 0; i < fardTimes.length; i++) {
      if (totalSecondsNow >= fardTimes[i].secs) {
        currentPrayer = fardTimes[i];
        if (i < fardTimes.length - 1) {
          nextPrayer = fardTimes[i + 1];
          secondsRemaining = nextPrayer.secs - totalSecondsNow;
        } else {
          // next prayer is tomorrow's Fajr
          nextPrayer = fardTimes[0];
          secondsRemaining = (24 * 3600 - totalSecondsNow) + nextPrayer.secs;
        }
      }
    }

    // Edge case before 1st prayer (Fajr)
    if (totalSecondsNow < fardTimes[0].secs) {
      currentPrayer = fardTimes[fardTimes.length - 1]; // Still Isha theoretically
      nextPrayer = fardTimes[0];
      secondsRemaining = nextPrayer.secs - totalSecondsNow;
    }

    const countdownHMS = formatCountdownHMS(secondsRemaining, settings.language);

    return {
      currentPrayer,
      nextPrayer,
      secondsRemaining,
      minutesRemaining: Math.floor(secondsRemaining / 60),
      countdownHMS
    };
  };

  const { currentPrayer, nextPrayer, secondsRemaining, minutesRemaining, countdownHMS } = calculateCurrentNextPrayer();

  // Get forbidden status checks of today
  const sunriseObj = dateTimesOfToday.find(p => p.id === 'sunrise')!;
  const dhuhrObj = dateTimesOfToday.find(p => p.id === 'dhuhr')!;
  const sunsetObj = dateTimesOfToday.find(p => p.id === 'sunset')!;

  const formattedTimeStr = currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const forbiddenCheck = checkForbiddenStatus(
    formattedTimeStr,
    sunriseObj.time,
    dhuhrObj.time,
    sunsetObj.time
  );

  // Islamic and Bengali calendar calculations
  const hijriDate = getHijriDate(currentTime, settings.hijriOffset !== undefined ? settings.hijriOffset : -1);
  const banglaDate = getBanglaDate(currentTime);

  const activeMonthVirtue = HIJRI_MONTH_VIRTUES.find(v => v.monthIndex === hijriDate.month);
  const activeDayIndex = Math.min(30, Math.max(1, hijriDate.day));
  const activeDailyHadithDua = DAILY_HADITH_DUAS.find(h => h.dayIndex === activeDayIndex) || DAILY_HADITH_DUAS[0];

  const displayDigitalClock = () => {
    // Standard format converter
    const formatOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: settings.clockFormat === '12h'
    };
    const timeString = currentTime.toLocaleTimeString(settings.language === 'bn' ? 'bn-BD' : 'en-US', formatOptions);
    return timeString;
  };

  const displayDateLine = () => {
    if (settings.language === 'bn') {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const engStr = currentTime.toLocaleDateString('bn-BD', options);
      const bYear = toBanglaNum(banglaDate.year);
      const bDay = toBanglaNum(banglaDate.day);
      const hYear = toBanglaNum(hijriDate.year);
      const hDay = toBanglaNum(hijriDate.day);

      return {
        eng: engStr,
        hijri: `${hDay} ${hijriDate.monthNameBn}, ${hYear} হিজরি`,
        bangla: `${bDay} ${banglaDate.monthNameBn}, ${bYear} বঙ্গাব্দ`
      };
    } else {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const engStr = currentTime.toLocaleDateString('en-GB', options);
      return {
        eng: engStr,
        hijri: `${hijriDate.day} ${hijriDate.monthNameEn}, ${hijriDate.year} AH`,
        bangla: `${banglaDate.day} ${banglaDate.monthNameEn}, ${banglaDate.year} BS`
      };
    }
  };

  const dateLines = displayDateLine();

  // Print monthly schedule array builder for current month
  const getMonthlyPrintData = () => {
    const list: any[] = [];
    const year = currentTime.getFullYear();
    const month = currentTime.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateCell = new Date(year, month, day);
      const dailyTimes = calculatePrayerTimes(
        dateCell,
        scheduleDistrict.lat,
        scheduleDistrict.lng,
        6,
        settings.madhab,
        settings.calcMethod
      );
      list.push({
        date: dateCell.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        times: dailyTimes
      });
    }
    return list;
  };

  const printMonthlySchedule = () => {
    window.print();
  };

  // Duas Category Filter
  const toggleBookmarkDua = (id: string) => {
    let updated = [...savedDuaIds];
    if (updated.includes(id)) {
      updated = updated.filter(x => x !== id);
    } else {
      updated.push(id);
      if (settings.hapticFeedback && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(35);
      }
    }
    setSavedDuaIds(updated);
    localStorage.setItem('namaz_times_bookmarks_v1', JSON.stringify(updated));
    showToast(
      updated.includes(id) ? 'দুআ বুকমার্ক এ যুক্ত করা হয়েছে' : 'বুকমার্ক সরানো হয়েছে',
      updated.includes(id) ? 'Dua bookmarked successfully' : 'Bookmark removed'
    );
  };

  const copyContentDua = (dua: any) => {
    const text = `🕌 ${settings.language === 'bn' ? dua.titleBn : dua.titleEn} 🕌\n\nArabic:\n${dua.arabic}\n\nPhonetic Pronunciation:\n${settings.language === 'bn' ? dua.pronunciationBn : dua.pronunciationEn}\n\nMeaning:\n${settings.language === 'bn' ? dua.meaningBn : dua.meaningEn}\n\nShared via Bangladesh Namaz Times App.`;
    navigator.clipboard.writeText(text).then(() => {
      if (settings.hapticFeedback && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(25);
      }
      showToast('কপি করা হয়েছে!', 'Content copied successfully!');
    });
  };

  const shareContentDua = (dua: any) => {
    if (navigator.share) {
      navigator.share({
        title: settings.language === 'bn' ? dua.titleBn : dua.titleEn,
        text: `${dua.arabic}\n\n${settings.language === 'bn' ? dua.meaningBn : dua.meaningEn}`,
      }).catch(err => console.log(err));
    } else {
      copyContentDua(dua);
    }
  };

  const filteredDuas = DUAS_LIST.filter(d => {
    const matchesSearch =
      d.titleBn.toLowerCase().includes(duasSearch.toLowerCase()) ||
      d.titleEn.toLowerCase().includes(duasSearch.toLowerCase()) ||
      d.meaningBn.toLowerCase().includes(duasSearch.toLowerCase()) ||
      d.meaningEn.toLowerCase().includes(duasSearch.toLowerCase());

    const matchesCat = selectedDuaCat === 'all' || d.category === selectedDuaCat;
    const matchesBookmark = !showOnlyBookmarks || savedDuaIds.includes(d.id);

    return matchesSearch && matchesCat && matchesBookmark;
  });

  const FONT_SIZE_CLASSES = {
    sm: 'text-sm [&_p]:text-xs [&_h2]:text-lg [&_h3]:text-base [&_h4]:text-sm [&_h5]:text-xs',
    md: 'text-base',
    lg: 'text-lg [&_p]:text-base [&_h2]:text-2xl [&_h3]:text-xl [&_h4]:text-lg [&_h5]:text-sm',
    xl: 'text-xl [&_p]:text-lg [&_h2]:text-3xl [&_h3]:text-2xl [&_h4]:text-xl [&_h5]:text-base',
  };

  return (
    <div className={`min-h-screen bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-100 flex flex-col md:flex-row transition-colors duration-500 islamic-pattern ${FONT_SIZE_CLASSES[settings.fontSize || 'md']} relative overflow-x-hidden`}>

      {/* Ambient Floating Crescent & Star Particles */}
      {settings.ambientMotionEnabled !== false && settings.showFloatingParticles !== false && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden islamic-motion-item">
          <div className="absolute top-12 right-16 opacity-30 dark:opacity-20 animate-float-crescent select-none">
            <span className="text-4xl text-accent-gold filter drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">🌙</span>
          </div>
          <div className="absolute top-32 left-1/4 opacity-40 animate-twinkle text-accent-gold text-sm select-none">✦</div>
          <div className="absolute top-2/3 right-1/3 opacity-30 animate-twinkle text-accent-gold text-xs select-none" style={{ animationDelay: '1.5s' }}>✧</div>
          <div className="absolute bottom-24 left-16 opacity-35 animate-float-particle text-accent-gold text-sm select-none" style={{ animationDelay: '2s' }}>★</div>
          <div className="absolute top-1/2 right-12 opacity-25 animate-float-particle text-accent-gold text-base select-none" style={{ animationDelay: '3.5s' }}>✦</div>
        </div>
      )}

      {/* Rotating 8-Point Geometric Rosette Watermark */}
      {settings.ambientMotionEnabled !== false && settings.showRotatingRosette !== false && (
        <div className="fixed -bottom-32 -right-32 pointer-events-none z-0 w-96 h-96 opacity-[0.035] dark:opacity-[0.05] animate-spin-slow text-accent-gold flex items-center justify-center select-none islamic-motion-item">
          <svg viewBox="0 0 200 200" className="w-full h-full fill-current">
            <path d="M100 0 L125 45 L175 25 L155 75 L200 100 L155 125 L175 175 L125 155 L100 200 L75 155 L25 175 L45 125 L0 100 L45 75 L25 25 L75 45 Z" />
          </svg>
        </div>
      )}

      {/* Global Toast Alert banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 max-w-sm p-4 bg-primary-green border border-accent-gold/20 text-white rounded-2xl shadow-xl z-50 flex items-center gap-2.5 animate-bounce text-sm font-semibold select-none">
          <BookOpen className="w-5 h-5 flex-shrink-0 text-accent-gold" />
          <span>{settings.language === 'bn' ? toastMessage.bn : toastMessage.en}</span>
        </div>
      )}

      {/* Side Desktop Navigation Menu */}
      <aside className="hidden md:flex flex-col w-72 bg-primary-green text-white border-r border-accent-gold/20 p-6 z-20 shrink-0 relative overflow-hidden">
        {/* Decorative background vectors from geometric balance */}
        <div className="absolute top-0 left-0 w-32 h-32 border border-white/5 rounded-full -ml-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 border border-white/5 rounded-full -mr-24 -mb-24 pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-8 select-none z-10">
          <div className="w-10 h-10 flex items-center justify-center bg-accent-gold text-primary-green rounded-xl shadow-lg border border-accent-gold/30 font-bold text-xl">
            <span>🕌</span>
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-wider uppercase leading-none">
              {settings.language === 'bn' ? 'বাংলাদেশ সালাত' : 'Bangladesh Prayer'}
            </h1>
            <span className="text-[10px] text-accent-gold uppercase tracking-widest mt-1 font-bold block">
              {settings.language === 'bn' ? 'জ্যামিতিক ব্যালেন্স' : 'Geometric Balance'}
            </span>
          </div>
        </div>

        {/* Action Toggles within Side panel */}
        <nav className="flex flex-col gap-2 flex-grow z-10">
          <button
            onClick={() => setActiveTab('prayer')}
            className={`flex items-center justify-between p-3.5 rounded-2xl text-xs uppercase tracking-wider font-bold transition-all pointer-events-auto cursor-pointer ${
              activeTab === 'prayer'
                ? 'bg-white/10 text-white border-l-4 border-accent-gold pl-4 shadow-inner'
                : 'text-white/70 hover:bg-white/5 hover:text-white hover:pl-3.5'
            }`}
          >
            <span className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-accent-gold" />
              {settings.language === 'bn' ? 'নামাজের সময়' : 'Prayer Times'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab('qibla')}
            className={`flex items-center justify-between p-3.5 rounded-2xl text-xs uppercase tracking-wider font-bold transition-all pointer-events-auto cursor-pointer ${
              activeTab === 'qibla'
                ? 'bg-white/10 text-white border-l-4 border-accent-gold pl-4 shadow-inner'
                : 'text-white/70 hover:bg-white/5 hover:text-white hover:pl-3.5'
            }`}
          >
            <span className="flex items-center gap-3">
              <Compass className="w-4 h-4 text-accent-gold" />
              {settings.language === 'bn' ? 'কিবলা দিক' : 'Qibla'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab('tasbih')}
            className={`flex items-center justify-between p-3.5 rounded-2xl text-xs uppercase tracking-wider font-bold transition-all pointer-events-auto cursor-pointer ${
              activeTab === 'tasbih'
                ? 'bg-white/10 text-white border-l-4 border-accent-gold pl-4 shadow-inner'
                : 'text-white/70 hover:bg-white/5 hover:text-white hover:pl-3.5'
            }`}
          >
            <span className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-accent-gold" />
              {settings.language === 'bn' ? 'ডিজিটাল তাসবিহ' : 'Tasbih'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center justify-between p-3.5 rounded-2xl text-xs uppercase tracking-wider font-bold transition-all pointer-events-auto cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-white/10 text-white border-l-4 border-accent-gold pl-4 shadow-inner'
                : 'text-white/70 hover:bg-white/5 hover:text-white hover:pl-3.5'
            }`}
          >
            <span className="flex items-center gap-3">
              <CalIcon className="w-4 h-4 text-accent-gold" />
              {settings.language === 'bn' ? 'হিজরি ক্যালেন্ডার' : 'Islamic Calendar'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <div>
            <button
              onClick={() => {
                setActiveTab('more');
              }}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs uppercase tracking-wider font-bold transition-all pointer-events-auto cursor-pointer ${
                activeTab === 'more'
                  ? 'bg-white/10 text-white border-l-4 border-accent-gold pl-4 shadow-inner'
                  : 'text-white/70 hover:bg-white/5 hover:text-white hover:pl-3.5'
              }`}
            >
              <span className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-accent-gold" />
                {settings.language === 'bn' ? 'অন্যান্য আমল' : 'More Features'}
              </span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeTab === 'more' ? 'rotate-90 text-accent-gold' : 'opacity-60'}`} />
            </button>

            {/* Direct Sub-links for desktop sidebar */}
            {activeTab === 'more' && (
              <div className="mt-1 ml-4 pl-3 border-l-2 border-accent-gold/30 flex flex-col gap-1 py-1 animate-in fade-in duration-200">
                <button
                  onClick={() => setMoreSubTab('duas')}
                  className={`text-left py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-2 ${
                    moreSubTab === 'duas'
                      ? 'bg-accent-gold/20 text-accent-gold font-black'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>📖</span>
                  <span>{settings.language === 'bn' ? 'আমল ও দোয়া ভান্ডার' : 'Duas & Azkar'}</span>
                </button>

                <button
                  onClick={() => setMoreSubTab('zakat')}
                  className={`text-left py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-2 ${
                    moreSubTab === 'zakat'
                      ? 'bg-accent-gold/20 text-accent-gold font-black'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>৳</span>
                  <span>{settings.language === 'bn' ? 'জাকাত ক্যালকুলেটর' : 'Zakat Calculator'}</span>
                </button>

                <button
                  onClick={() => setMoreSubTab('tracker')}
                  className={`text-left py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-2 ${
                    moreSubTab === 'tracker'
                      ? 'bg-accent-gold/20 text-accent-gold font-black'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>📊</span>
                  <span>{settings.language === 'bn' ? 'নামাজ ট্র্যাকার' : 'Prayer Tracker'}</span>
                </button>

                <button
                  onClick={() => setMoreSubTab('settings')}
                  className={`text-left py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-2 ${
                    moreSubTab === 'settings'
                      ? 'bg-accent-gold/20 text-accent-gold font-black'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>⚙️</span>
                  <span>{settings.language === 'bn' ? 'থিম ও সেটিংস' : 'Theme & Settings'}</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Sidebar Footer Location Indicator */}
        <div className="mt-auto pt-4 border-t border-white/5 select-none z-10">
          <div className="bg-[#0c180e]/60 rounded-xl p-3 border border-accent-gold/10 text-center">
            <p className="text-[10px] font-bold text-accent-gold/80 uppercase tracking-widest mb-1.5">
              {settings.language === 'bn' ? 'জেলা' : 'DISTRICT'}
            </p>
            <p className="text-white text-xs font-semibold flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-accent-gold animate-bounce" />
              {settings.language === 'bn' ? selectedDistrict.nameBn : selectedDistrict.nameEn}
            </p>
          </div>
        </div>

        {/* Audio Controller Indicator on Bottom of Sidebar */}
        {isAdjanPlaying && (
          <div className="p-4 bg-accent-gold/10 border border-accent-gold/20 text-accent-gold rounded-2xl text-xs flex flex-col gap-2 shadow-inner select-none mt-3.5 z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-ping" />
              <p className="font-semibold leading-none text-white">{settings.language === 'bn' ? 'আযান বাজানো হচ্ছে...' : 'Playing Holy Azan...'}</p>
            </div>
            <button
              onClick={stopActiveAdhan}
              className="mt-1 flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold py-1 px-3 bg-accent-gold text-primary-green rounded-lg hover:bg-white transition pointer-events-auto cursor-pointer"
            >
              <VolumeX className="w-3.5 h-3.5" />
              {settings.language === 'bn' ? 'আযান বন্ধ করুন' : 'Mute Adhan'}
            </button>
          </div>
        )}
      </aside>

      {/* Main Container Content */}
      <main className="flex-grow flex flex-col max-w-7xl mx-auto w-full px-4 md:px-8 py-6 mb-20 md:mb-0">
        
        {/* Top Floating App Bar */}
        <header className="flex items-center justify-between mb-8 select-none">
          
          {/* Mobile responsive logo and text */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-2xl">🕌</span>
            <h1 className="text-sm font-black text-primary-green dark:text-[#f1f8e9] uppercase tracking-wider leading-none">
              {settings.language === 'bn' ? 'সালাত টাইমস' : 'Prayer BD'}
            </h1>
          </div>

          <div className="hidden md:flex flex-col">
            <span className="text-xs text-primary-green dark:text-accent-gold font-bold uppercase tracking-widest leading-none">
              {settings.language === 'bn' ? 'আস-সালাতু খাইরুম মিনান নাউম' : 'Prayer is better than sleep'}
            </span>
          </div>

          {/* District switcher & Language Switch floating on top */}
          <div className="flex items-center gap-2">
            
            {/* GPS icon & District names dropdown */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-primary-green/10 dark:border-neutral-800 p-1 px-3.5 rounded-full shadow-sm hover:border-primary-green/35 transition shrink-0">
              <MapPin className="w-3.5 h-3.5 text-primary-green dark:text-accent-gold" />
              
              <select
                value={selectedDistrict.id}
                onChange={(e) => {
                  const match = DISTRICTS_LIST.find(d => d.id === e.target.value);
                  if (match) handleSelectDistrict(match);
                }}
                className="text-xs font-bold text-primary-green dark:text-[#f1f8e9] bg-transparent outline-none border-none py-1 cursor-pointer"
              >
                {DISTRICTS_LIST.map((d) => (
                  <option key={d.id} value={d.id} className="text-gray-900 dark:text-zinc-100 bg-white dark:bg-zinc-950">
                    {settings.language === 'bn' ? d.nameBn : d.nameEn}
                  </option>
                ))}
              </select>

              <button
                onClick={() => requestGpsLocation(false)}
                id="gps-lock-trigger"
                title={settings.language === 'bn' ? 'জিপিএস দিয়ে সনাক্ত করুন' : 'Find via GPS Geolocation'}
                className="p-1 hover:bg-emerald-50 dark:hover:bg-zinc-800 rounded-full transition text-primary-green dark:text-accent-gold pointer-events-auto cursor-pointer"
              >
                <Compass className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin-slow' : ''}`} />
              </button>
            </div>

            {/* Quick Lang Switch */}
            <button
              onClick={handleToggleLanguage}
              id="quick-lang-toggle"
              className="theme-btn py-1.5 px-3.5 text-xs font-bold pointer-events-auto cursor-pointer shadow-sm transition"
            >
              {settings.language === 'bn' ? 'EN' : 'বাংলা'}
            </button>
          </div>
        </header>

        {/* Stop active adhan floating button at layout level if playing on mobile */}
        {isAdjanPlaying && (
          <div className="mb-4 md:hidden p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl text-xs flex justify-between items-center shadow-inner">
            <span className="font-semibold leading-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              {settings.language === 'bn' ? 'আযান বাজানো হচ্ছে' : 'Playing Holy adhan...'}
            </span>
            <button
              onClick={stopActiveAdhan}
              className="font-bold py-1 px-3.5 bg-amber-500 text-white rounded-xl uppercase hover:bg-amber-600 pointer-events-auto cursor-pointer"
            >
              {settings.language === 'bn' ? 'বন্ধ করুন' : 'Mute'}
            </button>
          </div>
        )}

        {/* Core application body sections rendering based on active Tab selection */}
        {activeTab === 'prayer' && (
          <div id="home-dashboard-screen" className="flex flex-col gap-6">
            
            {/* 1. Ramadan Dashboard widget banner */}
            <RamadanDashboard
              language={settings.language}
              fajrTime={dateTimesOfToday.find(p => p.id === 'fajr')!.time}
              maghribTime={dateTimesOfToday.find(p => p.id === 'maghrib')!.time}
              hijriOffset={settings.hijriOffset}
            />

            {/* 2. Hero Interactive digital clocks */}
            <div className="bg-primary-green text-white rounded-3xl p-6 md:p-8 border border-accent-gold/20 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden select-none">
              
              {/* Islamic Motion elements */}
              {settings.islamicMotion !== 'off' && (
                <div className="absolute top-4 right-8 pointer-events-none islamic-motion-item select-none animate-float-crescent opacity-75 hidden sm:block">
                  <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(212,163,35,0.7)]">🌙</span>
                  <span className="text-xs text-accent-gold ml-0.5 animate-twinkle">✨</span>
                </div>
              )}

              {/* Majestic Geometric overlays with optional Islamic rotation */}
              <div className={`absolute top-0 right-0 w-[500px] h-[500px] border-[24px] border-white/5 rounded-full -mr-64 -mt-64 pointer-events-none ${settings.islamicMotion !== 'off' ? 'animate-spin-slow' : ''}`}></div>
              <div className={`absolute top-0 right-0 w-[400px] h-[400px] border border-accent-gold/10 rotate-45 -mr-40 -mt-40 pointer-events-none ${settings.islamicMotion !== 'off' ? 'animate-spin-reverse-slow' : ''}`}></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 border-[2px] border-white/5 rounded-full -ml-16 -mb-16 pointer-events-none"></div>

              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1 z-10">
                {/* Live clock */}
                <h2 className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white drop-shadow-sm flex items-center gap-2">
                  <Clock className="w-8 h-8 text-accent-gold" />
                  {displayDigitalClock()}
                </h2>
                
                {/* 3 Dates lists display */}
                <p className="text-xs text-white/80 font-bold mt-2 uppercase tracking-wider">
                  {dateLines.eng}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-[11px] text-accent-gold mt-3 font-bold bg-[#0c180e]/40 p-1.5 px-4.5 border border-white/5 rounded-full max-w-sm md:max-w-none">
                  <span className="flex items-center gap-1">🌙 {dateLines.hijri}</span>
                  <span className="opacity-40">|</span>
                  <span className="flex items-center gap-1">🌾 {dateLines.bangla}</span>
                </div>
              </div>

              {/* Countdown panel with real-time hours, minutes, and seconds auto decrement */}
              <div className="flex flex-col items-center md:items-end text-center md:text-right p-5 bg-[#0c180e]/50 backdrop-blur-md rounded-2xl border border-accent-gold/20 shrink-0 z-10 shadow-inner">
                <span className="text-[9px] text-accent-gold font-extrabold uppercase tracking-widest bg-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-ping" />
                  {settings.language === 'bn' ? 'পরবর্তী ওয়াক্ত' : 'UPCOMING PRAYER'}
                </span>
                <span className="text-xl font-black text-white mt-2">
                  {settings.language === 'bn' ? nextPrayer.nameBn : nextPrayer.nameEn}
                  <span className="text-[11px] text-accent-gold font-bold ml-1.5 uppercase font-sans">
                     ({ { fajr: 'Subhe Sadiq', dhuhr: 'Zohr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' }[nextPrayer.id] || ''})
                  </span>
                </span>
                
                {/* Real-time Hour-Minute-Second Decrementing Countdown Unit */}
                <div className="mt-3 flex flex-col items-center md:items-end gap-1.5">
                  <div className="flex items-center gap-1 font-mono text-white text-xs font-black">
                    {/* Hour box */}
                    <div className="flex flex-col items-center bg-black/45 border border-accent-gold/30 px-2.5 py-1.5 rounded-xl min-w-[48px] shadow-sm">
                      <span className="text-base text-accent-gold font-bold">
                        {settings.language === 'bn' ? toBanglaNum(String(countdownHMS.hours).padStart(2, '0')) : String(countdownHMS.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[8px] text-gray-300 font-sans uppercase">
                        {settings.language === 'bn' ? 'ঘণ্টা' : 'HR'}
                      </span>
                    </div>
                    <span className="text-accent-gold font-bold text-base -mt-2 animate-pulse">:</span>

                    {/* Minute box */}
                    <div className="flex flex-col items-center bg-black/45 border border-accent-gold/30 px-2.5 py-1.5 rounded-xl min-w-[48px] shadow-sm">
                      <span className="text-base text-white font-bold">
                        {settings.language === 'bn' ? toBanglaNum(String(countdownHMS.minutes).padStart(2, '0')) : String(countdownHMS.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[8px] text-gray-300 font-sans uppercase">
                        {settings.language === 'bn' ? 'মিনিট' : 'MIN'}
                      </span>
                    </div>
                    <span className="text-accent-gold font-bold text-base -mt-2 animate-pulse">:</span>

                    {/* Second box (decreases every second!) */}
                    <div className="flex flex-col items-center bg-black/45 border border-accent-gold/30 px-2.5 py-1.5 rounded-xl min-w-[48px] shadow-sm">
                      <span className="text-base text-accent-gold font-bold">
                        {settings.language === 'bn' ? toBanglaNum(String(countdownHMS.seconds).padStart(2, '0')) : String(countdownHMS.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[8px] text-gray-300 font-sans uppercase">
                        {settings.language === 'bn' ? 'সেকেন্ড' : 'SEC'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-white/90 font-medium tracking-wide bg-primary-green/50 py-1 px-2.5 rounded-lg border border-white/10 mt-0.5">
                    {settings.language === 'bn' ? 'সময় বাকিঃ ' : 'Time remaining: '}
                    <span className="font-extrabold text-accent-gold font-mono">
                      {countdownHMS.formattedText}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Forbidden times status checks indicator bar if active */}
            {forbiddenCheck.isForbidden && (
              <div className="p-4 bg-red-600 border border-red-500 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 text-center text-xs shadow-md select-none animate-pulse">
                <X className="w-5 h-5 flex-shrink-0 animate-ping" />
                <span>
                  {settings.language === 'bn' ? forbiddenCheck.reasonBn : forbiddenCheck.reasonEn}
                </span>
              </div>
            )}

            {/* 3. 10 Prayer cards display grids */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center select-none">
                <h3 className="text-xs uppercase tracking-widest font-black text-primary-green dark:text-[#f1f8e9] flex items-center gap-2">
                  <Sun className="w-4 h-4 text-accent-gold animate-spin-slow" />
                  {settings.language === 'bn' ? 'ওয়াক্তভিত্তিক সময়সূচি' : 'Prayer Slots schedule'}
                </h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {settings.language === 'bn' ? '* আস-সালাতু খাইরুম মিনান নাউম' : '* Assalatu khairum minan naum'}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {dateTimesOfToday.map((p) => {
                  const isCurrent = p.id === currentPrayer.id;
                  const isUpcoming = p.id === nextPrayer.id;

                  // Formatting cards indicators using Geometric Balance palette and borders
                  const pTime = p.time;
                  let cardBg = 'bg-white dark:bg-zinc-900 border border-primary-green/5 dark:border-neutral-800 hover:border-accent-gold/20 shadow-sm hover:shadow-md';
                  
                  if (isCurrent && p.type !== 'marker') {
                    cardBg = `bg-primary-green text-white border-none shadow-xl scale-[1.02] ring-4 ring-accent-gold z-10 ${settings.ambientMotionEnabled !== false ? 'active-waqt-gold-wave' : ''}`;
                  } else if (isUpcoming && p.type !== 'marker') {
                    cardBg = 'bg-emerald-50/70 dark:bg-zinc-900/40 border border-accent-gold/30 dark:border-accent-gold/20 ring-4 ring-primary-green/10 dark:ring-accent-gold/10 animate-pulse';
                  } else if (p.type === 'marker') {
                    // Sunrise, Sunset, Tahajjud etc (optional/markers)
                    cardBg = 'bg-white/60 dark:bg-zinc-900/40 border border-amber-500/10 dark:border-neutral-800 opacity-80';
                  }

                  const displayPTime = settings.language === 'bn' ? toBanglaNum(pTime) : pTime;

                  return (
                    <div
                      key={p.id}
                      className={`p-4.5 rounded-3xl border transition-all duration-300 pointer-events-auto cursor-pointer ${cardBg} relative overflow-hidden`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <p className={`text-[9px] font-black tracking-widest uppercase font-mono ${isCurrent && p.type !== 'marker' ? 'text-accent-gold' : 'text-gray-400 dark:text-gray-500'}`}>
                            {p.arabicName}
                          </p>
                          <h4 className={`text-base font-black mt-1 ${isCurrent && p.type !== 'marker' ? 'text-white' : 'text-primary-green dark:text-[#f1f8e9]'}`}>
                            {settings.language === 'bn' ? p.nameBn : p.nameEn}
                          </h4>
                        </div>

                        {/* Custom vector decorations based on cards */}
                        <div className="text-2xl filter drop-shadow">
                          {p.id === 'fajr' && '🌅'}
                          {p.id === 'sunrise' && '☀️'}
                          {p.id === 'ishraq' && '✨'}
                          {p.id === 'chasht' && '🌞'}
                          {p.id === 'dhuhr' && '☀️'}
                          {p.id === 'asr' && '🌤️'}
                          {p.id === 'sunset' && '🌆'}
                          {p.id === 'maghrib' && '🌙'}
                          {p.id === 'isha' && '🌃'}
                          {p.id === 'tahajjud' && '🌌'}
                        </div>
                      </div>

                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-xl font-black font-mono tracking-tight">
                          {displayPTime}
                        </span>
                        <span className={`text-[9px] font-black ${isCurrent && p.type !== 'marker' ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'} uppercase font-sans`}>
                          {settings.clockFormat === '24h' ? '' : Number(pTime.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                        </span>
                      </div>

                      {/* Card indicators info */}
                      <p className={`text-[9px] mt-2.5 leading-tight ${isCurrent && p.type !== 'marker' ? 'text-accent-gold' : 'text-primary-green/85 dark:text-accent-gold/80'} font-bold uppercase tracking-wider truncate`}>
                        {p.id === 'fajr' && (settings.language === 'bn' ? 'সুবহে সাদেক' : 'Subhe Sadiq')}
                        {p.id === 'sunrise' && (settings.language === 'bn' ? '⚠️ নামাজ হারাম' : '⚠️ Haram time')}
                        {p.id === 'sunset' && (settings.language === 'bn' ? '⚠️ নামাজ হারাম' : '⚠️ Haram time')}
                        {p.id === 'ishraq' && (settings.language === 'bn' ? 'নফল ওয়াক্ত' : 'Nafl prayer')}
                        {p.id === 'dhuhr' && (settings.language === 'bn' ? 'যোহরের ওয়াক্ত' : 'Zohr prayer')}
                        {p.id === 'maghrib' && (settings.language === 'bn' ? 'ইফতারের সূচনা' : 'Iftar start')}
                        {p.id === 'isha' && (settings.language === 'bn' ? 'এশার ওয়াক্ত' : 'Isha prayer')}
                        {p.id === 'tahajjud' && (settings.language === 'bn' ? 'তাহাজ্জুদ সময়' : 'Tahajjud period')}
                        {p.id === 'chasht' && (settings.language === 'bn' ? 'চাশতের ওয়াক্ত' : 'Chasht prayer')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* dynamic Hijri virtues & Hadith rotating widget based on current date */}
            {activeMonthVirtue && activeDailyHadithDua && (
              <div id="hijri-guidance-card" className="p-6 bg-gradient-to-br from-emerald-50/15 to-teal-50/10 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-500/10 rounded-3xl shadow-sm flex flex-col gap-6 relative overflow-hidden select-none">
                {/* Visual Islamic geometric decorations */}
                <div className="absolute -top-12 -right-12 w-32 h-32 border-4 border-emerald-500/5 rotate-12 rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 border border-emerald-500/5 rotate-45 rounded-full pointer-events-none"></div>

                {/* Card Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-500/15">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌙</span>
                    <div>
                      <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                        {settings.language === 'bn' 
                          ? `আজকের হাদিস ও ${hijriDate.monthNameBn} মাসের আমল` 
                          : `Today's Hadith & ${hijriDate.monthNameEn} Virtues`}
                      </h4>
                      <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400 font-bold tracking-wider font-mono">
                        {settings.language === 'bn' 
                          ? `${toBanglaNum(hijriDate.day)}ই ${hijriDate.monthNameBn}, হিজরি ${toBanglaNum(hijriDate.year)}` 
                          : `${hijriDate.day} ${hijriDate.monthNameEn}, Hijri ${hijriDate.year}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-705 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider w-fit">
                    {settings.language === 'bn' ? `রোজকার আত্মশুদ্ধি` : `Daily Purification`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hadith & Supplication Section */}
                  <div className="flex flex-col gap-3.5 bg-white/45 dark:bg-zinc-950/30 p-4.5 rounded-2xl border border-emerald-500/5">
                    <div>
                      <span className="text-[10px] font-black text-amber-600 dark:text-accent-gold uppercase tracking-wider">
                        {settings.language === 'bn' ? '📜 আজকের হাদীস শরীফ:' : '📜 Today\'s Hadith:'}
                      </span>
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-relaxed mt-1">
                        {settings.language === 'bn' ? activeDailyHadithDua.hadithBn : activeDailyHadithDua.hadithEn}
                      </p>
                      <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 block mt-1.5 font-mono">
                        — {settings.language === 'bn' ? activeDailyHadithDua.sourceBn : activeDailyHadithDua.sourceEn}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-dashed border-gray-100 dark:border-zinc-800">
                      <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                        {settings.language === 'bn' ? '🤲 আজকের দো‘আ ও মোনাজাত:' : '🤲 Today\'s Supplication:'}
                      </span>
                      <p className="text-xs font-semibold text-emerald-850 dark:text-emerald-300 leading-relaxed mt-1">
                        {settings.language === 'bn' ? activeDailyHadithDua.duaBn : activeDailyHadithDua.duaEn}
                      </p>
                    </div>
                  </div>

                  {/* Monthly Virtue Section */}
                  <div className="flex flex-col gap-3 justify-center bg-white/45 dark:bg-zinc-950/30 p-4.5 rounded-2xl border border-emerald-500/5">
                    <div>
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                        {settings.language === 'bn' ? `রাসূল নির্দেশিত ${hijriDate.monthNameBn} মাস:` : `Prophetic guidance for ${hijriDate.monthNameEn}:`}
                      </span>
                      <h5 className="text-xs font-black text-emerald-950 dark:text-emerald-100 mt-2.5">
                        {settings.language === 'bn' ? activeMonthVirtue.titleBn : activeMonthVirtue.titleEn}
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-1.5">
                        {settings.language === 'bn' ? activeMonthVirtue.descBn : activeMonthVirtue.descEn}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. 64 Districts scheduler planner download schedule index */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-primary-green/10 dark:border-neutral-800 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 select-none relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 border border-primary-green/5 rounded-full pointer-events-none"></div>
              
              <div className="flex flex-col gap-1.5 z-10 font-sans">
                <h4 className="text-base font-black text-primary-green dark:text-[#f1f8e9]">
                  {settings.language === 'bn' ? 'সারা বাংলাদেশের নামাজের সময়সূচি' : 'Bangladesh 64 Districts Schedule Maker'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">
                  {settings.language === 'bn'
                    ? 'যেকোনো জেলার মাসিক সময়সূচী ও ক্যালেন্ডার প্রিন্ট বা ডাউনলোড করুন অনায়াসেই। ঢাকার চেয়ে সময় ব্যবধান হিসাব স্বয়ংক্রিয়।'
                    : 'Download or print the monthly schedule chart list for any of the 64 districts. Automatic offset times calculations from Dhaka.'}
                </p>
              </div>

              {/* District planner select triggers */}
              <div className="flex items-center gap-3 shrink-0 z-10 w-full md:w-auto">
                <select
                  value={scheduleDistrict.id}
                  onChange={(e) => {
                    const match = DISTRICTS_LIST.find(d => d.id === e.target.value);
                    if (match) setScheduleDistrict(match);
                  }}
                  className="text-xs font-bold py-2.5 px-4 bg-white dark:bg-zinc-950 border border-primary-green/15 dark:border-neutral-800 text-primary-green dark:text-accent-gold rounded-xl outline-none pointer-events-auto cursor-pointer"
                >
                  {DISTRICTS_LIST.map((dist) => (
                    <option key={dist.id} value={dist.id} className="text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950">
                      {settings.language === 'bn' ? dist.nameBn : dist.nameEn}
                    </option>
                  ))}
                </select>

                <button
                  onClick={printMonthlySchedule}
                  id="print-trigger-btn"
                  className="py-2.5 px-4 bg-primary-green hover:bg-[#206f25] hover:scale-105 active:scale-95 text-white border border-accent-gold/25 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-sm shrink-0"
                >
                  <Printer className="w-4 h-4 text-accent-gold" />
                  {settings.language === 'bn' ? 'প্রিন্ট' : 'Print Schedule'}
                </button>
              </div>
            </div>

            {/* Printed monthly calendar sheet invisible in screen visually but rendered on Print trigger */}
            <div id="print-sheet-area" className="hidden print:block bg-white text-black p-8 font-sans">
              <h2 className="text-xl font-bold text-center">
                ইসলামিক সালাত সময়সূচি - {scheduleDistrict.nameEn} ({scheduleDistrict.nameBn})
              </h2>
              <p className="text-xs text-center mt-1">
                পদ্ধতিঃ {settings.calcMethod} | আসর মাজহাবঃ {settings.madhab}
              </p>
              <table className="w-full mt-6 border-collapse border border-gray-300 text-xs text-center">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">Date</th>
                    <th className="border border-gray-300 p-2">Fajr</th>
                    <th className="border border-gray-300 p-2">Sunrise</th>
                    <th className="border border-gray-300 p-2">Dhuhr</th>
                    <th className="border border-gray-300 p-2">Asr</th>
                    <th className="border border-gray-300 p-2">Maghrib</th>
                    <th className="border border-gray-300 p-2">Isha</th>
                  </tr>
                </thead>
                <tbody>
                  {getMonthlyPrintData().map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-1.5 font-bold">{row.date}</td>
                      <td className="border border-gray-300 p-1.5">{row.times.find((x: any) => x.id === 'fajr')?.time}</td>
                      <td className="border border-gray-300 p-1.5">{row.times.find((x: any) => x.id === 'sunrise')?.time}</td>
                      <td className="border border-gray-300 p-1.5">{row.times.find((x: any) => x.id === 'dhuhr')?.time}</td>
                      <td className="border border-gray-300 p-1.5">{row.times.find((x: any) => x.id === 'asr')?.time}</td>
                      <td className="border border-gray-300 p-1.5">{row.times.find((x: any) => x.id === 'maghrib')?.time}</td>
                      <td className="border border-gray-300 p-1.5">{row.times.find((x: any) => x.id === 'isha')?.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* COMPASS COMPONENT TAB */}
        {activeTab === 'qibla' && (
          <CompassComponent
            userLat={selectedDistrict.lat}
            userLng={selectedDistrict.lng}
            locationName={settings.language === 'bn' ? selectedDistrict.nameBn : selectedDistrict.nameEn}
            language={settings.language}
          />
        )}

        {/* TASBIH COMPONENT TAB */}
        {activeTab === 'tasbih' && (
          <TasbihComponent language={settings.language} />
        )}

        {/* CALENDAR COMPONENT TAB */}
        {activeTab === 'calendar' && (
          <CalendarComponent
            language={settings.language}
            hijriOffset={settings.hijriOffset}
          />
        )}

        {/* MORE FEATURES WRAPPED TABS */}
        {activeTab === 'more' && (
          <div className="flex flex-col gap-6">
            
            {/* 100% Responsive Islamic Mobile & Desktop Tool Switcher Bar */}
            <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-500/10 via-emerald-600/5 to-amber-500/10 dark:from-zinc-950 dark:via-zinc-900 dark:to-neutral-900 rounded-3xl border border-emerald-500/20 shadow-sm flex flex-col gap-3 select-none">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>🌟</span>
                    <span>{settings.language === 'bn' ? 'অন্যান্য আমল ও প্রয়োজনীয় ফিচারসমূহ' : 'Islamic Utilities & More Deeds'}</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {settings.language === 'bn' 
                      ? 'আমল ও দোয়া ভান্ডার, যাকাত ক্যালকুলেটর, নামাজ ট্র্যাকার ও সেটিংস কাস্টমাইজার' 
                      : 'Duas, Zakat, Prayer attendance tracker & complete theme settings'}
                  </p>
                </div>
              </div>

              {/* 4 Responsive Buttons: 2x2 on Mobile, 1x4 on Tablet/Desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                
                {/* 1. Duas & Azkar */}
                <button
                  onClick={() => setMoreSubTab('duas')}
                  id="tab-btn-duas"
                  className={`py-3 px-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 text-center sm:text-left cursor-pointer active:scale-95 ${
                    moreSubTab === 'duas'
                      ? 'theme-btn shadow-md ring-2 ring-emerald-500/40 font-bold'
                      : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-gray-200 hover:bg-emerald-50/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-xl sm:text-lg">📖</span>
                  <div className="min-w-0">
                    <span className="text-xs font-black block truncate">
                      {settings.language === 'bn' ? 'আমল ও দোয়া' : 'Duas & Azkar'}
                    </span>
                    <span className={`text-[10px] block truncate font-medium ${moreSubTab === 'duas' ? 'opacity-90' : 'text-gray-400 dark:text-gray-500'}`}>
                      {settings.language === 'bn' ? 'দো‘আ ভান্ডার' : 'Supplications'}
                    </span>
                  </div>
                </button>

                {/* 2. Zakat Calculator */}
                <button
                  onClick={() => setMoreSubTab('zakat')}
                  id="tab-btn-zakat"
                  className={`py-3 px-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 text-center sm:text-left cursor-pointer active:scale-95 ${
                    moreSubTab === 'zakat'
                      ? 'theme-btn shadow-md ring-2 ring-emerald-500/40 font-bold'
                      : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-gray-200 hover:bg-emerald-50/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-xl sm:text-lg">৳</span>
                  <div className="min-w-0">
                    <span className="text-xs font-black block truncate">
                      {settings.language === 'bn' ? 'যাকাত হিসাব' : 'Zakat Calc'}
                    </span>
                    <span className={`text-[10px] block truncate font-medium ${moreSubTab === 'zakat' ? 'opacity-90' : 'text-gray-400 dark:text-gray-500'}`}>
                      {settings.language === 'bn' ? 'নিসাব ও হিসাব' : 'Nisab Calculator'}
                    </span>
                  </div>
                </button>

                {/* 3. Prayer Tracker */}
                <button
                  onClick={() => setMoreSubTab('tracker')}
                  id="tab-btn-tracker"
                  className={`py-3 px-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 text-center sm:text-left cursor-pointer active:scale-95 ${
                    moreSubTab === 'tracker'
                      ? 'theme-btn shadow-md ring-2 ring-emerald-500/40 font-bold'
                      : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-gray-200 hover:bg-emerald-50/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-xl sm:text-lg">📊</span>
                  <div className="min-w-0">
                    <span className="text-xs font-black block truncate">
                      {settings.language === 'bn' ? 'নামাজ ট্র্যাকার' : 'Prayer Tracker'}
                    </span>
                    <span className={`text-[10px] block truncate font-medium ${moreSubTab === 'tracker' ? 'opacity-90' : 'text-gray-400 dark:text-gray-500'}`}>
                      {settings.language === 'bn' ? 'হাজিরা ও স্কোর' : 'Logs & Attendance'}
                    </span>
                  </div>
                </button>

                {/* 4. Theme & Settings */}
                <button
                  onClick={() => setMoreSubTab('settings')}
                  id="tab-btn-settings"
                  className={`py-3 px-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 text-center sm:text-left cursor-pointer active:scale-95 ${
                    moreSubTab === 'settings'
                      ? 'theme-btn shadow-md ring-2 ring-emerald-500/40 font-bold'
                      : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-gray-200 hover:bg-emerald-50/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-xl sm:text-lg">⚙️</span>
                  <div className="min-w-0">
                    <span className="text-xs font-black block truncate">
                      {settings.language === 'bn' ? 'থিম ও সেটিংস' : 'Theme & Settings'}
                    </span>
                    <span className={`text-[10px] block truncate font-medium ${moreSubTab === 'settings' ? 'opacity-90' : 'text-gray-400 dark:text-gray-500'}`}>
                      {settings.language === 'bn' ? 'রং, মোশন ও ফন্ট' : 'Customizer'}
                    </span>
                  </div>
                </button>

              </div>
            </div>

            {/* DUAS ARCHIVE IMPLEMENTATION INDEX */}
            {moreSubTab === 'duas' && (
              <div id="duas-list-screen" className="flex flex-col gap-5">
                
                {/* Search query input */}
                <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-neutral-800 rounded-3xl shadow-sm flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center select-none">
                  <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={settings.language === 'bn' ? 'নাম বা অর্থ দিয়ে সার্চ...' : 'Search supplications library...'}
                      value={duasSearch}
                      onChange={(e) => setDuasSearch(e.target.value)}
                      className="w-full text-xs h-9 pl-9 pr-3 border border-emerald-100 dark:border-neutral-800 bg-emerald-50/10 dark:bg-zinc-950 rounded-lg text-emerald-950 dark:text-emerald-100 outline-none select-all focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 shrink-0 w-full md:w-auto">
                    {/* Category Dropdown */}
                    <select
                      value={selectedDuaCat}
                      onChange={(e) => setSelectedDuaCat(e.target.value)}
                      className="text-xs h-9 px-3 border border-emerald-100 dark:border-neutral-800 bg-emerald-50/10 dark:bg-zinc-950 text-emerald-950 dark:text-emerald-100 rounded-lg outline-none cursor-pointer flex-1 sm:flex-initial min-w-[140px]"
                    >
                      <option value="all">{settings.language === 'bn' ? 'সব বিভাগ' : 'All Categories'}</option>
                      <option value="prayer">{settings.language === 'bn' ? 'নামাজের দুআ' : 'Prayer\'s Duas'}</option>
                      <option value="istighfar">{settings.language === 'bn' ? 'ইস্তেগফার ও ক্ষমা প্রার্থনা' : 'Istighfar & Repentance'}</option>
                      <option value="durood">{settings.language === 'bn' ? 'দরূদ শরীফ সমূহ' : 'Durood Sharif'}</option>
                      <option value="necessary">{settings.language === 'bn' ? 'নিত্য প্রয়োজনীয় দোয়া' : 'Essential Daily Duas'}</option>
                      <option value="morning-evening">{settings.language === 'bn' ? 'সকাল-সন্ধ্যার আমল' : 'Morning/Evening'}</option>
                      <option value="food">{settings.language === 'bn' ? 'খাবারের দুআ' : 'Food\'s Duas'}</option>
                      <option value="sleep">{settings.language === 'bn' ? 'ঘুমের দোয়া' : 'Sleep\'s Duas'}</option>
                      <option value="travel">{settings.language === 'bn' ? 'ভ্রমণের দোয়া' : 'Travel Duas'}</option>
                      <option value="hardship">{settings.language === 'bn' ? 'বিপদের দোয়া' : 'Hardship Duas'}</option>
                      <option value="salatut-tasbih">{settings.language === 'bn' ? 'সালাতুত তাসবিহ পদ্ধতি' : 'Salat-al-Tasbih Method'}</option>
                    </select>

                    {/* Bookmarks toggle list */}
                    <button
                      onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
                      className={`h-9 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition shrink-0 ${
                        showOnlyBookmarks
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-white dark:bg-zinc-900 border-emerald-100 dark:border-neutral-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${showOnlyBookmarks ? 'fill-white' : ''}`} />
                      {settings.language === 'bn' ? 'পছন্দ তালিকা' : 'Bookmarks'}
                    </button>
                  </div>
                </div>

                {/* Duas list representation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredDuas.length > 0 ? (
                    filteredDuas.map((dua) => {
                      const isFavorited = savedDuaIds.includes(dua.id);

                      return (
                        <div
                          key={dua.id}
                          className="p-6 bg-white dark:bg-zinc-900 border border-emerald-500/5 dark:border-neutral-800/40 rounded-3xl shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2.5 select-none pb-4 border-b border-gray-50 dark:border-neutral-800/40">
                              <div>
                                <span className="text-[9px] font-extrabold uppercase py-0.5 px-2 bg-emerald-600/10 text-emerald-600 rounded-full">
                                  {dua.category}
                                </span>
                                <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 mt-2">
                                  {settings.language === 'bn' ? dua.titleBn : dua.titleEn}
                                </h3>
                              </div>

                              <button
                                onClick={() => toggleBookmarkDua(dua.id)}
                                className={`p-2 rounded-xl border transition ${
                                  isFavorited
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                    : 'border-emerald-500/5 hover:bg-emerald-55/10 text-gray-400'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-amber-500' : ''}`} />
                              </button>
                            </div>

                            {/* Complex Dual language Arabic text box */}
                            <div className="p-4 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/5 rounded-2xl my-4 text-center">
                              <p className="font-arabic text-2xl text-emerald-950 dark:text-emerald-50 tracking-wide font-normal leading-loose">
                                {dua.arabic}
                              </p>
                              <p className="text-xs text-emerald-700 font-semibold dark:text-emerald-400 mt-4 leading-relaxed font-sans block">
                                [ {settings.language === 'bn' ? dua.pronunciationBn : dua.pronunciationEn} ]
                              </p>
                            </div>

                            {/* Translations */}
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                              <span className="font-bold text-gray-800 dark:text-gray-100">
                                {settings.language === 'bn' ? 'অর্থঃ ' : 'Meaning: '}
                              </span>
                              {settings.language === 'bn' ? dua.meaningBn : dua.meaningEn}
                            </p>
                          </div>

                          {/* Quick clipboard copier tools */}
                          <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-gray-50 dark:border-neutral-800/40">
                            <button
                              onClick={() => copyContentDua(dua)}
                              className="py-2.5 bg-emerald-50/40 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-zinc-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              {settings.language === 'bn' ? 'কপি করুন' : 'Copy'}
                            </button>

                            <button
                              onClick={() => shareContentDua(dua)}
                              className="py-2.5 bg-emerald-50/40 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-zinc-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              {settings.language === 'bn' ? 'শেয়ার করুন' : 'Share'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-1 md:col-span-2 text-center py-10 text-gray-400 select-none">
                      📖 {settings.language === 'bn' ? 'উক্ত ফিল্টারে কোনো দুআ খুঁজে পাওয়া যায়নি।' : 'No supplications found for selected filter.'}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ZAKAT CALCULATOR TAB */}
            {moreSubTab === 'zakat' && (
              <ZakatCalculator language={settings.language} />
            )}

            {/* PRAYER TRACKER CALENDAR TAB */}
            {moreSubTab === 'tracker' && (
              <PrayerTracker language={settings.language} />
            )}

            {/* SETTINGS OPTION TAB */}
            {moreSubTab === 'settings' && (
              <SettingsPanel settings={settings} onChange={updateSettings} language={settings.language} />
            )}

          </div>
        )}

        {/* BOTTOM NAV BAR ON MOBILE DEVICES */}
        <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-primary-green backdrop-blur-md border-t border-accent-gold/20 p-2 z-30 shadow-2xl select-none">
          <div className="grid grid-cols-5 text-center text-[10px] font-bold">
            
            <button
              onClick={() => setActiveTab('prayer')}
              id="mobile-tab-prayer"
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                activeTab === 'prayer' ? 'text-accent-gold bg-white/10' : 'text-white/60 hover:text-white'
              }`}
            >
              <Clock className="w-5 h-5 flex-shrink-0" />
              <span>{settings.language === 'bn' ? 'নামাজ' : 'Prayer'}</span>
            </button>

            <button
              onClick={() => setActiveTab('qibla')}
              id="mobile-tab-qibla"
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                activeTab === 'qibla' ? 'text-accent-gold bg-white/10' : 'text-white/60 hover:text-white'
              }`}
            >
              <CompIcon className="w-5 h-5 flex-shrink-0 animate-spin-slow" />
              <span>{settings.language === 'bn' ? 'কিবলা' : 'Qibla'}</span>
            </button>

            <button
              onClick={() => setActiveTab('tasbih')}
              id="mobile-tab-tasbih"
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                activeTab === 'tasbih' ? 'text-accent-gold bg-white/10' : 'text-white/60 hover:text-white'
              }`}
            >
              <Volume2 className="w-5 h-5 flex-shrink-0" />
              <span>{settings.language === 'bn' ? 'তাসবিহ' : 'Tasbih'}</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              id="mobile-tab-calendar"
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                activeTab === 'calendar' ? 'text-accent-gold bg-white/10' : 'text-white/60 hover:text-white'
              }`}
            >
              <CalIcon className="w-5 h-5 flex-shrink-0" />
              <span>{settings.language === 'bn' ? 'ক্যালেন্ডার' : 'Calendar'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('more');
              }}
              id="mobile-tab-more"
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                activeTab === 'more' ? 'text-accent-gold bg-white/10' : 'text-white/60 hover:text-white'
              }`}
            >
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{settings.language === 'bn' ? 'অন্যান্য আমল' : 'Deeds'}</span>
            </button>

          </div>
        </footer>

        {/* Global Footer & Declarations */}
        <footer className="mt-12 text-center text-[10px] text-gray-400 dark:text-zinc-500 border-t border-primary-green/10 dark:border-neutral-800 pt-6 select-none leading-relaxed">
          <p className="font-bold text-primary-green dark:text-accent-gold/85">
            {settings.language === 'bn'
              ? 'নামাজের সময় গণনা: Islamic Society of North America (ISNA) / Muslim World League (MWL) পদ্ধতি অনুযায়ী'
              : 'Prayer calculations: ISNA & Muslim World League solar equations models.'}
          </p>
          <p className="mt-1 font-black text-amber-600 dark:text-amber-500">
            {settings.language === 'bn'
              ? '⚠️ সঠিক সময়ের জন্য সবসময় স্থানীয় মসজিদের আযানের ওয়াক্ত অনুসরণ করুন।'
              : '⚠️ For perfect validation, please conform to your nearest Mosque adhan schedules.'}
          </p>
          <p className="mt-2 text-xs font-mono font-bold text-primary-green dark:text-[#81c784]/60">
            {settings.language === 'bn' ? 'ডেভেলপ করেছেন মোঃ মুদ্দাসসির বিল্লাহ। | বাংলাদেশ সালাত টাইমস' : 'Developed by MD Muddassir Billah | Bangladesh Namaz Times'}
          </p>
        </footer>

      </main>
    </div>
  );
}
