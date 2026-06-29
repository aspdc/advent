"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { apiFetch } from "@/lib/client-fetch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SubmissionItem {
  id: number
  problemId: string
  userId: string
  userName: string
  submittedValue: string
  submittedAt: string
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

type SortDir = "asc" | "desc"
type SortBy = "problemId" | "submittedValue" | "submittedAt"

export function SubmissionsTab() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadTrigger, setLoadTrigger] = useState(0)
  const [sortBy, setSortBy] = useState<SortBy>("submittedAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortBy,
      sortDir,
    })
    if (search) params.set("search", search)

    apiFetch<PaginatedResponse<SubmissionItem>>(
      `/api/admin/submissions?${params}`
    ).then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        setError(error)
        setLoading(false)
        return
      }
      if (data) {
        setSubmissions(data.items)
        setTotal(data.total)
        setPage(data.page)
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTrigger, sortBy, sortDir])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setPage(1)
    setLoadTrigger((n) => n + 1)
  }, [])

  const handleSearchInput = useCallback((value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      setLoadTrigger((n) => n + 1)
    }, 300)
  }, [])

  function toggleSort(column: SortBy) {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(column)
      setSortDir("asc")
    }
    setPage(1)
  }

  function sortIcon(column: SortBy) {
    if (sortBy !== column)
      return <span className="ml-1 text-muted-foreground/30">&#8597;</span>
    return (
      <span className="ml-1 text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>
    )
  }

  const totalPages = Math.ceil(total / limit)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="animate-pulse text-sm text-muted-foreground">
          Loading...
        </p>
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

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search by user name, problem, or answer..."
          value={search}
          onChange={(e) => handleSearchInput(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer font-mono select-none"
              onClick={() => toggleSort("problemId")}
            >
              Problem {sortIcon("problemId")}
            </TableHead>
            <TableHead className="font-mono">User</TableHead>
            <TableHead
              className="cursor-pointer font-mono select-none"
              onClick={() => toggleSort("submittedValue")}
            >
              Answer {sortIcon("submittedValue")}
            </TableHead>
            <TableHead
              className="cursor-pointer font-mono select-none"
              onClick={() => toggleSort("submittedAt")}
            >
              Submitted {sortIcon("submittedAt")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-8 text-center text-muted-foreground"
              >
                No submissions found
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono">{s.problemId}</TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  {s.userName ?? s.userId}
                </TableCell>
                <TableCell
                  className="max-w-37.5 truncate font-mono"
                  title={s.submittedValue}
                >
                  {s.submittedValue}
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  {s.submittedAt
                    ? new Date(s.submittedAt).toLocaleString()
                    : "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span>
          {total} submission{total !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              setPage((p) => p - 1)
              setLoadTrigger((n) => n + 1)
            }}
          >
            Prev
          </Button>
          <span>
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => {
              setPage((p) => p + 1)
              setLoadTrigger((n) => n + 1)
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
