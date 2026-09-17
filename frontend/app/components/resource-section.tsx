"use client";

import React from "react";
import Link from "next/link";
import { FileIcon, ExternalLinkIcon, DownloadIcon } from "./icons";

const RESOURCES = [
  {
    title: "National Industrial Classification (NIC-2008) Guidelines",
    type: "PDF",
    size: "2.8 MB",
    lang: "English",
    date: "Official Reference",
    division: "Economic Statistics Division",
    desc: "Detailed classification codes for industrial and service establishments used across ASI and economic censuses.",
    href: "/documents",
  },
  {
    title: "Periodic Labour Force Survey (PLFS) Enumeration Manual",
    type: "PDF",
    size: "4.2 MB",
    lang: "Bilingual (EN/HI)",
    date: "Operational Manual",
    division: "National Sample Survey Office",
    desc: "Complete guide for field investigators on household sampling, activity status classification, and CAPI protocols.",
    href: "/documents",
  },
  {
    title: "MoSPI Statistical Quality Assurance Framework (SQAF)",
    type: "PDF",
    size: "1.6 MB",
    lang: "English",
    date: "Governance Standard",
    division: "Standards & Methodology Wing",
    desc: "National benchmarks for relevance, accuracy, timeliness, accessibility, and comparability of official statistics.",
    href: "/documents",
  },
  {
    title: "System of National Accounts (SNA) Conceptual Compendium",
    type: "PDF",
    size: "5.1 MB",
    lang: "English",
    date: "Macro Reference",
    division: "National Accounts Division",
    desc: "Methodological framework for compiling Gross Value Added (GVA), capital formation, and sector supply-use tables.",
    href: "/documents",
  },
  {
    title: "PragatiParikshan Open Competency REST API & Data Schema",
    type: "JSON / OpenAPI",
    size: "450 KB",
    lang: "Technical Spec",
    date: "SIH 2026 Prototype",
    division: "Interoperability Layer",
    desc: "Open API endpoints for competency scoring vectors, officer gap diagnostics, and iGOT course ID webhook sync.",
    href: "/documents",
  },
];

export function ResourceSection() {
  return (
    <section id="resources" className="py-16 border-t border-[var(--border)] bg-[var(--panel-inner)]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)] border border-[var(--primary)]/20">
              <FileIcon className="h-3.5 w-3.5" />
              <span>Official Manuals &amp; Guidelines</span>
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
              Cadre Reference Library &amp; Guidelines
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">
              Authorized documentation, survey manuals, and technical specifications for statistical officers.
            </p>
          </div>
          <Link
            href="/documents"
            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline"
          >
            <span>View All Documents</span>
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)] flex flex-col justify-between hover:border-[var(--primary)]/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 rounded bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-black text-[var(--accent)] border border-[var(--accent)]/30">
                    {item.type}
                  </span>
                  <span className="text-[11px] text-[var(--muted)] font-medium">
                    {item.size} • {item.lang}
                  </span>
                </div>

                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--teal)]">
                  {item.division}
                </div>

                <h3 className="mt-1 text-sm font-bold text-[var(--foreground)] leading-snug">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-[10px] text-[var(--muted)] font-semibold">
                  {item.date}
                </span>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-1.5 text-xs font-bold text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
                >
                  <DownloadIcon className="h-3.5 w-3.5" />
                  <span>Access</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
