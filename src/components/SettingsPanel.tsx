/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settings, Moon, Sun, Monitor, Bell, BellOff, Volume2, Globe, Clock, ShieldCheck } from 'lucide-react';
import { AppSettings, Language, Theme, Madhab, CalcMethod } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (update: Partial<AppSettings>) => void;
  language: Language;
}

const AZAN_SOUNDS_LIST = [
  { id: 'azan_standard', labelBn: 'স্ট্যান্ডার্ড আযান (মক্কা)', labelEn: 'Standard Azan (Makkah)' },
  { id: 'azan_madinah', labelBn: 'মদিনা আযান', labelEn: 'Madinah Azan' },
  { id: 'azan_egypt', labelBn: 'মিশরীয় আযান', labelEn: 'Egyptian Azan' },
  { id: 'beep', labelBn: 'বিপ সাউন্ড (ডিভাইস উৎপন্ন)', labelEn: 'Synthetic Beep sound' },
  { id: 'silent', labelBn: 'কোনো শব্দ নয় (শুধুমাত্র নোটিফিকেশন)', labelEn: 'Silent notification only' }
];

export default function SettingsPanel({ settings, onChange, language }: SettingsPanelProps) {
  
  const handleToggleLanguage = () => {
    onChange({ language: settings.language === 'bn' ? 'en' : 'bn' });
  };

  const handleToggleClock = () => {
    onChange({ clockFormat: settings.clockFormat === '12h' ? '24h' : '12h' });
  };

  return (
    <div id="settings-page-section" className="bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm select-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600 animate-spin-slow" />
            {language === 'bn' ? 'অ্যাপ্লিকেশন সেটিংস' : 'System Settings'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {language === 'bn' ? 'হিসাব পদ্ধতি ও নোটিফিকেশন পরিবর্তন করুন' : 'Configure translation layers and adhan notification sounds'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left column: Layout and computation switches */}
        <div className="flex flex-col gap-5">
          <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wider uppercase flex items-center gap-1">
            <Globe className="w-4 h-4 text-emerald-600" />
            {language === 'bn' ? 'ভাষা ও প্রদর্শন বিন্যাস' : 'Language & Display'}
          </h3>

          {/* Bilingual Switcher */}
          <div className="flex items-center justify-between p-4 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/5 rounded-2xl">
            <div>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                {language === 'bn' ? 'অ্যাপের ভাষা' : 'App Language'}
              </h4>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                {language === 'bn' ? 'বাংলা এবং ইংরেজিতে রূপান্তর' : 'Switch between Bengali and English'}
              </p>
            </div>
            
            <button
              onClick={handleToggleLanguage}
              id="language-app-toggle"
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 pointer-events-auto cursor-pointer shadow-sm transition"
            >
              {settings.language === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>

          {/* Clock format Toggle (12h vs 24h) */}
          <div className="flex items-center justify-between p-4 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/5 rounded-2xl">
            <div>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                {language === 'bn' ? 'সময় বিন্যাস' : 'Clock Layout format'}
              </h4>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                {language === 'bn' ? '১২ ঘণ্টা নাকি ২৪ ঘণ্টা প্রদর্শন' : 'Adjust dial display values'}
              </p>
            </div>
            
            <button
              onClick={handleToggleClock}
              id="clock-app-toggle"
              className="px-4 py-2 bg-white dark:bg-zinc-800 text-emerald-900 dark:text-emerald-100 border border-emerald-200 dark:border-neutral-800 font-extrabold rounded-xl text-xs hover:border-emerald-300 pointer-events-auto cursor-pointer transition"
            >
              {settings.clockFormat === '12h' ? '12 Hour' : '24 Hour'}
            </button>
          </div>

          {/* Theme customizer (Light, Dark, Auto) */}
          <div className="flex flex-col gap-3 p-4 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/5 rounded-2xl">
            <div>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                {language === 'bn' ? 'ডিসপ্লে থিম' : 'Visual Paint Theme'}
              </h4>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                {language === 'bn' ? 'ডার্ক মোড সমর্থন পরিবর্তন করুন' : 'Support for eye-safe dark themes'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-1">
              {(['light', 'dark', 'auto'] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onChange({ theme: t })}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all pointer-events-auto cursor-pointer ${
                    settings.theme === t
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-neutral-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t === 'light' && <Sun className="w-3.5 h-3.5" />}
                  {t === 'dark' && <Moon className="w-3.5 h-3.5" />}
                  {t === 'auto' && <Monitor className="w-3.5 h-3.5" />}
                  <span className="capitalize">{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Font / Text Size Customize (Small, Medium, Large, Extra Large) */}
          <div className="flex flex-col gap-3 p-4 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/5 rounded-2xl">
            <div>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                {language === 'bn' ? 'লেখার সাইজ' : 'Text / Font Size'}
              </h4>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                {language === 'bn' ? 'অক্ষরের মাপ পরিবর্তন করুন' : 'Adjust global typography scale'}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => onChange({ fontSize: sz })}
                  className={`py-2 text-[11px] font-bold rounded-xl border flex items-center justify-center transition-all pointer-events-auto cursor-pointer ${
                    (settings.fontSize || 'md') === sz
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-neutral-800 text-gray-700 dark:text-gray-300 hover:border-emerald-200'
                  }`}
                >
                  <span className="uppercase">{sz === 'sm' ? (language === 'bn' ? 'ছোট' : 'SM') : sz === 'md' ? (language === 'bn' ? 'মাঝারি' : 'MD') : sz === 'lg' ? (language === 'bn' ? 'বড়' : 'LG') : (language === 'bn' ? 'X-বড়' : 'XL')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Calculations setups and prayer laws */}
        <div className="flex flex-col gap-5">
          <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wider uppercase flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {language === 'bn' ? 'গণনা ও মাজহাব সেটিংস' : 'Calculations & Madhab Laws'}
          </h3>

          {/* Calulation Standard methods */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-bold">
              {language === 'bn' ? 'নামাজের হিসাব পদ্ধতিঃ' : 'Calculation Method:'}
            </label>
            <select
              value={settings.calcMethod}
              onChange={(e) => onChange({ calcMethod: e.target.value as CalcMethod })}
              className="w-full text-xs h-11 px-3 border border-emerald-100 dark:border-neutral-800 bg-emerald-50/10 dark:bg-zinc-950 text-emerald-950 dark:text-emerald-100 rounded-xl outline-none pointer-events-auto cursor-pointer focus:border-emerald-500"
            >
              <option value="MWL">Muslim World League (MWL)</option>
              <option value="ISNA">Islamic Society of North America (ISNA)</option>
              <option value="Karachi">University of Islamic Sciences, Karachi</option>
              <option value="Egypt">Egyptian General Authority of Survey</option>
              <option value="UmmAlQura">Umm al-Qura University, Makkah</option>
            </select>
            <span className="text-[10px] text-gray-400 leading-relaxed mt-0.5 px-1">
              {language === 'bn'
                ? '* বাংলাদেশে মুসলিম ওয়ার্ল্ড লীগ (MWL) পদ্ধতিটি সবচেয়ে নির্ভরযোগ্য।'
                : '* Muslim World League is highly recommended for Bangladesh prayer scopes.'}
            </span>
          </div>

          {/* Asr Juristic Method selection */}
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-bold">
              {language === 'bn' ? 'আসর ওয়াক্তের মাজহাব হিসাবঃ' : 'Asr Juristic Method (Madhab):'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['shafi', 'hanafi', 'maliki', 'hanbali'] as Madhab[]).map((m) => {
                let label = '';
                if (m === 'shafi') label = language === 'bn' ? 'শাফেয়ী (১ গুণ ছায়া)' : 'Shafi\'i (1x)';
                else if (m === 'hanafi') label = language === 'bn' ? 'হানাফী (২ গুণ ছায়া)' : 'Hanafi (2x)';
                else if (m === 'maliki') label = language === 'bn' ? 'মালেকী (১ গুণ ছায়া)' : 'Maliki (1x)';
                else if (m === 'hanbali') label = language === 'bn' ? 'হাম্বলী (১ গুণ ছায়া)' : 'Hanbali (1x)';

                return (
                  <button
                    key={m}
                    onClick={() => onChange({ madhab: m })}
                    className={`p-2.5 text-xs font-bold rounded-xl border transition-all pointer-events-auto cursor-pointer ${
                      settings.madhab === m
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border-emerald-100 dark:border-neutral-800 text-emerald-900 dark:text-emerald-100 hover:border-emerald-300'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] text-gray-400 leading-relaxed mt-0.5 px-1">
              {language === 'bn'
                ? '* হানাফী অনুসারীগণ হানাফী এবং অন্য ৩টি মাজহাব অনুসারীগণ ১ গুণ ছায়া সিলেক্ট করবেন।'
                : '* Hanafi uses 2x shadow, others (Shafi\'i, Maliki, Hanbali) use standard 1x shadow.'}
            </span>
          </div>

          {/* Hijri Lunar Calendar Adjustment Offset */}
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-bold">
              {language === 'bn' ? 'হিজরি তারিখ সংশোধন (চাঁদ দেখা অনুযায়ী)ঃ' : 'Hijri Calendar Moon Adjustment Offset:'}
            </label>
            <div className="flex items-center gap-1.5">
              {[-2, -1, 0, 1, 2].map((off) => {
                let lbl = off === 0 ? '0' : (off > 0 ? `+${off}` : `${off}`);
                let defaultTxt = off === -1 && language === 'bn' ? ' (BD)' : '';
                return (
                  <button
                    key={off}
                    onClick={() => onChange({ hijriOffset: off })}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all pointer-events-auto cursor-pointer ${
                      (settings.hijriOffset !== undefined ? settings.hijriOffset : -1) === off
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border-emerald-100 dark:border-neutral-800 text-emerald-900 dark:text-emerald-100 hover:border-emerald-300'
                    }`}
                  >
                    {lbl}{defaultTxt}
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] text-gray-400 leading-relaxed mt-0.5 px-1">
              {language === 'bn'
                ? '* বাংলাদেশে চাঁদ দেখা অনুযায়ী সাধারণত -১ দিন পিছিয়ে গণনা সঠিক।'
                : '* Bangladesh lunar calculation is typically offset by -1 day.'}
            </span>
          </div>

          {/* Azan audio volume parameters */}
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-bold">
              <span>{language === 'bn' ? 'আযান সাউন্ড ভলিউমঃ' : 'Azan Audio Volume:'}</span>
              <span className="font-mono">{Math.round(settings.volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-emerald-600" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => onChange({ volume: Number(e.target.value) })}
                className="w-full text-emerald-600"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
