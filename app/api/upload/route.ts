import { NextResponse } from "next/server"

// Do NOT add `runtime = 'edge'` when using uploads.

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const files = form.getAll("files")

    if (!files || files.length === 0) {
      return NextResponse.json({ files: [] })
    }

    // Try to upload to Vercel Blob if configured.
    // Requires setting BLOB_READ_WRITE_TOKEN in your Project Settings on Vercel.
    // If not configured, this will throw and the client will fall back to in-memory URLs.
    const uploaded: { name: string; type: string; size: number; url: string }[] = []

    // Import inside handler to avoid bundling when not used.
    const { put } = await import("@vercel/blob")

    for (const item of files) {
      if (!(item instanceof File)) continue
      const file = item as File
      const objectName = `submissions/${Date.now()}-${file.name}`
      const blob = await put(objectName, file, { access: "public" } as any)
      uploaded.push({
        name: file.name,
        type: file.type,
        size: file.size,
        url: blob.url,
      })
    }

    return NextResponse.json({ files: uploaded })
  } catch (err) {
    // Upload not configured or failed; tell client to fallback.
    return new NextResponse(JSON.stringify({ error: "Upload not configured" }), { status: 500 })
  }
}
