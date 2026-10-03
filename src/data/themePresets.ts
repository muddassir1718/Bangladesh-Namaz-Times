/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  IslamicPresetId, BackgroundPatternId, ButtonShapeId,
  ButtonBgStyleId, ButtonTextColorId, ButtonShadowId,
  ButtonHoverEffectId, MotionIntensity
} from '../types';

export interface ThemePresetConfig {
  id: IslamicPresetId;
  nameBn: string;
  nameEn: string;
  descBn: string;
  descEn: string;
  primary: string;
  accent: string;
  bgDark: string;
  bgLight: string;
  textLight: string;
  textDark: string;
  secondaryTextLight: string;
  secondaryTextDark: string;
  borderDark: string;
  borderLight: string;
}

export const ISLAMIC_PRESETS: ThemePresetConfig[] = [
  {
    id: 'madina-emerald',
    nameBn: 'মদিনা এমেরাল্ড (Madina Emerald)',
    nameEn: 'Madina Emerald & Gold',
    descBn: 'ক্লাসিক মদিনা-অনুপ্রাণিত ইসলামি আভিজাত্য',
    descEn: 'Classic Medina-inspired Islamic elegance',
    primary: '#0F6B4F',
    accent: '#D4AF37',
    bgDark: '#07150C',
    bgLight: '#F4F8F5',
    textDark: '#F9FAFB',
    textLight: '#111827',
    secondaryTextDark: '#9CA3AF',
    secondaryTextLight: '#4B5563',
    borderDark: '#163D24',
    borderLight: '#D1E7DD'
  },
  {
    id: 'makkah-royal',
    nameBn: 'মক্কা রয়্যাল গোল্ড (Makkah Royal)',
    nameEn: 'Makkah Royal Gold',
    descBn: 'কাবা শরীফ অনুপ্রাণিত রাজকীয় কৃষ্ণ ও স্বর্ণালি আভা',
    descEn: 'Premium royal Islamic luxury inspired by the Kaaba',
    primary: '#18181B',
    accent: '#E6B741',
    bgDark: '#09090B',
    bgLight: '#FAFAF9',
    textDark: '#F4F4F5',
    textLight: '#09090B',
    secondaryTextDark: '#A1A1AA',
    secondaryTextLight: '#52525B',
    borderDark: '#27272A',
    borderLight: '#E4E4E7'
  },
  {
    id: 'al-quds-turquoise',
    nameBn: 'আল-কুদস ফিরোজা (Al-Quds Turquoise)',
    nameEn: 'Al-Quds Turquoise & Sapphire',
    descBn: 'মসজিদুল আকসার গম্বুজ ও মোজাইকের মনোহর আভা',
    descEn: 'Elegant architectural Islamic atmosphere',
    primary: '#0D9488',
    accent: '#38BDF8',
    bgDark: '#081528',
    bgLight: '#F0F9FF',
    textDark: '#F0FDF4',
    textLight: '#0C4A6E',
    secondaryTextDark: '#94A3B8',
    secondaryTextLight: '#475569',
    borderDark: '#133552',
    borderLight: '#BAE6FD'
  },
  {
    id: 'ottoman-ruby',
    nameBn: 'উসমানীয় রুবি (Ottoman Ruby)',
    nameEn: 'Ottoman Ruby & Bronze',
    descBn: 'উসমানীয় সাম্রাজ্যের রাজকীয় রুবি ও ব্রোঞ্জ স্বর্ণ',
    descEn: 'Ottoman-inspired historical luxury',
    primary: '#881337',
    accent: '#D97706',
    bgDark: '#1C070E',
    bgLight: '#FFF1F2',
    textDark: '#FFF1F2',
    textLight: '#4C0519',
    secondaryTextDark: '#FDA4AF',
    secondaryTextLight: '#881337',
    borderDark: '#4A0E1F',
    borderLight: '#FECDD3'
  },
  {
    id: 'desert-amber',
    nameBn: 'মরু আম্বর (Desert Amber)',
    nameEn: 'Desert Amber & Sand Gold',
    descBn: 'আরব্য মরুভূমির উষ্ণ তাম্র, বালুকা ও সুবর্ণ কিরণ',
    descEn: 'Arabian desert architecture and warmth',
    primary: '#B45309',
    accent: '#F59E0B',
    bgDark: '#1B1107',
    bgLight: '#FEFCE8',
    textDark: '#FEF3C7',
    textLight: '#451A03',
    secondaryTextDark: '#FCD34D',
    secondaryTextLight: '#78350F',
    borderDark: '#45220C',
    borderLight: '#FDE68A'
  },
  {
    id: 'midnight-velvet',
    nameBn: 'মিডনাইট ভেলভেট (Midnight Velvet)',
    nameEn: 'Midnight Velvet & Silver',
    descBn: 'মহাজাগতিক নীলাকাশ, রৌপ্য তারা ও প্রশান্ত রজনী',
    descEn: 'Calm celestial Islamic night and silver aura',
    primary: '#1E1B4B',
    accent: '#E2E8F0',
    bgDark: '#060913',
    bgLight: '#F8FAFC',
    textDark: '#F8FAFC',
    textLight: '#0F172A',
    secondaryTextDark: '#94A3B8',
    secondaryTextLight: '#475569',
    borderDark: '#1E293B',
    borderLight: '#CBD5E1'
  }
];

export const BACKGROUND_PATTERNS: {
  id: BackgroundPatternId;
  nameBn: string;
  nameEn: string;
  descBn: string;
  descEn: string;
  icon: string;
}[] = [
  {
    id: '8-point-star',
    nameBn: '৮-তারা জ্যামিতিক গ্রিড (8-Point Star)',
    nameEn: '8-Point Islamic Star',
    descBn: 'রুব এল হিজব জ্যামিতিক নকশা অনুপ্রাণিত প্যাটার্ন',
    descEn: 'Rub el Hizb geometric grid pattern',
    icon: '۞'
  },
  {
    id: 'mashrabiya',
    nameBn: 'মাশরাবিয়া জালি (Mashrabiya)',
    nameEn: 'Mashrabiya Lattice',
    descBn: 'ঐতিহ্যবাহী ইসলামি স্থাপত্যের জালি ও উইন্ডো প্যাটার্ন',
    descEn: 'Architectural Islamic lattice screen',
    icon: '▦'
  },
  {
    id: 'crescent-night',
    nameBn: 'ক্রিসেন্ট অ্যাম্বিয়েন্ট নাইট (Crescent Night)',
    nameEn: 'Crescent Ambient Night',
    descBn: 'হিল্লোলিত চাঁদ ও মৃদু নক্ষত্রমণ্ডলীর রাতের আবহ',
    descEn: 'Subtle crescent moon with atmospheric glow',
    icon: '🌙'
  },
  {
    id: 'arabesque',
    nameBn: 'অ্যারাবেস্ক দামাস্ক (Arabesque Damask)',
    nameEn: 'Arabesque Damask',
    descBn: 'ইসলামি লতাপাতা ও ফুলের ছন্দোময় অলংকরণ',
    descEn: 'Flowing floral arabesque curves',
    icon: '🌿'
  },
  {
    id: 'minimal-dots',
    nameBn: 'মিনিমাল ক্লিন ডটস (Minimal Dots)',
    nameEn: 'Minimal Clean Dots',
    descBn: 'অতি সূক্ষ্ম ও আধুনিক ডট গ্রিড টেক্সচার',
    descEn: 'Ultra-subtle contemporary dot grid',
    icon: '∷'
  },
  {
    id: 'solid',
    nameBn: 'সলিড পিওর কালার (Solid Pure)',
    nameEn: 'Solid Pure Color',
    descBn: 'কোনো প্যাটার্ন ছাড়া পরিচ্ছন্ন বিশুদ্ধ ব্যাকগ্রাউন্ড',
    descEn: 'Clean pure solid background without patterns',
    icon: '◻'
  }
];

export const BUTTON_SHAPES: {
  id: ButtonShapeId;
  nameBn: string;
  nameEn: string;
  radiusCss: string;
  descBn: string;
}[] = [
  {
    id: 'soft-rounded',
    nameBn: 'সফট রাউন্ডেড (Soft 14px)',
    nameEn: 'Soft Rounded (14px)',
    radiusCss: '14px',
    descBn: 'মৃদু বক্রাকার আধুনিক কর্নার'
  },
  {
    id: 'full-pill',
    nameBn: 'ফুল পিল (Full Pill)',
    nameEn: 'Full Pill',
    radiusCss: '9999px',
    descBn: 'সম্পূর্ণ গোলাকার ক্যাপসুল বোতাম'
  },
  {
    id: 'sharp-modern',
    nameBn: 'শার্প মডার্ন (Sharp 4px)',
    nameEn: 'Sharp Modern (4px)',
    radiusCss: '4px',
    descBn: 'সূক্ষ্ম ৪ পিক্সেল আধুনিক কর্নার'
  },
  {
    id: 'mehrab-arch',
    nameBn: 'ইসলামিক মেহরাব আর্চ (Mehrab)',
    nameEn: 'Islamic Mehrab Arch',
    radiusCss: '20px 20px 6px 6px',
    descBn: 'মসজিদের মেহরাব অনুপ্রাণিত ধনুকাকৃতি ওপর'
  }
];

export const BUTTON_BG_STYLES: {
  id: ButtonBgStyleId;
  nameBn: string;
  nameEn: string;
  descBn: string;
}[] = [
  {
    id: 'solid-vibrant',
    nameBn: 'সলিড ভাইব্র্যান্ট (Solid Vibrant)',
    nameEn: 'Solid Vibrant',
    descBn: 'একক উজ্জ্বল সলিড ব্র্যান্ড কালার'
  },
  {
    id: 'smooth-gradient',
    nameBn: 'স্মুথ গ্রেডিয়েন্ট (Smooth Gradient)',
    nameEn: 'Smooth Gradient',
    descBn: 'প্রাইমারি ও অ্যাকসেন্টের মনোরম গ্রেডিয়েন্ট'
  },
  {
    id: 'gold-border',
    nameBn: 'গোল্ডেন বর্ডার লাক্সারি (Gold Border)',
    nameEn: 'Golden Border Luxury',
    descBn: 'স্বর্ণালি সীমানা সম্বলিত প্রিমিয়াম বর্ডার'
  },
  {
    id: 'frosted-glass',
    nameBn: 'ফ্রস্টেড গ্লাস (Frosted Glass)',
    nameEn: 'Frosted Glass',
    descBn: 'অর্ধস্বচ্ছ ব্লার সম্বলিত গ্লাস রূপ'
  },
  {
    id: 'soft-gold-accent',
    nameBn: 'সফট গোল্ড অ্যাকসেন্ট (Soft Gold)',
    nameEn: 'Soft Gold Accent',
    descBn: 'মৃদু স্বর্ণালি আভা ও আভিজাত্যের স্পর্শ'
  }
];

export const BUTTON_TEXT_COLORS: {
  id: ButtonTextColorId;
  nameBn: string;
  nameEn: string;
  hex: string;
}[] = [
  {
    id: 'bright-white',
    nameBn: 'উজ্জ্বল শুভ্র (Bright White)',
    nameEn: 'Bright White',
    hex: '#FFFFFF'
  },
  {
    id: 'royal-gold',
    nameBn: 'রাজকীয় স্বর্ণ (Royal Gold)',
    nameEn: 'Royal Gold',
    hex: '#D4AF37'
  },
  {
    id: 'deep-emerald',
    nameBn: 'গভীর এমেরাল্ড (Deep Emerald)',
    nameEn: 'Deep Emerald',
    hex: '#0F6B4F'
  },
  {
    id: 'creamy-ivory',
    nameBn: 'ক্রিমি আইভরি (Creamy Ivory)',
    nameEn: 'Creamy Ivory',
    hex: '#FFFBEB'
  },
  {
    id: 'custom',
    nameBn: 'কাস্টম কালার (Custom HEX)',
    nameEn: 'Custom Color',
    hex: '#FFFFFF'
  }
];

export const BUTTON_SHADOWS: {
  id: ButtonShadowId;
  nameBn: string;
  nameEn: string;
  css: string;
}[] = [
  {
    id: 'gold-aura',
    nameBn: 'ইসলামিক গোল্ড অরা (Gold Aura)',
    nameEn: 'Islamic Gold Aura',
    css: '0 0 18px rgba(212, 175, 55, 0.45)'
  },
  {
    id: 'subtle-shadow',
    nameBn: 'সাবটল শ্যাডো (Subtle Depth)',
    nameEn: 'Subtle Shadow',
    css: '0 4px 12px rgba(0, 0, 0, 0.12)'
  },
  {
    id: 'bevel-3d',
    nameBn: 'থ্রি-ডি বেভেল (3D Bevel)',
    nameEn: '3D Bevel',
    css: '0 4px 0px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
  },
  {
    id: 'flat',
    nameBn: 'ফ্ল্যাট / নো শ্যাডো (Flat)',
    nameEn: 'Flat / No Shadow',
    css: 'none'
  }
];

export const BUTTON_HOVER_EFFECTS: {
  id: ButtonHoverEffectId;
  nameBn: string;
  nameEn: string;
  descBn: string;
}[] = [
  {
    id: 'smooth-lift',
    nameBn: 'স্মুথ লিফট (Smooth Lift)',
    nameEn: 'Smooth Lift',
    descBn: 'হোভার করলে সামান্য ওপরে উঠে আসে'
  },
  {
    id: 'scale-bounce',
    nameBn: 'স্কেল বাউন্স (Scale Bounce)',
    nameEn: 'Scale Bounce',
    descBn: 'হোভার ও ক্লিকে আলতো সংকোচন-প্রসারণ'
  },
  {
    id: 'golden-glow',
    nameBn: 'গোল্ডেন গ্লো (Golden Glow)',
    nameEn: 'Golden Glow',
    descBn: 'হোভার করলে স্বর্ণালি আলোকচ্ছটা বাড়ে'
  }
];

export const MOTION_INTENSITIES: {
  id: MotionIntensity;
  nameBn: string;
  nameEn: string;
  speed: string;
}[] = [
  {
    id: 'calm',
    nameBn: 'শান্ত ও ধীর (Calm)',
    nameEn: 'Calm (Very Slow)',
    speed: '40s - 50s'
  },
  {
    id: 'lively',
    nameBn: 'গতিশীল ও স্পষ্ট (Lively)',
    nameEn: 'Lively (Elegant)',
    speed: '14s - 20s'
  },
  {
    id: 'minimal',
    nameBn: 'ন্যূনতম ও সংযত (Minimal)',
    nameEn: 'Minimal (Restrained)',
    speed: '60s+'
  }
];
