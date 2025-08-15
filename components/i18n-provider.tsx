"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

export type AppLocale = "ckb" | "kmr" | "ar" | "en"

export const typeKeys = ["complaint", "suggestion", "project", "request"] as const
export type TypeKey = typeof typeKeys[number]

export const statusKeys = ["pending", "in-progress", "resolved"] as const
export type StatusKey = typeof statusKeys[number]

type Dict = {
  common: {
    appTitle: string
    appSubtitle: string
    submitTab: string
    manageTab: string
    success: string
    error: string
  }
  form: {
    requestType: string
    subject: string
    fullName: string
    mobile: string
    address: string
    description: string
    reason: string
    submit: string
    projectTypeButton: string
    projectTypeLabel: string
    projectTypePlaceholder: string
    projectTypeOptions: {
      software: string
      construction: string
      community: string
      other: string
    }
    placeholders: {
      type: string
      subject: string
      name: string
      mobile: string
      address: string
      description: string
      reason: string
      search: string
    }
    requiredNote?: string
    attachments: string
    addFiles?: string
    filesHelp?: string
  }
  filters: {
    title: string
    type: string
    status: string
    allTypes: string
    allStatus: string
  }
  list: {
    showing: string
    noResultsTitle: string
    noResultsHint: string
  }
  labels: {
    date: string
    person: string
    phone: string
    location: string
  }
  types: Record<TypeKey, string>
  status: Record<StatusKey, string>
}

const dictionaries: Record<AppLocale, Dict> = {
  // Kurdish Sorani (RTL)
  ckb: {
    common: {
      appTitle: "مەڵبەندی سلێمانی",
      appSubtitle: "ناردن و بەڕێوەبردنی شکایەت، پێشنیار، پڕۆژە و داواکان",
      submitTab: "ناردنی داوا",
      manageTab: "بەڕێوەبردنی داواکان",
      success: "داواکەت بەسەرکەوتوویی تۆمار کرا",
      error: "تکایە هەموو خانە پێویستەکان پڕبکەوە",
    },
    form: {
      requestType: "جۆری داوا *",
      subject: "بابەت *",
      fullName: "ناوی تەواو *",
      mobile: "ژمارەی مۆبایل *",
      address: "ناونیشان *",
      description: "پێناسە *",
      reason: "هۆکاری بینین *",
      submit: "ناردنی داوا",
      projectTypeButton: "جۆری پڕۆژە",
      projectTypeLabel: "جۆری پڕۆژە",
      projectTypePlaceholder: "جۆرێکی پڕۆژە هەڵبژێرە",
      projectTypeOptions: {
        software: "نەرمەکاڵا",
        construction: "بیناسازی",
        community: "کۆمەڵایەتی",
        other: "هیتر",
      },
      placeholders: {
        type: "جۆری داوا هەڵبژێرە",
        subject: "بابەت بنووسە",
        name: "ناوی تەواوت بنووسە",
        mobile: "ژمارەی مۆبایلت بنووسە",
        address: "ناونیشانت بنووسە",
        description: "وردەکارییەکان بنووسە...",
        reason: "هۆکاری بینین بنووسە",
        search: "بگەڕێ بە ناو یان پێناسە...",
      },
      requiredNote: " * خانە پێویستەکانن",
      attachments: "فایل و وێنەکان",
      addFiles: "پەڕگەکان هەڵبژێرە",
      filesHelp:
        "وێنە یان پەڕگە بنێرە (PDF, DOCX, XLSX, ZIP). سنوور: 10MB بۆ هەر پەڕگە، تا 5 پەڕگە",
    },
    filters: {
      title: "پاڵاوتنی داواکان",
      type: "جۆر",
      status: "دۆخ",
      allTypes: "هەموو جۆرەکان",
      allStatus: "هەموو دۆخەکان",
    },
    list: {
      showing: "نیشاندان {count} لە {total} داواکاری",
      noResultsTitle: "هیچ داوایەک نەدۆزرایەوە",
      noResultsHint: "تکایە پاڵاوتەکان دەستکاری بکە",
    },
    labels: {
      date: "ڕێکەوت",
      person: "ناو",
      phone: "مۆبایل",
      location: "ناونیشان",
    },
    types: {
      complaint: "شکایت",
      suggestion: "پێشنیار",
      project: "پڕۆژە",
      request: "داوا",
    },
    status: {
      pending: "لە چاوەڕوانیدا",
      "in-progress": "لە جێبەجێکردندایە",
      resolved: "چارەسەر کرا",
    },
  },

  // Kurdish Badini / Kurmanji (LTR)
  kmr: {
    common: {
      appTitle: "Serokatiya Silêmanî",
      appSubtitle:
        "Nermijandina û rêveberiya şikên, pêşnîyaran, projeyan û daxwazan",
      submitTab: "Daxwazê bişîne",
      manageTab: "Nermijandan birêve bike",
      success: "Daxwaza te bi serkeftî tomarkirî ye",
      error: "Ji kerema xwe hemû qadên pêwîst tije bike",
    },
    form: {
      requestType: "Cureya daxwazê *",
      subject: "Mijar *",
      fullName: "Nav û paşnav *",
      mobile: "Hejmara telefonê *",
      address: "Navnîşan *",
      description: "Rave *",
      reason: "Sedema serdanê *",
      submit: "Daxwazê bişîne",
      projectTypeButton: "Cureya proje",
      projectTypeLabel: "Cureya projeyê",
      projectTypePlaceholder: "Cureyek hilbijêre",
      projectTypeOptions: {
        software: "Nermalav",
        construction: "Avakirina/binasazî",
        community: "Civakî",
        other: "Yên din",
      },
      placeholders: {
        type: "Cureyê daxwazê hilbijêre",
        subject: "Mijar binivîse",
        name: "Nav û paşnav binivîse",
        mobile: "Hejmara telefonê binivîse",
        address: "Navnîşan binivîse",
        description: "Agahdariya berfireh binivîse...",
        reason: "Sedema serdanê binivîse",
        search: "Li gorî nav an jî rave bigere...",
      },
      requiredNote: " * qadan pêwîst in",
      attachments: "Pel û wêne",
      addFiles: "Pelan hilbijêre",
      filesHelp:
        "Wêne an pel bar bike (PDF, DOCX, XLSX, ZIP). Sînordar: 10MB/pele, heta 5 pel",
    },
    filters: {
      title: "Fîltreya nermijandan",
      type: "Cure",
      status: "Rewş",
      allTypes: "Hemû cureyan",
      allStatus: "Hemû rewşan",
    },
    list: {
      showing: "Dîtandina {count} ji {total} nermijandan",
      noResultsTitle: "Tu nermijandek nehat dîtin",
      noResultsHint: "Ji kerema xwe fîltreyan mîheng bike",
    },
    labels: {
      date: "Dîrok",
      person: "Kes",
      phone: "Telefon",
      location: "Navnîşan",
    },
    types: {
      complaint: "Şikayet",
      suggestion: "Pêşnîyar",
      project: "Proje",
      request: "Daxwaz",
    },
    status: {
      pending: "Li benda",
      "in-progress": "Di pêvajoyê de",
      resolved: "Çareser bû",
    },
  },

  // Arabic (RTL)
  ar: {
    common: {
      appTitle: "المقر الرئيسي في السليمانية",
      appSubtitle: "إرسال وإدارة الشكاوى والمقترحات والمشاريع والطلبات",
      submitTab: "إرسال الطلب",
      manageTab: "إدارة الطلبات",
      success: "تم حفظ طلبك بنجاح",
      error: "الرجاء تعبئة جميع الحقول المطلوبة",
    },
    form: {
      requestType: "نوع الطلب *",
      subject: "الموضوع *",
      fullName: "الاسم الكامل *",
      mobile: "رقم الهاتف *",
      address: "العنوان *",
      description: "الوصف *",
      reason: "سبب المراجعة *",
      submit: "إرسال الطلب",
      projectTypeButton: "نوع المشروع",
      projectTypeLabel: "نوع المشروع",
      projectTypePlaceholder: "اختر نوع المشروع",
      projectTypeOptions: {
        software: "برمجيات",
        construction: "إنشاءات",
        community: "مجتمعي",
        other: "أخرى",
      },
      placeholders: {
        type: "اختر نوع الطلب",
        subject: "أدخل الموضوع",
        name: "أدخل اسمك الكامل",
        mobile: "أدخل رقم هاتفك",
        address: "أدخل عنوانك",
        description: "يرجى إدخال تفاصيل الطلب...",
        reason: "أدخل سبب المراجعة",
        search: "ابحث بالاسم أو الوصف...",
      },
      requiredNote: " * حقول مطلوبة",
      attachments: "الملفات والمرفقات",
      addFiles: "اختر الملفات",
      filesHelp:
        "ارفع صورًا أو مستندات (PDF, DOCX, XLSX, ZIP). الحد: 10MB لكل ملف، حتى 5 ملفات",
    },
    filters: {
      title: "تصفية الطلبات",
      type: "النوع",
      status: "الحالة",
      allTypes: "جميع الأنواع",
      allStatus: "جميع الحالات",
    },
    list: {
      showing: "عرض {count} من {total} طلبًا",
      noResultsTitle: "لا توجد طلبات",
      noResultsHint: "جرّب تعديل عوامل التصفية",
    },
    labels: {
      date: "التاريخ",
      person: "الاسم",
      phone: "الهاتف",
      location: "العنوان",
    },
    types: {
      complaint: "شكوى",
      suggestion: "اقتراح",
      project: "مشروع",
      request: "طلب",
    },
    status: {
      pending: "قيد الانتظار",
      "in-progress": "قيد التنفيذ",
      resolved: "تم الحل",
    },
  },

  // English (LTR)
  en: {
    common: {
      appTitle: "Sulaimanyah Headquarter",
      appSubtitle: "Submit and manage complaints, suggestions, projects, and requests",
      submitTab: "Submit",
      manageTab: "Manage",
      success: "Your submission has been saved",
      error: "Please fill in all required fields",
    },
    form: {
      requestType: "Request Type *",
      subject: "Subject *",
      fullName: "Full Name *",
      mobile: "Mobile Number *",
      address: "Address *",
      description: "Description *",
      reason: "Reason for visit *",
      submit: "Submit",
      projectTypeButton: "Project Type",
      projectTypeLabel: "Project Type",
      projectTypePlaceholder: "Select a project type",
      projectTypeOptions: {
        software: "Software",
        construction: "Construction",
        community: "Community",
        other: "Other",
      },
      placeholders: {
        type: "Select request type",
        subject: "Enter subject",
        name: "Enter your full name",
        mobile: "Enter your mobile number",
        address: "Enter your address",
        description: "Enter details...",
        reason: "Enter reason for visit",
        search: "Search by name or description...",
      },
      requiredNote: "* Required fields",
      attachments: "Files and attachments",
      addFiles: "Choose files",
      filesHelp: "Upload images or documents (PDF, DOCX, XLSX, ZIP). Limit: 10MB per file, up to 5 files",
    },
    filters: {
      title: "Filter submissions",
      type: "Type",
      status: "Status",
      allTypes: "All types",
      allStatus: "All statuses",
    },
    list: {
      showing: "Showing {count} of {total} submissions",
      noResultsTitle: "No submissions found",
      noResultsHint: "Try adjusting the filters",
    },
    labels: {
      date: "Date",
      person: "Name",
      phone: "Phone",
      location: "Address",
    },
    types: {
      complaint: "Complaint",
      suggestion: "Suggestion",
      project: "Project",
      request: "Request",
    },
    status: {
      pending: "Pending",
      "in-progress": "In progress",
      resolved: "Resolved",
    },
  },
}

const localeMeta: Record<AppLocale, { dir: "rtl" | "ltr"; intl: string }> = {
  ckb: { dir: "rtl", intl: "ckb-IQ" },
  kmr: { dir: "ltr", intl: "ku" },
  ar: { dir: "rtl", intl: "ar-IQ" },
  en: { dir: "ltr", intl: "en-US" },
}

type I18nContextType = {
  locale: AppLocale
  dir: "rtl" | "ltr"
  intl: string
  setLocale: (l: AppLocale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const STORAGE_KEY = "complaints-app:locale"

export function I18nProvider({
  children,
  defaultLocale = "ckb",
}: {
  children: React.ReactNode
  defaultLocale?: AppLocale
}) {
  const [locale, setLocaleState] = useState<AppLocale>(defaultLocale)

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as AppLocale | null) : null
    if (saved && dictionaries[saved]) setLocaleState(saved)
  }, [])

  const setLocale = (l: AppLocale) => {
    setLocaleState(l)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, l)
    }
  }

  const value = useMemo<I18nContextType>(() => {
    const { dir, intl } = localeMeta[locale]
    const dict = dictionaries[locale]

    const t = (key: string, params?: Record<string, string | number>) => {
      const parts = key.split(".")
      let cur: any = dict
      for (const p of parts) {
        if (cur && p in cur) cur = cur[p]
        else return key
      }
      let str = String(cur)
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replaceAll(`{${k}}`, String(v))
        }
      }
      return str
    }

    return { locale, dir, intl, setLocale, t }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}

export const i18nDictionaries = dictionaries
export const i18nMeta = localeMeta
