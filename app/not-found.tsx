import Link from "next/link"

export default function NotFound() {
  return (
    <div className="relative flex flex-col flex-1 items-center justify-center gap-6 py-16 px-6 overflow-hidden text-center">
      <div className="flex items-center gap-1 font-mono font-bold leading-none text-foreground tracking-tighter text-8xl">
        <span>4</span>
        <span className="text-primary">0</span>
        <span>4</span>
      </div>

      <h1 className="font-mono text-base font-normal tracking-widest uppercase text-muted-foreground m-0">
        Page Not Found
      </h1>

      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed m-0">
        This puzzle piece doesn&apos;t exist — or maybe you&apos;re not{" "}
        <span className="text-primary font-mono">authenticated</span> yet.
      </p>

      <div className="flex items-center gap-4 flex-wrap justify-center mt-2">
        <Link
          href="/"
          className="font-mono text-xs text-primary-foreground bg-primary no-underline px-5 py-2 rounded-sm border border-transparent transition-opacity duration-150 hover:opacity-85 tracking-wider"
        >
          ← Return Home
        </Link>
        <Link
          href="/login"
          className="font-mono text-xs text-muted-foreground no-underline px-5 py-2 rounded-sm border border-border transition-colors duration-150 hover:text-foreground hover:border-foreground tracking-wider"
        >
          [Login]
        </Link>
      </div>
    </div>
  )
}
