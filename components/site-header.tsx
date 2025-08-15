"use client"

import Image from "next/image"
import LanguageSwitcher from "@/components/language-switcher"
import { useI18n } from "@/components/i18n-provider"

export default function SiteHeader() {
  const { t, dir } = useI18n()

  return (
    <header className="mb-8" dir={dir}>
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow">
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative px-6 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-white p-1 shadow">
                <Image
                  src="/images/puk-logo.png"
                  alt="PUK logo"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold leading-tight md:text-3xl">
                  {t("common.appTitle")}
                </h1>
                <p className="text-emerald-50/90">{t("common.appSubtitle")}</p>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs text-white">
                  <span className="font-semibold">Sulaimanyah Headquarter</span>
                  <span aria-hidden="true">•</span>
                  <span>مەڵبەندی سلێمانی</span>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
