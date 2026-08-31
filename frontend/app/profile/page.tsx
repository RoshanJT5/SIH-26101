"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../components/app-shell";
import { getCurrentUserId, getUser, updateUser, UserProfile } from "../../lib/api";

const fieldClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)]";

type ProfileForm = {
  name: string;
  email: string;
  mobile: string;
  employee_id: string;
  organization: string;
  department: string;
  designation: string;
  job_role: string;
  education: string;
  career_goal: string;
};

const emptyForm: ProfileForm = {
  name: "",
  email: "",
  mobile: "",
  employee_id: "",
  organization: "",
  department: "",
  designation: "",
  job_role: "",
  education: "",
  career_goal: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    getUser(getCurrentUserId())
      .then((user: UserProfile) => {
        if (!active) return;
        setForm({
          name: user.name || "",
          email: user.email || "",
          mobile: user.mobile || "",
          employee_id: user.employee_id || "",
          organization: user.organization || "",
          department: user.department || "",
          designation: user.designation || "",
          job_role: user.job_role || "",
          education: user.education || "",
          career_goal: user.career_goal || "",
        });
      })
      .catch(() => {
        if (active) setError("Unable to load your profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      await updateUser(getCurrentUserId(), {
        ...form,
        mobile: form.mobile.trim() || undefined,
        employee_id: form.employee_id.trim() || undefined,
        organization: form.organization.trim() || undefined,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  }

  const fields: { key: keyof ProfileForm; label: string; type?: string }[] = [
    { key: "name", label: "Full name" },
    { key: "email", label: "Official email", type: "email" },
    { key: "mobile", label: "Mobile number", type: "tel" },
    { key: "employee_id", label: "Employee ID" },
    { key: "organization", label: "Organization" },
    { key: "department", label: "Department" },
    { key: "designation", label: "Designation" },
    { key: "job_role", label: "Job role" },
    { key: "education", label: "Education" },
    { key: "career_goal", label: "Career goal" },
  ];

  return (
    <AppShell title="Edit Profile" subtitle="Keep your official learning profile up to date.">
      <section className="max-w-3xl rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6">
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading profile...</p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            {fields.map(({ key, label, type = "text" }) => (
              <label key={key} className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[var(--muted)]">{label}</span>
                <input
                  required={key === "name" || key === "email"}
                  type={type}
                  value={form[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                  className={fieldClass}
                />
              </label>
            ))}
            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
              <div aria-live="polite" className="text-sm">
                {error && <span className="text-[var(--red)]">{error}</span>}
                {saved && <span className="text-[var(--green)]">Profile updated.</span>}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="h-11 rounded-md border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 rounded-md bg-[var(--primary)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </form>
        )}
      </section>
    </AppShell>
  );
}
