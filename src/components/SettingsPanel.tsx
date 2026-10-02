/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings, Moon, Sun, Monitor, Bell, BellOff, Volume2, Globe, Clock,
  ShieldCheck, Palette, Vibrate, Play, Square, RotateCcw, Sparkles, Check
} from 'lucide-react';
import { AppSettings, Language, Theme, Madhab, CalcMethod, ColorPalette } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (update: Partial<AppSettings>) => void;
  language: Language;
}

export const MUEZZIN_LIST = [
  {
    id: 'makkah',
    nameBn: 'মসজিদুল হারাম, মক্কা মুকাররমা',
    nameEn: 'Masjid al-Haram, Makkah',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan1.mp3'
  },
  {
    id: 'madinah',
    nameBn: 'মসজিদে নববী, মদিনা মুনাওয়ারা',
    nameEn: 'Masjid an-Nabawi, Madinah',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan2.mp3'
  },
  {
    id: 'alaqsa',
    nameBn: 'মসজিদুল আকসা, জেরুসালেম',
    nameEn: 'Masjid Al-Aqsa, Jerusalem',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan4.mp3'
  },
  {
    id: 'mishary',
    nameBn: 'ক্বারী মিশারী রশীদ আল-আফাসী',
    nameEn: 'Qari Mishary Rashid Alafasy',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan5.mp3'
  },
  {
    id: 'egypt',
    nameBn: 'কায়রো ঐতিহাসিক জামে আযান, মিশর',
    nameEn: 'Cairo Historical Azan, Egypt',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan3.mp3'
  }
];

export const COLOR_PALETTES: { id: ColorPalette; nameBn: string; nameEn: string; primary: string; accent: string }[] = [
  {
    id: 'emerald',
    nameBn: 'মরু ও মিনার (এমেরাল্ড গ্রিন ও গোল্ড)',
    nameEn: 'Classic Emerald & Gold',
    primary: '#105221',
    accent: '#d4a323'
  },
  {
    id: 'midnight',
    nameBn: 'কালো ও নীলাভ রৌপ্য (OLED মিডনাইট)',
    nameEn: 'Midnight OLED & Cyan',
    primary: '#0f172a',
    accent: '#38bdf8'
  },
  {
    id: 'turquoise',
    nameBn: 'উসমানীয় ফিরোজা ও অ্যাম্বার',
    nameEn: 'Ottoman Turquoise & Amber',
    primary: '#0f766e',
    accent: '#f59e0b'
  },
  {
    id: 'sepia',
    nameBn: 'সাহারা মরু ও টেরাকোটা',
    nameEn: 'Sahara Sand & Sepia',
    primary: '#78350f',
    accent: '#d97706'
  },
  {
    id: 'royal',
    nameBn: 'রাজকীয় নীল ও রোজা গোল্ড',
    nameEn: 'Royal Indigo & Rose',
    primary: '#3730a3',
    accent: '#fb7185'
  }
];

export default function SettingsPanel({ settings, onChange, language }: SettingsPanelProps) {
  const [playingMuezzinId, setPlayingMuezzinId] = useState<string | null>(null);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

  const handleToggleLanguage = () => {
    onChange({ language: settings.language === 'bn' ? 'en' : 'bn' });
  };

  const handleToggleClock = () => {
    onChange({ clockFormat: settings.clockFormat === '12h' ? '24h' : '12h' });
  };

  const handlePreviewAdhan = (muezzinId: string, url: string) => {
    if (playingMuezzinId === muezzinId && audioInstance) {
      audioInstance.pause();
      setPlayingMuezzinId(null);
      setAudioInstance(null);
      return;
    }

    if (audioInstance) {
      audioInstance.pause();
    }

    try {
      const audio = new Audio(url);
      audio.volume = settings.volume;
      audio.play().catch(e => console.warn('Preview blocked:', e));
      setAudioInstance(audio);
      setPlayingMuezzinId(muezzinId);

      audio.onended = () => {
        setPlayingMuezzinId(null);
        setAudioInstance(null);
      };
    } catch (e) {
      console.error(e);
      setPlayingMuezzinId(null);
    }
  };

  const triggerHapticTest = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([60, 40, 80]);
    }
  };

  return (
    <div id="settings-page-section" className="bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-neutral-800 rounded-3xl p-6 md:p-8 shadow-sm select-none font-sans flex flex-col gap-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-green/10 dark:bg-accent-gold/15 text-primary-green dark:text-accent-gold flex items-center justify-center font-bold">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <h2 className="text-xl font-black text-primary-green dark:text-[#f1f8e9]">
              {language === 'bn' ? 'অ্যাপ্লিকেশন সেটিংস ও থিমস' : 'App Settings & Themes'}
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {language === 'bn'
              ? 'থিমস, কালার প্যালেট, মুয়াজ্জিনের আযান, গণনা পদ্ধতি ও মোবাইল রেসপনসিভ কনফিগারেশন'
              : 'Themes, color palettes, Muezzin adhans, calculation methods & responsive controls'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: THEMES, COLORS & DISPLAY                     */}
        {/* ======================================================== */}
        <div className="flex flex-col gap-6">
          
          <div className="flex items-center gap-2 text-xs font-black text-primary-green dark:text-accent-gold uppercase tracking-wider">
            <Palette className="w-4 h-4" />
            <span>{language === 'bn' ? 'থিমস ও কালার কাস্টমাইজেশন' : 'Themes & Color Palettes'}</span>
          </div>

          {/* Color Palettes Chooser */}
          <div className="flex flex-col gap-3 p-5 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl">
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>🎨</span>
                {language === 'bn' ? 'ইসলামিক রঙের প্যালেট' : 'Islamic Color Palette'}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {language === 'bn' ? 'অ্যাপের প্রাথমিক ও আকর্ষক রঙের সমন্বয় নির্ধারণ করুন' : 'Select active branding and accent palette'}
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-1">
              {COLOR_PALETTES.map((pal) => {
                const isSelected = (settings.colorPalette || 'emerald') === pal.id;
                return (
                  <button
                    key={pal.id}
                    onClick={() => {
                      onChange({ colorPalette: pal.id });
                      triggerHapticTest();
                    }}
                    className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-800 border-accent-gold shadow-md ring-2 ring-accent-gold/30'
                        : 'bg-white/60 dark:bg-zinc-900/60 border-gray-100 dark:border-neutral-800 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center -space-x-1.5">
                        <span className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: pal.primary }}></span>
                        <span className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: pal.accent }}></span>
                      </div>
                      <span className="text-gray-800 dark:text-gray-200">
                        {language === 'bn' ? pal.nameBn : pal.nameEn}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme customizer (Light, Dark, Auto) */}
          <div className="flex flex-col gap-3 p-5 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl">
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>🌓</span>
                {language === 'bn' ? 'ডিসপ্লে মোড (লাইট / ডার্ক)' : 'Display Mode'}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {language === 'bn' ? 'চোখের সুরক্ষা ও ব্যাটারি সাশ্রয়কারী ডার্ক মোড' : 'Eye-friendly OLED Dark and Light modes'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-1">
              {(['light', 'dark', 'auto'] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onChange({ theme: t })}
                  className={`py-2.5 px-3 text-xs font-bold rounded-2xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    settings.theme === t
                      ? 'bg-primary-green border-primary-green text-white shadow-md'
                      : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  {t === 'dark' && <Moon className="w-3.5 h-3.5 text-accent-gold" />}
                  {t === 'auto' && <Monitor className="w-3.5 h-3.5" />}
                  <span className="capitalize">{t === 'auto' ? (language === 'bn' ? 'অটো' : 'Auto') : t === 'light' ? (language === 'bn' ? 'লাইট' : 'Light') : (language === 'bn' ? 'ডার্ক' : 'Dark')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language & Clock Format Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Language Switch */}
            <div className="p-4 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  {language === 'bn' ? 'অ্যাপের ভাষা' : 'App Language'}
                </h4>
                <p className="text-[10px] text-gray-400">
                  {settings.language === 'bn' ? 'বাংলা সংস্করণ' : 'English mode'}
                </p>
              </div>
              
              <button
                onClick={handleToggleLanguage}
                className="px-3.5 py-1.5 bg-primary-green text-white font-bold rounded-xl text-xs hover:bg-[#135f28] cursor-pointer shadow-sm transition"
              >
                {settings.language === 'bn' ? 'English' : 'বাংলা'}
              </button>
            </div>

            {/* Clock Format */}
            <div className="p-4 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  {language === 'bn' ? 'ঘড়ির ফরম্যাট' : 'Clock Layout'}
                </h4>
                <p className="text-[10px] text-gray-400">
                  {settings.clockFormat === '12h' ? '12-Hour AM/PM' : '24-Hour Military'}
                </p>
              </div>
              
              <button
                onClick={handleToggleClock}
                className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 text-gray-800 dark:text-white border border-gray-200 dark:border-neutral-700 font-extrabold rounded-xl text-xs cursor-pointer transition shadow-sm"
              >
                {settings.clockFormat === '12h' ? '12h' : '24h'}
              </button>
            </div>

          </div>

          {/* Font / Text Size */}
          <div className="p-4 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                {language === 'bn' ? 'ফন্ট / লেখার সাইজ' : 'Text Typography Size'}
              </h4>
              <span className="text-[10px] text-accent-gold font-mono uppercase font-bold">
                {settings.fontSize || 'md'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => onChange({ fontSize: sz })}
                  className={`py-2 text-[11px] font-bold rounded-xl border flex items-center justify-center transition cursor-pointer ${
                    (settings.fontSize || 'md') === sz
                      ? 'bg-primary-green border-primary-green text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>{sz === 'sm' ? 'ছোট' : sz === 'md' ? 'মাঝারি' : sz === 'lg' ? 'বড়' : 'X-বড়'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Haptic Touch Vibration Toggle */}
          <div className="p-4 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Vibrate className="w-4 h-4 text-accent-gold" />
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  {language === 'bn' ? 'হ্যাপটিক ভাইব্রেশন (স্পর্শ অনুভূতি)' : 'Haptic Touch Vibration'}
                </h4>
                <p className="text-[10px] text-gray-500">
                  {language === 'bn' ? 'তাসবিহ ও কিবলা সোজা হলে মৃদু স্পন্দন' : 'Gentle pulse on Tasbih count and Qibla lock'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const nextVal = !(settings.hapticFeedback ?? true);
                onChange({ hapticFeedback: nextVal });
                if (nextVal) triggerHapticTest();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                (settings.hapticFeedback ?? true)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {(settings.hapticFeedback ?? true) ? (language === 'bn' ? 'চালু ✓' : 'ON') : (language === 'bn' ? 'বন্ধ' : 'OFF')}
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: MUEZZIN ADHAN AUDIO & CALCULATIONS          */}
        {/* ======================================================== */}
        <div className="flex flex-col gap-6">
          
          <div className="flex items-center gap-2 text-xs font-black text-primary-green dark:text-accent-gold uppercase tracking-wider">
            <Volume2 className="w-4 h-4" />
            <span>{language === 'bn' ? 'মুয়াজ্জিনের আযান ও অডিও সাউন্ড' : 'Muezzin & Audio Settings'}</span>
          </div>

          {/* Muezzin Selector */}
          <div className="flex flex-col gap-3 p-5 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl">
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>🕌</span>
                {language === 'bn' ? 'পছন্দের মুয়াজ্জিনের আযান' : 'Select Muezzin Voice'}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {language === 'bn' ? 'নামাজের ওয়াক্ত হলে কোন আযানটি বাজবে তা নির্ধারণ করুন' : 'Choose which holy adhan plays upon prayer time'}
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-1">
              {MUEZZIN_LIST.map((m) => {
                const isSelected = (settings.selectedMuezzin || 'makkah') === m.id;
                const isPlaying = playingMuezzinId === m.id;

                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-800 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-white/60 dark:bg-zinc-900/60 border-gray-100 dark:border-neutral-800'
                    }`}
                  >
                    <div
                      onClick={() => onChange({ selectedMuezzin: m.id as any })}
                      className="flex items-center gap-2.5 flex-grow cursor-pointer"
                    >
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {language === 'bn' ? m.nameBn : m.nameEn}
                      </span>
                    </div>

                    <button
                      onClick={() => handlePreviewAdhan(m.id, m.audioUrl)}
                      className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                        isPlaying
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-accent-gold hover:bg-emerald-500/20'
                      }`}
                      title="Preview Sound"
                    >
                      {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span className="text-[10px]">{isPlaying ? (language === 'bn' ? 'থামুন' : 'Stop') : (language === 'bn' ? 'শুনুন' : 'Play')}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Volume Slider */}
          <div className="p-4 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs text-gray-700 dark:text-gray-300 font-bold">
              <span>{language === 'bn' ? 'আযানের সাউন্ড ভলিউম:' : 'Adhan Sound Volume:'}</span>
              <span className="font-mono text-emerald-700 dark:text-accent-gold font-bold">{Math.round(settings.volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => onChange({ volume: Number(e.target.value) })}
                className="w-full text-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Calculations Standard methods */}
          <div className="p-4 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl flex flex-col gap-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary-green dark:text-accent-gold" />
              {language === 'bn' ? 'নামাজের হিসাব পদ্ধতি ও মাজহাব' : 'Calculation Method & Jurisprudence'}
            </h4>

            <div>
              <label className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block mb-1">
                {language === 'bn' ? 'গণনা পদ্ধতি (Solar Equations Method):' : 'Calculation Method:'}
              </label>
              <select
                value={settings.calcMethod}
                onChange={(e) => onChange({ calcMethod: e.target.value as CalcMethod })}
                className="w-full text-xs h-10 px-3 border border-gray-200 dark:border-neutral-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100 rounded-xl outline-none cursor-pointer"
              >
                <option value="MWL">Muslim World League (MWL - প্রস্তাবিত)</option>
                <option value="ISNA">Islamic Society of North America (ISNA)</option>
                <option value="Karachi">University of Islamic Sciences, Karachi</option>
                <option value="Egypt">Egyptian General Authority of Survey</option>
                <option value="UmmAlQura">Umm al-Qura University, Makkah</option>
              </select>
            </div>

            {/* Asr Madhab Buttons */}
            <div>
              <label className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block mb-1">
                {language === 'bn' ? 'আসর ওয়াক্তের মাজহাব হিসাব:' : 'Asr Juristic Madhab:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['hanafi', 'shafi'] as Madhab[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => onChange({ madhab: m })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      settings.madhab === m
                        ? 'bg-primary-green border-primary-green text-white shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {m === 'hanafi'
                      ? (language === 'bn' ? 'হানাফী (২ গুণ ছায়া)' : 'Hanafi (2x Shadow)')
                      : (language === 'bn' ? 'শাফেয়ী / অন্য ৩টি (১ গুণ)' : 'Shafi\'i / Standard (1x)')}
                  </button>
                ))}
              </div>
            </div>

            {/* Hijri Lunar Offset */}
            <div>
              <label className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block mb-1">
                {language === 'bn' ? 'হিজরি তারিখ সংশোধন (চাঁদ দেখা অনুযায়ী):' : 'Hijri Lunar Offset (Moon Sighting):'}
              </label>
              <div className="flex items-center gap-1.5">
                {[-2, -1, 0, 1, 2].map((off) => {
                  const lbl = off === 0 ? '0' : off > 0 ? `+${off}` : `${off}`;
                  const isSel = (settings.hijriOffset !== undefined ? settings.hijriOffset : -1) === off;
                  return (
                    <button
                      key={off}
                      onClick={() => onChange({ hijriOffset: off })}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        isSel
                          ? 'bg-primary-green border-primary-green text-white shadow-sm'
                          : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {lbl}{off === -1 ? ' (BD)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
