"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProblemsTab } from "@/components/admin/problems-tab"
import { UsersTab } from "@/components/admin/users-tab"
import { SubmissionsTab } from "@/components/admin/submissions-tab"

export default function AdminPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-10">
      <h1 className="font-mono text-xl font-semibold tracking-wide">Admin Dashboard</h1>

      <Tabs defaultValue="problems">
        <TabsList>
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>
        <TabsContent value="problems">
          <ProblemsTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="submissions">
          <SubmissionsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
