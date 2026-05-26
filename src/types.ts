/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'bn' | 'en';
export type Theme = 'light' | 'dark' | 'auto';
export type Madhab = 'shafi' | 'hanafi' | 'maliki' | 'hanbali';
export type CalcMethod = 'ISNA' | 'MWL' | 'Egypt' | 'Karachi' | 'UmmAlQura';

export interface AppSettings {
  language: Language;
  theme: Theme;
  madhab: Madhab;
  calcMethod: CalcMethod;
  notificationSettings: Record<string, { enabled: boolean; type: 'audio' | 'beep' | 'silent'; timerBefore: number }>;
  clockFormat: '12h' | '24h';
  volume: number;
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
  hijriOffset?: number;
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
