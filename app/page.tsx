import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AsciiArt } from "@/components/problems/ascii-art"

export default function Page() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10">

      <div className="w-full max-w-md scale-120">
        <AsciiArt />
      </div>

        <Button asChild className="mt-4 animate-pulse">
          <Link href="/dashboard">Start Solving</Link>
        </Button>
    </div>
  )
}
