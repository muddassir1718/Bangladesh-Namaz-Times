/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Compass as CompassIcon, MapPin } from 'lucide-react';
import { Language } from '../types';
import { toBanglaNum } from '../utils/calculations';

interface CompassProps {
  userLat: number;
  userLng: number;
  locationName: string;
  language: Language;
}

export default function Compass({ userLat, userLng, locationName, language }: CompassProps) {
  useEffect(() => {
    let isMounted = true;
    let handleOrientationRef: ((event: DeviceOrientationEvent) => void) | null = null;

    function calculateQiblaAngle(lat: number, lon: number) {
      const kaabaLat = 21.4225 * Math.PI / 180;
      const kaabaLon = 39.8262 * Math.PI / 180;
      const userLatRad = lat * Math.PI / 180;
      const userLonRad = lon * Math.PI / 180;
      
      const dLon = kaabaLon - userLonRad;
      
      const y = Math.sin(dLon) * Math.cos(kaabaLat);
      const x = Math.cos(userLatRad) * Math.sin(kaabaLat) - 
                Math.sin(userLatRad) * Math.cos(kaabaLat) * Math.cos(dLon);
      
      let bearing = Math.atan2(y, x) * 180 / Math.PI;
      bearing = (bearing + 360) % 360; // normalize to 0-360
      return bearing;
    }

    function calculateDistanceToKaaba(lat: number, lon: number) {
      const R = 6371; // Earth radius in km
      const kaabaLat = 21.4225;
      const kaabaLon = 39.8262;
      
      const dLat = (kaabaLat - lat) * Math.PI / 180;
      const dLon = (kaabaLon - lon) * Math.PI / 180;
      
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat * Math.PI/180) * Math.cos(kaabaLat * Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return Math.round(distance);
    }

    function showStaticQibla() {
      if (!isMounted) return;
      const btn = document.getElementById('compass-permission-btn');
      if (btn) btn.style.display = 'none';
      
      // Show static compass pointing to calculated Qibla direction
      const qiblaAngle = calculateQiblaAngle(userLat, userLng);
      const needle = document.getElementById('qibla-needle');
      if (needle) {
        needle.style.transform = `rotate(${qiblaAngle}deg)`;
        needle.style.transition = 'none';
      }
      
      const degreeDisplay = document.getElementById('qibla-degree');
      if (degreeDisplay) {
        degreeDisplay.textContent = Math.round(qiblaAngle) + '°';
      }
      
      // Show message
      const wrapper = document.getElementById('compass-wrapper');
      if (wrapper) {
        // Remove previous fallback message if any
        const existing = document.getElementById('compass-sensor-fallback-msg');
        if (existing) {
          existing.remove();
        }

        const msg = document.createElement('p');
        msg.id = 'compass-sensor-fallback-msg';
        msg.textContent = language === 'bn'
          ? '⚠️ আপনার ডিভাইসে কম্পাস সেন্সর পাওয়া যায়নি। উপরের ডিগ্রি অনুযায়ী কিবলার দিক নির্ণয় করুন।'
          : '⚠️ No compass sensor detected on your device. Please orient to Qibla using the degree above.';
        msg.style.cssText = 'color:#e65100; font-size:13px; text-align:center; padding:8px; margin-top:8px; font-weight:bold;';
        wrapper.after(msg);
      }
    }

    function startCompassListener() {
      if (!isMounted) return;
      let lastAlpha: number | null = null;
      let smoothedCompassX: number | null = null;
      let smoothedCompassY: number | null = null;
      const filterStrength = 0.12; // Lower = smoother, higher = faster
      
      const handleOrientation = (event: DeviceOrientationEvent) => {
        let compass = 0;
        
        if ((event as any).webkitCompassHeading !== undefined) {
          // iOS webkit compass heading (already corrected for magnetic north)
          compass = (event as any).webkitCompassHeading;
        } else if (event.alpha !== null) {
          // Android: alpha is rotation around Z-axis
          // Convert to compass bearing (0 = north)
          compass = 360 - event.alpha;
        } else {
          showStaticQibla();
          return;
        }
        
        // Dynamic angle low-pass vector filter to completely remove jittering
        const compassRad = compass * Math.PI / 180;
        const targetX = Math.cos(compassRad);
        const targetY = Math.sin(compassRad);

        if (smoothedCompassX === null || smoothedCompassY === null) {
          smoothedCompassX = targetX;
          smoothedCompassY = targetY;
        } else {
          smoothedCompassX = smoothedCompassX + filterStrength * (targetX - smoothedCompassX);
          smoothedCompassY = smoothedCompassY + filterStrength * (targetY - smoothedCompassY);
        }

        let smoothedCompass = Math.atan2(smoothedCompassY, smoothedCompassX) * 180 / Math.PI;
        smoothedCompass = (smoothedCompass + 360) % 360;

        if (lastAlpha !== null && Math.abs(smoothedCompass - lastAlpha) < 0.25) return;
        lastAlpha = smoothedCompass;
        
        // Calculate Qibla angle from user location
        const qiblaAngle = calculateQiblaAngle(userLat, userLng);
        
        // Rotate needle: Qibla direction relative to current smoothed heading
        const needleRotation = qiblaAngle - smoothedCompass;
        
        // Apply smooth transition CSS rotation to the needle element
        const needle = document.getElementById('qibla-needle');
        if (needle) {
          needle.style.transition = 'transform 0.25s cubic-bezier(0.1, 0.8, 0.3, 1)';
          needle.style.transform = `rotate(${needleRotation}deg)`;
        }
        
        // Also rotate the compass rose (background) opposite to phone rotation
        const compassRose = document.getElementById('compass-rose');
        if (compassRose) {
          compassRose.style.transition = 'transform 0.25s cubic-bezier(0.1, 0.8, 0.3, 1)';
          compassRose.style.transform = `rotate(${-smoothedCompass}deg)`;
        }
        
        // Update degree display
        const degreeDisplay = document.getElementById('qibla-degree');
        if (degreeDisplay) {
          degreeDisplay.textContent = Math.round(qiblaAngle) + '°';
        }
      };

      handleOrientationRef = handleOrientation;
      
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    function initCompass() {
      // Check if DeviceOrientationEvent exists
      if (!window.DeviceOrientationEvent) {
        showStaticQibla();
        return;
      }

      // iOS 13+ requires explicit permission request
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const btn = document.getElementById('compass-permission-btn');
        if (btn) {
          btn.style.display = 'block';
          btn.textContent = language === 'bn' ? 'কম্পাস চালু করুন' : 'Enable Compass';
          const clickHandler = () => {
            (DeviceOrientationEvent as any).requestPermission()
              .then((response: string) => {
                if (response === 'granted') {
                  btn.style.display = 'none';
                  startCompassListener();
                } else {
                  showStaticQibla();
                }
              })
              .catch(() => showStaticQibla());
          };
          btn.addEventListener('click', clickHandler);
          return () => btn.removeEventListener('click', clickHandler);
        }
      } else {
        // Android Chrome path — directly start listener
        // But first show a "Tap to activate compass" button
        // because some Android Chrome versions need user gesture
        const btn = document.getElementById('compass-permission-btn');
        if (btn) {
          btn.style.display = 'block';
          btn.textContent = language === 'bn' ? 'কম্পাস চালু করুন' : 'Enable Compass';
          const clickHandler = () => {
            btn.style.display = 'none';
            startCompassListener();
          };
          btn.addEventListener('click', clickHandler);
          return () => btn.removeEventListener('click', clickHandler);
        }
      }
    }

    // Set initial distance immediately on load / location update
    const initialDistance = calculateDistanceToKaaba(userLat, userLng);
    const distanceDisplay = document.getElementById('qibla-distance');
    if (distanceDisplay) {
      distanceDisplay.textContent = language === 'bn'
        ? `কাবা থেকে দূরত্ব: ${toBanglaNum(initialDistance)} কিমি`
        : `Distance to Kaaba: ${initialDistance.toLocaleString()} km`;
    }

    // Set initial degree
    const qBearing = calculateQiblaAngle(userLat, userLng);
    const initialDegree = document.getElementById('qibla-degree');
    if (initialDegree) {
      initialDegree.textContent = Math.round(qBearing) + '°';
    }

    const initCleanup = initCompass();

    return () => {
      isMounted = false;
      if (typeof initCleanup === 'function') {
        initCleanup();
      }
      if (handleOrientationRef) {
        window.removeEventListener('deviceorientationabsolute', handleOrientationRef, true);
        window.removeEventListener('deviceorientation', handleOrientationRef, true);
      }
      const existing = document.getElementById('compass-sensor-fallback-msg');
      if (existing) {
        existing.remove();
      }
    };
  }, [userLat, userLng, language]);

  return (
    <div id="qibla-compass-section" className="bg-white dark:bg-zinc-900 border border-primary-green/10 dark:border-neutral-800 rounded-3xl p-6 shadow-sm select-none">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary-green dark:text-[#f1f8e9]">
            {language === 'bn' ? 'কিবলা কম্পাস' : 'Qibla Compass'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {language === 'bn' ? 'কাবা শরিফের সঠিক দিক নির্ণয়' : 'Locate the exact direction of Holy Kaaba'}
          </p>
        </div>
        <div className="p-2.5 bg-emerald-50 dark:bg-neutral-800 text-primary-green dark:text-accent-gold rounded-xl">
          <CompassIcon className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Compass Dial Visual Column */}
        <div className="md:col-span-6 flex flex-col items-center justify-center">
          
          {/* Compass wrapper */}
          <div
            id="compass-wrapper"
            className="relative w-72 h-72 mx-auto flex items-center justify-center"
          >
            {/* Compass Rose (background circle with N/S/E/W) */}
            <div
              id="compass-rose"
              className="absolute w-full h-full rounded-full border-4 border-primary-green dark:border-accent-gold flex items-center justify-center bg-gradient-to-br from-emerald-50/70 to-[#e8f5e9]/90 dark:from-zinc-950 dark:to-zinc-900 shadow-inner duration-300"
            >
              {/* N S E W labels */}
              <span className="absolute top-2.5 font-extrabold text-[#105221] dark:text-[#d4a323] text-lg select-none">
                N
              </span>
              <span className="absolute bottom-2.5 font-extrabold text-[#105221] dark:text-[#d4a323] text-lg select-none">
                S
              </span>
              <span className="absolute right-3.5 font-extrabold text-[#105221] dark:text-[#d4a323] text-lg select-none">
                E
              </span>
              <span className="absolute left-3.5 font-extrabold text-[#105221] dark:text-[#d4a323] text-lg select-none">
                W
              </span>
            </div>

            {/* Qibla Needle (Kaaba icon at tip) */}
            <div
              id="qibla-needle"
              style={{ transformOrigin: 'bottom center' }}
              className="absolute top-1/2 left-1/2 w-1 h-32 -ml-0.5 -mt-32 origin-bottom bg-gradient-to-t from-transparent via-[#c62828] to-[#e53935] dark:via-[#d4a323] dark:to-accent-gold rounded-full duration-300"
            >
              {/* Kaaba emoji at top of needle */}
              <div className="absolute -top-6 -left-3 text-2xl select-none filter drop-shadow">
                🕋
              </div>
            </div>

            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-primary-green dark:bg-accent-gold -ml-2 -mt-2 z-10 shadow-sm transition-colors duration-300" />
          </div>

          {/* Permission Button */}
          <button
            id="compass-permission-btn"
            className="hidden mx-auto mt-4 px-6 py-2.5 bg-primary-green hover:bg-[#0c3e18] dark:bg-accent-gold dark:hover:bg-gold-hover text-white dark:text-zinc-950 font-bold rounded-xl text-sm transition shadow-sm cursor-pointer"
          >
            {language === 'bn' ? 'কম্পাস চালু করুন' : 'Enable Compass'}
          </button>

          {/* Degree + Direction display */}
          <div className="text-center mt-5">
            <span
              id="qibla-degree"
              className="text-4xl font-black font-mono text-primary-green dark:text-accent-gold block"
            >
              --°
            </span>
            <p
              id="qibla-direction"
              className="text-xs font-bold text-gray-700 dark:text-emerald-100 uppercase tracking-wider mt-1"
            >
              {language === 'bn' ? 'কিবলার দিক' : 'Qibla Direction'}
            </p>
            <p
              id="qibla-distance"
              className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-semibold"
            >
              {language === 'bn' ? 'কাবা থেকে দূরত্ব: -- কিমি' : 'Distance to Kaaba: -- km'}
            </p>
          </div>

        </div>

        {/* Informative Instruction Column */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <div className="p-4 bg-emerald-500/5 rounded-2xl border border-dashed border-emerald-500/10">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-primary-green dark:text-accent-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-primary-green dark:text-[#f1f8e9]">
                  {language === 'bn' ? `আপনার অবস্থান: ${locationName}` : `Your Location: ${locationName}`}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 lines-relaxed leading-relaxed">
                  {language === 'bn' 
                    ? 'কম্পাস সঠিকভাবে ঘুরতে ডিভাইসটিকে হাত সোজা রেখে বাতাসে ইংরেজি "8" অক্ষরের আকারে ৩-৪ বার ঘোরান। এটি আপনার ফোনের ম্যাগনেটোমিটার সেন্সর সঠিকভাবে ক্যালিব্রেট করে।'
                    : 'If the needle response is sluggish, wave your device flatly in a figure-8 motion several times to recalibrate your internal gyroscope and magnetometer sensors.'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-zinc-800/30 border border-primary-green/5">
            <p className="text-[10px] uppercase font-bold text-[#81c784] tracking-wider mb-1.5">
              {language === 'bn' ? 'কোণ গণনা রেফারেন্স' : 'Bearing Calculations'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
              {language === 'bn'
                ? 'কাবা শরীফের জিপিএস স্থানাঙ্ক (২১.৪২২৫° উত্তর, ৩৯.৮২৬২° পূর্ব) ও আপনার অবস্থান অনুযায়ী গণিতিক সমীকরণ ব্যবহার করে দিক নির্দেশ করা হচ্ছে।'
                : 'Using spherical trigonometric equations to yield direct bearing angle from your device coordinates to Mecca (21.4225° N, 39.8262° E).'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
