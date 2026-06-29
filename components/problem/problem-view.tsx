"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { apiFetch } from "@/lib/client-fetch"
import { sanitize } from "@/lib/sanitize"
import type { ProblemData, ValidateData } from "@/types/problem"

function ProblemHTML({ html }: { html: string }) {
  return (
    <div
      className="prose prose-xl prose-invert max-w-none text-justify
        prose-headings:text-foreground prose-headings:tracking-wide
        prose-p:text-foreground/85
        prose-strong:text-foreground
        prose-code:text-foreground prose-code:bg-muted/60 prose-code:px-1 prose-code:font-mono
        prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border
        prose-li:text-foreground/85
        prose-a:text-primary"
      dangerouslySetInnerHTML={{ __html: sanitize(html) }}
    />
  )
}

function ProblemSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-5 bg-muted rounded w-3/4" />
      <div className="h-5 bg-muted rounded w-1/2" />
      <div className="h-5 bg-muted rounded w-2/3" />
      <div className="h-32 bg-muted rounded w-full mt-2" />
      <div className="h-5 bg-muted rounded w-1/3 mt-2" />
    </div>
  )
}

interface ProblemViewProps {
  problemId: number
}

export function ProblemView({ problemId }: ProblemViewProps) {
  const router = useRouter()
  const [problem, setProblem] = useState<ProblemData | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [isSolved, setIsSolved] = useState(false)
  const [nextProblemId, setNextProblemId] = useState<number | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [answer, setAnswer] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [loadKey, setLoadKey] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    function prevent(e: Event) {
      e.preventDefault()
      e.stopPropagation()
    }

    el.addEventListener("copy", prevent)
    el.addEventListener("cut", prevent)
    el.addEventListener("contextmenu", prevent)
    el.addEventListener("selectstart", prevent)

    return () => {
      el.removeEventListener("copy", prevent)
      el.removeEventListener("cut", prevent)
      el.removeEventListener("contextmenu", prevent)
      el.removeEventListener("selectstart", prevent)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data, error } = await apiFetch<ProblemData>(
        "/api/problem/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problemId }),
        },
      )

      if (cancelled) return

      if (error) {
        setGenerateError(error)
        toast.error(error)
        setIsGenerating(false)
        return
      }

      if (!data) {
        setIsGenerating(false)
        return
      }

      setProblem(data)
      if (data.isSolved) {
        setIsSolved(true)
        if (data.nextProblemId) setNextProblemId(data.nextProblemId)
      }
      setIsGenerating(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [problemId, loadKey])

  function handleRetry() {
    setIsGenerating(true)
    setGenerateError(null)
    setLoadKey((k) => k + 1)
  }

  const handleSubmit = useCallback(async () => {
    setIsValidating(true)

    const { data, error } = await apiFetch<ValidateData>(
      "/api/problem/validate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, answer }),
      },
    )

    setIsValidating(false)

    if (error) {
      toast.error(error)
      return
    }

    if (!data) return

    if (data.nextProblemId !== undefined) {
      setNextProblemId(data.nextProblemId)
    }

    if (data.isCorrect === undefined && data.nextProblemId !== undefined) {
      toast.success("Already solved!")
      setIsSolved(true)
      return
    }

    if (data.isCorrect) {
      toast.success("Correct!")
      setIsSolved(true)
      setShowDialog(true)
    } else {
      toast.error("Incorrect, try again")
    }
  }, [problemId, answer])

  if (isGenerating) return <ProblemSkeleton />

  if (generateError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-sm text-destructive">Failed to load problem</p>
        <Button variant="outline" onClick={handleRetry}>
          Retry
        </Button>
      </div>
    )
  }

  if (!problem) return null

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div ref={contentRef} className="flex flex-col gap-4 select-none">
        {problem.before && <ProblemHTML html={problem.before} />}
        <ProblemHTML html={problem.statement} />
        {problem.example && <ProblemHTML html={problem.example} />}
      </div>

      {isSolved ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary/5 border border-primary/30 rounded-full px-8 py-3 shadow-lg">
          {nextProblemId ? (
            <Button
              variant="ghost"
              className="text-primary font-mono tracking-wide text-center h-auto px-0 py-0"
              onClick={() => router.push(`/problem/${nextProblemId}`)}
            >
              Next &rarr; Problem {nextProblemId}
            </Button>
          ) : (
            <p className="text-primary font-mono tracking-wide text-center">
              Solved!
            </p>
          )}
        </div>
      ) : (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-xl bg-card border border-border rounded-full px-3 py-2 shadow-xl focus-within:ring-1 focus-within:ring-ring">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isValidating}
              placeholder="Enter your answer"
              className="flex-1 border-0 bg-transparent px-2 py-1.5 text-base shadow-none focus-visible:ring-0"
            />
            <Button
              type="submit"
              className="rounded-full shrink-0 px-4"
              disabled={isValidating || !answer.trim()}
            >
              {isValidating ? "Checking\u2026" : "Submit"}
            </Button>
          </form>
        </div>
      )}

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Problem Solved!</AlertDialogTitle>
          </AlertDialogHeader>
          {problem.after && (
            <div className="text-xs/relaxed text-balance text-muted-foreground">
              <ProblemHTML html={problem.after} />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                router.push(nextProblemId ? `/problem/${nextProblemId}` : "/dashboard")
              }}
            >
              {nextProblemId
                ? `Next → Problem ${nextProblemId}`
                : "Back to Dashboard"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
