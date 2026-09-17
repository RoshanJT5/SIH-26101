"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLinkIcon } from "./icons";

export function InstitutionalFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--header)] text-slate-100">
      {/* Top Footer Navigation Columns */}
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 text-xs">
          {/* Column 1: Project Identity & Vision */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-md bg-white p-0.5 shadow-xs">
                <Image
                  src="/pragati-parikshan-logo.jpeg"
                  alt="PragatiParikshan Logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <span className="text-base font-black text-white">PragatiParikshan</span>
                <span className="block text-[11px] text-amber-300 font-semibold">
                  National Statistical Competency &amp; Intelligence Platform
                </span>
              </div>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
              An evidence-driven competency assessment, skill gap mapping, and capacity-building prototype developed for Smart India Hackathon (SIH 2026) in alignment with Mission Karmayogi Bharat.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 rounded bg-white/10 px-2.5 py-1 text-[10px] font-bold text-amber-300 border border-white/10">
                <span>Problem Statement: SIH26101 • MoSPI Challenge</span>
              </span>
            </div>
          </div>

          {/* Column 2: Platform Modules */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Platform Services
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              <li>
                <Link href="/dashboard" className="hover:text-white hover:underline transition">
                  Officer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/assessments" className="hover:text-white hover:underline transition">
                  Diagnostic Assessments
                </Link>
              </li>
              <li>
                <Link href="/skill-gaps" className="hover:text-white hover:underline transition">
                  Competency Gap Matrix
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-white hover:underline transition">
                  iGOT Course Catalog
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="hover:text-white hover:underline transition">
                  Learning Roadmap
                </Link>
              </li>
              <li>
                <Link href="/ai-tutor" className="hover:text-white hover:underline transition">
                  Statistical AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Ecosystem & Guidelines */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Ecosystem References
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              <li>
                <a
                  href="https://igotkarmayogi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white hover:underline transition"
                >
                  <span>iGOT Karmayogi Bharat</span>
                  <ExternalLinkIcon className="h-3 w-3 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.sih.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white hover:underline transition"
                >
                  <span>Smart India Hackathon</span>
                  <ExternalLinkIcon className="h-3 w-3 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.digitalindia.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white hover:underline transition"
                >
                  <span>Digital India Initiative</span>
                  <ExternalLinkIcon className="h-3 w-3 opacity-70" />
                </a>
              </li>
              <li>
                <Link href="/documents" className="hover:text-white hover:underline transition">
                  MoSPI Statistical Manuals
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-white hover:underline transition">
                  REST API Specification
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Public Policies */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Policies &amp; Compliance
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              <li>
                <Link href="/privacy" className="hover:text-white hover:underline transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white hover:underline transition">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-white hover:underline transition">
                  Accessibility Statement
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="hover:text-white hover:underline transition">
                  Copyright Policy
                </Link>
              </li>
              <li>
                <Link href="/hyperlink-policy" className="hover:text-white hover:underline transition">
                  Hyperlinking Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer and Metadata Bar */}
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-slate-400 space-y-2">
          <div className="text-[11px] font-semibold text-slate-200">
            Smart India Hackathon 2026 Prototype • Academic &amp; Demonstration Platform
          </div>
          <p className="text-[10px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
            This portal is an independent prototype built for the Smart India Hackathon and does not claim official Government of India or Ministry ownership. Design architecture inspired by iGOT Karmayogi and UX4G accessibility principles.
          </p>
          <div className="text-[10px] text-slate-400">
            Last Updated: September 2026 • WCAG 2.1 AA Compliant • Secure HTTPS Architecture
          </div>
        </div>
      </div>
    </footer>
  );
}
