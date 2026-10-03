/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings, Moon, Sun, Monitor, Volume2, Globe, Clock,
  ShieldCheck, Palette, Vibrate, Play, Square, RotateCcw,
  Sparkles, Check, MousePointer, Type, Eye, Layers, Compass,
  Wand2, Sliders, Save, Hash
} from 'lucide-react';
import {
  AppSettings, Language, Theme, Madhab, CalcMethod,
  IslamicPresetId, BackgroundPatternId, ButtonShapeId,
  ButtonBgStyleId, ButtonTextColorId, ButtonShadowId,
  ButtonHoverEffectId, MotionIntensity, FontFamilyChoice, FontColorTone
} from '../types';
import {
  ISLAMIC_PRESETS, BACKGROUND_PATTERNS, BUTTON_SHAPES,
  BUTTON_BG_STYLES, BUTTON_TEXT_COLORS, BUTTON_SHADOWS,
  BUTTON_HOVER_EFFECTS, MOTION_INTENSITIES
} from '../data/themePresets';

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

export const DEFAULT_THEME_VALUES: Partial<AppSettings> = {
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
  fontSize: 'md',
  fontColorTone: 'default',
  ambientMotionEnabled: true,
  motionIntensity: 'calm',
  showFloatingParticles: true,
  showRotatingRosette: true
};

type SettingsSection = 'all' | 'theme-bg' | 'buttons-font' | 'motion' | 'display' | 'calculations';

export default function SettingsPanel({ settings, onChange, language }: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('all');
  const [playingMuezzinId, setPlayingMuezzinId] = useState<string | null>(null);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  const [previewClicked, setPreviewClicked] = useState<boolean>(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<boolean>(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<boolean>(false);

  // Helper to validate HEX color
  const isValidHex = (hex: string) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);

  const handleCustomColorInput = (key: keyof AppSettings, value: string) => {
    onChange({
      [key]: value,
      preset: 'custom'
    });
  };

  const handleSelectPreset = (presetId: IslamicPresetId) => {
    const found = ISLAMIC_PRESETS.find(p => p.id === presetId);
    if (!found) return;

    onChange({
      preset: presetId,
      customPrimary: found.primary,
      customAccent: found.accent,
      customBgDark: found.bgDark,
      customBgLight: found.bgLight,
      customText: found.textLight,
      customTextSecondary: found.secondaryTextLight,
      customBorder: found.borderDark
    });
    triggerHapticTest();
  };

  const handleExplicitSave = () => {
    // Persist to localStorage
    try {
      localStorage.setItem('namaz_times_settings_v1', JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    setSavedSuccessMessage(true);
    triggerHapticTest();
    setTimeout(() => setSavedSuccessMessage(false), 3000);
  };

  const handleResetToDefault = () => {
    onChange(DEFAULT_THEME_VALUES);
    setResetSuccessMessage(true);
    triggerHapticTest();
    setTimeout(() => setResetSuccessMessage(false), 3500);
  };

  const triggerHapticTest = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([40, 30, 60]);
      } catch (e) {
        // ignore
      }
    }
  };

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

  // Active theme properties with safe defaults
  const activePreset = settings.preset || 'madina-emerald';
  const activePattern = settings.backgroundPattern || '8-point-star';
  const activeShape = settings.buttonShape || 'soft-rounded';
  const activeBgStyle = settings.buttonBgStyle || 'solid-vibrant';
  const activeTextColor = settings.buttonTextColor || 'bright-white';
  const activeShadow = settings.buttonShadow || 'subtle-shadow';
  const activeHover = settings.buttonHoverEffect || 'smooth-lift';
  const activeFontFamily = settings.fontFamily || 'sans';
  const activeFontSize = settings.fontSize || 'md';
  const activeFontTone = settings.fontColorTone || 'default';
  const activeMotionIntensity = settings.motionIntensity || 'calm';
  const isMotionEnabled = settings.ambientMotionEnabled !== false;

  return (
    <div id="settings-page-section" className="bg-white dark:bg-zinc-900 border border-primary-green/10 dark:border-neutral-800 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm select-none font-sans flex flex-col gap-6">
      
      {/* Top Header with Save and Reset buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-green/10 dark:bg-accent-gold/15 text-primary-green dark:text-accent-gold flex items-center justify-center font-bold">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
              {language === 'bn' ? 'থিম ও সেটিংস কাস্টমাইজেশন' : 'Theme & Settings Customizer'}
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {language === 'bn'
              ? 'থিম ও ব্যাকগ্রাউন্ড, বাটন ও ফ্রন্ট স্টাইল, ইসলামিক মোশন, ভাষা ও ডিসপ্লে, মাজহাব ও হিসাব সম্পূর্ণ কাস্টমাইজ ও সংরক্ষণ করুন'
              : '100% functional theme presets, buttons, fonts, motion, language & jurisprudence settings'}
          </p>
        </div>

        {/* Action Buttons: Save & Reset */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
          <button
            onClick={handleExplicitSave}
            id="save-theme-settings-btn"
            className="theme-btn py-2.5 px-5 text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'bn' ? 'পরিবর্তন সেভ করুন' : 'Save Changes'}</span>
          </button>

          <button
            onClick={handleResetToDefault}
            id="reset-theme-defaults-btn"
            className="py-2.5 px-3.5 rounded-xl border border-red-500/25 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-950/40 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            title={language === 'bn' ? 'ডিফল্ট থিমে ফিরে যান' : 'Reset to Default'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Save Success Toast */}
      {savedSuccessMessage && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-accent-gold shrink-0" />
          <span>
            {language === 'bn'
              ? '✓ আপনার কাস্টমাইজেশন ও সেটিংস সফলভাবে সেভ ও সংরক্ষণ করা হয়েছে!'
              : '✓ All settings and customizations have been successfully saved!'}
          </span>
        </div>
      )}

      {/* Reset Success Toast */}
      {resetSuccessMessage && (
        <div className="p-3.5 bg-amber-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 shrink-0" />
          <span>
            {language === 'bn'
              ? '✓ সফলভাবে সকল থিম অপশন ডিফল্ট মদিনা এমেরাল্ড অবস্থায় ফিরিয়ে আনা হয়েছে!'
              : '✓ Successfully restored all options to default Madina Emerald theme!'}
          </span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. LIVE INTERACTIVE PREVIEW BOX                          */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50/60 via-white to-amber-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-neutral-900 border border-accent-gold/30 rounded-3xl shadow-sm flex flex-col gap-4 relative overflow-hidden">
        
        {/* Subtle decorative background watermark */}
        <div className="absolute top-0 right-0 w-44 h-44 border-8 border-accent-gold/10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-accent-gold" />
            <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
              {language === 'bn' ? 'রিয়েল-টাইম লাইভ প্রিভিউ (Live Interactive Preview)' : 'Real-Time Interactive Preview Box'}
            </h3>
            {isMotionEnabled && (
              <span className="w-2 h-2 rounded-full bg-accent-gold animate-ping"></span>
            )}
          </div>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            {language === 'bn' ? 'নিচের অপশন বদলালে এখানে সরাসরি পরিবর্তন দেখা যাবে' : 'All settings update this preview in real time'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-7 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌙</span>
              <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                {language === 'bn' ? 'আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ' : 'Bismillahir Rahmanir Raheem'}
              </h4>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {language === 'bn'
                ? 'পবিত্র কোরআন ও সুন্নাহর আলোকে প্রতিটি ওয়াক্তের নির্ভুল সময় ও আত্মিক বরকত অর্জনের মাধ্যম।'
                : 'A peaceful Islamic prayer timetable, Qibla alignment, and daily authentic Sunnah Azkar.'}
            </p>

            {/* Active Waqt Demo Badge with Gold Wave */}
            <div className={`p-2.5 px-3.5 rounded-xl border flex items-center justify-between text-xs font-bold max-w-sm ${isMotionEnabled ? 'active-waqt-gold-wave' : 'border-accent-gold/40 bg-accent-gold/10'}`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse"></span>
                <span className="text-gray-900 dark:text-white">
                  {language === 'bn' ? 'সক্রিয় ওয়াক্ত: আসর' : 'Active Waqt: Asr Prayer'}
                </span>
              </div>
              <span className="text-[10px] text-accent-gold font-mono font-black uppercase">
                {language === 'bn' ? 'চলমান' : 'Live'}
              </span>
            </div>
          </div>

          {/* Interactive Live Buttons to Test */}
          <div className="md:col-span-5 flex flex-wrap items-center justify-start md:justify-end gap-2.5">
            <button
              onClick={() => {
                setPreviewClicked(true);
                triggerHapticTest();
                setTimeout(() => setPreviewClicked(false), 1500);
              }}
              className="theme-btn py-2.5 px-5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
              <span>
                {previewClicked
                  ? (language === 'bn' ? '✓ ক্লিকে সাড়া দিয়েছে!' : '✓ Click Verified!')
                  : (language === 'bn' ? 'প্রধান বোতাম টেস্ট' : 'Test Primary Button')}
              </span>
            </button>

            <button
              className="py-2.5 px-5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer shadow-sm"
              style={{
                borderRadius: activeShape === 'soft-rounded' ? '14px' : activeShape === 'full-pill' ? '9999px' : activeShape === 'sharp-modern' ? '4px' : '20px 20px 6px 6px'
              }}
            >
              <span>{language === 'bn' ? 'সেকেন্ডারি বোতাম' : 'Secondary Button'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CATEGORY SEGMENTED FILTER BAR (100% RESPONSIVE)       */}
      {/* ======================================================== */}
      <div className="bg-gray-50 dark:bg-zinc-950/60 p-1.5 rounded-2xl border border-gray-200 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 select-none">
        {[
          { id: 'all' as SettingsSection, labelBn: 'সব সেটিংস', labelEn: 'All', icon: '📋' },
          { id: 'theme-bg' as SettingsSection, labelBn: 'থিম ও ব্যাকগ্রাউন্ড', labelEn: 'Theme & Bg', icon: '🎨' },
          { id: 'buttons-font' as SettingsSection, labelBn: 'বাটন ও ফ্রন্ট স্টাইল', labelEn: 'Buttons & Font', icon: '🔘' },
          { id: 'motion' as SettingsSection, labelBn: 'ইসলামিক মোশন', labelEn: 'Motion', icon: '✨' },
          { id: 'display' as SettingsSection, labelBn: 'ভাষা ও ডিসপ্লে', labelEn: 'Display', icon: '🌐' },
          { id: 'calculations' as SettingsSection, labelBn: 'মাজহাব ও হিসাব', labelEn: 'Madhab & Calc', icon: '⚖️' }
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              activeSection === sec.id
                ? 'theme-btn shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800'
            }`}
          >
            <span>{sec.icon}</span>
            <span className="truncate">{language === 'bn' ? sec.labelBn : sec.labelEn}</span>
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 3. SECTION 1: থিম ও ব্যাকগ্রাউন্ড                          */}
      {/* ======================================================== */}
      {(activeSection === 'all' || activeSection === 'theme-bg') && (
        <div className="flex flex-col gap-6">
          
          {/* 6 Handcrafted Presets */}
          <div className="flex flex-col gap-4 p-5 sm:p-6 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'bn' ? '৬টি হস্তনির্মিত ইসলামি প্রিসেট' : '6 Handcrafted Islamic Presets'}</span>
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {language === 'bn' ? 'ঐতিহাসিক ইসলামি ঐতিহ্য ও স্থাপত্য অনুযায়ী তৈরি' : 'Curated authentic Islamic palettes'}
                </p>
              </div>
              <span className="text-[10px] text-accent-gold font-mono font-bold uppercase">{activePreset}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ISLAMIC_PRESETS.map((preset) => {
                const isSelected = activePreset === preset.id;

                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-800 border-accent-gold shadow-md ring-2 ring-accent-gold/40'
                        : 'bg-white/60 dark:bg-zinc-900/60 border-gray-200 dark:border-neutral-800 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center -space-x-1.5">
                        <span className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: preset.primary }}></span>
                        <span className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: preset.accent }}></span>
                        <span className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: preset.bgDark }}></span>
                      </div>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-sm">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                        {language === 'bn' ? preset.nameBn : preset.nameEn}
                      </h5>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                        {language === 'bn' ? preset.descBn : preset.descEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7 Custom HEX Colors */}
          <div className="flex flex-col gap-3 p-5 sm:p-6 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl">
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-accent-gold" />
                <span>{language === 'bn' ? 'কাস্টম HEX কালার পিকার ও কোড (৭টি কালার)' : 'Custom HEX Color Customizer (7 Colors)'}</span>
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {language === 'bn' ? 'কালার পিকার বা সরাসরি HEX লিখে পরিবর্তন করুন, সাথে সাথে কার্যকর হবে' : 'Enter valid HEX codes or use native color pickers'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-1">
              {/* 1. Primary */}
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? '১. প্রাইমারি কালার:' : '1. Primary Color:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={isValidHex(settings.customPrimary || '') ? settings.customPrimary : '#0F6B4F'}
                    onChange={(e) => handleCustomColorInput('customPrimary', e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={settings.customPrimary || '#0F6B4F'}
                    onChange={(e) => handleCustomColorInput('customPrimary', e.target.value)}
                    className="flex-1 text-xs py-1 px-2 border border-gray-200 dark:border-neutral-800 rounded-lg font-mono uppercase bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* 2. Accent Gold */}
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? '২. স্বর্ণালি অ্যাকসেন্ট:' : '2. Accent Gold:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={isValidHex(settings.customAccent || '') ? settings.customAccent : '#D4AF37'}
                    onChange={(e) => handleCustomColorInput('customAccent', e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={settings.customAccent || '#D4AF37'}
                    onChange={(e) => handleCustomColorInput('customAccent', e.target.value)}
                    className="flex-1 text-xs py-1 px-2 border border-gray-200 dark:border-neutral-800 rounded-lg font-mono uppercase bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* 3. Dark Bg */}
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? '৩. ডার্ক ব্যাকগ্রাউন্ড:' : '3. Dark Background:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={isValidHex(settings.customBgDark || '') ? settings.customBgDark : '#07150C'}
                    onChange={(e) => handleCustomColorInput('customBgDark', e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={settings.customBgDark || '#07150C'}
                    onChange={(e) => handleCustomColorInput('customBgDark', e.target.value)}
                    className="flex-1 text-xs py-1 px-2 border border-gray-200 dark:border-neutral-800 rounded-lg font-mono uppercase bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* 4. Light Bg */}
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? '৪. লাইট ব্যাকগ্রাউন্ড:' : '4. Light Background:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={isValidHex(settings.customBgLight || '') ? settings.customBgLight : '#F4F8F5'}
                    onChange={(e) => handleCustomColorInput('customBgLight', e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={settings.customBgLight || '#F4F8F5'}
                    onChange={(e) => handleCustomColorInput('customBgLight', e.target.value)}
                    className="flex-1 text-xs py-1 px-2 border border-gray-200 dark:border-neutral-800 rounded-lg font-mono uppercase bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* 5. Main Text Color */}
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? '৫. মূল লেখার কালার:' : '5. Main Text Color:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={isValidHex(settings.customText || '') ? settings.customText : '#111827'}
                    onChange={(e) => handleCustomColorInput('customText', e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={settings.customText || '#111827'}
                    onChange={(e) => handleCustomColorInput('customText', e.target.value)}
                    className="flex-1 text-xs py-1 px-2 border border-gray-200 dark:border-neutral-800 rounded-lg font-mono uppercase bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* 6. Secondary Text Color */}
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? '৬. গৌণ লেখার কালার:' : '6. Secondary Text:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={isValidHex(settings.customTextSecondary || '') ? settings.customTextSecondary : '#4B5563'}
                    onChange={(e) => handleCustomColorInput('customTextSecondary', e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={settings.customTextSecondary || '#4B5563'}
                    onChange={(e) => handleCustomColorInput('customTextSecondary', e.target.value)}
                    className="flex-1 text-xs py-1 px-2 border border-gray-200 dark:border-neutral-800 rounded-lg font-mono uppercase bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* 7. Border Color */}
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? '৭. বর্ডার কালার:' : '7. Border Color:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={isValidHex(settings.customBorder || '') ? settings.customBorder : '#163D24'}
                    onChange={(e) => handleCustomColorInput('customBorder', e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={settings.customBorder || '#163D24'}
                    onChange={(e) => handleCustomColorInput('customBorder', e.target.value)}
                    className="flex-1 text-xs py-1 px-2 border border-gray-200 dark:border-neutral-800 rounded-lg font-mono uppercase bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 6 Background Patterns */}
          <div className="flex flex-col gap-3 p-5 sm:p-6 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? '৬টি ব্যাকগ্রাউন্ড প্যাটার্ন সিস্টেম' : '6 Background Patterns'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-1">
              {BACKGROUND_PATTERNS.map((pat) => {
                const isSelected = activePattern === pat.id;

                return (
                  <button
                    key={pat.id}
                    onClick={() => {
                      onChange({ backgroundPattern: pat.id });
                      triggerHapticTest();
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-800 border-accent-gold shadow-md ring-2 ring-accent-gold/40'
                        : 'bg-white/60 dark:bg-zinc-900/60 border-gray-200 dark:border-neutral-800 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl w-6 text-center">{pat.icon}</span>
                      <div>
                        <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                          {language === 'bn' ? pat.nameBn : pat.nameEn}
                        </h5>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {language === 'bn' ? pat.descBn : pat.descEn}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SECTION 2: বাটন ও ফ্রন্ট স্টাইল                        */}
      {/* ======================================================== */}
      {(activeSection === 'all' || activeSection === 'buttons-font') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Button Shapes (4 shapes) */}
          <div className="p-5 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl flex flex-col gap-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'বোতামের আকার (4 Shapes)' : 'Button Shapes'}</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 mt-1">
              {BUTTON_SHAPES.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => onChange({ buttonShape: shape.id })}
                  style={{ borderRadius: shape.radiusCss }}
                  className={`p-2.5 border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    activeShape === shape.id
                      ? 'bg-primary-green text-white border-primary-green shadow-sm ring-2 ring-primary-green/30'
                      : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <span>{language === 'bn' ? shape.nameBn : shape.nameEn}</span>
                  {activeShape === shape.id && <Check className="w-3 h-3 text-accent-gold" />}
                </button>
              ))}
            </div>
          </div>

          {/* Button Background Styles (5 styles) */}
          <div className="p-5 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl flex flex-col gap-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-accent-gold" />
              <span>{language === 'bn' ? 'বোতামের ব্যাকগ্রাউন্ড স্টাইল (5 Styles)' : 'Button Background Styles'}</span>
            </h4>

            <div className="flex flex-col gap-2 mt-1">
              {BUTTON_BG_STYLES.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => onChange({ buttonBgStyle: bg.id })}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    activeBgStyle === bg.id
                      ? 'bg-white dark:bg-zinc-800 border-accent-gold shadow-sm ring-1 ring-accent-gold/40'
                      : 'bg-white/60 dark:bg-zinc-900/60 border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <span>{language === 'bn' ? bg.nameBn : bg.nameEn}</span>
                  {activeBgStyle === bg.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Button Text Color (5 options + Custom Picker) */}
          <div className="p-5 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl flex flex-col gap-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'বোতামের ফ্রন্ট/লেখার কালার' : 'Button Text Color'}</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {BUTTON_TEXT_COLORS.map((tc) => (
                <button
                  key={tc.id}
                  onClick={() => onChange({ buttonTextColor: tc.id })}
                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    activeTextColor === tc.id
                      ? 'bg-white dark:bg-zinc-800 border-accent-gold shadow-sm ring-1 ring-accent-gold/40'
                      : 'bg-white/60 dark:bg-zinc-900/60 border-gray-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: tc.hex }}></span>
                    <span className="text-[11px] text-gray-900 dark:text-white">{language === 'bn' ? tc.nameBn : tc.nameEn}</span>
                  </div>
                  {activeTextColor === tc.id && <Check className="w-3 h-3 text-emerald-600" />}
                </button>
              ))}
            </div>

            {/* Custom Button Text Color Picker if custom selected */}
            {activeTextColor === 'custom' && (
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex items-center justify-between gap-3 mt-1">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? 'কাস্টম বাটন লেখার কালার:' : 'Custom Text Hex:'}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.customButtonTextColor || '#FFFFFF'}
                    onChange={(e) => onChange({ customButtonTextColor: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={settings.customButtonTextColor || '#FFFFFF'}
                    onChange={(e) => onChange({ customButtonTextColor: e.target.value })}
                    className="w-24 text-xs py-1 px-2 border border-gray-200 dark:border-neutral-800 rounded-lg font-mono uppercase bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Button Shadows & Aura */}
          <div className="p-5 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl flex flex-col gap-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-gold" />
              <span>{language === 'bn' ? 'বোতামের শ্যাডো ও অরা (Shadow & Aura)' : 'Button Shadows & Aura'}</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 mt-1">
              {BUTTON_SHADOWS.map((sh) => (
                <button
                  key={sh.id}
                  onClick={() => onChange({ buttonShadow: sh.id })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    activeShadow === sh.id
                      ? 'bg-primary-green text-white border-primary-green shadow-sm ring-2 ring-primary-green/30'
                      : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <span>{language === 'bn' ? sh.nameBn : sh.nameEn}</span>
                  {activeShadow === sh.id && <Check className="w-3 h-3 text-accent-gold" />}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family & Typography */}
          <div className="p-5 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl flex flex-col gap-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'ফন্ট স্টাইল ও টাইপোগ্রাফি (Typefaces)' : 'Typography & Font Family'}</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                { id: 'sans' as FontFamilyChoice, labelBn: 'আধুনিক সান্স (Sans)', labelEn: 'Modern Sans' },
                { id: 'serif' as FontFamilyChoice, labelBn: 'ইসলামিক সেরিফ (Serif)', labelEn: 'Islamic Serif' },
                { id: 'rounded' as FontFamilyChoice, labelBn: 'স্মুথ রাউন্ডেড', labelEn: 'Smooth Rounded' },
                { id: 'mono' as FontFamilyChoice, labelBn: 'ডিজিটাল মনোস্পেস', labelEn: 'Monospace' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => onChange({ fontFamily: f.id })}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    activeFontFamily === f.id
                      ? 'bg-primary-green border-primary-green text-white shadow-sm ring-2 ring-primary-green/30'
                      : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>{language === 'bn' ? f.labelBn : f.labelEn}</span>
                  {activeFontFamily === f.id && <Check className="w-3.5 h-3.5 text-accent-gold" />}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size & Tone */}
          <div className="p-5 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl flex flex-col gap-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-accent-gold" />
              <span>{language === 'bn' ? 'ফন্ট সাইজ ও লেখার টোন' : 'Font Size & Tone'}</span>
            </h4>

            {/* Font Size */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {language === 'bn' ? 'ফন্ট সাইজ (আকার):' : 'Font Size:'}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'sm' as const, labelBn: 'ছোট', labelEn: 'Small' },
                  { id: 'md' as const, labelBn: 'মাঝারি', labelEn: 'Medium' },
                  { id: 'lg' as const, labelBn: 'বড়', labelEn: 'Large' },
                  { id: 'xl' as const, labelBn: 'অতি বড়', labelEn: 'X-Large' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onChange({ fontSize: s.id })}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
                      activeFontSize === s.id
                        ? 'bg-primary-green text-white border-primary-green shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {language === 'bn' ? s.labelBn : s.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Tone */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {language === 'bn' ? 'লেখার টোন ও আবহ:' : 'Color Tone:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'default' as FontColorTone, labelBn: 'ডিফল্ট', labelEn: 'Default' },
                  { id: 'emerald' as FontColorTone, labelBn: 'এমেরাল্ড আভা', labelEn: 'Emerald' },
                  { id: 'gold' as FontColorTone, labelBn: 'গোল্ডেন', labelEn: 'Gold' },
                  { id: 'slate' as FontColorTone, labelBn: 'স্লেট গ্রে', labelEn: 'Slate' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onChange({ fontColorTone: t.id })}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
                      activeFontTone === t.id
                        ? 'bg-primary-green text-white border-primary-green shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {language === 'bn' ? t.labelBn : t.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hover Effects */}
          <div className="p-5 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl flex flex-col gap-3 lg:col-span-2">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'হোভার অ্যানিমেশন (Hover Effects)' : 'Hover Effects'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
              {BUTTON_HOVER_EFFECTS.map((hov) => (
                <button
                  key={hov.id}
                  onClick={() => onChange({ buttonHoverEffect: hov.id })}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition text-center cursor-pointer ${
                    activeHover === hov.id
                      ? 'bg-primary-green text-white border-primary-green shadow-sm ring-2 ring-primary-green/30'
                      : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <span>{language === 'bn' ? hov.nameBn : hov.nameEn}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 5. SECTION 3: ইসলামিক মোশন                               */}
      {/* ======================================================== */}
      {(activeSection === 'all' || activeSection === 'motion') && (
        <div className="flex flex-col gap-4 p-5 sm:p-6 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-gold animate-spin-slow" />
                <span>{language === 'bn' ? 'ইসলামিক অ্যাম্বিয়েন্ট মোশন সিস্টেম' : 'Islamic Ambient Motion System'}</span>
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {language === 'bn' ? 'ভাসমান চাঁদ ও নক্ষত্র কণা, ঘূর্ণায়মান রসেট ও গতি নিয়ন্ত্রণ' : 'Master ambient motion toggle & particle effects'}
              </p>
            </div>

            <button
              onClick={() => onChange({ ambientMotionEnabled: !isMotionEnabled })}
              className={`py-1.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition shadow-sm flex items-center gap-2 shrink-0 ${
                isMotionEnabled ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <span>{isMotionEnabled ? (language === 'bn' ? 'মোশন চালু (ON) ✓' : 'Motion ON ✓') : (language === 'bn' ? 'মোশন বন্ধ (OFF)' : 'Motion OFF')}</span>
            </button>
          </div>

          {isMotionEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-neutral-800 animate-in fade-in duration-200">
              {/* Motion Intensity */}
              <div className="sm:col-span-3 flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {language === 'bn' ? 'মোশনের গতি ও গভীরতা (Intensity):' : 'Motion Intensity:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MOTION_INTENSITIES.map((mi) => (
                    <button
                      key={mi.id}
                      onClick={() => onChange({ motionIntensity: mi.id })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        activeMotionIntensity === mi.id
                          ? 'bg-primary-green text-white border-primary-green shadow-sm'
                          : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <span>{language === 'bn' ? mi.nameBn : mi.nameEn}</span>
                      {activeMotionIntensity === mi.id && <Check className="w-3 h-3 text-accent-gold" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Floating Crescent */}
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                    {language === 'bn' ? 'ভাসমান চাঁদ ও তারা কণা' : 'Floating Crescent & Stars'}
                  </h5>
                  <p className="text-[10px] text-gray-400">{language === 'bn' ? 'মৃদু ভাসমান কিরণ' : 'Atmospheric particles'}</p>
                </div>
                <button
                  onClick={() => onChange({ showFloatingParticles: !(settings.showFloatingParticles !== false) })}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition ${
                    settings.showFloatingParticles !== false ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'
                  }`}
                >
                  {settings.showFloatingParticles !== false ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Rotating Rosette */}
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                    {language === 'bn' ? 'ঘূর্ণায়মান রসেট ওয়াটারমার্ক' : 'Rotating Rosette'}
                  </h5>
                  <p className="text-[10px] text-gray-400">{language === 'bn' ? '৮-তারা জ্যামিতিক নকশা' : 'Rub el Hizb watermark'}</p>
                </div>
                <button
                  onClick={() => onChange({ showRotatingRosette: !(settings.showRotatingRosette !== false) })}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition ${
                    settings.showRotatingRosette !== false ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'
                  }`}
                >
                  {settings.showRotatingRosette !== false ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. SECTION 4: ভাষা ও ডিসপ্লে                              */}
      {/* ======================================================== */}
      {(activeSection === 'all' || activeSection === 'display') && (
        <div className="p-5 sm:p-6 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl flex flex-col gap-4">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'ভাষা ও ডিসপ্লে সেটিংস' : 'Language & Display Setup'}</span>
          </h4>

          {/* Theme Light / Dark / Auto */}
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'dark', 'auto'] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => onChange({ theme: t })}
                className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  settings.theme === t
                    ? 'bg-primary-green border-primary-green text-white shadow-sm ring-2 ring-primary-green/30'
                    : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {t === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                {t === 'dark' && <Moon className="w-3.5 h-3.5 text-accent-gold" />}
                {t === 'auto' && <Monitor className="w-3.5 h-3.5" />}
                <span className="capitalize">{t === 'auto' ? (language === 'bn' ? 'অটো' : 'Auto') : t === 'light' ? (language === 'bn' ? 'লাইট' : 'Light') : (language === 'bn' ? 'ডার্ক' : 'Dark')}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Language */}
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">{language === 'bn' ? 'অ্যাপের ভাষা' : 'Language'}</span>
                <span className="text-[10px] text-gray-400">{settings.language === 'bn' ? 'বাংলা' : 'English'}</span>
              </div>
              <button
                onClick={handleToggleLanguage}
                className="py-1 px-3 bg-primary-green text-white font-bold rounded-lg text-xs hover:bg-[#135f28] cursor-pointer"
              >
                {settings.language === 'bn' ? 'English' : 'বাংলা'}
              </button>
            </div>

            {/* Clock Format */}
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">{language === 'bn' ? 'ঘড়ির ফরম্যাট' : 'Clock Layout'}</span>
                <span className="text-[10px] text-gray-400">{settings.clockFormat === '12h' ? '12h AM/PM' : '24h Military'}</span>
              </div>
              <button
                onClick={handleToggleClock}
                className="py-1 px-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                {settings.clockFormat === '12h' ? '12h' : '24h'}
              </button>
            </div>

            {/* Mobile Haptic */}
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Vibrate className="w-4 h-4 text-accent-gold" />
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{language === 'bn' ? 'হ্যাপটিক ভাইব্রেশন' : 'Haptics'}</span>
              </div>
              <button
                onClick={() => {
                  const nxt = !(settings.hapticFeedback ?? true);
                  onChange({ hapticFeedback: nxt });
                  if (nxt) triggerHapticTest();
                }}
                className={`py-1 px-3 rounded-lg text-xs font-bold cursor-pointer ${
                  (settings.hapticFeedback ?? true) ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-400'
                }`}
              >
                {(settings.hapticFeedback ?? true) ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. SECTION 5: মাজহাব ও হিসাব                              */}
      {/* ======================================================== */}
      {(activeSection === 'all' || activeSection === 'calculations') && (
        <div className="p-5 sm:p-6 bg-emerald-50/20 dark:bg-zinc-950/40 border border-emerald-500/10 rounded-3xl flex flex-col gap-4">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'মাজহাব ও হিসাব পদ্ধতি (Madhab & Calculations)' : 'Jurisprudence & Calculation Methods'}</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Calculation Method */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {language === 'bn' ? 'নামাজের হিসাব পদ্ধতি (Solar Calculation):' : 'Calculation Method:'}
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

            {/* Asr Madhab */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {language === 'bn' ? 'আসর ওয়াক্তের মাজহাব:' : 'Asr Juristic Madhab:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['hanafi', 'shafi'] as Madhab[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => onChange({ madhab: m })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      settings.madhab === m
                        ? 'bg-primary-green border-primary-green text-white shadow-sm ring-2 ring-primary-green/30'
                        : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {m === 'hanafi'
                      ? (language === 'bn' ? 'হানাফী (২ গুণ)' : 'Hanafi (2x)')
                      : (language === 'bn' ? 'শাফেয়ী / সাধারণ (১ গুণ)' : 'Shafi\'i (1x)')}
                  </button>
                ))}
              </div>
            </div>

            {/* Hijri Offset */}
            <div className="md:col-span-2 flex flex-col gap-1.5 pt-2 border-t border-gray-100 dark:border-neutral-800">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
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

          {/* Muezzin & Audio Sound Preview */}
          <div className="mt-2 pt-3 border-t border-gray-100 dark:border-neutral-800 flex flex-col gap-2">
            <h5 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'মুয়াজ্জিনের আযান ও অডিও সাউন্ড' : 'Muezzin & Adhan Audio'}</span>
            </h5>

            <div className="flex flex-col gap-2">
              {MUEZZIN_LIST.map((m) => {
                const isSelected = (settings.selectedMuezzin || 'makkah') === m.id;
                const isPlaying = playingMuezzinId === m.id;

                return (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                        : 'bg-white/60 dark:bg-zinc-900/60 border-gray-100 dark:border-neutral-800'
                    }`}
                  >
                    <div
                      onClick={() => onChange({ selectedMuezzin: m.id as any })}
                      className="flex items-center gap-2 flex-grow cursor-pointer"
                    >
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                      </span>
                      <span className="text-gray-900 dark:text-white text-xs">
                        {language === 'bn' ? m.nameBn : m.nameEn}
                      </span>
                    </div>

                    <button
                      onClick={() => handlePreviewAdhan(m.id, m.audioUrl)}
                      className={`py-1 px-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                        isPlaying
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-accent-gold hover:bg-emerald-500/20'
                      }`}
                    >
                      {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                      <span className="text-[10px]">{isPlaying ? (language === 'bn' ? 'থামুন' : 'Stop') : (language === 'bn' ? 'শুনুন' : 'Play')}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Volume Slider */}
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {language === 'bn' ? 'আযানের ভলিউম:' : 'Adhan Volume:'} {Math.round(settings.volume * 100)}%
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => onChange({ volume: Number(e.target.value) })}
                className="w-32 text-emerald-600 cursor-pointer"
              />
            </div>
          </div>

        </div>
      )}

      {/* Floating Save Button on Mobile */}
      <div className="sticky bottom-16 z-20 flex justify-center py-2">
        <button
          onClick={handleExplicitSave}
          className="theme-btn py-3 px-8 text-xs font-black shadow-2xl flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{language === 'bn' ? 'পরিবর্তন সেভ করুন' : 'Save Changes'}</span>
        </button>
      </div>

    </div>
  );
}
