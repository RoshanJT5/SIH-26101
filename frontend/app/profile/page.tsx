"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../components/app-shell";
import {
  assignUserRole,
  getCurrentUserId,
  getProgressiveHierarchy,
  getRole,
  getUser,
  ProgressiveHierarchy,
  Role,
  updateUser,
  UserProfile,
} from "../../lib/api";
import { CheckIcon } from "../components/icons";

const fieldClass =
  "h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs sm:text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] transition";

type ProfileForm = {
  name: string;
  email: string;
  mobile: string;
  employee_id: string;
  organization: string;
  department: string;
  ministry: string;
  division_unit: string;
  designation: string;
  job_role: string;
  experience_years: number;
  education: string;
  specialization: string;
  career_goal: string;
};

const emptyForm: ProfileForm = {
  name: "",
  email: "",
  mobile: "",
  employee_id: "",
  organization: "",
  department: "",
  ministry: "",
  division_unit: "",
  designation: "",
  job_role: "",
  experience_years: 3,
  education: "Post Graduate / Masters",
  specialization: "",
  career_goal: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Progressive Hierarchy & Role State
  const [hierarchy, setHierarchy] = useState<ProgressiveHierarchy | null>(null);
  const [selectedMinistry, setSelectedMinistry] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [rolePreview, setRolePreview] = useState<Role | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [user, hier] = await Promise.all([
          getUser(getCurrentUserId()),
          getProgressiveHierarchy().catch(() => null),
        ]);

        if (!active) return;

        setUserProfile(user);
        setForm({
          name: user.name || "",
          email: user.email || "",
          mobile: user.mobile || "",
          employee_id: user.employee_id || "",
          organization: user.organization_name || user.organization || "",
          department: user.department || "",
          ministry: user.ministry || "Ministry of Statistics and Programme Implementation (MoSPI)",
          division_unit: user.division_unit || "",
          designation: user.designation || "",
          job_role: user.role_name || user.job_role || "",
          experience_years: user.experience_years || 3,
          education: user.education || "Post Graduate / Masters",
          specialization: user.specialization || "",
          career_goal: user.career_goal || "",
        });

        if (hier) {
          setHierarchy(hier);
          const initialMin = user.ministry || hier.ministries?.[0] || "";
          setSelectedMinistry(initialMin);

          const depts = (initialMin && hier.departments_by_ministry?.[initialMin]) || [];
          const initialDept = user.department || depts[0] || "";
          setSelectedDepartment(initialDept);

          const orgs = (initialDept && hier.organizations_by_dept?.[initialDept]) || [];
          const initialOrgId = user.organization_id || (orgs[0] ? orgs[0].id : null);
          setSelectedOrgId(initialOrgId);

          const roles = (initialOrgId && hier.roles_by_org?.[initialOrgId]) || [];
          const initialRoleId = user.role_id || (roles[0] ? roles[0].id : null);
          setSelectedRoleId(initialRoleId);

          if (initialRoleId) {
            getRole(initialRoleId)
              .then((r: Role) => {
                if (active) setRolePreview(r);
              })
              .catch(() => {});
          }
        }
      } catch {
        if (active) setError("Unable to load profile information.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  function handleMinistryChange(min: string) {
    setSelectedMinistry(min);
    if (!hierarchy) return;
    const depts = hierarchy.departments_by_ministry[min] || [];
    const firstDept = depts[0] || "";
    setSelectedDepartment(firstDept);

    const orgs = hierarchy.organizations_by_dept[firstDept] || [];
    const firstOrg = orgs[0] ? orgs[0].id : null;
    setSelectedOrgId(firstOrg);

    if (firstOrg) {
      const roles = hierarchy.roles_by_org[firstOrg] || [];
      const firstRole = roles[0] ? roles[0].id : null;
      setSelectedRoleId(firstRole);
      if (firstRole) fetchRolePreview(firstRole);
    }
  }

  function handleDepartmentChange(dept: string) {
    setSelectedDepartment(dept);
    if (!hierarchy) return;
    const orgs = hierarchy.organizations_by_dept[dept] || [];
    const firstOrg = orgs[0] ? orgs[0].id : null;
    setSelectedOrgId(firstOrg);

    if (firstOrg) {
      const roles = hierarchy.roles_by_org[firstOrg] || [];
      const firstRole = roles[0] ? roles[0].id : null;
      setSelectedRoleId(firstRole);
      if (firstRole) fetchRolePreview(firstRole);
    }
  }

  function handleOrgChange(orgId: number) {
    setSelectedOrgId(orgId);
    if (!hierarchy) return;
    const roles = hierarchy.roles_by_org[orgId] || [];
    const firstRole = roles[0] ? roles[0].id : null;
    setSelectedRoleId(firstRole);
    if (firstRole) fetchRolePreview(firstRole);
  }

  function handleRoleChange(roleId: number) {
    setSelectedRoleId(roleId);
    fetchRolePreview(roleId);
  }

  async function fetchRolePreview(roleId: number) {
    try {
      const r = await getRole(roleId);
      setRolePreview(r);
      if (r) {
        setForm((prev) => ({
          ...prev,
          designation: r.role_name,
          job_role: r.role_name,
        }));
      }
    } catch {
      // ignore
    }
  }

  function updateField<K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const userId = getCurrentUserId();
      if (selectedRoleId && selectedRoleId !== userProfile?.role_id) {
        await assignUserRole(userId, selectedOrgId || 1, selectedRoleId, form.designation);
      }

      const updated = await updateUser(userId, {
        ...form,
        ministry: selectedMinistry || form.ministry,
        department: selectedDepartment || form.department,
        division_unit: form.division_unit.trim() || undefined,
        specialization: form.specialization.trim() || undefined,
        role_id: selectedRoleId ?? undefined,
      });

      setUserProfile(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  }

  const deptsAvailable = (hierarchy && selectedMinistry && hierarchy.departments_by_ministry[selectedMinistry]) || [];
  const orgsAvailable = (hierarchy && selectedDepartment && hierarchy.organizations_by_dept[selectedDepartment]) || [];
  const rolesAvailable = (hierarchy && selectedOrgId && hierarchy.roles_by_org[selectedOrgId]) || [];

  return (
    <AppShell
      title="Official Profile & Cadre Alignment"
      subtitle="Institutional hierarchy, professional credentials, and synchronized competency baseline for official statistical capacity building."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Column: Profile Form Sections */}
        <section className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. PERSONAL CREDENTIALS */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6 shadow-[var(--card-shadow)]">
              <div className="mb-4">
                <span className="rounded bg-[var(--panel-soft)] border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] font-bold text-[var(--primary)] uppercase">
                  Personal Information
                </span>
                <h2 className="mt-1 text-base font-bold text-[var(--foreground)]">Official Identity & Account</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Full Name *</span>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Official Email *</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Employee ID / Gov ID</span>
                  <input
                    type="text"
                    value={form.employee_id}
                    onChange={(e) => updateField("employee_id", e.target.value)}
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Mobile Number</span>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => updateField("mobile", e.target.value)}
                    className={fieldClass}
                  />
                </label>
              </div>
            </div>

            {/* 2. ORGANIZATION & CADRE */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6 shadow-[var(--card-shadow)]">
              <div className="mb-4">
                <span className="rounded bg-[var(--primary-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--primary)] uppercase">
                  Organization & Cadre
                </span>
                <h2 className="mt-1 text-base font-bold text-[var(--foreground)]">Institutional Placement</h2>
                <p className="text-xs text-[var(--muted)]">
                  Changing your Role automatically updates your competency requirements while preserving historical diagnostic evaluations.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Ministry</span>
                  <select
                    value={selectedMinistry}
                    onChange={(e) => handleMinistryChange(e.target.value)}
                    className={fieldClass}
                  >
                    {hierarchy?.ministries?.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Department</span>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className={fieldClass}
                  >
                    {deptsAvailable.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Organization</span>
                  <select
                    value={selectedOrgId ?? ""}
                    onChange={(e) => handleOrgChange(Number(e.target.value))}
                    className={fieldClass}
                  >
                    {orgsAvailable.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Division / Unit</span>
                  <input
                    type="text"
                    value={form.division_unit}
                    onChange={(e) => updateField("division_unit", e.target.value)}
                    placeholder="e.g. Sampling Design Cell"
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Role / Job Function</span>
                  <select
                    value={selectedRoleId ?? ""}
                    onChange={(e) => handleRoleChange(Number(e.target.value))}
                    className={`${fieldClass} font-semibold text-[var(--primary)]`}
                  >
                    {rolesAvailable.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.role_name || r.name} {r.service_cadre ? `(${r.service_cadre})` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Designation</span>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={(e) => updateField("designation", e.target.value)}
                    className={fieldClass}
                  />
                </label>
              </div>
            </div>

            {/* 3. PROFESSIONAL PROFILE */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6 shadow-[var(--card-shadow)]">
              <div className="mb-4">
                <span className="rounded bg-[var(--panel-soft)] border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] font-bold text-[var(--foreground)] uppercase">
                  Professional Profile
                </span>
                <h2 className="mt-1 text-base font-bold text-[var(--foreground)]">Qualifications & Specialization</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Years of Experience</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={form.experience_years}
                    onChange={(e) => updateField("experience_years", parseInt(e.target.value, 10) || 0)}
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Highest Qualification</span>
                  <input
                    type="text"
                    value={form.education}
                    onChange={(e) => updateField("education", e.target.value)}
                    placeholder="e.g. M.Sc. Statistics / B.Tech Data Science"
                    className={fieldClass}
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Specialization / Field</span>
                  <input
                    type="text"
                    value={form.specialization}
                    onChange={(e) => updateField("specialization", e.target.value)}
                    placeholder="e.g. National Accounts, Survey Sampling, Microdata Wrangling"
                    className={fieldClass}
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Career Goal / Capacity Target</span>
                  <input
                    type="text"
                    value={form.career_goal}
                    onChange={(e) => updateField("career_goal", e.target.value)}
                    placeholder="e.g. Lead National Accounts GVA Estimation or Chief Survey Statistician"
                    className={fieldClass}
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <div aria-live="polite" className="text-xs">
                  {error && <span className="text-red-500 font-semibold">{error}</span>}
                  {saved && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckIcon className="h-4 w-4" /> Profile & Cadre Alignment Updated Successfully.
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 rounded-lg bg-[var(--primary)] px-6 text-xs font-bold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-60 shadow-xs"
                >
                  {saving ? "Saving Changes..." : "Save Profile & Role Alignment"}
                </button>
              </div>
            </div>
          </form>

          {/* 4. COMPETENCY STATUS MATRIX */}
          {userProfile?.competencies && userProfile.competencies.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6 shadow-[var(--card-shadow)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)]">Competency Assessment Status</h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Self-reported baselines vs. AI-validated diagnostic scores
                  </p>
                </div>
                <button
                  onClick={() => router.push("/assessments")}
                  className="h-8 rounded-md bg-[var(--primary-soft)] border border-[var(--primary)]/20 px-3 text-xs font-bold text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition"
                >
                  Take Diagnostic →
                </button>
              </div>

              <div className="rounded-lg border border-[var(--border)] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--panel-soft)] text-[var(--muted)] uppercase border-b border-[var(--border)] font-semibold">
                    <tr>
                      <th className="px-3.5 py-2.5">Competency</th>
                      <th className="px-3 py-2.5 text-center">Current Level</th>
                      <th className="px-3 py-2.5 text-center">Validation Status</th>
                      <th className="px-3 py-2.5 text-center">Confidence</th>
                      <th className="px-3 py-2.5 text-right">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {userProfile.competencies.map((c) => (
                      <tr key={c.id} className="hover:bg-[var(--panel-soft)] transition">
                        <td className="px-3.5 py-2.5 font-medium text-[var(--foreground)]">
                          {c.competency_name}
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold text-[var(--foreground)]">
                          {c.current_level > 0 ? `Level ${c.current_level}/5` : "Pending Assessment"}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.assessment_source === "VALIDATED_ASSESSMENT" || c.confidence >= 0.9
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                                : c.assessment_source === "SELF_REPORTED"
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                                : "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30"
                            }`}
                          >
                            {c.assessment_source === "VALIDATED_ASSESSMENT" || c.confidence >= 0.9
                              ? "Validated"
                              : c.assessment_source === "SELF_REPORTED"
                              ? "Self-Reported"
                              : "Diagnostic Required"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center font-semibold text-[var(--muted)]">
                          {Math.round((c.confidence || 0) * 100)}%
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-[var(--muted)]">
                          {c.assessment_source || "Baseline"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Live Role Competency Requirements Preview */}
        <aside>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)] sticky top-6">
            <div className="mb-3">
              <span className="rounded bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--primary)] uppercase">
                Role Requirement Baseline
              </span>
              <h3 className="mt-1 text-sm font-bold text-[var(--foreground)]">
                {rolePreview?.role_name || form.designation || "Official Role Baseline"}
              </h3>
              {rolePreview?.service_cadre && (
                <div className="text-xs text-[var(--muted)]">Cadre: {rolePreview.service_cadre}</div>
              )}
            </div>

            {rolePreview?.responsibilities && (
              <p className="text-xs text-[var(--muted)] mb-4 leading-relaxed bg-[var(--panel-soft)] p-2.5 rounded-lg border border-[var(--border-subtle)] whitespace-pre-line">
                {rolePreview.responsibilities}
              </p>
            )}

            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
              Mandated Competency Requirements
            </h4>

            {rolePreview?.competencies && rolePreview.competencies.length > 0 ? (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {rolePreview.competencies.map((comp) => (
                  <div
                    key={comp.competency_id}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-soft)] p-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-[var(--foreground)] leading-tight">{comp.competency_name}</span>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black ${
                          comp.importance === "CRITICAL"
                            ? "bg-red-500/15 text-red-700 dark:text-red-300"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {comp.importance}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--muted)]">
                      <span>{comp.category}</span>
                      <span className="font-bold text-[var(--primary)]">Required: Level {comp.required_level}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[var(--muted)] py-4 text-center">
                Select a role to preview mandated competency requirements.
              </div>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
