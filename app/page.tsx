"use client"

import { useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SubmissionForm from "@/components/submission-form"
import SubmissionsList from "@/components/submissions-list"
import SiteHeader from "@/components/site-header"
import { I18nProvider, useI18n, type StatusKey, type TypeKey } from "@/components/i18n-provider"

export interface Attachment {
  name: string
  type: string
  size: number
  url: string
}

export interface Submission {
  id: string
  type: TypeKey
  subject: string
  name: string
  mobile: string
  address: string
  description: string
  // Only for "request"
  reason?: string
  // Only for "project"
  projectKind?: string
  attachments?: Attachment[]
  status: StatusKey
  createdAt: Date
}

function HomeInner() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const { t, dir } = useI18n()

  const addSubmission = (submission: Omit<Submission, "id" | "status" | "createdAt">) => {
    const newSubmission: Submission = {
      ...submission,
      id: Date.now().toString(),
      status: "pending",
      createdAt: new Date(),
    }
    setSubmissions(prev => [newSubmission, ...prev])
  }

  const updateSubmissionStatus = (id: string, status: Submission["status"]) => {
    setSubmissions(prev =>
      prev.map(submission =>
        submission.id === id ? { ...submission, status } : submission
      )
    )
  }

  const manageTabText = useMemo(() => {
    return `${t("common.manageTab")} (${submissions.length})`
  }, [submissions.length, t])

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir={dir}>
      <div className="mx-auto max-w-6xl">
        <SiteHeader />

        <Tabs defaultValue="submit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-emerald-50">
            <TabsTrigger
              value="submit"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {t("common.submitTab")}
            </TabsTrigger>
            <TabsTrigger
              value="manage"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {manageTabText}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="mt-6">
            <Card className="border-t-4 border-emerald-500">
              <CardHeader>
                <CardTitle className="text-emerald-700">{t("common.submitTab")}</CardTitle>
                <CardDescription>{t("common.appSubtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                <SubmissionForm onSubmit={addSubmission} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="mt-6">
            <SubmissionsList
              submissions={submissions}
              onUpdateStatus={updateSubmissionStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <I18nProvider defaultLocale="ckb">
      <HomeInner />
    </I18nProvider>
  )
}
