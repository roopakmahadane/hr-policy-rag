"use client"

import { useState } from "react"

const API = "https://web-production-2ee08.up.railway.app"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState("")
  const [uploading, setUploading] = useState(false)

  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [sources, setSources] = useState<string[]>([])
  const [asking, setAsking] = useState(false)

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setUploadStatus("")
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch(`${API}/upload`, { method: "POST", body: form })
      const data = await res.json()
      if (data.error) {
        setUploadStatus(`Error: ${data.error}`)
      } else {
        setUploadStatus(`✓ ${data.filename} uploaded — ${data.pages} pages, ${data.chunks} chunks`)
      }
    } catch (e) {
      setUploadStatus(`Error: ${(e as Error).message}`)
    } finally {
      setUploading(false)
    }
  }

  async function handleAsk() {
    if (!question.trim()) return
    setAsking(true)
    setAnswer("")
    setSources([])
    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      if (data.error) {
        setAnswer(`Error: ${data.error}`)
      } else {
        setAnswer(data.answer)
        setSources(data.sources ?? [])
      }
    } catch (e) {
      setAnswer(`Error: ${(e as Error).message}`)
    } finally {
      setAsking(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">HR Policy Assistant</h1>

        {/* Upload */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Upload PDF</h2>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
          {uploadStatus && (
            <p className={`text-sm ${uploadStatus.startsWith("Error") ? "text-red-600" : "text-green-700"}`}>
              {uploadStatus}
            </p>
          )}
        </section>

        {/* Ask */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Ask a Question</h2>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="e.g. How many annual leave days do employees get?"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAsk}
            disabled={!question.trim() || asking}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {asking ? "Asking…" : "Ask"}
          </button>
        </section>

        {/* Answer */}
        {answer && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">Answer</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{answer}</p>
          </section>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Sources</h2>
            <ul className="space-y-2">
              {sources.map((src, i) => (
                <li key={i} className="text-xs text-gray-600 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                  {src}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
