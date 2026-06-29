"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/client-fetch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface UserItem {
  id: string
  name: string
  email: string
  role: string | null
  banned: boolean | null
  banReason: string | null
  score: number
  createdAt: string
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export function UsersTab() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bannedLoading, setBannedLoading] = useState(false)
  const [loadTrigger, setLoadTrigger] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.set("search", search)

    apiFetch<PaginatedResponse<UserItem>>(`/api/admin/users?${params}`).then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        setError(error)
        setLoading(false)
        return
      }
      if (data) {
        setUsers(data.items)
        setTotal(data.total)
        setPage(data.page)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTrigger])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setPage(1)
    setLoading(true)
    setLoadTrigger((n) => n + 1)
  }, [])

  const handleSearchInput = useCallback((value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      setLoading(true)
      setLoadTrigger((n) => n + 1)
    }, 300)
  }, [])

  const toggleBan = useCallback(async (id: string) => {
    setBannedLoading(true)
    const { data, error } = await apiFetch<{ id: string; banned: boolean }>(
      `/api/admin/users/${id}/ban`,
      { method: "PUT" },
    )
    setBannedLoading(false)

    if (error) {
      toast.error(error)
      return
    }
    if (data) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, banned: data.banned } : u)),
      )
      toast.success(data.banned ? "User banned" : "User unbanned")
    }
  }, [])

  const totalPages = Math.ceil(total / limit)

  if (loading && users.length === 0) {
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
        <Button variant="outline" onClick={() => { setLoading(true); setError(null); setLoadTrigger((n) => n + 1) }}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => handleSearchInput(e.target.value)}
          className="max-w-xs"
          disabled={loading}
        />
        <Button type="submit" variant="secondary" disabled={loading}>
          Search
        </Button>
      </form>

      <div className="relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-mono">Name</TableHead>
              <TableHead className="font-mono">Email</TableHead>
              <TableHead className="font-mono w-16">Score</TableHead>
              <TableHead className="font-mono w-16">Banned</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono">{u.name}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="font-mono">{u.score}</TableCell>
                  <TableCell className="font-mono">
                    {u.banned ? (
                      <span className="text-destructive">Yes</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={u.banned ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => toggleBan(u.id)}
                      disabled={bannedLoading}
                    >
                      {u.banned ? "Unban" : "Ban"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {loading && users.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50">
            <p className="animate-pulse text-sm text-muted-foreground">Loading...</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
        <span>{total} user{total !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading || page <= 1}
            onClick={() => { setPage((p) => p - 1); setLoading(true); setLoadTrigger((n) => n + 1) }}
          >
            Prev
          </Button>
          <span>{page} / {totalPages || 1}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={loading || page >= totalPages}
            onClick={() => { setPage((p) => p + 1); setLoading(true); setLoadTrigger((n) => n + 1) }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
