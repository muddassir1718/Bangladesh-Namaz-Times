/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'bn' | 'en';
export type Theme = 'light' | 'dark' | 'auto';
export type ColorPalette = 'emerald' | 'midnight' | 'turquoise' | 'sepia' | 'royal';
export type Madhab = 'shafi' | 'hanafi' | 'maliki' | 'hanbali';
export type CalcMethod = 'ISNA' | 'MWL' | 'Egypt' | 'Karachi' | 'UmmAlQura';

// 6 Handcrafted Islamic Theme Presets
export type IslamicPresetId =
  | 'madina-emerald'
  | 'makkah-royal'
  | 'al-quds-turquoise'
  | 'ottoman-ruby'
  | 'desert-amber'
  | 'midnight-velvet'
  | 'custom';

// 6 Background Patterns
export type BackgroundPatternId =
  | '8-point-star'
  | 'mashrabiya'
  | 'crescent-night'
  | 'arabesque'
  | 'minimal-dots'
  | 'solid';

// 4 Button Shapes
export type ButtonShapeId =
  | 'soft-rounded'    // 14px radius
  | 'full-pill'       // 9999px radius
  | 'sharp-modern'    // 4px radius
  | 'mehrab-arch';    // Islamic Mehrab arch top

// 5 Button Background Styles
export type ButtonBgStyleId =
  | 'solid-vibrant'
  | 'smooth-gradient'
  | 'gold-border'
  | 'frosted-glass'
  | 'soft-gold-accent';

// 5 Button Front/Text Colors
export type ButtonTextColorId =
  | 'bright-white'
  | 'royal-gold'
  | 'deep-emerald'
  | 'creamy-ivory'
  | 'custom';

// 4 Button Shadows & Aura
export type ButtonShadowId =
  | 'gold-aura'
  | 'subtle-shadow'
  | 'bevel-3d'
  | 'flat';

// 3 Button Hover Effects
export type ButtonHoverEffectId =
  | 'smooth-lift'
  | 'scale-bounce'
  | 'golden-glow';

// Ambient Motion Intensity
export type MotionIntensity = 'calm' | 'lively' | 'minimal';

// Legacy compatibility types
export type ButtonStyle = 'rounded-full' | 'rounded-2xl' | 'rounded-xl' | 'rounded-md' | 'rounded-none';
export type ButtonColorMode = 'theme' | 'emerald' | 'gold' | 'midnight' | 'turquoise' | 'royal' | 'custom';
export type BackgroundStyle = 'geometric' | 'arabesque' | 'minimal' | 'solid';
export type FontFamilyChoice = 'sans' | 'serif' | 'rounded' | 'mono';
export type FontColorTone = 'default' | 'emerald' | 'gold' | 'slate';
export type IslamicMotion = 'subtle' | 'smooth' | 'off';

export interface AppSettings {
  language: Language;
  theme: Theme;
  colorPalette?: ColorPalette;
  madhab: Madhab;
  calcMethod: CalcMethod;
  notificationSettings: Record<string, { enabled: boolean; type: 'audio' | 'beep' | 'silent'; timerBefore: number }>;
  clockFormat: '12h' | '24h';
  volume: number;
  selectedMuezzin?: 'makkah' | 'madinah' | 'alaqsa' | 'mishary' | 'egypt';
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
  hijriOffset?: number;
  hapticFeedback?: boolean;

  // 100% Functional Islamic Theme System
  preset: IslamicPresetId;

  // Custom HEX Colors
  customPrimary: string;
  customAccent: string;
  customBgLight: string;
  customBgDark: string;
  customText: string;
  customTextSecondary: string;
  customBorder: string;

  // 6 Background Patterns
  backgroundPattern: BackgroundPatternId;

  // 4 Button Shapes
  buttonShape: ButtonShapeId;

  // 5 Button Background Styles
  buttonBgStyle: ButtonBgStyleId;

  // 5 Button Text Colors
  buttonTextColor: ButtonTextColorId;
  customButtonTextColor?: string;

  // 4 Button Shadows & Aura
  buttonShadow: ButtonShadowId;

  // 3 Button Hover Effects
  buttonHoverEffect: ButtonHoverEffectId;

  // Font/Typography
  fontFamily: FontFamilyChoice;
  fontColorTone: FontColorTone;

  // Islamic Ambient Motion System
  ambientMotionEnabled: boolean;
  motionIntensity: MotionIntensity;
  showFloatingParticles: boolean;
  showRotatingRosette: boolean;

  // Backward compatibility fields
  buttonStyle?: ButtonStyle;
  buttonColorMode?: ButtonColorMode;
  customButtonBg?: string;
  customButtonText?: string;
  backgroundStyle?: BackgroundStyle;
  islamicMotion?: IslamicMotion;
}

export interface TrackerCustomizationConfig {
  showPrayedBtn: boolean;
  showQazaBtn: boolean;
  showMissedBtn: boolean;
  autoMinusEnabled: boolean;
  labelPrayedBn: string;
  labelPrayedEn: string;
  labelQazaBn: string;
  labelQazaEn: string;
  labelMissedBn: string;
  labelMissedEn: string;
}

export interface District {
  id: string;
  nameBn: string;
  nameEn: string;
  lat: number;
  lng: number;
  offsetMinutes: number; // minutes offset from Dhaka
}

export interface PrayerTime {
  id: string;
  nameBn: string;
  nameEn: string;
  arabicName: string;
  time: string; // "HH:MM" 24h
  dateStr: string; // For sorting or state
  isForbidden: boolean;
  type: 'fard' | 'sunnah' | 'nafl' | 'marker';
}

export interface HijriDate {
  day: number;
  month: number;
  monthNameEn: string;
  monthNameBn: string;
  year: number;
}

export interface BanglaDate {
  day: number;
  monthNameBn: string;
  monthNameEn: string;
  year: number;
}

export interface IslamicEvent {
  day: number; // Hijri Day
  month: number; // Hijri Month
  nameBn: string;
  nameEn: string;
  isKadrPotential?: boolean;
}

export interface DuaItem {
  id: string;
  category: 'prayer' | 'morning-evening' | 'food' | 'sleep' | 'travel' | 'hardship' | 'salatut-tasbih' | 'istighfar' | 'durood' | 'necessary';
  titleBn: string;
  titleEn: string;
  arabic: string;
  pronunciationBn: string;
  pronunciationEn: string;
  meaningBn: string;
  meaningEn: string;
}

export interface TrackerDay {
  date: string; // YYYY-MM-DD
  prayers: Record<string, 'prayed' | 'missed' | 'qaza' | 'untracked'>;
}

export interface TasbihHistory {
  date: string;
  dhikrId: string;
  count: number;
}
