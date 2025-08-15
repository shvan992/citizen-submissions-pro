"use client"

import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Submission, Attachment } from "@/app/page"
import { useI18n, typeKeys, type TypeKey } from "./i18n-provider"
import { X, ImageIcon, FileText, Paperclip, UploadCloud, ChevronDown } from 'lucide-react'
import { cn } from "@/lib/utils"

interface SubmissionFormProps {
  onSubmit: (submission: Omit<Submission, "id" | "status" | "createdAt">) => void
}

const MAX_FILES = 5
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

function isImage(mime: string) {
  return mime.startsWith("image/")
}

export default function SubmissionForm({ onSubmit }: SubmissionFormProps) {
  const { t, locale } = useI18n()
  const { toast } = useToast()
  const forceLtrForm = locale === "ckb" || locale === "ar"
  const [formData, setFormData] = useState({
    type: "" as TypeKey | "",
    subject: "",
    name: "",
    mobile: "",
    address: "",
    description: "",
    reason: "",
    projectKind: "",
  })
  const [showProjectKind, setShowProjectKind] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previews = useMemo(() => {
    return files.map((f) => ({
      file: f,
      isImage: isImage(f.type),
      url: URL.createObjectURL(f),
    }))
  }, [files])

  const handleFilesSelect = (list: FileList | null) => {
    if (!list) return
    const incoming = Array.from(list)

    const next: File[] = []
    for (const f of incoming) {
      if (f.size > MAX_SIZE) {
        toast({
          title: t("common.error"),
          description: `${f.name} > 10MB`,
          variant: "destructive",
        })
        continue
      }
      next.push(f)
    }

    const combined = [...files, ...next].slice(0, MAX_FILES)
    if (combined.length > MAX_FILES) {
      toast({
        title: t("common.error"),
        description: `Max ${MAX_FILES} files`,
        variant: "destructive",
      })
    }
    setFiles(combined)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFilesSelect(e.dataTransfer.files)
  }

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const uploadViaApi = async (toUpload: File[]): Promise<Attachment[]> => {
    const fd = new FormData()
    toUpload.forEach((f) => fd.append("files", f))
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    if (!res.ok) throw new Error("upload failed")
    const data = await res.json()
    return (data.files || []) as Attachment[]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.type ||
      !formData.subject.trim() ||
      !formData.name ||
      !formData.mobile ||
      !formData.address ||
      !formData.description
    ) {
      toast({
        title: t("common.error"),
        description: t("form.requiredNote") || "",
        variant: "destructive",
      })
      return
    }
    if (formData.type === "request" && !formData.reason.trim()) {
      toast({
        title: t("common.error"),
        description: t("form.reason"),
        variant: "destructive",
      })
      return
    }

    let attachments: Attachment[] = []
    try {
      if (files.length > 0) {
        attachments = await uploadViaApi(files)
      }
    } catch {
      attachments = files.map((f) => ({
        name: f.name,
        type: f.type,
        size: f.size,
        url: URL.createObjectURL(f),
      }))
    }

    const payload: Omit<Submission, "id" | "status" | "createdAt"> = {
      type: formData.type as TypeKey,
      subject: formData.subject,
      name: formData.name,
      mobile: formData.mobile,
      address: formData.address,
      description: formData.description,
      reason: formData.type === "request" ? formData.reason : undefined,
      projectKind: formData.type === "project" && formData.projectKind ? formData.projectKind : undefined,
      attachments,
    }

    onSubmit(payload)

    setFormData({
      type: "",
      subject: "",
      name: "",
      mobile: "",
      address: "",
      description: "",
      reason: "",
      projectKind: "",
    })
    setFiles([])

    toast({ title: t("common.success") })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isProject = formData.type === "project"

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir={forceLtrForm ? "ltr" : undefined}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="type">{t("form.requestType")}</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => {
              handleInputChange("type", value)
              if (value !== "project") {
                setShowProjectKind(false)
                handleInputChange("projectKind", "")
              }
            }}
          >
            <SelectTrigger className="focus:ring-emerald-600">
              <SelectValue placeholder={t("form.placeholders.type")} />
            </SelectTrigger>
            <SelectContent>
              {typeKeys.map((key) => (
                <SelectItem key={key} value={key}>
                  {t(`types.${key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Subject directly under Request Type */}
          <div className="mt-3 space-y-2">
            <Label htmlFor="subject">{t("form.subject")}</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              placeholder={t("form.placeholders.subject")}
              className="focus-visible:ring-emerald-600"
              required
            />
          </div>

          {isProject && (
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProjectKind((s) => !s)}
                className="w-full justify-between border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                {t("form.projectTypeButton")}
                <ChevronDown className="h-4 w-4" />
              </Button>

              {showProjectKind && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="projectKind">{t("form.projectTypeLabel")}</Label>
                  <Select
                    value={formData.projectKind}
                    onValueChange={(v) => handleInputChange("projectKind", v)}
                  >
                    <SelectTrigger id="projectKind" className="focus:ring-emerald-600">
                      <SelectValue placeholder={t("form.projectTypePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software">{t("form.projectTypeOptions.software")}</SelectItem>
                      <SelectItem value="construction">{t("form.projectTypeOptions.construction")}</SelectItem>
                      <SelectItem value="community">{t("form.projectTypeOptions.community")}</SelectItem>
                      <SelectItem value="other">{t("form.projectTypeOptions.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="spacey-2 space-y-2">
          <Label htmlFor="name">{t("form.fullName")}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder={t("form.placeholders.name")}
            className="focus-visible:ring-emerald-600"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile">{t("form.mobile")}</Label>
          <Input
            id="mobile"
            type="tel"
            value={formData.mobile}
            onChange={(e) => handleInputChange("mobile", e.target.value)}
            placeholder={t("form.placeholders.mobile")}
            className="focus-visible:ring-emerald-600"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">{t("form.address")}</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder={t("form.placeholders.address")}
            className="focus-visible:ring-emerald-600"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("form.description")}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder={t("form.placeholders.description")}
          className="min-h-[120px] focus-visible:ring-emerald-600"
          required
        />
      </div>

      {formData.type === "request" && (
        <div className="space-y-2">
          <Label htmlFor="reason">{t("form.reason")}</Label>
          <Input
            id="reason"
            value={formData.reason}
            onChange={(e) => handleInputChange("reason", e.target.value)}
            placeholder={t("form.placeholders.reason")}
            className="focus-visible:ring-emerald-600"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>{t("form.attachments")}</Label>
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed p-6 transition",
            dragOver ? "border-emerald-600 bg-emerald-50/60" : "border-emerald-200 hover:bg-emerald-50/40"
          )}
        >
          <UploadCloud className="h-6 w-6 text-emerald-600" />
          <p className="text-sm text-gray-700">
            {t("form.addFiles") || "Add files"}
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Paperclip className="mr-2 h-4 w-4" />
              {t("form.addFiles") || "Add files"}
            </Button>
            <span className="text-xs text-gray-500">{t("form.filesHelp")}</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,application/zip"
            className="sr-only"
            onChange={(e) => handleFilesSelect(e.target.files)}
          />
        </div>

        {previews.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {previews.map((p, idx) => (
              <div key={idx} className="relative rounded border p-2">
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute -top-2 -right-2 rounded-full bg-emerald-700 p-1 text-white shadow"
                  aria-label="Remove file"
                >
                  <X className="h-3 w-3" />
                </button>
                {p.isImage ? (
                  <img
                    src={p.url || "/placeholder.svg?height=160&width=240&query=attachment%20preview%20image"}
                    alt={p.file.name}
                    className="h-28 w-full rounded object-cover"
                  />
                ) : (
                  <div className="flex h-28 items-center justify-center">
                    <div className="flex flex-col items-center text-gray-600">
                      <FileText className="mb-1 h-6 w-6" />
                      <span className="line-clamp-2 text-center text-xs">{p.file.name}</span>
                    </div>
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  {p.isImage ? <ImageIcon className="h-3 w-3 text-emerald-600" /> : <Paperclip className="h-3 w-3 text-emerald-600" />}
                  <span className="truncate">{p.file.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700">
        {t("form.submit")}
      </Button>
    </form>
  )
}
