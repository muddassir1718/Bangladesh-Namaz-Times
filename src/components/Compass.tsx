/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Compass as CompassIcon, MapPin, RefreshCw, Smartphone,
  Info, AlertTriangle, CheckCircle2, ChevronRight, Sliders, ShieldAlert, Sparkles
} from 'lucide-react';
import { Language } from '../types';
import { toBanglaNum } from '../utils/calculations';

interface CompassProps {
  userLat: number;
  userLng: number;
  locationName: string;
  language: Language;
}

export default function Compass({ userLat, userLng, locationName, language }: CompassProps) {
  // Compass Core States
  const [heading, setHeading] = useState<number>(0);
  const [qiblaAngle, setQiblaAngle] = useState<number>(268); // default for Bangladesh
  const [distanceKm, setDistanceKm] = useState<number>(5140);
  const [isAligned, setIsAligned] = useState<boolean>(false);
  const [isFlat, setIsFlat] = useState<boolean>(true);
  const [sensorStatus, setSensorStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [showCalibModal, setShowCalibModal] = useState<boolean>(false);

  // Manual fallback simulation slider if sensors are unavailable or blocked
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [manualHeading, setManualHeading] = useState<number>(0);

  // Smoothing vector refs to prevent jitter & 360-wrap around bug
  const smoothedX = useRef<number | null>(null);
  const smoothedY = useRef<number | null>(null);
  const lastVibrateTime = useRef<number>(0);
  const wasAlignedRef = useRef<boolean>(false);

  // Calculate spherical bearing to Kaaba (Makkah: 21.4225° N, 39.8262° E)
  const calculateQiblaBearing = useCallback((lat: number, lon: number) => {
    const kaabaLat = (21.4225 * Math.PI) / 180;
    const kaabaLon = (39.8262 * Math.PI) / 180;
    const userLatRad = (lat * Math.PI) / 180;
    const userLonRad = (lon * Math.PI) / 180;

    const dLon = kaabaLon - userLonRad;
    const y = Math.sin(dLon) * Math.cos(kaabaLat);
    const x =
      Math.cos(userLatRad) * Math.sin(kaabaLat) -
      Math.sin(userLatRad) * Math.cos(kaabaLat) * Math.cos(dLon);

    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    bearing = (bearing + 360) % 360;
    return bearing;
  }, []);

  // Calculate distance in km
  const calculateDistance = useCallback((lat: number, lon: number) => {
    const R = 6371; // Earth radius in km
    const kaabaLat = 21.4225;
    const kaabaLon = 39.8262;

    const dLat = ((kaabaLat - lat) * Math.PI) / 180;
    const dLon = ((kaabaLon - lon) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((kaabaLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }, []);

  // Initial calculation on location update
  useEffect(() => {
    const bearing = calculateQiblaBearing(userLat, userLng);
    const dist = calculateDistance(userLat, userLng);
    setQiblaAngle(bearing);
    setDistanceKm(dist);
  }, [userLat, userLng, calculateQiblaBearing, calculateDistance]);

  // Orientation event handler
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let rawHeading: number | null = null;

    // 1. iOS: webkitCompassHeading is exact magnetic north (0-360)
    if ((event as any).webkitCompassHeading !== undefined) {
      rawHeading = (event as any).webkitCompassHeading;
      if ((event as any).webkitCompassAccuracy !== undefined) {
        setAccuracy((event as any).webkitCompassAccuracy);
      }
    } else if (event.alpha !== null) {
      // 2. Android: standard absolute alpha (360 - alpha = magnetic heading)
      // If event.absolute is true, it's tied to Earth's magnetic field
      rawHeading = (360 - event.alpha) % 360;
    }

    if (rawHeading === null) return;

    // Tilt detection (beta: front-to-back tilt, gamma: left-to-right tilt)
    if (event.beta !== null && event.gamma !== null) {
      const isDeviceFlat = Math.abs(event.beta) < 38 && Math.abs(event.gamma) < 38;
      setIsFlat(isDeviceFlat);
    }

    // Vector smoothing (unit circle components) to prevent 360°/0° flipping jitter
    const rad = (rawHeading * Math.PI) / 180;
    const targetX = Math.cos(rad);
    const targetY = Math.sin(rad);
    const filter = 0.18; // smooth dampening factor

    if (smoothedX.current === null || smoothedY.current === null) {
      smoothedX.current = targetX;
      smoothedY.current = targetY;
    } else {
      smoothedX.current = smoothedX.current + filter * (targetX - smoothedX.current);
      smoothedY.current = smoothedY.current + filter * (targetY - smoothedY.current);
    }

    let smoothHeading = (Math.atan2(smoothedY.current, smoothedX.current) * 180) / Math.PI;
    smoothHeading = (smoothHeading + 360) % 360;

    setHeading(smoothHeading);
    setSensorStatus('granted');

    // Check alignment with Qibla
    checkAlignment(smoothHeading, qiblaAngle);
  }, [qiblaAngle]);

  const checkAlignment = (currentHeading: number, targetBearing: number) => {
    // Difference between heading and Qibla angle
    let diff = Math.abs(currentHeading - targetBearing);
    if (diff > 180) diff = 360 - diff;

    // Aligned if within 3.5 degrees
    const alignedNow = diff <= 3.5;
    setIsAligned(alignedNow);

    // Trigger haptic vibration on mobile when alignment state triggers
    if (alignedNow && !wasAlignedRef.current) {
      const now = Date.now();
      if (now - lastVibrateTime.current > 1500) {
        lastVibrateTime.current = now;
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate([60, 40, 80]);
          } catch (e) {
            // Haptic error ignored
          }
        }
      }
    }
    wasAlignedRef.current = alignedNow;
  };

  // Request sensor permission and start listener
  const startSensorListener = async () => {
    // Check if DeviceOrientationEvent exists
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) {
      setSensorStatus('unsupported');
      setManualMode(true);
      return;
    }

    // iOS 13+ permission request flow
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setSensorStatus('granted');
          attachOrientationListeners();
        } else {
          setSensorStatus('denied');
          setManualMode(true);
        }
      } catch (err) {
        console.warn('Orientation permission error:', err);
        setSensorStatus('denied');
        setManualMode(true);
      }
    } else {
      // Android and standard browsers
      attachOrientationListeners();
      setSensorStatus('granted');
    }
  };

  const attachOrientationListeners = () => {
    const win = window as any;
    if (typeof win !== 'undefined') {
      try {
        if ('ondeviceorientationabsolute' in win) {
          win.addEventListener('deviceorientationabsolute', handleOrientation, true);
        }
        win.addEventListener('deviceorientation', handleOrientation, true);
      } catch (e) {
        console.warn('Error attaching orientation listeners:', e);
      }
    }
  };

  // Auto initialize on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
        // Android / non-iOS standard can attach directly
        attachOrientationListeners();
      }
    } else {
      setSensorStatus('unsupported');
    }

    return () => {
      const win = window as any;
      if (typeof win !== 'undefined') {
        win.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        win.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [handleOrientation]);

  // Active heading (either from live sensor or manual simulation)
  const activeHeading = manualMode ? manualHeading : heading;
  // Needle rotation relative to phone's current direction
  const needleRotation = (qiblaAngle - activeHeading + 360) % 360;

  // Turn recommendation
  const calculateTurnDirection = () => {
    let diff = (qiblaAngle - activeHeading + 360) % 360;
    if (diff <= 3.5 || diff >= 356.5) {
      return { textBn: 'সরাসরি কিবলামুখী!', textEn: 'Directly Aligned!', turn: 'aligned' as const, deg: 0 };
    }
    if (diff < 180) {
      return {
        textBn: `${toBanglaNum(Math.round(diff))}° ডানে ঘোরান`,
        textEn: `Turn right ${Math.round(diff)}°`,
        turn: 'right' as const,
        deg: Math.round(diff)
      };
    } else {
      const leftDiff = 360 - diff;
      return {
        textBn: `${toBanglaNum(Math.round(leftDiff))}° বামে ঘোরান`,
        textEn: `Turn left ${Math.round(leftDiff)}°`,
        turn: 'left' as const,
        deg: Math.round(leftDiff)
      };
    }
  };

  const turnInfo = calculateTurnDirection();

  return (
    <div id="qibla-compass-section" className="bg-white dark:bg-zinc-900 border border-primary-green/10 dark:border-neutral-800 rounded-3xl p-6 md:p-8 shadow-sm select-none font-sans flex flex-col gap-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-green/10 dark:bg-accent-gold/15 text-primary-green dark:text-accent-gold flex items-center justify-center font-bold">
              <CompassIcon className="w-5 h-5 animate-spin-slow" />
            </div>
            <h2 className="text-xl font-black text-primary-green dark:text-[#f1f8e9]">
              {language === 'bn' ? 'স্মার্ট কিবলা কম্পাস' : 'Smart Qibla Compass'}
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {language === 'bn'
              ? 'মোবাইল সেন্সর ও জিপিএস সমীকরণের সাহায্যে পবিত্র কাবার নির্ভুল দিক নির্ণয়'
              : 'Precision real-time bearing to Holy Kaaba using mobile magnetometer & geolocation'}
          </p>
        </div>

        {/* Action controls toolbar */}
        <div className="flex items-center gap-2">
          {/* Calibrate figure 8 button */}
          <button
            onClick={() => setShowCalibModal(true)}
            className="py-1.5 px-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-zinc-950 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 transition cursor-pointer flex items-center gap-1.5"
            title={language === 'bn' ? 'সেন্সর ক্যালিব্রেশন নির্দেশিকা' : 'Sensor Calibration'}
          >
            <RefreshCw className="w-3.5 h-3.5 text-accent-gold" />
            <span>{language === 'bn' ? 'ক্যালিব্রেশন' : 'Calibrate'}</span>
          </button>

          {/* Manual mode switch */}
          <button
            onClick={() => setManualMode(!manualMode)}
            className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              manualMode
                ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                : 'border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-zinc-950 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{manualMode ? (language === 'bn' ? 'ম্যানুয়াল মোড' : 'Manual') : (language === 'bn' ? 'সেন্সর মোড' : 'Sensor')}</span>
          </button>
        </div>
      </div>

      {/* Sensor Activation Prompt for Mobile Devices */}
      {sensorStatus !== 'granted' && !manualMode && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-100 rounded-2xl text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-emerald-600 dark:text-accent-gold shrink-0 animate-bounce" />
            <div>
              <p className="font-bold text-sm">
                {language === 'bn' ? 'মোবাইল কম্পাস সেন্সর সক্রিয় করুন' : 'Activate Mobile Compass Sensors'}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {language === 'bn'
                  ? 'মোবাইলের ম্যাগনেটোমিটার সেন্সর চালু করতে নিচের বাটনে ট্যাপ করুন'
                  : 'Tap below to permit device orientation and start real-time magnetic compass'}
              </p>
            </div>
          </div>
          <button
            onClick={startSensorListener}
            className="py-2 px-4 bg-primary-green hover:bg-[#135f28] text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm transition active:scale-95 shrink-0 flex items-center gap-1.5"
          >
            <CompassIcon className="w-4 h-4 text-accent-gold" />
            <span>{language === 'bn' ? 'সেন্সর চালু করুন' : 'Start Sensor'}</span>
          </button>
        </div>
      )}

      {/* Tilt warning alert if phone is not held flat */}
      {!isFlat && !manualMode && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-2xl text-xs flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 shrink-0 rotate-12" />
            <span className="font-bold">
              {language === 'bn'
                ? '⚠️ ফোনটি হাতের তালুতে সম্পূর্ণ সমতল (Flat) রাখুন যাতে কম্পাস নির্ভুল কোণ দেখাতে পারে।'
                : '⚠️ Hold your device horizontally flat for accurate compass heading.'}
            </span>
          </div>
        </div>
      )}

      {/* Alignment Success Celebration Banner */}
      {isAligned && (
        <div className="p-4 bg-gradient-to-r from-emerald-600 via-primary-green to-teal-700 border border-accent-gold/40 text-white rounded-2xl shadow-xl flex items-center justify-center gap-3 text-center animate-bounce">
          <Sparkles className="w-5 h-5 text-accent-gold shrink-0 animate-spin-slow" />
          <span className="text-sm font-black tracking-wide">
            {language === 'bn'
              ? '✨ মাশাআল্লাহ! আপনি এখন সরাসরি কাবা শরীফ বরাবর কিবলামুখী!'
              : '✨ Alhamdulillah! You are directly facing the Holy Kaaba!'}
          </span>
          <CheckCircle2 className="w-5 h-5 text-accent-gold shrink-0" />
        </div>
      )}

      {/* Main Compass Visual Dial Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Visual Dial (Left/Center) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          
          <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
            
            {/* Outer Decorative Ring with Alignment Glow */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-500 ${
                isAligned
                  ? 'ring-8 ring-accent-gold shadow-[0_0_60px_rgba(212,163,35,0.4)] animate-pulse'
                  : 'border border-primary-green/10 dark:border-neutral-800'
              }`}
            ></div>

            {/* Compass Dial Face (Rotates opposite to device heading to keep North pointing true) */}
            <div
              style={{
                transform: `rotate(${-activeHeading}deg)`,
                transition: manualMode ? 'none' : 'transform 0.2s cubic-bezier(0.1, 0.9, 0.2, 1)'
              }}
              className="absolute inset-3 rounded-full border-4 border-primary-green dark:border-accent-gold bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/80 dark:from-zinc-950 dark:via-zinc-900 dark:to-neutral-950 shadow-2xl flex items-center justify-center overflow-hidden"
            >
              {/* Compass Dial Degree Ticks */}
              {Array.from({ length: 36 }, (_, i) => i * 10).map(deg => {
                const isMajor = deg % 30 === 0;
                return (
                  <div
                    key={deg}
                    style={{ transform: `rotate(${deg}deg)` }}
                    className="absolute inset-0 pointer-events-none flex justify-center"
                  >
                    <div
                      className={`${
                        isMajor
                          ? 'h-3.5 w-0.5 bg-primary-green dark:bg-accent-gold'
                          : 'h-2 w-0.5 bg-gray-300 dark:bg-zinc-700'
                      }`}
                    ></div>
                  </div>
                );
              })}

              {/* Cardinal Directions */}
              <div className="absolute top-4 font-black text-red-600 dark:text-red-500 text-base tracking-widest flex flex-col items-center">
                <span>N</span>
                <span className="text-[9px] font-bold text-gray-500 -mt-1">
                  {language === 'bn' ? 'উত্তর' : '0°'}
                </span>
              </div>

              <div className="absolute bottom-4 font-black text-primary-green dark:text-accent-gold text-base tracking-widest flex flex-col items-center">
                <span>S</span>
                <span className="text-[9px] font-bold text-gray-500 -mt-1">
                  {language === 'bn' ? 'দক্ষিণ' : '180°'}
                </span>
              </div>

              <div className="absolute right-5 font-black text-primary-green dark:text-accent-gold text-base tracking-widest flex flex-col items-center">
                <span>E</span>
                <span className="text-[9px] font-bold text-gray-500 -mt-1">
                  {language === 'bn' ? 'পূর্ব' : '90°'}
                </span>
              </div>

              <div className="absolute left-5 font-black text-primary-green dark:text-accent-gold text-base tracking-widest flex flex-col items-center">
                <span>W</span>
                <span className="text-[9px] font-bold text-gray-500 -mt-1">
                  {language === 'bn' ? 'পশ্চিম' : '270°'}
                </span>
              </div>

              {/* Kaaba Direction Marker on the dial circle */}
              <div
                style={{ transform: `rotate(${qiblaAngle}deg)` }}
                className="absolute inset-0 flex justify-center pointer-events-none"
              >
                <div className="relative -top-2 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-accent-gold text-primary-green flex items-center justify-center text-base shadow-lg ring-2 ring-white filter drop-shadow">
                    🕋
                  </div>
                  <span className="text-[8px] font-black bg-primary-green text-white px-1.5 py-0.2 rounded-full uppercase tracking-tighter mt-0.5">
                    {language === 'bn' ? 'কিবলা' : 'Qibla'}
                  </span>
                </div>
              </div>

              {/* Inner geometric cross pattern */}
              <div className="w-48 h-48 rounded-full border border-dashed border-primary-green/20 dark:border-accent-gold/20 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-primary-green/10 dark:border-accent-gold/10"></div>
              </div>
            </div>

            {/* Qibla Direction Needle (Points directly towards Kaaba relative to the phone top) */}
            <div
              style={{
                transform: `rotate(${needleRotation}deg)`,
                transformOrigin: 'bottom center',
                transition: manualMode ? 'none' : 'transform 0.22s cubic-bezier(0.1, 0.85, 0.2, 1)'
              }}
              className="absolute top-1/2 left-1/2 w-1.5 h-36 sm:h-44 -ml-[3px] -mt-36 sm:-mt-44 origin-bottom rounded-full duration-200 pointer-events-none z-20"
            >
              {/* Needle Head with Kaaba Symbol and glowing pointer */}
              <div className="absolute -top-7 left-1/2 -ml-5 w-10 h-10 flex flex-col items-center justify-center animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-accent-gold flex items-center justify-center text-lg shadow-xl ring-4 ring-emerald-500/30">
                  🕋
                </div>
                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-accent-gold -mt-0.5"></div>
              </div>

              {/* Glowing Needle shaft */}
              <div className="w-full h-full bg-gradient-to-t from-transparent via-accent-gold to-amber-500 rounded-full shadow-[0_0_12px_rgba(212,163,35,0.7)]"></div>
            </div>

            {/* Needle Pivot Center Button */}
            <div className="absolute top-1/2 left-1/2 w-7 h-7 rounded-full bg-primary-green dark:bg-accent-gold -ml-3.5 -mt-3.5 z-30 shadow-xl border-2 border-white flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-zinc-900"></div>
            </div>

          </div>

          {/* Turn Guidance Indicator Bar */}
          <div className="mt-6 flex flex-col items-center text-center">
            <div className={`px-5 py-2 rounded-2xl border text-sm font-black flex items-center gap-2 shadow-sm transition-all duration-300 ${
              isAligned
                ? 'bg-emerald-600 text-white border-emerald-600 scale-105 shadow-md'
                : 'bg-emerald-50/70 dark:bg-zinc-800/80 border-accent-gold/30 text-emerald-950 dark:text-accent-gold'
            }`}>
              <span>{turnInfo.turn === 'aligned' ? '🎯' : turnInfo.turn === 'right' ? '👉' : '👈'}</span>
              <span>{language === 'bn' ? turnInfo.textBn : turnInfo.textEn}</span>
            </div>

            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 font-medium">
              {language === 'bn'
                ? `বর্তমান ফোনের দিক: ${toBanglaNum(Math.round(activeHeading))}° | কিবলা কোণ: ${toBanglaNum(Math.round(qiblaAngle))}°`
                : `Device Heading: ${Math.round(activeHeading)}° | Qibla Angle: ${Math.round(qiblaAngle)}°`}
            </p>
          </div>

          {/* iOS / Browser Enable Sensor button if required */}
          {sensorStatus === 'prompt' && !manualMode && (
            <button
              onClick={startSensorListener}
              className="mt-4 px-6 py-2.5 bg-primary-green hover:bg-[#0c3e18] text-white font-black rounded-xl text-xs shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-accent-gold" />
              <span>{language === 'bn' ? 'মোবাইল কম্পাস সেন্সর চালু করুন' : 'Enable Mobile Compass Sensor'}</span>
            </button>
          )}

          {/* Manual Slider if in manual mode */}
          {manualMode && (
            <div className="w-full max-w-sm p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold text-amber-800 dark:text-amber-300">
                <span>{language === 'bn' ? 'ম্যানুয়াল দিক পরিবর্তন (ঘোরান):' : 'Manual Heading Slider:'}</span>
                <span className="font-mono text-sm">{Math.round(manualHeading)}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={manualHeading}
                onChange={e => {
                  const val = Number(e.target.value);
                  setManualHeading(val);
                  checkAlignment(val, qiblaAngle);
                }}
                className="w-full text-accent-gold cursor-pointer"
              />
              <span className="text-[10px] text-gray-500">
                {language === 'bn' ? 'স্লাইডার টেনে ফোনের বাস্তব দিক মিলিয়ে নিন।' : 'Drag slider to match physical orientation.'}
              </span>
            </div>
          )}

        </div>

        {/* Informative Stats & Location Details (Right Column) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Location & Qibla Angle Card */}
          <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-zinc-950 dark:to-zinc-900 border border-emerald-500/20 rounded-3xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-accent-gold tracking-wider">
                {language === 'bn' ? 'কিবলার সঠিক কোণ' : 'EXACT QIBLA BEARING'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                {locationName}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-primary-green dark:text-white">
                {language === 'bn' ? toBanglaNum(Math.round(qiblaAngle)) : Math.round(qiblaAngle)}°
              </span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {language === 'bn' ? 'পশ্চিম-দক্ষিণ-পশ্চিম (W-SW)' : 'West-Southwest'}
              </span>
            </div>

            <div className="pt-3 border-t border-emerald-500/15 flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent-gold" />
                {language === 'bn' ? 'কাবা শরিফের দূরত্ব:' : 'Distance to Kaaba:'}
              </span>
              <span className="font-mono text-emerald-800 dark:text-accent-gold font-black">
                {language === 'bn' ? toBanglaNum(distanceKm.toLocaleString()) : distanceKm.toLocaleString()} {language === 'bn' ? 'কিমি' : 'km'}
              </span>
            </div>
          </div>

          {/* Sensor Diagnostics */}
          <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-neutral-800 flex flex-col gap-2.5 text-xs">
            <h4 className="font-black text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>🧭</span>
              {language === 'bn' ? 'সেন্সর স্ট্যাটাস ও পরামর্শ' : 'Sensor Diagnostics'}
            </h4>
            
            <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
              <span>{language === 'bn' ? 'ম্যাগনেটোমিটার অবস্থা:' : 'Magnetometer Sensor:'}</span>
              <span className={`font-bold ${sensorStatus === 'granted' ? 'text-emerald-600' : 'text-amber-500'}`}>
                {sensorStatus === 'granted'
                  ? (language === 'bn' ? 'সক্রিয় ✓' : 'Active ✓')
                  : sensorStatus === 'denied'
                  ? (language === 'bn' ? 'অনুমতি মেলেনি' : 'Denied')
                  : (language === 'bn' ? 'অপেক্ষা করছে' : 'Standby')}
              </span>
            </div>

            {accuracy !== null && (
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>{language === 'bn' ? 'সেন্সর নির্ভুলতা:' : 'Accuracy:'}</span>
                <span className="font-mono font-bold text-emerald-600">±{Math.round(accuracy)}°</span>
              </div>
            )}

            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed pt-2 border-t border-gray-200/60 dark:border-neutral-800">
              {language === 'bn'
                ? 'মোবাইলের চৌম্বক কভার বা মেটালিক বস্তু সেন্সরের দিক বিক্ষেপ করতে পারে। সঠিক ফলাফলের জন্য মোবাইল ফোনের কভার খুলে সমতলে রাখুন।'
                : 'Magnetic phone cases or heavy metallic objects may distort compass bearings. Remove magnetic covers for highest precision.'}
            </p>
          </div>

          {/* Calibration Shortcut Banner */}
          <div
            onClick={() => setShowCalibModal(true)}
            className="p-3.5 bg-emerald-500/5 hover:bg-emerald-500/10 dark:bg-zinc-800/40 border border-emerald-500/15 rounded-2xl flex items-center justify-between cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/15 text-emerald-700 dark:text-accent-gold flex items-center justify-center font-bold text-xs">
                8
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {language === 'bn' ? 'ফিগার-৮ (Figure-8) ক্যালিব্রেশন' : 'Figure-8 Sensor Calibration'}
                </p>
                <p className="text-[10px] text-gray-500">
                  {language === 'bn' ? 'সেন্সর আটকে গেলে সহজে ঠিক করার নিয়ম' : 'How to quickly recalibrate mobile gyroscope'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

        </div>

      </div>

      {/* Sensor Calibration Modal */}
      {showCalibModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-emerald-500/20 rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-accent-gold animate-spin-slow" />
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  {language === 'bn' ? 'কম্পাস সেন্সর ক্যালিব্রেশন' : 'Calibrate Compass Sensor'}
                </h3>
              </div>
              <button
                onClick={() => setShowCalibModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-emerald-50/30 dark:bg-zinc-950 rounded-2xl border border-emerald-500/10">
              <div className="w-16 h-16 rounded-full bg-emerald-600/10 dark:bg-emerald-600/20 text-emerald-700 dark:text-accent-gold flex items-center justify-center text-2xl font-black mb-2 animate-bounce">
                ♾️
              </div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white">
                {language === 'bn' ? 'বাতাসে ইংরেজি "8" অক্ষরের মতো ঘোরান' : 'Wave in a Figure-8 Motion'}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                {language === 'bn'
                  ? 'আপনার ফোনটি সমতলে ধরে বাতাসে ইংরেজি "8" বা অসীম (Infinity) চিহ্নের আকারে ৩-৪ বার মৃদুভাবে ঘোরান। এটি ফোনের অভ্যন্তরীণ ম্যাগনেটিক সেন্সর রিসেট ও ক্যালিব্রেট করে।'
                  : 'Gently rotate your smartphone horizontally in a figure-8 or infinity gesture 3 to 4 times. This resets magnetic declination in device sensors.'}
              </p>
            </div>

            <button
              onClick={() => {
                setShowCalibModal(false);
                startSensorListener();
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              {language === 'bn' ? 'বুঝেছি, কম্পাসে ফিরে যান' : 'Got it, Back to Compass'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
