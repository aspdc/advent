import Link from "next/link"

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-code">
        <span className="not-found-star">*</span>
        <span>4</span>
        <span className="not-found-star">0</span>
        <span>4</span>
        <span className="not-found-star">*</span>
      </div>

      <h1 className="not-found-title">Page Not Found</h1>

      <p className="not-found-desc">
        This puzzle piece doesn&apos;t exist — or maybe you&apos;re not{" "}
        <span className="not-found-accent">authenticated</span> yet.
      </p>

      <div className="not-found-actions">
        <Link href="/" className="not-found-btn-primary">
          ← Return Home
        </Link>
        <Link href="/login" className="not-found-btn-secondary">
          [Login]
        </Link>
      </div>

      <div className="not-found-grid" aria-hidden="true">
        {Array.from({ length: 80 }).map((_, i) => (
          <span
            key={i}
            className="not-found-dot"
            style={{ animationDelay: `${(i * 0.05) % 2}s` }}
          >
            ·
          </span>
        ))}
      </div>
    </div>
  )
}
