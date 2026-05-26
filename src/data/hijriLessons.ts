export interface MonthVirtue {
  monthIndex: number; // 1 to 12
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
}

export interface DailyHadithDua {
  dayIndex: number; // 1 to 30
  hadithBn: string;
  hadithEn: string;
  sourceBn: string;
  sourceEn: string;
  duaBn: string;
  duaEn: string;
}

export const HIJRI_MONTH_VIRTUES: MonthVirtue[] = [
  {
    monthIndex: 1,
    titleBn: 'মহররম ও আশুরার ফজিলত',
    titleEn: 'Virtues of Muharram & Ashura',
    descBn: 'মহররম হিজরি বর্ষের প্রথম মাস এবং নিষিদ্ধ চার মাসের অন্যতম। এই মাসের বিশেষ বিশেষত্ব হচ্ছে ১০ই মহররম ‘আশুরা’। আশুরার দিন নবী মুসা (আ.) এবং বনী ইসরাইল ফেরাউনের কবল থেকে মুক্তি পেয়েছিলেন। রাসুলুল্লাহ (সা.) বলেছেন: আশুরার দিনের রোজার ব্যাপারে আমি আল্লাহর কাছে আশা রাখি যে, তা পূর্ববর্তী এক বছরের গুনাহ ক্ষমা করে দিবে। (সহীহ মুসলিম)',
    descEn: 'Muharram is the first month of the Islamic calendar and one of the four sacred months. Its peak significance lies on the 10th of Muharram (\'Ashura\'), when Prophet Musa (a.s) and Bani Israel were delivered from Pharaoh. The Prophet (s.a.w) said: Obeserving the fast on the day of Ashura expiates the sins of the previous year. (Sahih Muslim)'
  },
  {
    monthIndex: 2,
    titleBn: 'সফর মাস ও ভ্রান্ত ধারণা সংশোধন',
    titleEn: 'Virtues of Safar & Rectifying Misbeliefs',
    descBn: 'ইসলামপূর্ব যুগে সফর মাসকে অলক্ষুণে ও বিপদের মাস মনে করা হতো। রাসূলুল্লাহ (সা.) এই কুসংস্কার সম্পূর্ণ বাতিল করে দিয়ে ঘোষণা করেছেন, "সংক্রমণ বা সফর মাস বলে অশুভ অলক্ষণের কোনো অস্তিত্ব নেই।" (সহীহ বুখারী)। এই মাসে আল্লাহ তাআলার বেশি বেশি ইবাদত করা এবং সর্বপ্রকার কুসংস্কার ও শিরক থেকে অন্তরকে মুক্ত রাখাই প্রথম দায়িত্ব।',
    descEn: 'In pre-Islamic times, Safar was superstitious felt as an unlucky month. The Prophet (s.a.w) disestablished this completely, stating: "There is no superstition or bad omen associated with Safar." (Sahih Bukhari). Faith warrants remembering that times are created by Allah; increased prayers and avoidance of innovation is recommended.'
  },
  {
    monthIndex: 3,
    titleBn: 'রবিউল আউয়াল ও বিশ্বনবীর আগমন',
    titleEn: 'Rabi\' al-Awwal & Prophet\'s Legacy',
    descBn: '১২ই রবিউল আউয়াল আল্লাহর প্রিয় রাসূল ও সমগ্র সৃষ্টির রহমত হযরত মুহাম্মদ (সা.) পৃথিবীতে আগমন করেন। এই মাসে রাসুলুল্লাহ (সা.)-এর সুন্নাহ ও সীরাত নিয়ে বেশি বেশি আলোচনা করা, তাঁর জীবনাচরণকে নিজের ব্যক্তিগত ও সামাজিক জীবনে অনুসরণের দৃঢ় শপথ গ্রহণ করা এবং তাঁর ওপর প্রগাঢ় দুরুদ ও সালাম প্রেরণ করার আমল অত্যন্ত বরকতপূর্ণ।',
    descEn: 'Rabi\' al-Awwal is the month in which our beloved Prophet Muhammad (s.a.w) was born, bringing light and mercy to the universe. Engaging in studying the Seerah (prophetic biography), following his sunnah in daily tasks, and elevating deep blessings and Durood upon him is highly recommended during this blessed time.'
  },
  {
    monthIndex: 4,
    titleBn: 'রবিউস সানি ও দ্বীনি জ্ঞান অর্জন',
    titleEn: 'Rabi\' ath-Thani & Cultivating Knowledge',
    descBn: 'হিজরি বর্ষের চতুর্থ মাস রবিউস সানি বা রবিউল আখির। আল্লাহর পক্ষ থেকে আসা আমাদের সমস্ত নেয়ামতের জন্য শোকর আদায় করা এবং দ্বীনি জ্ঞান (ইলম) অন্বেষণ শুরু করা এই মাসের বিশেষ আমল। রাসূল (সা.) বলেছেন: যে ইলম অন্বেষণে বের হয়, ফিরে আসা পর্যন্ত সে আল্লাহর পথে থাকে। (তিরমিযী)',
    descEn: 'Rabi\' ath-Thani is a period to ponder over our faith and reinforce religious studies and circles of knowledge. The Prophet (s.a.w) remarked: "He who steps out in search of knowledge is in Allah\'s path until he returns." (Tirmidhi). Leverage this month to commit to better understanding the Holy Quran.'
  },
  {
    monthIndex: 5,
    titleBn: 'জুমাদাল উলা ও আত্মীয়তার সম্পর্ক বজায় রাখা',
    titleEn: 'Jumada al-Ula & Family Bonds',
    descBn: 'জুমাদাল উলা মাসে রাসূলুল্লাহ (সা.) আত্মীয়-স্বজন ও পরিবারের প্রতি সদ্ব্যবহার এবং হিংসা-অন্যায় থেকে বেঁচে থাকার আহ্বান জানিয়েছেন। ইরশাদ হয়েছে: যে ব্যক্তি চায় যে তার রিজিক বৃদ্ধি পাক এবং আয়ু দীর্ঘ হোক, সে যেন তার আত্মীয়দের সাথে সুসম্পর্ক বজায় রাখে। (সহীহ বুখারী)',
    descEn: 'During Jumada al-Ula, focus heavily on the preservation of family bonds (Silat ar-Rahim). The Prophet (s.a.w) taught: "Whoever loves that his sustenance be expanded and his lifespan prolonged, let him maintain close ties with his kin." (Sahih Bukhari).'
  },
  {
    monthIndex: 6,
    titleBn: 'জুমাদাস সানি ও আখলাক সংশোধন',
    titleEn: 'Jumada ath-Thani & Purification of Akhlaq',
    descBn: 'জুমাদাস সানি আত্মিক চরিত্র (আখলাক) সংশোধনের মাস। রমজান মাস নিকটে আসার পূর্বে নিজেকে তৈরি করার এটি অন্যতম প্রারম্ভিক সময়। রাসুলুল্লাহ (সা.) বলেছেন: কেবল সচ্চরিত্রতা সম্পন্ন মুমিনদের ঈমানই পূর্ণাঙ্গ রূপ লাভ করে। (তিরমিজি)',
    descEn: 'Jumada ath-Thani calls for inner self-improvement (Akhlaq) ahead of the months of Rajab, Sha\'ban and Ramadan. The Messenger of Allah (s.a.w) conveyed: "The most perfect of believers in faith is the one who is best in their character." (Tirmidhi).'
  },
  {
    monthIndex: 7,
    titleBn: 'রজব মাস ও হুরমত রক্ষা করা',
    titleEn: 'Rajab & The Respect of Sacred Months',
    descBn: 'রজব সম্মানিত চার মাসের অন্যতম। পবিত্র কুরআনে আল্লাহ তাআলা এই সম্মানিত মাসগুলোতে নিজেদের উপর অন্যায় ও জুলুম করতে নিষেধ করেছেন। রাসূলুল্লাহ (সা.) রজব মাস শুরু হলে দোয়া করতেন: হে আল্লাহ! আমাদের জন্য রজব ও শাবান মাস বরকতময় করুন এবং আমাদের রমজান পর্যন্ত পৌঁছে দিন (মুসনাদে আহমাদ)।',
    descEn: 'Rajab is one of the four sacred months (Al-Ashhur al-Hurum). Fighting and sinning are strictly prohibited, and rewards for good deeds are amplified. The Prophet (s.a.w) used to supplicate: "O Allah, bless us in Rajab and Sha\'ban, and enable us to reach Ramadan." (Ahmad).'
  },
  {
    monthIndex: 8,
    titleBn: 'শাবান মাস ও রমজানের পূর্বপ্রস্তুতি',
    titleEn: 'Sha\'ban & Initiating Ramadan Preparations',
    descBn: 'শাবান মাস অত্যন্ত গুরুত্বপূর্ণ ইবাদতের সময়। রাসূলুল্লাহ (সা.) এই মাসে রমজানের আন্তরিক সম্মানার্থে অন্য যেকোনো মাসের চেয়ে অনেক বেশি নফল রোজা রাখতেন। এই মাসে বান্দার বার্ষিক আমল আল্লাহর দরবারে উত্তোলন করা হয়; তাই ইস্তিগফার বৃদ্ধি ও নফল ইবাদতের মাধ্যমে অন্তর পরিচ্ছন্ন করা জরুরি।',
    descEn: 'Sha\'ban acts as a gateway to Ramadan. The Prophet (s.a.w) fasted abundantly in this month to welcome the heat of Ramadan. It is also the month in which deeds are raised to Lord of the Worlds, making repentance, charities, and night prayers invaluable.'
  },
  {
    monthIndex: 9,
    titleBn: 'রমজান মাস ও মহাগ্রন্থ আল-কুরআনের বসন্ত',
    titleEn: 'The Magnificence of Ramadan & Quran Recital',
    descBn: 'রমজান মাস মুসলিম উম্মাহর নিকট সর্বশ্রেষ্ঠ অতি পবিত্র ও বরকতময় মাস। এই মাসেই নাযিল হয়েছে মহাগ্রন্থ আল কুরআন। শেষ দশকের বিজোড় রাতে রয়েছে লাইলাতুল কদর যা হাজার মাস অপেক্ষা উত্তম। ফরজ রোজার সাথে সাথে বেশি বেশি তারাবিহ, কুরআন তেলাওয়াত ও অভাবী মানুষকে সাহায্য করার বসন্তকাল এটি।',
    descEn: 'Ramadan is the pinnacle of the Islamic year, the month in which the Quran was revealed. It contains Laylatul Qadr (The Night of Decree), which is better than a thousand months in worship. Focus heavily on charity, fasting with complete restraint, and sincere nightly Quran recitals.'
  },
  {
    monthIndex: 10,
    titleBn: 'শাওয়াল মাস ও ৬ রোজার ফজিলত',
    titleEn: 'Shawwal & Sustaining Good Habits',
    descBn: 'শাওয়ালের বিশেষ ফজিলত হচ্ছে এই মাসের ৬টি নফল রোজা। যে রাসূলুল্লাহ (সা.) বলেছেন: যে ব্যক্তি রমজানের রোজা রাখল অতঃপর শাওয়ালের ছয়টি রোজা রাখল, সে যেন সারা বছরই রোজা রাখল (মুসলিম)। এটি রমজানের ইবাদতের ধারাবাহিকতা বজায় রাখতে আমাদের অনুপ্রাণিত করে।',
    descEn: 'Shawwal brings the celebration of Eid-ul-Fitr. Its specific virtue is observing six voluntary fasts. The Prophet (s.a.w) stated: "Whoever fasts Ramadan and follows it with six from Shawwal, it is as if he fasted the entire year." (Sahih Muslim).'
  },
  {
    monthIndex: 11,
    titleBn: 'জিলকদ মাস ও হজ ও ওমরাহর প্রস্তুতি',
    titleEn: 'Dhu al-Qi\'dah & Planning Pilgrimages',
    descBn: 'জিলকদ মাস সম্মানিত নিষিদ্ধ চার মাসের আরেকটি মহিমান্বিত মাস। এই মাস হজ্জের তিনটি অগ্রিম প্রধান সফরের মাসের অন্যতম। এই মাসে নিজেকে সব ধরনের পাপাচার ও লড়াই থেকে বিরত রেখে জিলহজ মাসের মহান ফরজ হজ্জের প্রস্তুতি গ্রহণ করা উত্তম আমল।',
    descEn: 'Dhu al-Qi\'dah is a sacred month preceding the Hajj. It is a time for calm preparation, intense spiritual focus, and avoiding conflicts, designed to transition mind and soul toward pilgrimage rites or Dhu al-Hijjah blessings.'
  },
  {
    monthIndex: 12,
    titleBn: 'জিলহজ মাস ও শ্রেষ্ঠ দশকের ইবাদত',
    titleEn: 'Dhu al-Hijjah & The Top Ten Days',
    descBn: 'জিলহজ মাসের প্রথম ১০ দিনের আমল মহান আল্লাহর নিকট অন্য যেকোনো দিনের ইবাদত অপেক্ষা অধিক প্রিয়। এই ১০ দিনে তাসবীহ-তাহমীদ পড়া, ৯ই জিলহজ আরাফার রোজা রাখা এবং উম্মাহর সমর্থবানদের জন্য কোরবানি করা মহান সুন্নাহ। রাসূল (সা.) বলেছেন: এই দিনগুলোর চেয়ে উত্তম কোনো দিন নেই (সহীহ বুখারী)।',
    descEn: 'Dhu al-Hijjah hosts the annual Hajj pilgrimage and Eid-ul-Adha. Its initial ten days are the most virtuous days of the year. Reciting Takbeer, fasting on the Day of Arafah (for non-pilgrims), and performing Qurbani (sacrifice) represent highly rewarded acts of devotion.'
  }
];

export const DAILY_HADITH_DUAS: DailyHadithDua[] = [
  {
    dayIndex: 1,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "সব আমল নিয়তের ওপরেই নির্ভরশীল এবং মানুষ তার নিয়ত অনুযায়ীই ফল পাবে।"- (বুখারী)',
    hadithEn: 'The Prophet (s.a.w) said: "Actions are judged by intentions and every person will get what they intended." (Bukhari)',
    sourceBn: 'সহীহ বুখারী, হাদিস নং ১',
    sourceEn: 'Sahih Bukhari, Hadith 1',
    duaBn: 'ইয়া হানু ইয়া মান্নান, আমার নিয়তকে সব রিয়া ও অহংকার থেকে মুক্ত করে সম্পূর্ণ বিশুদ্ধ করার তৌফিক দিন।',
    duaEn: 'O Allah, purify my intentions from show-off and vanity, and make them completely sincere for You.'
  },
  {
    dayIndex: 2,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে কুরআন নিজে শেখে এবং অন্যকে শেখায়।"- (বুখারী)',
    hadithEn: 'The Prophet (s.a.w) said: "The best among you are those who learn the Quran and teach it." (Bukhari)',
    sourceBn: 'সহীহ বুখারী, হাদিস ৫০২৭',
    sourceEn: 'Sahih Bukhari, Hadith 5027',
    duaBn: 'হে আল্লাহ! আমাকে কুরআনের সঠিক ইলম ও হেদায়াত দান করুন এবং সেই অনুযায়ী আমল করার শক্তি দিন।',
    duaEn: 'O Lord, bestow upon me the true knowledge and wisdom of the Quran and empower me to act upon it.'
  },
  {
    dayIndex: 3,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "পবিত্রতা ঈমানের অর্ধেক এবং ‘আলহামদুলিল্লাহ’ মিযানকে (আমলের পাল্লা) পূর্ণ করে দেয়।"- (মুসলিম)',
    hadithEn: 'The Prophet (s.a.w) said: "Purity is half of the faith, and saying \'Alhamdulillah\' fills the scale." (Muslim)',
    sourceBn: 'সহীহ মুসলিম, হাদিস নং ২২৩',
    sourceEn: 'Sahih Muslim, Hadith 223',
    duaBn: 'হে আল্লাহ! আমার শরীর ও মনকে অপবিত্রতা হতে এবং আমার আমলকে কুফরি ও নিফাক থেকে দূরে রাখুন।',
    duaEn: 'O Allah, keep my body clean, safeguard my heart from hypocrisy, and guide me to remain pure.'
  },
  {
    dayIndex: 4,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "যে ব্যক্তি সকাল-সন্ধ্যায় সুবহানাল্লাহি ওয়া বিহামদিহি ১০০ বার পড়বে, কিয়ামতের দিন তার চেয়ে উত্তম আমল কেউ আনতে পারবে না।"- (মুসলিম)',
    hadithEn: 'The Prophet (s.a.w) said: "He who recites \'Subhanallahi wa bihamdihi\' 100 times daily will not be surpassed by anyone on Judgement Day." (Muslim)',
    sourceBn: 'সহীহ মুসলিম, হাদিস ২৬৯২',
    sourceEn: 'Sahih Muslim, Hadith 2692',
    duaBn: 'সুবহানাল্লাহি ওয়া বিহামদিহি (মহিমান্বিত আল্লাহ এবং প্রশংসিত আল্লাহ)। হে আল্লাহ! আমার গুনাহসমূহ মাফ করে দিন।',
    duaEn: 'Glory be to Allah and His is the praise. O Allah, forgive all my shortcomings and forgive me.'
  },
  {
    dayIndex: 5,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "সহজ করো, কঠিন করো না; সুসংবাদ দাও, মানুষকে দূরে ঠেলে দিও না।"- (বুখারী)',
    hadithEn: 'The Prophet (s.a.w) said: "Make things easy and do not make them difficult, give glad tidings and do not drive people away." (Bukhari)',
    sourceBn: 'সহীহ বুখারী, হাদিস নং ৬১২৫',
    sourceEn: 'Sahih Bukhari, Hadith 6125',
    duaBn: 'রাব্বি ইয়াসসির ওয়া লা তুআসসির ওয়া তাম্মিম আলাইনা বিল খাইর। (হে রব, সহজ করুন, কঠিন করবেন না)',
    duaEn: 'My Lord, make things easy, do not make them difficult, and bring our affairs to a beautiful end.'
  },
  {
    dayIndex: 6,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "প্রকৃত মুসলিম সেই, যার জিহ্বা ও হাত থেকে অন্য মুসলমানগণ নিরাপদ থাকে।"- (বুখারী)',
    hadithEn: 'The Prophet (s.a.w) said: "A true Muslim is the one from whose tongue and hand other Muslims are safe." (Bukhari)',
    sourceBn: 'সহীহ বুখারী, হাদিস নং ১০',
    sourceEn: 'Sahih Bukhari, Hadith 10',
    duaBn: 'হে আল্লাহ! আমাদের হাত ও মুখের অন্যায় আঘাত থেকে আমাদের সমাজ ও আত্মীয়দের নিরাপদ রাখুন।',
    duaEn: 'O Allah, protect our people from the wickedness of our tongues and the harm of our hands.'
  },
  {
    dayIndex: 7,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "তুমি ইবাদত করার সময় আল্লাহকে এমনভাবে ভয় করো যেন তুমি তাঁকে দেখছ, যদি দেখতে না পাও তবে বিশ্বাস রাখো তিনি তোমাকে দেখছেন।"- (মুসলিম)',
    hadithEn: 'The Prophet (s.a.w) said: "Worship Allah as if you see Him, for if you do not see Him, indeed He sees you." (Muslim)',
    sourceBn: 'সহীহ মুসলিম, হাদিস নং ৮ (হাদিসে জিবরাইল)',
    sourceEn: 'Sahih Muslim, Hadith 8',
    duaBn: 'হে আল্লাহ! আমাদের অন্তরে আপনার ইহসান ও তাকওয়া জাগ্রত রাখুন যাতে গোপনে ও প্রকাশ্যে আপনাকে ভয় করে চলতে পারি।',
    duaEn: 'O Allah, instill in our hearts the station of Ihsan so that we remain mindful of You in public and secret.'
  },
  {
    dayIndex: 8,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "যে ব্যক্তি আল্লাহর সন্তুষ্টির উদ্দেশ্যে একটি মসজিদ তৈরি করবে, আল্লাহ তার জন্য জান্নাতে একটি প্রাসাদ নির্মাণ করবেন।"- (বুখারী)',
    hadithEn: 'The Prophet (s.a.w) said: "Whoever builds a mosque for the sake of Allah, Allah will build for him a house in Paradise." (Bukhari)',
    sourceBn: 'সহীহ বুখারী, হাদিস নং ৪৫০',
    sourceEn: 'Sahih Bukhari, Hadith 450',
    duaBn: 'হে আল্লাহ! আমাদের নিয়তকে আপনার দ্বীনের কল্যাণে ও দান-সদকার জন্য উন্মুক্ত করে দিন।',
    duaEn: 'O Allah, enlarge our hearts to support noble and lasting houses of worship and charities.'
  },
  {
    dayIndex: 9,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "তুমি যেখানেই থাকো না কেন আল্লাহকে ভয় করো, প্রতিটি ভুলের পর ভালো কাজ করো যা তা মুছে দেবে এবং মানুষের সাথে সুন্দর আচরণ করো।"- (তিরমিযী)',
    hadithEn: 'The Prophet (s.a.w) said: "Have Taqwa of Allah wherever you are, follow an evil deed with a good one to wipe it out, and behave well with people." (Tirmidhi)',
    sourceBn: 'সুনানে তিরমিযী, হাদিস নং ১৯৮৭',
    sourceEn: 'Jami\' at-Tirmidhi, Hadith 1987',
    duaBn: 'হে আল্লাহ! আমাকে উত্তম সচ্চরিত্রতা দান করুন এবং আমার পাপ কাজগুলো সৎ কাজের বিনিময়ে মুছে দিন।',
    duaEn: 'O Allah, beautify my character and replace my bad deeds with righteous ones in Your mercy.'
  },
  {
    dayIndex: 10,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "মুমিনের বিষয়গুলো অদ্ভুত! তার প্রতিটি বিষয়েই কল্যাণ রয়েছে। যখন তার কোনো সুখ আসে সে শুকরিয়া আদায় করে যা কল্যাণকর এবং যখন দুঃখ আসে সে ধৈর্য ধারণ করে যা কল্যাণকর।"- (মুসলিম)',
    hadithEn: 'The Prophet (s.a.w) said: "Amazing is the affair of a believer, there is good in all of his affairs. If prosperity comes he is grateful, and if adversity comes he is patient." (Muslim)',
    sourceBn: 'সহীহ মুসলিম, হাদিস নং ২৯৯৯',
    sourceEn: 'Sahih Muslim, Hadith 2999',
    duaBn: 'হে আল্লাহ! সুসময়ে কৃতজ্ঞ মন এবং বিপদে সীমাহীন ধৈর্য (সবর) ধারণ করার তৌফিক ও মানসিক শক্তি দিন।',
    duaEn: 'O Allah, grant me a thankful heart in good moments and deep patience (Sabr) in trying times.'
  },
  {
    dayIndex: 11,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "যে ব্যক্তি দুনিয়াতে কোনো মুসলিম ভাইয়ের একটি কষ্ট দূর করবে, আল্লাহ কিয়ামতের দিন তার একটি বড় কষ্ট লাঘব করবেন।"- (বুখারী)',
    hadithEn: 'The Prophet (s.a.w) said: "Whoever relieves a believer of a distress in this world, Allah will relieve him of a distress on the Day of Resurrection." (Bukhari)',
    sourceBn: 'সহীহ বুখারী, হাদিস নং ২৪৪২',
    sourceEn: 'Sahih Bukhari, Hadith 2442',
    duaBn: 'হে আল্লাহ! আমার দ্বারা যেন কারো ক্ষতি না হয়, বরং আমাকে অন্যের দুঃখ নিবারণে সর্বদা নিয়োজিত রাখুন।',
    duaEn: 'O Allah, shield others from any harm from me and make me a source of ease and relief for others.'
  },
  {
    dayIndex: 12,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "যদি কেউ খাঁটি অন্তরে আল্লাহর নিকট ক্ষমার প্রার্থনা (ইস্তিগফার) করে, তবে সে গুনাহ থেকে এমনভাবে মুক্ত হয় যেন সে কোনো পাপই করেনি।"- (ইবনে মাজাহ)',
    hadithEn: 'The Prophet (s.a.w) said: "The one who repents from sin is like the one who has no sin." (Ibn Majah)',
    sourceBn: 'সুনানে ইবনে মাজাহ, হাদিস ৪২৫০',
    sourceEn: 'Sunan Ibn Majah, Hadith 4250',
    duaBn: 'আস্তাগফিরুল্লাহাল আজিম। হে অতি দয়াশীল আল্লাহ! আমার জীবনের ছোট-বড় সকল প্রকাশ্য-গোপন গুনাহ ক্ষমা করুন।',
    duaEn: 'Astaghfirullah. O Ever-Forgiving Lord, wash away all my private and public transgressions.'
  },
  {
    dayIndex: 13,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "মাতা-পিতার সন্তুষ্টির ভেতরেই আল্লাহর সন্তুষ্টি নিহিত রয়েছে এবং মাতা-পিতার অসন্তুষ্টির মাঝেই আল্লাহর ক্রোধ নিহিত থাকে।"- (তিরমিযী)',
    hadithEn: 'The Prophet (s.a.w) said: "The pleasure of the Lord is in the pleasure of the parents, and the displeasure of the Lord is in the displeasure of the parents." (Tirmidhi)',
    sourceBn: 'সুনানে তিরমিযী, হাদিস নং ১৮৯৯',
    sourceEn: 'Jami\' at-Tirmidhi, Hadith 1899',
    duaBn: 'রাব্বির হামহুমা কামা রাব্বাইয়ানি সাগিরা। হে আল্লাহ! আমার আব্বা-আম্মাকে সুস্থ রাখুন ও উত্তম প্রতিদান দিন।',
    duaEn: 'My Lord, have mercy upon them [my parents] as they brought me up [when I was] small.'
  },
  {
    dayIndex: 14,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "দুইটি বাক্য পড়তে অত্যন্ত সহজ, কিয়ামতের মিযানে অত্যন্ত ভারী এবং আল্লাহর নিকট অত্যন্ত প্রিয়: সুবহানাল্লাহি ওয়া বিহামদিহি, সুবহানাল্লাহিল আজীম।"- (বুখারী)',
    hadithEn: 'The Prophet (s.a.w) said: "Two words are light on the tongue, heavy on the scale, and beloved to the Merciful: Subhanallahi wa bihamdihi, Subhanallahil-azeem." (Bukhari)',
    sourceBn: 'সহীহ বুখারী, হাদিস নং ৬৬৮২',
    sourceEn: 'Sahih Bukhari, Hadith 6682',
    duaBn: 'সুবহানাল্লাহি ওয়া বিহামদিহি সুবহানাল্লাহিল আজীম। হে আল্লাহ! প্রতিটি শ্বাসে আপনার জিকির করার তৌফিক দিন।',
    duaEn: 'Glory be to Allah and His is the praise, Glory be to Allah the Almighty. Keep my tongue moist in Your remembrance.'
  },
  {
    dayIndex: 15,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "যে ব্যক্তি আমার ওপর একবার দরূদ পাঠ করবে, আল্লাহ তার ওপর দশবার রহমত বর্ষণ করবেন এবং দশটি পাপ ক্ষমা করবেন।"- (নাসায়ী)',
    hadithEn: 'The Prophet (s.a.w) said: "Whoever sends blessings upon me once, Allah sends blessings upon him ten times and erases ten sins." (An-Nasa\'i)',
    sourceBn: 'সুনানে নাসায়ী, হাদিস ১২৯৭',
    sourceEn: 'Sunan An-Nasa\'i, Hadith 1297',
    duaBn: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ (হে আল্লাহ! আমাদের প্রিয় নবী মুহাম্মদের ওপর শান্তি ও রহমত বর্ষণ করুন)।',
    duaEn: 'Allahumma salli wa sallim \'ala nabiyyina Muhammad. O Lord, shower continuous mercy upon our Prophet.'
  },
  {
    dayIndex: 16,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "তোমাদের মধ্যে কেউ ততক্ষণ প্রকৃত মুমিন হতে পারবে না যতক্ষণ না সে নিজের জন্য যা পছন্দ করে, তার অপর ভাইয়ের জন্যও তা পছন্দ করে।"- (বুখারী)',
    hadithEn: 'The Prophet (s.a.w) said: "None of you believes until he loves for his brother what he loves for himself." (Bukhari)',
    sourceBn: 'সহীহ বুখারী, হাদিস নং ১৩',
    sourceEn: 'Sahih Bukhari, Hadith 13',
    duaBn: 'হে আল্লাহ! আমাদের অন্তর থেকে সমস্ত হিংসা, পরশ্রীকাতরতা ও দ্বেষ দূর করে দিন এবং পরস্পরের মধ্যে ভালোবাসা দিন।',
    duaEn: 'O Allah, strip our hearts of pride and jealousy and unite the hearts of our community in goodwill.'
  },
  {
    dayIndex: 17,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "দানের মাধ্যমে কখনো সম্পদের ঘাটতি হয় না; উপরন্তু সদকা করার কারণে আল্লাহ বান্দার সম্মান বৃদ্ধি করেন।"- (মুসলিম)',
    hadithEn: 'The Prophet (s.a.w) said: "Charity does not decrease wealth, and Allah increases the honor of those who forgive." (Muslim)',
    sourceBn: 'সহীহ মুসলিম, হাদিস নং ২৫৮৮',
    sourceEn: 'Sahih Muslim, Hadith 2588',
    duaBn: 'হে রিজিকদাতা! আমার উপার্জনে বরকত দিন এবং তা থেকে সর্বদা অভাবী ও অসহায়দের সাহায্যের পথ মসৃণ করুন।',
    duaEn: 'O Sustainer, bless our wealth and make us always generous to support orphans, widows and the poor.'
  },
  {
    dayIndex: 18,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "যে আল্লাহর ওপর চূড়ান্ত ভরসা (তাওয়াক্কুল) করে, আল্লাহ তার জন্য যথেষ্ট হয়ে যান যেমন তিনি পাখিদের রিজিক দেন; তারা সকালে ক্ষুধার্ত বের হয় ও সন্ধ্যায় তৃপ্ত হয়ে ফেরে।"- (তিরমিযী)',
    hadithEn: 'The Prophet (s.a.w) said: "If you trust Allah with right reliance, He will sustain you as He sustains birds; they go out hungry and return filled." (Tirmidhi)',
    sourceBn: 'সুনানে তিরমিযী, হাদিস নং ২৩৪৪',
    sourceEn: 'Jami\' at-Tirmidhi, Hadith 2344',
    duaBn: 'হাসবিয়াল্লাহু লা ইলাহা ইল্লা হুয়া, আলাইহি তাওয়াক্কালতু ওয়া হুয়া রাব্বুল আরশিল আজিম। (আমার জন্য আল্লাহই যথেষ্ট)',
    duaEn: 'Allah is sufficient for me. There is no deity except Him. In Him I trust, and He is the Lord of the Great Throne.'
  },
  {
    dayIndex: 19,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "মিথ্যা বলা বর্জন করো, কেননা মিথ্যা মানুষকে ধ্বংসের দিকে পরিচালিত করে এবং সত্য মানুষকে জান্নাতে নিয়ে যায়।"- (বুখারী)',
    hadithEn: 'The Prophet (s.a.w) said: "Shun falsehood, because falsehood leads to wickedness and wickedness leads to Hell; adhere to truth." (Bukhari)',
    sourceBn: 'সহীহ বুখারী, হাদিস ৬০৯৪',
    sourceEn: 'Sahih Bukhari, Hadith 6094',
    duaBn: 'হে সত্যবাদী ও ন্যায়পরায়ণ রব! আমাদের জিহ্বাকে মিথ্যা বলা হতে এবং সমস্ত প্রতারণামূলক ধোঁকা থেকে চিরতরে বিরত রাখুন।',
    duaEn: 'O Lord of Truth, keep our speech and dealings completely honest and save us from all degrees of hypocrisy.'
  },
  {
    dayIndex: 20,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "যে মুসলিম সকালে একটি গাছ রোপণ করে অথবা শস্য বপন করে এবং তা থেকে কোনো পাখি, মানুষ বা পশু আহার করে, তা তার জন্য সদকা হিসেবে গণ্য হয়।"- (বুখারী)',
    hadithEn: 'The Prophet (s.a.w) said: "Any Muslim who plants a tree or sows a crop, and a bird, person or animal eats from it, it is a charity." (Bukhari)',
    sourceBn: 'সহীহ বুখারী, হাদিস নং ২৩২০',
    sourceEn: 'Sahih Bukhari, Hadith 2320',
    duaBn: 'হে আল্লাহ! আমাদের ছোট-বড় সমস্ত ইতিবাচক পার্থিব ও পরকালীন নেক আমল এবং পরিশ্রমকে কবুল করুন।',
    duaEn: 'O Allah, accept our earthly labors and convert our simple actions into lasting rewards of Sadaqah Jariyah.'
  },
  {
    dayIndex: 21,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "আল্লাহর নিকট সবচেয়ে প্রিয় আমল হলো সেটি যা নিয়মতান্ত্রিক অবিরত করা হয়, পরিমানে তা অল্প হলেও।"- (বুখারী)',
    hadithEn: 'The Prophet (s.a.w) said: "The most beloved of deeds to Allah are those that are most consistent, even if they are small." (Bukhari)',
    sourceBn: 'সহীহ বুখারী, হাদিস নং ৫৮৬১',
    sourceEn: 'Sahih Bukhari, Hadith 5861',
    duaBn: 'হে আল্লাহ! ইবাদতের ধারা নিয়মতান্ত্রিকভাবে বজায় রাখার তৌফিক দিন এবং অলসতা থেকে মুক্তি দিন।',
    duaEn: 'O Lord, grant me the discipline of consistency in my daily prayers, learning, and helpful habits.'
  },
  {
    dayIndex: 22,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "তোমাদের মধ্যে কেউ যেন দাঁড়িয়ে পানি পান না করে।"- (মুসলিম) [বসে তিন শ্বাসে শান্তভাবে ডান হাতে পানি পান করা সুন্নাহ]',
    hadithEn: 'The Prophet (s.a.w) said: "None of you should drink water while standing." (Muslim) [Sitting and drinking quietly with the right hand is Sunnah]',
    sourceBn: 'সহীহ মুসলিম, হাদিস নং ২০২৬',
    sourceEn: 'Sahih Muslim, Hadith 2026',
    duaBn: 'হে দয়ালু মালিক! আমাদের জীবনের প্রতিটি ছোট কাজে আপনার প্রিয় হাবিব (সা.)-এর সুন্নাহ মেনে চলার তৌফিক দিন।',
    duaEn: 'O Allah, guide us to follow the beautiful Sunnah of our beloved Prophet in every minor and major action.'
  },
  {
    dayIndex: 23,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "নিশ্চয়ই রাগ শয়তানের পক্ষ থেকে আসে। যখন তোমাদের রাগ আসে, তখন তোমরা ওযূ করো, কেননা পানি আগুন নিভিয়ে দেয়।"- (আবু দাউদ)',
    hadithEn: 'The Prophet (s.a.w) said: "Anger is from Satan. When any of you is angry, let him perform Wudu, for water extinguishes fire." (Abu Dawud)',
    sourceBn: 'সুনানে আবু দাউদ, হাদিস ৪৭৮৪',
    sourceEn: 'Sunan Abi Dawud, Hadith 4784',
    duaBn: 'আউযুবিল্লাহি মিনাশ শাইতানির রাজীম। হে আল্লাহ! ক্রোধের মূহূর্তে আমার মনকে শান্ত ও স্থির রাখার হিম্মত দিন।',
    duaEn: 'I seek refuge in Allah from Satan the outcast. O Allah, grant me self-control and clear thinking in anger.'
  },
  {
    dayIndex: 24,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "বান্দা যখন সেজদারত অবস্থায় থাকে, তখন সে আল্লাহর সবচেয়ে নিকটবর্তী হয়। কাজেই সেজদায় তোমরা বেশি বেশি দোয়া করো।"- (মুসলিম)',
    hadithEn: 'The Prophet (s.a.w) said: "The nearest a servant comes to his Lord is when he is prostrating (Sajdah), so supplicate much in it." (Muslim)',
    sourceBn: 'সহীহ মুসলিম, হাদিস নং ৪৮২',
    sourceEn: 'Sahih Muslim, Hadith 482',
    duaBn: 'হে পরম দয়ালু আল্লাহ! আমাদের প্রতিটি সেজদাকে গ্রহণযোগ্য করুন এবং সেজদার নতজানু অবস্থায় আমাদের অন্তরের সৎ বাসনা মঞ্জুর করুন।',
    duaEn: 'O Most Gracious Lord, make our prostrations filled with sincerity, and answer our prayers in Sajdah.'
  },
  {
    dayIndex: 25,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "যে ব্যক্তি দ্বীনের ইলম অর্জনের জন্য কোনো পথ অবলম্বন করে, আল্লাহ তার জন্য জান্নাতের পথ সহজ করে দেন।"- (মুসলিম)',
    hadithEn: 'The Prophet (s.a.w) said: "Whoever treads a path in search of Islamic knowledge, Allah will make easy for him the path to Paradise." (Muslim)',
    sourceBn: 'সহীহ মুসলিম, হাদিস নং ২৬৯৯',
    sourceEn: 'Sahih Muslim, Hadith 2699',
    duaBn: 'রাব্বি জিদনি ইলমা। হে আল্লাহ! আমাদের জ্ঞান ও সৎ বোঝার শক্তিকে অনেক বৃদ্ধি করে দিন।',
    duaEn: 'My Lord, increase me in beneficial knowledge. Guide me to apply and share what I learn.'
  },
  {
    dayIndex: 26,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "আল্লাহ তাআলা তোমাদের চেহারা বা সম্পদের দিকে তাকান না, বরং তিনি তোমাদের আমল ও অন্তরের দিকেই নজর দেন।"- (মুসলিম)',
    hadithEn: 'The Prophet (s.a.w) said: "Indeed, Allah does not look at your appearances or wealth, but He looks at your hearts and actions." (Muslim)',
    sourceBn: 'সহীহ মুসলিম, হাদিস নং ২৫৬৪',
    sourceEn: 'Sahih Muslim, Hadith 2564',
    duaBn: 'হে আল্লাহ! আমাদের অন্তরকে কুটিলতা, হিংসা ও লোকদেখানো আকাঙ্ক্ষা শূন্য করে পবিত্রময় সালেহ অন্তর দান করুন।',
    duaEn: 'O Allah, purify our inner spiritual self and remove any concealed pride or corrupt thought from my chest.'
  },
  {
    dayIndex: 27,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "তোমরা অবশ্যই হিংসা থেকে দূরে থাকবে, কেননা আগুন যেভাবে শুকনা কাঠ জ্বালিয়ে দেয়, হিংসা সেভাবে সৎ আমল ধ্বংস করে।"- (আবু দাউদ)',
    hadithEn: 'The Prophet (s.a.w) said: "Beware of jealousy, for jealousy consumes good deeds just as fire consumes wood." (Abu Dawud)',
    sourceBn: 'সুনানে আবু দাউদ, হাদিস ৪৯০৩',
    sourceEn: 'Sunan Abi Dawud, Hadith 4903',
    duaBn: 'হে আল্লাহ! অপরের ভালো দেখে হিংসা করার রোগ থেকে আমায় হেফাজত করুন ও অন্যের সৌভাগ্যে খুশি হওয়ার তৌফিক দিন।',
    duaEn: 'O Allah, protect my chest from envying others, and bless them in their gifts and make me content.'
  },
  {
    dayIndex: 28,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "যে মানুষ অন্য মানুষের প্রতি দয়া করে না, আল্লাহ তাআলাও তার প্রতি দয়া করেন না।"- (বুখারী)',
    hadithEn: 'The Prophet (s.a.w) said: "He who does not show mercy to people, Allah will not show mercy to him." (Bukhari)',
    sourceBn: 'সহীহ বুখারী, হাদিস নং ৭৩৭৬',
    sourceEn: 'Sahih Bukhari, Hadith 7376',
    duaBn: 'হে আর-রাহামুর রাহীমিীন! আমার হৃদয়কে পশুপাখি, এতিম ও সমস্ত সৃষ্টির প্রতি অসীম সহানুভূতিশীল করে দিন।',
    duaEn: 'O Ever-Merciful, expand the mercy in my heart for children, the poor, animal life, and all creation.'
  },
  {
    dayIndex: 29,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "যে ব্যক্তি সকালের নামাজ (ফজর) জামাতে আদায় করবে, সে সারাদিন আল্লাহর খাস নিরাপত্তাবলয়ে থাকবে।"- (মুসলিম)',
    hadithEn: 'The Prophet (s.a.w) said: "He who offers the morning prayer (Fajr) in congregation is under the direct safety of Allah." (Muslim)',
    sourceBn: 'সহীহ মুসলিম, হাদিস নং ৬৫৪',
    sourceEn: 'Sahih Muslim, Hadith 654',
    duaBn: 'হে আল্লাহ! ফজর ও এশার নামাজ জামাতের সাথে পড়ার তৌফিক দিন এবং আমাদের মুনাফিকদের বৈশিষ্ট্য থেকে বাঁচিয়ে রাখুন।',
    duaEn: 'O Allah, protect me from the traits of hypocrisy, and make me punctual in congregation at Fajr.'
  },
  {
    dayIndex: 30,
    hadithBn: 'রাসূলুল্লাহ (সা.) বলেছেন: "তোমাদের মধ্যে অহংকারী ব্যক্তি জান্নাতে প্রবেশ করবে না, যার অন্তরে বালু পরিমাণ অহংকার থাকবে।"- (মুসলিম)',
    hadithEn: 'The Prophet (s.a.w) said: "He will not enter Paradise who has even a mustard seed of arrogance in his heart." (Muslim)',
    sourceBn: 'সহীহ মুসলিম, হাদিস নং ৯১',
    sourceEn: 'Sahih Muslim, Hadith 91',
    duaBn: 'হে আল্লাহ! আমাদের মনকে পরম নম্র করুন এবং কিয়ামতের দিন আপনার আরশের সুশীতল ছায়ায় বসার সৌভাগ্য দিন।',
    duaEn: 'O Allah, cleanse me of any arrogance, make me humble to face truth, and grant me your shade on Judgement Day.'
  }
];
