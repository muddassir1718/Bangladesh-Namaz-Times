/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calculator, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { toBanglaNum } from '../utils/calculations';
import { Language } from '../types';

interface ZakatProps {
  language: Language;
}

export default function ZakatCalculator({ language }: ZakatProps) {
  // Input States (values represented in BDT or grams)
  const [cash, setCash] = useState<number>(0);
  const [goldGrams, setGoldGrams] = useState<number>(0);
  const [silverGrams, setSilverGrams] = useState<number>(0);
  const [businessStock, setBusinessStock] = useState<number>(0);
  const [receivables, setReceivables] = useState<number>(0);
  const [investments, setInvestments] = useState<number>(0);
  const [liabilities, setLiabilities] = useState<number>(0);

  // Editable Commodity Prices in BDT per gram (Approximate pricing for 22K standard gold/silver)
  const [goldPrice, setGoldPrice] = useState<number>(10000); // 10,000 BDT per gram
  const [silverPrice, setSilverPrice] = useState<number>(170); // 170 BDT per gram

  // Calculations
  const calculatedGoldVal = goldGrams * goldPrice;
  const calculatedSilverVal = silverGrams * silverPrice;

  const totalAssets =
    cash +
    calculatedGoldVal +
    calculatedSilverVal +
    businessStock +
    receivables +
    investments -
    liabilities;

  // Nisab threshold constants
  const goldNisabGrams = 87.48; // 7.5 bhori/tola = 87.48 grams approx
  const silverNisabGrams = 612.36; // 52.5 bhori/tola = 612.36 grams approx

  const goldNisabValue = goldNisabGrams * goldPrice;
  const silverNisabValue = silverNisabGrams * silverPrice;

  // Shariah ruling standard: for mixed wealth assets, Nisab is based on Silver because it favors the poor (lower threshold)
  const nisabUsed = Math.min(goldNisabValue, silverNisabValue);
  const isEligible = totalAssets >= nisabUsed;
  const zakatDue = isEligible ? Math.max(0, totalAssets * 0.025) : 0;

  // Helper BDT formatter
  const formatCurrency = (val: number) => {
    const formatted = Math.max(0, Math.round(val)).toLocaleString('en-IN');
    return language === 'bn' ? `৳ ${toBanglaNum(formatted)}` : `৳ ${formatted}`;
  };

  const formatWeight = (val: number, type: 'gold' | 'silver') => {
    const num = Math.round(val * 100) / 100;
    const str = language === 'bn' ? `${toBanglaNum(num)} গ্রাম` : `${num} g`;
    return str;
  };

  return (
    <div id="zakat-calculator-section" className="bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm select-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
            {language === 'bn' ? 'জাকাত ক্যালকুলেটর' : 'Zakat Calculator'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {language === 'bn'
              ? 'ইসলামিক শরীয়ত মোতাবেক আপনার জাকাতের সহজ হিসাব'
              : 'Calculate your obligatory Zakat in BDT accurately'}
          </p>
        </div>
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
          <Calculator className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Input Fields */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 pb-1 border-b border-gray-100 dark:border-neutral-800">
            {language === 'bn' ? 'সম্পদের বিবরণী (৳)' : 'Asset Details (BDT)'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cash at Hand */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">
                {language === 'bn' ? '১. নগদ ও ব্যাংক ব্যালেন্স' : '1. Cash & Bank Balance'}
              </label>
              <input
                type="number"
                min="0"
                value={cash || ''}
                placeholder="0"
                onChange={(e) => setCash(Math.max(0, Number(e.target.value)))}
                className="w-full text-sm h-11 px-3 border border-emerald-100 dark:border-neutral-800 bg-emerald-50/10 dark:bg-zinc-950 rounded-xl text-emerald-950 dark:text-emerald-100 outline-none transition focus:border-emerald-500"
              />
            </div>

            {/* Business Stock */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">
                {language === 'bn' ? '২. ব্যবসায়িক পণ্য বা স্টক মূল্য' : '2. Business Assets & Inventory'}
              </label>
              <input
                type="number"
                min="0"
                value={businessStock || ''}
                placeholder="0"
                onChange={(e) => setBusinessStock(Math.max(0, Number(e.target.value)))}
                className="w-full text-sm h-11 px-3 border border-emerald-100 dark:border-neutral-800 bg-emerald-50/10 dark:bg-zinc-950 rounded-xl text-emerald-950 dark:text-emerald-100 outline-none transition focus:border-emerald-500"
              />
            </div>

            {/* Gold grams input */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium flex items-center justify-between">
                <span>{language === 'bn' ? '৩. সোনার পরিমাণ (গ্রাম)' : '3. Gold Weight (g)'}</span>
                <span className="text-[10px] text-emerald-600 font-mono">
                  {formatCurrency(calculatedGoldVal)}
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={goldGrams || ''}
                placeholder="0"
                onChange={(e) => setGoldGrams(Math.max(0, Number(e.target.value)))}
                className="w-full text-sm h-11 px-3 border border-emerald-100 dark:border-neutral-800 bg-emerald-50/10 dark:bg-zinc-950 rounded-xl text-emerald-950 dark:text-emerald-100 outline-none transition focus:border-emerald-500"
              />
            </div>

            {/* Silver grams input */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium flex items-center justify-between">
                <span>{language === 'bn' ? '৪. রুপার পরিমাণ (গ্রাম)' : '4. Silver Weight (g)'}</span>
                <span className="text-[10px] text-emerald-600 font-mono">
                  {formatCurrency(calculatedSilverVal)}
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={silverGrams || ''}
                placeholder="0"
                onChange={(e) => setSilverGrams(Math.max(0, Number(e.target.value)))}
                className="w-full text-sm h-11 px-3 border border-emerald-100 dark:border-neutral-800 bg-emerald-50/10 dark:bg-zinc-950 rounded-xl text-emerald-950 dark:text-emerald-100 outline-none transition focus:border-emerald-500"
              />
            </div>

            {/* Receivables */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">
                {language === 'bn' ? '৫. পাওনা টাকা (ফেরতযোগ্য)' : '5. Receivables / Loan Owed to You'}
              </label>
              <input
                type="number"
                min="0"
                value={receivables || ''}
                placeholder="0"
                onChange={(e) => setReceivables(Math.max(0, Number(e.target.value)))}
                className="w-full text-sm h-11 px-3 border border-emerald-100 dark:border-neutral-800 bg-emerald-50/10 dark:bg-zinc-950 rounded-xl text-emerald-950 dark:text-emerald-100 outline-none transition focus:border-emerald-500"
              />
            </div>

            {/* Investments */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">
                {language === 'bn' ? '৬. শেয়ার ও স্থায়ী বিনিয়োগ মূল্য' : '6. Shares & Joint Investments'}
              </label>
              <input
                type="number"
                min="0"
                value={investments || ''}
                placeholder="0"
                onChange={(e) => setInvestments(Math.max(0, Number(e.target.value)))}
                className="w-full text-sm h-11 px-3 border border-emerald-100 dark:border-neutral-800 bg-emerald-50/10 dark:bg-zinc-950 rounded-xl text-emerald-950 dark:text-emerald-100 outline-none transition focus:border-emerald-500"
              />
            </div>
          </div>

          <h3 className="text-sm font-bold text-red-800 dark:text-red-300 mt-4 pb-1 border-b border-gray-100 dark:border-neutral-800">
            {language === 'bn' ? 'বিয়োজন ও দায়-দেনা (৳)' : 'Liabilities & Deductions (BDT)'}
          </h3>

          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">
              {language === 'bn' ? '৭. ঋণ বা অন্যান্য পরিশোধযোগ্য দায়' : '7. Immediate Liabilities / Debts and Household Expenses'}
            </label>
            <input
              type="number"
              min="0"
              value={liabilities || ''}
              placeholder="0"
              onChange={(e) => setLiabilities(Math.max(0, Number(e.target.value)))}
              className="w-full text-sm h-11 px-3 border border-red-100 dark:border-neutral-800 bg-red-50/5 dark:bg-zinc-950 rounded-xl text-emerald-950 dark:text-emerald-100 outline-none transition focus:border-red-400"
            />
          </div>

          {/* Pricing Config toggles */}
          <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mt-4 pb-1 border-b border-gray-100 dark:border-neutral-800">
            {language === 'bn' ? 'ধাতুর বাজারমূল্য (প্রতি গ্রাম ৳)' : 'Metal Market Rates (per gram BDT)'}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                {language === 'bn' ? 'সোনার প্রতি গ্রাম (৳)' : '1g Gold Price'}
              </label>
              <input
                type="number"
                min="1"
                value={goldPrice}
                onChange={(e) => setGoldPrice(Math.max(1, Number(e.target.value)))}
                className="w-full text-xs h-9 px-2 border border-emerald-100 dark:border-neutral-800 bg-emerald-50/10 dark:bg-zinc-950 rounded-lg text-emerald-950 dark:text-emerald-100 font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                {language === 'bn' ? 'রুপার প্রতি গ্রাম (৳)' : '1g Silver Price'}
              </label>
              <input
                type="number"
                min="1"
                value={silverPrice}
                onChange={(e) => setSilverPrice(Math.max(1, Number(e.target.value)))}
                className="w-full text-xs h-9 px-2 border border-emerald-100 dark:border-neutral-800 bg-emerald-50/10 dark:bg-zinc-950 rounded-lg text-emerald-950 dark:text-emerald-100 font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Columns: Calculations and Shariah Status */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-4">
          <div className="p-6 bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-500/10 rounded-2xl">
            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wider uppercase mb-4">
              {language === 'bn' ? 'হিসাবের সারসংক্ষেপ' : 'Calculation Summary'}
            </h4>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-emerald-500/10">
                <span className="text-gray-500 dark:text-gray-400">
                  {language === 'bn' ? 'মোট জাকাতযোগ্য সম্পদ:' : 'Total Zakatable Assets:'}
                </span>
                <span className="font-bold text-emerald-950 dark:text-emerald-100 font-mono text-sm">
                  {formatCurrency(totalAssets)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-emerald-500/10">
                <span className="text-gray-500 dark:text-gray-400">
                  {language === 'bn' ? 'স্বর্ণের নিসাব (৮৭.৪৮ গ্রাম):' : 'Gold Nisab (87.48g):'}
                </span>
                <span className="font-medium text-gray-600 dark:text-gray-400 font-mono">
                  {formatCurrency(goldNisabValue)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-emerald-500/10">
                <span className="text-gray-500 dark:text-gray-400">
                  {language === 'bn' ? 'রুপার নিসাব (৬১২.৩৬ গ্রাম):' : 'Silver Nisab (612.36g):'}
                </span>
                <span className="font-medium text-gray-600 dark:text-gray-400 font-mono">
                  {formatCurrency(silverNisabValue)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  {language === 'bn' ? 'প্রযোজ্য নিসাব সীমা:' : 'Effective Nisab Value:'}
                </span>
                <span className="font-bold text-emerald-600 font-mono text-xs">
                  {formatCurrency(nisabUsed)}
                </span>
              </div>
            </div>

            {/* Obligatory status notice bar */}
            <div className={`mt-6 p-4 rounded-xl flex items-start gap-2.5 ${
              isEligible
                ? 'bg-emerald-600/10 text-emerald-900 dark:text-emerald-100 border border-emerald-500/20'
                : 'bg-amber-600/10 text-amber-900 dark:text-amber-100 border border-amber-500/20'
            }`}>
              {isEligible ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h5 className="font-bold text-sm">
                  {isEligible
                    ? language === 'bn'
                      ? 'আপনার ওপর জাকাত ফরজ'
                      : 'Zakat is Obligatory upon you'
                    : language === 'bn'
                    ? 'আপনার ওপর জাকাত ফরজ নয়'
                    : 'Zakat is not Obligatory'}
                </h5>
                <p className="text-[11px] font-normal leading-relaxed mt-1 opacity-90">
                  {isEligible
                    ? language === 'bn'
                      ? `মাশাআল্লাহ! আপনার মোট সম্পদ (নিসাব ${formatCurrency(nisabUsed)}) এর অধিক থাকায় আপনাকে ২.৫% হারে জাকাত দিতে হবে।`
                      : `Your net assets are above the effective Nisab of ${formatCurrency(nisabUsed)}. You must pay 2.5% of your wealth.`
                    : language === 'bn'
                    ? 'আপনার মোট সম্পদ নিসাব মূল্য সীমার নিচে রয়েছে।'
                    : 'Your net zakatable assets have not met the minimum Nisab value.'}
                </p>
              </div>
            </div>

            {/* Total due massive container */}
            {isEligible && (
              <div className="mt-5 p-5 bg-emerald-600 text-white rounded-2xl shadow-inner text-center">
                <span className="text-xs opacity-90 tracking-wider">
                  {language === 'bn' ? 'পরিশোধযোগ্য জাকাতের পরিমাণ:' : 'TOTAL ZAKAT DUE:'}
                </span>
                <h3 className="text-3xl font-extrabold font-mono mt-1 w-full truncate">
                  {formatCurrency(zakatDue)}
                </h3>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-neutral-800 text-[11px] text-gray-500 dark:text-gray-400 flex gap-2">
            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">
                {language === 'bn' ? 'সতর্কীকরণ বার্তা:' : 'Important Note:'}
              </p>
              <p className="leading-relaxed mt-0.5">
                {language === 'bn'
                  ? 'সোনা ও রুপার বাজারমূল্য প্রতিনিয়ত পরিবর্তন হয়। জাকাত পরিশোধের দিন স্থানীয় বাজার দর যাচাই করে ক্যালকুলেট করুন।'
                  : 'Metal commodity exchange rates fluctuate daily. Please consult up-to-date market rates when paying Zakat.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
