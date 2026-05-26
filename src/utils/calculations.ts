/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalcMethod, Madhab, PrayerTime } from '../types';

// Helper: Convert degrees to radians
const degToRad = (deg: number) => (deg * Math.PI) / 180;
// Helper: Convert radians to degrees
const radToDeg = (rad: number) => (rad * 180) / Math.PI;

// Coordinate Distance to Kaaba
// Kaaba: Lat 21.4225 N, Lng 39.8262 E
export function calculateDistanceToKaaba(userLat: number, userLng: number): number {
  const R = 6371; // Earth major radius in km
  const dLat = degToRad(21.4225 - userLat);
  const dLng = degToRad(39.8262 - userLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(userLat)) *
      Math.cos(degToRad(21.4225)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Qibla bearing calculation
export function calculateQiblaBearing(userLat: number, userLng: number): { bearing: number; directionEn: string; directionBn: string } {
  const kaabaLat = degToRad(21.4225);
  const kaabaLng = 39.8262;
  const dLng = degToRad(kaabaLng - userLng);
  const latRad = degToRad(userLat);

  const y = Math.sin(dLng) * Math.cos(kaabaLat);
  const x =
    Math.cos(latRad) * Math.sin(kaabaLat) -
    Math.sin(latRad) * Math.cos(kaabaLat) * Math.cos(dLng);

  let bearing = radToDeg(Math.atan2(y, x));
  bearing = (bearing + 360) % 360;

  // Directions in Bangladesh are typically West-North (approx 270 - 280 deg)
  let directionEn = 'West-North';
  let directionBn = 'পশ্চিম-উত্তর';

  if (bearing >= 337.5 || bearing < 22.5) {
    directionEn = 'North';
    directionBn = 'উত্তর';
  } else if (bearing >= 22.5 && bearing < 67.5) {
    directionEn = 'North-East';
    directionBn = 'উত্তর-পূর্ব';
  } else if (bearing >= 67.5 && bearing < 112.5) {
    directionEn = 'East';
    directionBn = 'পূর্ব';
  } else if (bearing >= 112.5 && bearing < 157.5) {
    directionEn = 'South-East';
    directionBn = 'দক্ষিণ-পূর্ব';
  } else if (bearing >= 157.5 && bearing < 202.5) {
    directionEn = 'South';
    directionBn = 'দক্ষিণ';
  } else if (bearing >= 202.5 && bearing < 247.5) {
    directionEn = 'South-West';
    directionBn = 'দক্ষিণ-পশ্চিম';
  } else if (bearing >= 247.5 && bearing < 292.5) {
    directionEn = 'West';
    directionBn = 'পশ্চিম';
  } else if (bearing >= 292.5 && bearing < 337.5) {
    directionEn = 'West-North';
    directionBn = 'পশ্চিম-উত্তর';
  }

  return { bearing: Math.round(bearing * 100) / 100, directionEn, directionBn };
}

// Convert hours decimal to "HH:MM"
export function decimalToTimeStr(decimalHours: number): string {
  let h = Math.floor(decimalHours);
  let m = Math.round((decimalHours - h) * 60);
  if (m === 60) {
    m = 0;
    h += 1;
  }
  h = (h + 24) % 24;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Core Prayer Times Algorithm
export function calculatePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  timezone: number = 6, // Bangladesh standard UTC+6
  madhab: Madhab = 'shafi',
  calcMethod: CalcMethod = 'MWL'
): PrayerTime[] {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 1. Calculate Julian Date
  // Simple formula for Julian Date
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  const M_adj = month <= 2 ? month + 12 : month;
  const Y_adj = month <= 2 ? year - 1 : year;
  const JD = Math.floor(365.25 * (Y_adj + 4716)) + Math.floor(30.6001 * (M_adj + 1)) + day + B - 1524.5 - timezone / 24;

  // 2. Solar calculations
  const D = JD - 2451545.0; // Days since epoch Y2K
  const g = 357.529 + 0.98560028 * D; // Mean anomaly
  const q = 280.459 + 0.98564736 * D; // Mean longitude
  const L = q + 1.915 * Math.sin(degToRad(g)) + 0.020 * Math.sin(degToRad(2 * g)); // True longitude

  const R = 1.00014 - 0.01671 * Math.cos(degToRad(g)) - 0.00014 * Math.cos(degToRad(2 * g));
  const e = 23.439 - 0.00000036 * D; // Obliquity of ecliptic

  const RA = radToDeg(Math.atan2(Math.cos(degToRad(e)) * Math.sin(degToRad(L)), Math.cos(degToRad(L)))) / 15;
  const RA_normalized = (RA + 24) % 24;

  const declination = radToDeg(Math.asin(Math.sin(degToRad(e)) * Math.sin(degToRad(L))));
  
  // Equation of Time in hours
  const EqT = q / 15 - RA_normalized;
  const EqT_minutes = (q % 360) / 15 - RA_normalized;
  const E = (EqT_minutes + 24) % 24; // Normalized EqT

  // Solar noon
  const Noon = 12 + timezone - lng / 15 - (E > 12 ? E - 24 : E);

  // Fajr/Isha Angles
  let fajrAngle = 18; // Bangladesh default standard Muslim World League or custom
  let ishaAngle = 17;

  if (calcMethod === 'ISNA') {
    fajrAngle = 15;
    ishaAngle = 15;
  } else if (calcMethod === 'Karachi') {
    fajrAngle = 18;
    ishaAngle = 18;
  } else if (calcMethod === 'Egypt') {
    fajrAngle = 19.5;
    ishaAngle = 17.5;
  } else if (calcMethod === 'UmmAlQura') {
    fajrAngle = 18.5;
    ishaAngle = 90; // Sunset + 90 minutes (custom handles later)
  }

  // Hour angle helper
  const hourAngle = (angle: number, altDirection: 'sunrise' | 'sunset' | 'custom', customAltitude?: number) => {
    let alt = 0;
    if (altDirection === 'sunrise' || altDirection === 'sunset') {
      alt = -0.833; // Standard refraction correction
    } else if (customAltitude !== undefined) {
      alt = customAltitude;
    } else {
      alt = -angle;
    }

    const cosH = (Math.sin(degToRad(alt)) - Math.sin(degToRad(lat)) * Math.sin(degToRad(declination))) /
                  (Math.cos(degToRad(lat)) * Math.cos(degToRad(declination)));

    if (cosH > 1 || cosH < -1) {
      return null; // Sun never reaches this altitude
    }
    return radToDeg(Math.acos(cosH)) / 15;
  };

  // Calculations
  const tSunriseHA = hourAngle(0, 'sunrise');
  const tSunsetHA = hourAngle(0, 'sunset');

  const sunrise = tSunriseHA !== null ? Noon - tSunriseHA : 6.0;
  const sunset = tSunsetHA !== null ? Noon + tSunsetHA : 18.0;

  const tFajrHA = hourAngle(fajrAngle, 'custom', -fajrAngle);
  const fajr = tFajrHA !== null ? Noon - tFajrHA : sunrise - 1.25;

  let isha = sunset + 1.25;
  if (calcMethod === 'UmmAlQura') {
    isha = sunset + 1.5; // Sunset + 90 minutes
  } else {
    const tIshaHA = hourAngle(ishaAngle, 'custom', -ishaAngle);
    if (tIshaHA !== null) {
      isha = Noon + tIshaHA;
    }
  }

  // Asr altitude calculation
  const shadowFactor = madhab === 'hanafi' ? 2 : 1;
  const asrAltRad = Math.atan(1 / (shadowFactor + Math.tan(degToRad(Math.abs(lat - declination)))));
  const asrAlt = radToDeg(asrAltRad);
  const tAsrHA = hourAngle(0, 'custom', asrAlt);
  const asr = tAsrHA !== null ? Noon + tAsrHA : sunset - 2.5;

  // Additional times
  const dhuhr = Noon + 4 / 60; // 4 minutes added for precautionary delay (Subhe Sadiq / Zohr start)
  const maghrib = sunset + 3 / 60; // Maghrib starts at sunset + 3 mins delay

  // Extended slot calculations
  // 1. Ishraq: 15 min after sunrise
  const ishraq = sunrise + 15 / 60;
  // 2. Chasht (Salat al-Duha): 30 min after sunrise (15 min after ishraq)
  const chasht = sunrise + 30 / 60;

  // 3. Tahajjud: calculated as the last 1/3rd of the night.
  // The night is defined from sunset to Fajr. Let's find duration.
  // We calculate Fajr of the same day for simplicity, but duration remains valid.
  // Night duration = (24 - sunset) + fajr or just fajr - sunset (if next day).
  const nightDuration = (fajr + 24 - sunset) % 24;
  const tahajjud = (fajr - nightDuration / 3 + 24) % 24;

  const dateStr = date.toISOString().split('T')[0];

  return [
    {
      id: 'tahajjud',
      nameBn: 'তাহাজ্জুদ',
      nameEn: 'Tahajjud',
      arabicName: 'تهجد',
      time: decimalToTimeStr(tahajjud),
      dateStr,
      isForbidden: false,
      type: 'nafl',
    },
    {
      id: 'fajr',
      nameBn: 'ফজর',
      nameEn: 'Fajr',
      arabicName: 'فجر',
      time: decimalToTimeStr(fajr),
      dateStr,
      isForbidden: false,
      type: 'fard',
    },
    {
      id: 'sunrise',
      nameBn: 'সূর্যোদয়',
      nameEn: 'Sunrise',
      arabicName: 'شروق',
      time: decimalToTimeStr(sunrise),
      dateStr,
      isForbidden: true, // Marker for forbidden period start
      type: 'marker',
    },
    {
      id: 'ishraq',
      nameBn: 'ইশরাক',
      nameEn: 'Ishraq',
      arabicName: 'إشراق',
      time: decimalToTimeStr(ishraq),
      dateStr,
      isForbidden: false,
      type: 'nafl',
    },
    {
      id: 'chasht',
      nameBn: 'চাশত',
      nameEn: 'Chasht',
      arabicName: 'ضحى',
      time: decimalToTimeStr(chasht),
      dateStr,
      isForbidden: false,
      type: 'nafl',
    },
    {
      id: 'dhuhr',
      nameBn: 'যোহর',
      nameEn: 'Dhuhr',
      arabicName: 'ظهر',
      time: decimalToTimeStr(dhuhr),
      dateStr,
      isForbidden: false,
      type: 'fard',
    },
    {
      id: 'asr',
      nameBn: 'আসর',
      nameEn: 'Asr',
      arabicName: 'عصر',
      time: decimalToTimeStr(asr),
      dateStr,
      isForbidden: false,
      type: 'fard',
    },
    {
      id: 'sunset',
      nameBn: 'সূর্যাস্ত',
      nameEn: 'Sunset',
      arabicName: 'غروب',
      time: decimalToTimeStr(sunset),
      dateStr,
      isForbidden: true, // Forbidden period start
      type: 'marker',
    },
    {
      id: 'maghrib',
      nameBn: 'মাগরিব',
      nameEn: 'Maghrib',
      arabicName: 'مغرب',
      time: decimalToTimeStr(maghrib),
      dateStr,
      isForbidden: false,
      type: 'fard',
    },
    {
      id: 'isha',
      nameBn: 'ইশা',
      nameEn: 'Isha',
      arabicName: 'عشاء',
      time: decimalToTimeStr(isha),
      dateStr,
      isForbidden: false,
      type: 'fard',
    },
  ];
}

// Check if a given time (in HH:MM format) falls under forbidden zones.
// Forbidden Zones:
// 1. At Sunrise (± 15 min around Sunrise)
// 2. When Sun is at zenith (5 min before Dhuhr prayer starts)
// 3. At Sunset (± 15 min around Sunset)
export function checkForbiddenStatus(
  timeStr: string, // "HH:MM"
  sunriseStr: string,
  dhuhrStr: string,
  sunsetStr: string
): { isForbidden: boolean; reasonBn: string; reasonEn: string } {
  const getMinutes = (str: string) => {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
  };

  const currentM = getMinutes(timeStr);
  const sunriseM = getMinutes(sunriseStr);
  const dhuhrM = getMinutes(dhuhrStr);
  const sunsetM = getMinutes(sunsetStr);

  // 1. At Sunrise (from sunrise - 5m to sunrise + 15m)
  if (currentM >= sunriseM - 1 && currentM <= sunriseM + 15) {
    return {
      isForbidden: true,
      reasonBn: 'সূর্যোদয়ের সময় (নামাজ হারাম)',
      reasonEn: 'At Sunrise (Prayer Forbidden)',
    };
  }

  // 2. Zenit (5 minutes before Dhuhr starts)
  const zenithStart = dhuhrM - 7;
  const zenithEnd = dhuhrM - 1;
  if (currentM >= zenithStart && currentM <= zenithEnd) {
    return {
      isForbidden: true,
      reasonBn: 'সূর্য মাথার ঠিক উপরে / মধ্যাহ্ন (নামাজ মাকরূহ)',
      reasonEn: 'Sun at Zenith / High Noon (Prayer Forbidden)',
    };
  }

  // 3. At Sunset (15 min before Sunset)
  if (currentM >= sunsetM - 15 && currentM <= sunsetM + 1) {
    return {
      isForbidden: true,
      reasonBn: 'সূর্যাস্তের সময় (নামাজ হারাম)',
      reasonEn: 'At Sunset (Prayer Forbidden)',
    };
  }

  return { isForbidden: false, reasonBn: '', reasonEn: '' };
}

// Convert numbers in English to Bangla numerals
export function toBanglaNum(num: string | number): string {
  const numMap: Record<string, string> = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
  };
  return num.toString().split('').map(char => numMap[char] || char).join('');
}

// Human friendly countdown time formatter
export function formatCountdown(minutes: number, lang: 'bn' | 'en'): string {
  if (minutes < 0) return '';
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);

  if (lang === 'bn') {
    if (hours > 0) {
      return `${toBanglaNum(hours)} ঘণ্টা ${toBanglaNum(mins)} মিনিট`;
    }
    return `${toBanglaNum(mins)} মিনিট`;
  } else {
    if (hours > 0) {
      return `${hours} hour ${mins} min`;
    }
    return `${mins} min`;
  }
}
