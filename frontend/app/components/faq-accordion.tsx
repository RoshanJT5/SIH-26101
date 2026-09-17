"use client";

import React, { useState } from "react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "What is the PragatiParikshan platform?",
    answer: "PragatiParikshan is an intelligent capacity-building and competency diagnosis prototype developed for the Smart India Hackathon (SIH 2026). It benchmarks statistical officers and analysts against MoSPI cadre competency standards and generates personalized, evidence-driven learning trajectories aligned with the iGOT Karmayogi ecosystem.",
  },
  {
    id: "faq-2",
    question: "How does the automated competency diagnosis work?",
    answer: "Officers complete standardized, role-specific diagnostic assessments across key domains (statistical inference, survey sampling, macroeconomic accounting, price indices, and data visualization). The platform calculates mastery percentages, compares scores to cadre benchmark targets, and flags priority competency gaps.",
  },
  {
    id: "faq-3",
    question: "How does the integration with iGOT Karmayogi operate?",
    answer: "Our engine maps diagnosed competency gaps to accredited Mission Karmayogi Bharat course modules. Officers receive direct recommendations for accredited learning units, enabling focused capacity building without manual course discovery. Planned phases include single sign-on and credential ledger synchronisation.",
  },
  {
    id: "faq-4",
    question: "Is this an official Government of India or MoSPI website?",
    answer: "No. PragatiParikshan is a demonstration hackathon prototype developed for Smart India Hackathon (Problem Statement: SIH26101). It is not an official Government of India portal and does not claim official ministry or iGOT ownership. It is designed to demonstrate how public-sector capacity building can be modernized.",
  },
  {
    id: "faq-5",
    question: "How is officer privacy and assessment data protected?",
    answer: "Assessment results and profile information are strictly used for individualized diagnostic feedback and aggregated capability analytics. The platform follows privacy-by-design principles, does not sell or share personal data, and complies with national digital governance data protection guidelines.",
  },
  {
    id: "faq-6",
    question: "Is the platform accessible on mobile devices and screen readers?",
    answer: "Yes. The platform adheres to UX4G guidelines and WCAG 2.1 AA standards. It features fully responsive layouts for smartphones and tablets, text scaling controls (A-, A, A+), high-contrast focus indicators, keyboard-accessible navigation, and screen reader semantic markup.",
  },
];

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-16 border-t border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 rounded bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)] border border-[var(--primary)]/20">
            Frequently Asked Questions
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
            Common Questions About the Platform
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[var(--muted)]">
            Everything you need to know about the competency framework, diagnostics, and iGOT integration.
          </p>
        </div>

        <div className="space-y-3" role="region" aria-label="Frequently Asked Questions Accordion">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xs transition-colors overflow-hidden"
              >
                <button
                  type="button"
                  id={`btn-${faq.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`content-${faq.id}`}
                  onClick={() => toggle(faq.id)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm sm:text-base font-bold text-[var(--foreground)] hover:bg-[var(--panel-soft)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                >
                  <span>{faq.question}</span>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--panel-inner)] text-[var(--primary)] text-base font-bold transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  >
                    ↓
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={`content-${faq.id}`}
                    role="region"
                    aria-labelledby={`btn-${faq.id}`}
                    className="border-t border-[var(--border-subtle)] bg-[var(--panel-inner)] p-5 text-xs sm:text-sm leading-relaxed text-[var(--muted)]"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
