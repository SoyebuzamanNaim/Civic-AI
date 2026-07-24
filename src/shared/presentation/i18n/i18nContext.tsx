'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'bn';

interface Translations {
  [key: string]: {
    en: string;
    bn: string;
  };
}

export const dictionary: Translations = {
  // Navigation & Headers
  appTitle: { en: 'CivicPulse AI', bn: 'সিভিকপালস এআই' },
  appTagline: { en: 'Next-Generation AI Civic Infrastructure Platform', bn: 'পরবর্তী প্রজন্মের এআই নাগরিক অবকাঠামো প্ল্যাটফর্ম' },
  trackReport: { en: 'Track Report', bn: 'প্রতিবেদন ট্র্যাক করুন' },
  officialPortal: { en: 'Official Portal', bn: 'সরকারি পোর্টাল' },
  reportAnIssue: { en: 'Report an Issue', bn: 'সমস্যা রিপোর্ট করুন' },
  heroTitle1: { en: 'Transforming Citizen Reports into', bn: 'নাগরিকের রিপোর্টকে রূপান্তর করুন' },
  heroTitle2: { en: 'Actionable Solutions', bn: 'কার্যকর সমাধানে' },
  heroDesc: {
    en: 'Report potholes, broken streetlights, water leaks, and illegal waste dumping in seconds. AI categorizes, rates severity, and detects duplicate reports automatically.',
    bn: 'কিছু সেকেন্ডের মধ্যে গর্ত, ভাঙা রাস্তার আলো, পানির লিক এবং অবৈধ বর্জ্যের রিপোর্ট করুন। এআই স্বয়ংক্রিয়ভাবে বিভাগ, তীব্রতা নির্ধারণ এবং প্রতিলিপি রিপোর্ট সনাক্ত করে।',
  },

  // Categories
  catPothole: { en: 'Pothole', bn: 'খাত/গর্ত (Pothole)' },
  catBrokenStreetlight: { en: 'Broken Streetlight', bn: 'ভাঙা ল্যাম্পপোস্ট' },
  catWaterLeak: { en: 'Water Leak', bn: 'পানির পাইপ লিক' },
  catIllegalDumping: { en: 'Illegal Dumping', bn: 'অবৈধ বর্জ্য ফেলা' },
  catOther: { en: 'Other', bn: 'অন্যান্য' },

  // Form Labels
  issueDescription: { en: 'Issue Description', bn: 'সমস্যার বিবরণ' },
  locationDetails: { en: 'Location Details', bn: 'অবস্থানের বিবরণ' },
  selectCategory: { en: 'Select Category (Optional)', bn: 'ক্যাটাগরি নির্বাচন করুন (ঐচ্ছিক)' },
  photoEvidenceUrl: { en: 'Photo Evidence URL (Optional)', bn: 'ছবির লিংক (ঐচ্ছিক)' },
  contactPhone: { en: 'Contact Phone / Email (Optional)', bn: 'যোগাযোগের ফোন/ইমেইল (ঐচ্ছিক)' },
  submitBtn: { en: 'Submit Citizen Report', bn: 'রিপোর্ট জমা দিন' },
  submitting: { en: 'Submitting & Analyzing...', bn: 'জমা দেওয়া ও বিশ্লেষণ চলছে...' },

  // Dashboard & Tracking
  dashboardTitle: { en: 'Government Operational Dashboard', bn: 'সরকারি অপারেশনাল ড্যাশবোর্ড' },
  realtimeActive: { en: 'Realtime Active', bn: 'রিয়েলটাইম সচল' },
  totalActiveReports: { en: 'Total Active Reports', bn: 'মোট সক্রিয় রিপোর্ট' },
  criticalSeverity: { en: 'Critical Severity', bn: 'জরুরি/মারাত্মক' },
  unassignedCases: { en: 'Unassigned Cases', bn: 'অবরাদ্দকৃত কেস' },
  inProgress: { en: 'In Progress', bn: 'কাজ চলমান' },
  searchPlaceholder: { en: 'Search tracking code, description, or location...', bn: 'ট্র্যাকিং কোড, বিবরণ বা অবস্থান অনুসন্ধান করুন...' },
  allStatuses: { en: 'All Statuses', bn: 'সকল স্ট্যাটাস' },
  allSeverities: { en: 'All Severities', bn: 'সকল তীব্রতা' },
  applyFilters: { en: 'Apply Filters', bn: 'ফিল্টার প্রয়োগ করুন' },
  tableView: { en: 'Table View', bn: 'টেবিল ভিউ' },
  mapView: { en: 'Interactive Map', bn: 'ইন্টারেক্টিভ ম্যাপ' },

  // Status Badges
  statusSubmitted: { en: 'Submitted', bn: 'জমা দেওয়া হয়েছে' },
  statusUnderReview: { en: 'Under Review', bn: 'পর্যালোচনাধীন' },
  statusAssigned: { en: 'Assigned', bn: 'বিভাগে বরাদ্দকৃত' },
  statusInProgress: { en: 'In Progress', bn: 'কাজ চলছে' },
  statusResolved: { en: 'Resolved', bn: 'সমাধান সম্পন্ন' },

  // Severity
  sevCritical: { en: 'Critical', bn: 'জরুরি (Critical)' },
  sevHigh: { en: 'High', bn: 'উচ্চ (High)' },
  sevMedium: { en: 'Medium', bn: 'মাঝারি (Medium)' },
  sevLow: { en: 'Low', bn: 'নিম্ন (Low)' },

  // AI & Resolution
  aiAnalysisTitle: { en: 'AI Intelligence & Diagnostic Rationale', bn: 'এআই বুদ্ধিমত্তা ও ডায়াগনস্টিক যৌক্তিকতা' },
  aiResolutionSuggestions: { en: 'AI Recommended Resolution Action Plan', bn: 'এআই প্রস্তাবিত কার্যবিবরণী ও সমাধান ধাপসমূহ' },
  applySmartDept: { en: 'Assign Suggested Department', bn: 'প্রস্তাবিত বিভাগ বরাদ্দ করুন' },

  // Miscellaneous
  trackingCode: { en: 'Tracking Code', bn: 'ট্র্যাকিং কোড' },
  actions: { en: 'Actions', bn: 'পদক্ষেপ' },
  inspectManage: { en: 'Inspect & Manage', bn: 'পরিদর্শন ও পরিচালনা' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('civicpulse_lang') as Language;
    if (saved === 'en' || saved === 'bn') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('civicpulse_lang', lang);
  };

  const t = (key: string): string => {
    const item = dictionary[key];
    if (!item) return key;
    return item[language] || item.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
