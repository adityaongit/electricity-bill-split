"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronDown } from "lucide-react"

interface FaqItem {
  question: string
  answer: string
}

function FaqAccordionItem({ faq }: { faq: FaqItem }) {
  const [isOpen, setIsOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  const updateHeight = useCallback(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [])

  useEffect(() => {
    updateHeight()
    window.addEventListener("resize", updateHeight)
    return () => window.removeEventListener("resize", updateHeight)
  }, [updateHeight])

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between p-5 sm:p-6 font-semibold text-left transition-colors hover:bg-muted/50 select-none"
      >
        <span className="pr-8">{faq.question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className="overflow-hidden transition-[height] duration-300 ease-out"
        style={{ height: isOpen ? height : 0 }}
      >
        <div ref={contentRef} className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
          <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {faq.answer}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <FaqAccordionItem key={i} faq={faq} />
      ))}
    </div>
  )
}
