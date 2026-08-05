export function Marquee({ items }: { items: string[] }) {
  const line = [...items, ...items, ...items, ...items]
  return (
    <div className="marq" aria-hidden="true">
      <div className="marq-track">
        {[0, 1].map((dup) => (
          <span key={dup} className="inline-flex items-center gap-6">
            {line.map((it, i) => (
              <span key={`${dup}-${i}`} className="inline-flex items-center gap-6">
                {it}
                <span className="star">✳</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}
