"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Search, Phone, MapPin, Calendar, User, FileText, ExternalLink } from 'lucide-react'
import type { Submission } from "@/app/page"
import { useI18n, statusKeys, typeKeys } from "./i18n-provider"

interface SubmissionsListProps {
  submissions: Submission[]
  onUpdateStatus: (id: string, status: Submission["status"]) => void
}

function isImage(mime: string) {
  return mime.startsWith("image/")
}

export default function SubmissionsList({ submissions, onUpdateStatus }: SubmissionsListProps) {
  const { t, intl } = useI18n()
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesType = filterType === "all" || submission.type === filterType
    const matchesStatus = filterStatus === "all" || submission.status === filterStatus
    const q = searchTerm.toLowerCase()
    const matchesSearch =
      searchTerm === "" ||
      submission.subject.toLowerCase().includes(q) ||
      submission.name.toLowerCase().includes(q) ||
      submission.description.toLowerCase().includes(q) ||
      (submission.reason?.toLowerCase().includes(q) ?? false)

    return matchesType && matchesStatus && matchesSearch
  })

  const getStatusColor = (status: Submission["status"]) => {
    switch (status) {
      case "pending":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200"
      case "in-progress":
        return "bg-lime-50 text-lime-700 border border-lime-200"
      case "resolved":
        return "bg-green-100 text-green-800 border border-green-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: Submission["type"]) => {
    switch (type) {
      case "complaint":
        return "bg-rose-100 text-rose-800"
      case "suggestion":
        return "bg-emerald-100 text-emerald-800"
      case "project":
        return "bg-green-100 text-green-800"
      case "request":
        return "bg-lime-100 text-lime-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-t-4 border-emerald-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <Search className="h-5 w-5" />
            {t("filters.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("form.placeholders.search")}</Label>
              <Input
                placeholder={t("form.placeholders.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus-visible:ring-emerald-600"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("filters.type")}</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="focus:ring-emerald-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                  {typeKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(`types.${key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("filters.status")}</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="focus:ring-emerald-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                  {statusKeys.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`status.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        {t("list.showing", { count: filteredSubmissions.length, total: submissions.length })}
      </div>

      {/* Submissions List */}
      <div className="grid gap-4">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-lg text-gray-500">{t("list.noResultsTitle")}</p>
                <p className="mt-1 text-sm text-gray-400">{t("list.noResultsHint")}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getTypeColor(submission.type)}>{t(`types.${submission.type}`)}</Badge>
                      <Badge className={getStatusColor(submission.status)}>{t(`status.${submission.status}`)}</Badge>
                    </div>
                    <div className="font-semibold text-gray-900">{submission.subject}</div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-emerald-700" />
                        {new Intl.DateTimeFormat(intl).format(submission.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-emerald-700" />
                        {submission.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={submission.status} onValueChange={(value) => onUpdateStatus(submission.id, value as Submission["status"])}>
                      <SelectTrigger className="w-40 focus:ring-emerald-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusKeys.map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`status.${s}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <p className="text-gray-700">{submission.description}</p>

                  {submission.type === "request" && submission.reason && (
                    <div className="rounded bg-emerald-50 p-3 text-sm text-emerald-800">
                      <span className="font-medium">{t("form.reason")}:</span> <span>{submission.reason}</span>
                    </div>
                  )}

                  {submission.type === "project" && submission.projectKind && (
                    <div className="rounded bg-emerald-50 p-3 text-sm text-emerald-800">
                      <span className="font-medium">{t("form.projectTypeLabel")}:</span>{" "}
                      <span>
                        {(() => {
                          const map: Record<string, string> = {
                            software: t("form.projectTypeOptions.software"),
                            construction: t("form.projectTypeOptions.construction"),
                            community: t("form.projectTypeOptions.community"),
                            other: t("form.projectTypeOptions.other"),
                          }
                          return map[submission.projectKind as keyof typeof map] ?? submission.projectKind
                        })()}
                      </span>
                    </div>
                  )}

                  {submission.attachments && submission.attachments.length > 0 && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {submission.attachments.map((att, i) => (
                          <div key={i} className="overflow-hidden rounded border hover:border-emerald-300">
                            {isImage(att.type) ? (
                              <a href={att.url} target="_blank" rel="noopener noreferrer" className="block">
                                <img
                                  src={att.url || "/placeholder.svg?height=200&width=300&query=attachment%20image"}
                                  alt={att.name}
                                  className="h-40 w-full object-cover"
                                />
                              </a>
                            ) : (
                              <div className="flex items-center gap-3 p-3">
                                <FileText className="h-5 w-5 text-emerald-600" />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm text-gray-800">{att.name}</p>
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Open
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-700" />
                      <span>{submission.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-700" />
                      <span>{submission.address}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
