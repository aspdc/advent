"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/client-fetch"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ProblemItem {
  id: string
  isActive: boolean
}

export function ProblemsTab() {
  const [problems, setProblems] = useState<ProblemItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)
  const [loadTrigger, setLoadTrigger] = useState(0)

  useEffect(() => {
    let cancelled = false
    apiFetch<ProblemItem[]>("/api/admin/problems").then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        setError(error)
        setLoading(false)
        return
      }
      if (data) setProblems(data)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [loadTrigger])

  const toggle = useCallback(async (id: string) => {
    setToggling(true)
    const { data, error } = await apiFetch<ProblemItem>(
      `/api/admin/problems/${id}`,
      { method: "PUT" },
    )
    setToggling(false)

    if (error) {
      toast.error(error)
      return
    }
    if (data) {
      setProblems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: data.isActive } : p)),
      )
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-sm text-destructive">{error}</p>
        <Button
          variant="outline"
          onClick={() => {
            setLoading(true)
            setError(null)
            setLoadTrigger((n) => n + 1)
          }}
        >
          Retry
        </Button>
      </div>
    )
  }

  const activeCount = problems.filter((p) => p.isActive).length

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground font-mono">
        {activeCount} / {problems.length} active
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 font-mono">#</TableHead>
            <TableHead className="font-mono">Status</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-muted-foreground">{p.id}</TableCell>
              <TableCell className="font-mono">
                <span className={p.isActive ? "text-primary" : "text-muted-foreground"}>
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>
                <Switch
                  checked={p.isActive}
                  onCheckedChange={() => toggle(p.id)}
                  disabled={toggling}
                  size="sm"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
