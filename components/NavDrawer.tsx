'use client'

import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

export interface NavLinkItem {
  id: string
  label: string
}

interface NavDrawerProps {
  open: boolean
  onClose: () => void
  links: NavLinkItem[]
  activeSection: string
}

export function NavDrawer({ open, onClose, links, activeSection }: NavDrawerProps) {
  const portalTarget = useMemo(() => {
    if (typeof document === 'undefined') return null
    return document.body
  }, [])

  useEffect(() => {
    if (!open) return

    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose, open])

  if (!portalTarget) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black/65 backdrop-blur-xl"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[var(--fg)] transition hover:bg-white/10"
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4L14 14M14 4L4 14" />
            </svg>
          </button>

          <nav aria-label="Mobile section navigation" onClick={(e) => e.stopPropagation()}>
            <ul className="flex flex-col items-center gap-2">
              {links.map((link, i) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                >
                  <a
                    href={`#${link.id}`}
                    onClick={onClose}
                    className={`block rounded-xl px-8 py-3 font-serif text-2xl font-medium transition ${
                      activeSection === link.id
                        ? 'text-[var(--accent)]'
                        : 'text-[var(--muted)] hover:text-[var(--fg)]'
                    }`}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  , portalTarget)
}
