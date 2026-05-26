/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BanglaDate, HijriDate, IslamicEvent } from '../types';

// Revised Bangla Calendar Month names
export const BANGLA_MONTHS_BN = [
  'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'
];

export const BANGLA_MONTHS_EN = [
  'Boishakh', 'Jaishtha', 'Ashadh', 'Shraban', 'Bhadra', 'Ashwin', 'Kartik', 'Agrahayan', 'Poush', 'Magh', 'Falgun', 'Choitro'
];

// Hijri Month names
export const HIJRI_MONTHS_BN = [
  'মহররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জুমাদাল উলা', 'জুমাদাস সানি', 'রজব', 'শাবান', 'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ'
];

export const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' ath-Thani', 'Jumada al-Ula', 'Jumada ath-Thani', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
];

// Calculate Hijri Date from Gregorian Date
// Uses standard Kuwaiti Algorithm approximation
export function getHijriDate(date: Date, adjustmentDays: number = 0): HijriDate {
  let gDate = new Date(date);
  if (adjustmentDays !== 0) {
    gDate.setDate(gDate.getDate() + adjustmentDays);
  }

  let year = gDate.getFullYear();
  let month = gDate.getMonth();
  let day = gDate.getDate();

  if (month < 2) {
    year -= 1;
    month += 12;
  }

  let alpha = Math.floor(year / 100);
  let beta = Math.floor(alpha / 4);
  let b = 2 - alpha + beta;
  let jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 2)) + day + b - 1524.5;

  let epoch = 1948439.5; // julian date epoch of Hijri
  let diff = jd - epoch;
  let cycle = Math.floor(diff / 10631);
  let remains = diff % 10631;
  let hYear = Math.floor(remains / 354.36667) + cycle * 30 + 1;
  let daysInYear = Math.floor(((hYear - 1 - cycle * 30) * 354.36667) % 354.36667) + 1.5;
  
  // Calculate month and day
  let hMonth = 1;
  let hDay = 1;
  let daysPassed = diff - (cycle * 10631 + Math.floor((hYear - 1 - cycle * 30) * 354.36667));

  // Cumulative months length
  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  // Leap years list in 30-year cycle: 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29
  const cycleYear = hYear % 30;
  const isLeap = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29].includes(cycleYear);
  if (isLeap) {
    monthLengths[11] = 30;
  }

  let accDays = 0;
  for (let m = 0; m < 12; m++) {
    let len = monthLengths[m];
    if (daysPassed < accDays + len) {
      hMonth = m + 1;
      hDay = Math.floor(daysPassed - accDays) + 1;
      break;
    }
    accDays += len;
  }

  // Prevent index overflows
  hMonth = Math.min(12, Math.max(1, hMonth));

  return {
    day: hDay,
    month: hMonth,
    monthNameEn: HIJRI_MONTHS_EN[hMonth - 1],
    monthNameBn: HIJRI_MONTHS_BN[hMonth - 1],
    year: hYear,
  };
}

// Check if a year is leap year in Gregorian
function isGregorianLeap(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// Convert Gregorian to Bangladeshi Revised Bangla Calendar Date
// Revised rules: Boishakh 1 is usually April 14
// First 5 months (Boishakh, Jaishtha, Ashadh, Shraban, Bhadra) are 31 days.
// Ashwin to Choitro are 30 days. Falgun is 31 in leap years, else 30.
export function getBanglaDate(date: Date): BanglaDate {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed: 0 = Jan, 11 = Dec
  const day = date.getDate();

  // Let's find Day of Year
  const daysInMonths = [31, isGregorianLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let dayOfYear = day;
  for (let i = 0; i < month; i++) {
    dayOfYear += daysInMonths[i];
  }

  // April 14th standard is Boishakh 1 (approx 104th day in non-leap year, 105th in leap)
  const april14Day = 104 + (isGregorianLeap(year) ? 1 : 0);

  let bYear = year - 593;
  let bDayOfYear = 0;

  if (dayOfYear >= april14Day) {
    bDayOfYear = dayOfYear - april14Day + 1;
  } else {
    bYear -= 1;
    // previous year's total days
    const prevYearDays = isGregorianLeap(year - 1) ? 366 : 365;
    const prevApril14Day = 104 + (isGregorianLeap(year - 1) ? 1 : 0);
    bDayOfYear = (prevYearDays - prevApril14Day + 1) + dayOfYear;
  }

  // Let's distribute bDayOfYear to monthly lengths
  // Boishakh to Bhadra (5 months) = 31 days each = 155 days
  // Ashwin to Poush (4 months) = 30 days each
  // Magh = 30, Falgun = 30 (31 in leap year), Choitro = 30
  const isBLeap = isGregorianLeap(bYear + 593); // alignment with corresponding Gregorian leap cycle
  const bMonthLengths = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, isBLeap ? 31 : 30, 30];

  let bMonth = 0;
  let accumulatedDays = 0;
  let hDay = 1;

  for (let i = 0; i < 12; i++) {
    if (bDayOfYear <= accumulatedDays + bMonthLengths[i]) {
      bMonth = i;
      hDay = bDayOfYear - accumulatedDays;
      break;
    }
    accumulatedDays += bMonthLengths[i];
  }

  hDay = bDayOfYear - accumulatedDays;
  if (hDay <= 0) hDay = 1;

  return {
    day: hDay,
    monthNameBn: BANGLA_MONTHS_BN[bMonth],
    monthNameEn: BANGLA_MONTHS_EN[bMonth],
    year: bYear,
  };
}

// Standard Islamic Events database
export const ISLAMIC_EVENTS: IslamicEvent[] = [
  { day: 1, month: 1, nameBn: '১ মহররম (হিজরি নববর্ষ)', nameEn: '1 Muharram (Islamic New Year)' },
  { day: 10, month: 1, nameBn: 'আশুরা', nameEn: 'Ashura (10th Muharram)' },
  { day: 12, month: 3, nameBn: 'ঈদে মিলাদুন্নবী (সা.)', nameEn: 'Eid Milad-un-Nabi' },
  { day: 27, month: 7, nameBn: 'শবে মিরাজ', nameEn: 'Shab-e-Mi\'raj' },
  { day: 15, month: 8, nameBn: 'শবে বরাত', nameEn: 'Shab-e-Barat (15th Sha\'ban)' },
  { day: 1, month: 9, nameBn: 'রমজান শুরু', nameEn: 'First Day of Ramadan' },
  { day: 21, month: 9, nameBn: 'শবে কদর (সম্ভাব্য)', nameEn: 'Laylatul Qadr (21st Ramadan)', isKadrPotential: true },
  { day: 23, month: 9, nameBn: 'শবে কদর (সম্ভাব্য)', nameEn: 'Laylatul Qadr (23rd Ramadan)', isKadrPotential: true },
  { day: 25, month: 9, nameBn: 'শবে কদর (সম্ভাব্য)', nameEn: 'Laylatul Qadr (25th Ramadan)', isKadrPotential: true },
  { day: 27, month: 9, nameBn: 'লাইলাতুল কদর', nameEn: 'Laylatul Qadr (27th Ramadan)', isKadrPotential: true },
  { day: 29, month: 9, nameBn: 'শবে কদর (সম্ভাব্য)', nameEn: 'Laylatul Qadr (29th Ramadan)', isKadrPotential: true },
  { day: 1, month: 10, nameBn: 'ঈদুল ফিতর', nameEn: 'Eid-ul-Fitr' },
  { day: 9, month: 12, nameBn: 'আরাফাহ দিবস', nameEn: 'Day of Arafah' },
  { day: 10, month: 12, nameBn: 'ঈদুল আযহা', nameEn: 'Eid-ul-Adha' },
];

/**
 * Days countdown until the upcoming Ramadan 1 (Ramadan starts)
 */
export function getDaysUntilNextRamadan(date: Date): number {
  const currentHijri = getHijriDate(date);
  
  let targetYear = currentHijri.year;
  if (currentHijri.month > 9 || (currentHijri.month === 9 && currentHijri.day > 1)) {
    targetYear += 1;
  }

  // Find Gregorian date of that Ramadan 1 approx
  // Ramadan 1 is at approx JD since Hijri epoch
  let yearDiff = targetYear - 1;
  let targetJD = 1948439.5 + Math.floor(yearDiff * 354.36667) + 236; // 236 days until Month 9 starts
  
  // Back to gregorian
  let z = Math.floor(targetJD + 0.5);
  let f = (targetJD + 0.5) - z;
  let alpha = Math.floor((z - 1867216.25) / 36524.25);
  let a = z + 1 + alpha - Math.floor(alpha / 4);
  let b = a + 1524;
  let c = Math.floor((b - 122.1) / 365.25);
  let d = Math.floor(365.25 * c);
  let eValue = Math.floor((b - d) / 30.6001);
  
  let targetMonth = eValue < 14 ? eValue - 1 : eValue - 13;
  let targetGregorianYear = targetMonth > 2 ? c - 4716 : c - 4715;
  let targetDay = Math.floor(b - d - Math.floor(30.6001 * eValue)) + f;

  const targetDate = new Date(targetGregorianYear, targetMonth - 1, Math.round(targetDay));
  const diffTime = targetDate.getTime() - date.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}
