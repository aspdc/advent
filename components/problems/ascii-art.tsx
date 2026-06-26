"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { TOTAL_PROBLEMS } from "@/types/progress"

const ART_LINES = [
  "  ███\\                                           ██\\                 ███\\   ",
  " ██  _|                                          ██ |                \\_██\\  ",
  " ██ |         ██████\\   ███████\\  ██████\\   ███████ | ███████\\         ██ | ",
  "███ |         \\____██\\ ██  _____|██  __██\\ ██  __██ |██  _____|        ███\\ ",
  "\\██ |         ███████ |\\██████\\  ██ /  ██ |██ /  ██ |██ /              ██  |",
  " ██ |        ██  __██ | \\____██\\ ██ |  ██ |██ |  ██ |██ |              ██ / ",
  " \\███\\       \\███████ |███████  |███████  |\\███████ |\\███████\\       ███  | ",
  "  \\___|       \\_______|\\_______/ ██  ____/  \\_______| \\_______|      \\___/  ",
  "                                 ██ |                                       ",
  "                                 ██ |                                       ",
  "                                 \\__|                                       ",
];

const LINE_LENGTH = ART_LINES[0].length

function buildRevealedLines(solvedCount: number): string[] {
  const revealAt = Math.ceil((solvedCount / TOTAL_PROBLEMS) * LINE_LENGTH)

  return ART_LINES.map((line) => {
    let result = ""
    for (let i = 0; i < line.length; i++) {
      if (i < revealAt) {
        result += line[i]
      } else {
        result += line[i] === " " ? " " : "░"
      }
    }
    return result
  })
}

export function AsciiArt() {
  const { data: session, isPending } = useSession()
  const [solvedCount, setSolvedCount] = useState(0)

  useEffect(() => {
    if (!session) return

    async function fetchProgress() {
      try {
        const res = await fetch("/api/user/progress")
        const json = await res.json()
        if (json.success) {
          const items = json.data as { problemId: string }[] | undefined
          if (items) {
            const solved = new Set(items.map((i) => i.problemId))
            setSolvedCount(solved.size)
          }
        }
      } catch {
        // silently fail
      }
    }

    fetchProgress()
  }, [session])

  const lines = buildRevealedLines(solvedCount)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-0">
        {lines.map((line, i) => (
          <pre key={i} className="m-0 leading-none text-foreground">
            <code className="font-mono text-xs">{line}</code>
          </pre>
        ))}
      </div>
    </div>
  )
}
