"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n, type AppLocale } from "./i18n-provider"

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n()

  return (
    <div className={className}>
      <Select value={locale} onValueChange={(v) => setLocale(v as AppLocale)}>
        <SelectTrigger className="w-[240px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ckb">کوردی (سۆرانی)</SelectItem>
          <SelectItem value="kmr">Kurdî (Badînî)</SelectItem>
          <SelectItem value="ar">العربية</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
