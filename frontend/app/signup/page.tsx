"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addUserCompetency, createUser, listCompetencies, setCurrentUserId } from "../../lib/api";

const fieldClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[#303030] px-3 text-sm text-white outline-none placeholder:text-[var(--muted)]";

const interests = ["Data Analysis", "Statistical Methods", "Survey Methodology", "Data Visualization", "Official Statistics", "Policy Analysis"];

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function handleToggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest]
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const user = await createUser({
        name: fullName.trim() || "Official",
        email: email.trim(),
        department: department.trim() || "General",
        designation: role.trim() || "Officer",
        job_role: role.trim() || "Officer",
        experience_years: 3,
        education: "Graduate",
        career_goal: selectedInterests.length ? selectedInterests.join(", ") : "Civil Service Competency Development",
      });

      if (user?.id) {
        setCurrentUserId(user.id);

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
    } catch {
      // fallback: keep default ID 1
      setCurrentUserId(1);
    } finally {
      setSubmitting(false);
      router.push("/dashboard");
    }
  }

  return (
    <main className="min-h-[100dvh] bg-[var(--background)] px-4 py-10 text-white">
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-6">
          <Link href="/" className="grid h-11 w-11 place-items-center rounded-md border border-[var(--border)] bg-[#1f1f1f] text-sm font-bold text-[var(--teal)]">
            SL
          </Link>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">Create your official learning profile</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Set up role context first, then move into the baseline skill assessment and personalized path.
          </p>
          <div className="mt-6 space-y-3">
            {["Role setup", "Skill assessment", "Competency map"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-md bg-[#303030] p-3 text-sm">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-[#1f1f1f] text-xs text-[var(--teal)]">{index + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-6">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--muted)]">Full name</span>
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
              <span className="mb-2 block text-sm text-[var(--muted)]">Official email</span>
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
              <span className="mb-2 block text-sm text-[var(--muted)]">Employee ID</span>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. GOV-STAT-1042"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--muted)]">Department</span>
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
              <span className="mb-2 block text-sm text-[var(--muted)]">Role / Designation</span>
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
              <span className="mb-2 block text-sm text-[var(--muted)]">Organization</span>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. MoSPI"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--muted)]">Password</span>
              <input type="password" placeholder="Create a secure password" className={fieldClass} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--muted)]">Confirm password</span>
              <input type="password" placeholder="Confirm your password" className={fieldClass} />
            </label>

            <fieldset className="md:col-span-2">
              <legend className="mb-3 text-sm text-[var(--muted)]">Select your areas</legend>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <label key={interest} className="rounded-md border border-[var(--border)] bg-[#303030] px-3 py-2 text-sm text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedInterests.includes(interest)}
                      onChange={() => handleToggleInterest(interest)}
                      className="mr-2 accent-[var(--teal)]"
                    />
                    {interest}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex h-11 w-full items-center justify-center rounded-md bg-[var(--primary)] text-sm font-semibold text-white hover:bg-[#60a5fa] disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--teal)] hover:text-white">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
