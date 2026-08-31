"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "../components/theme-toggle";
import { addUserCompetency, createUser, getAuthSession, listCompetencies, setAuthSession } from "../../lib/api";

const fieldClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)]";

const interests = ["Data Analysis", "Statistical Methods", "Survey Methodology", "Data Visualization", "Official Statistics", "Policy Analysis"];

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getAuthSession()) router.replace("/dashboard");
  }, [router]);

  function handleToggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest]
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    let created = false;

    try {
      const user = await createUser({
        name: fullName.trim() || "Official",
        email: email.trim(),
        password,
        mobile: mobile.trim() || undefined,
        employee_id: employeeId.trim() || undefined,
        organization: organization.trim() || undefined,
        department: department.trim() || "General",
        designation: role.trim() || "Officer",
        job_role: role.trim() || "Officer",
        experience_years: 3,
        education: "Graduate",
        career_goal: selectedInterests.length ? selectedInterests.join(", ") : "Civil Service Competency Development",
      });

      if (user?.id) {
        created = true;
        setAuthSession({ userId: user.id, user });

        try {
          const comps = await listCompetencies();
          if (comps?.length) {
            for (const interest of selectedInterests) {
              const match = comps.find(
                (c) =>
                  c.name.toLowerCase().includes(interest.toLowerCase()) ||
                  interest.toLowerCase().includes(c.name.toLowerCase())
              );
              if (match) {
                await addUserCompetency(user.id, {
                  competency_id: match.id,
                  current_level: 2,
                  required_level: 5,
                });
              }
            }
          }
        } catch {
          // ignore competency seed errors
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to create your account.");
    } finally {
      setSubmitting(false);
      if (created) router.push("/dashboard");
    }
  }

  return (
    <main className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between transition-colors duration-200">
      {/* Subtle National Accent Strip */}
      <div className="gov-tricolor-strip w-full" aria-hidden="true" />

      {/* Top Header */}
      <header className="border-b border-[var(--border)] bg-[var(--header)] text-[var(--header-text)] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-md border border-[var(--border)] bg-[var(--panel-inner)] text-xs font-bold text-[var(--teal)]">
              SL
            </div>
            <span className="text-sm font-bold text-white">StatLearn AI</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Form Container */}
      <div className="mx-auto w-full max-w-5xl px-4 py-8 flex-1">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--card-shadow)] flex flex-col justify-between">
            <div>
              <div className="grid h-11 w-11 place-items-center rounded-md border border-[var(--border)] bg-[var(--panel-inner)] text-sm font-bold text-[var(--teal)]">
                SL
              </div>
              <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                Create your official learning profile
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Set up role context first, then move into the baseline skill assessment and personalized path.
              </p>
              <div className="mt-6 space-y-3">
                {["Role setup", "Skill assessment", "Competency map"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-md bg-[var(--panel-soft)] border border-[var(--border-subtle)] p-3 text-sm font-medium text-[var(--foreground)]">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--primary-soft)] text-xs font-bold text-[var(--teal)]">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--muted)]">
              Ministry of Statistics and Programme Implementation (MoSPI)
            </div>
          </section>

          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--card-shadow)]">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[var(--muted)]">Full name</span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[var(--muted)]">Official email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rajesh.kumar@gov.in"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[var(--muted)]">Mobile number</span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[var(--muted)]">Employee ID</span>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. GOV-STAT-1042"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[var(--muted)]">Department</span>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Survey Division"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[var(--muted)]">Role / Designation</span>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Statistical Officer"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[var(--muted)]">Organization</span>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. MoSPI"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[var(--muted)]">Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[var(--muted)]">Confirm password</span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className={fieldClass}
                />
              </label>

              <fieldset className="md:col-span-2">
                <legend className="mb-2 block text-sm font-semibold text-[var(--muted)]">Select your areas</legend>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <label key={interest} className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-medium text-[var(--foreground)] cursor-pointer hover:border-[var(--primary)] transition">
                      <input
                        type="checkbox"
                        checked={selectedInterests.includes(interest)}
                        onChange={() => handleToggleInterest(interest)}
                        className="accent-[var(--primary)]"
                      />
                      {interest}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="md:col-span-2 mt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-11 w-full items-center justify-center rounded-md bg-[var(--primary)] text-sm font-semibold text-white hover:bg-[var(--primary-hover)] transition disabled:opacity-60 shadow-xs"
                >
                  {submitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--muted)]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[var(--teal)] hover:underline">
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--header)] py-4 text-center text-[11px] text-slate-400">
        © 2026 Government of India • Ministry of Statistics and Programme Implementation
      </footer>
    </main>
  );
}
