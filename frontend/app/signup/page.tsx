"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "../components/theme-toggle";
import {
  ApiErrorDetail,
  Competency,
  ProgressiveHierarchy,
  RoleCompetencyRequirement,
  UserOnboardingPayload,
  fetchCompetencies,
  fetchProgressiveHierarchy,
  getAuthSession,
  normalizeApiError,
  registerOnboardingUser,
  setAuthSession,
} from "../../lib/api";

const fieldClass =
  "h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-200";

const selectClass =
  "h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-200 cursor-pointer";

interface SelectedSkillState {
  competencyId: number;
  name: string;
  category: string;
  currentLevel: number; // 1 to 5, or 0 for 'Assess me'
  notSureAssess: boolean;
}

const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  STATISTICAL: "Statistical Domain",
  TECHNICAL: "Technical & Tools",
  DIGITAL_GOVERNANCE: "Digital Governance & Law",
  BEHAVIOURAL_MANAGERIAL: "Behavioural & Management",
  DOMAIN_SPECIFIC: "Domain Specific",
  BEHAVIORAL: "Behavioural & Management",
  GOVERNANCE: "Digital Governance",
};

const LEVEL_NAMES = [
  "Not Set",
  "L1 Foundational",
  "L2 Working",
  "L3 Proficient",
  "L4 Advanced",
  "L5 Expert",
];

export default function SignUpPage() {
  const router = useRouter();

  // Current onboarding step: 1 = Role Setup, 2 = Current Skills, 3 = Competency Map
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Hierarchy & Competency Data
  const [hierarchy, setHierarchy] = useState<ProgressiveHierarchy | null>(null);
  const [allCompetencies, setAllCompetencies] = useState<Competency[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Step 1: Personal & Account
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 1: Professional & Organization Cascading
  const [selectedMinistry, setSelectedMinistry] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<number | "">("");
  const [divisionUnit, setDivisionUnit] = useState("");
  const [designation, setDesignation] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [education, setEducation] = useState("Post Graduate / Masters (Statistics/Maths/Economics)");
  const [specialization, setSpecialization] = useState("");

  // Step 2: Selected Skills
  const [selectedSkills, setSelectedSkills] = useState<Record<number, SelectedSkillState>>({});
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("ALL");
  const [skillSearch, setSkillSearch] = useState("");

  // Step 3 & Submission & Error States
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<ApiErrorDetail | null>(null);
  const [generalError, setGeneralError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [employeeIdError, setEmployeeIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [createdProfile, setCreatedProfile] = useState<{
    id: number;
    name: string;
    roleName: string;
    orgName: string;
    expectedCount: number;
    declaredCount: number;
    assessmentRequiredCount: number;
    firstGapTopic?: string;
  } | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (getAuthSession()) {
      router.replace("/dashboard");
    }
  }, [router]);

  // Load backend progressive hierarchy and competencies
  useEffect(() => {
    async function loadInitData() {
      try {
        setLoadingData(true);
        const [hierData, compsData] = await Promise.all([
          fetchProgressiveHierarchy().catch(() => null),
          fetchCompetencies().catch(() => []),
        ]);

        if (hierData) {
          setHierarchy(hierData);
          if (hierData.ministries && hierData.ministries.length > 0) {
            const defaultMin = hierData.ministries[0];
            setSelectedMinistry(defaultMin);

            const depts = hierData.departments_by_ministry?.[defaultMin] || [];
            if (depts.length > 0) {
              setSelectedDepartment(depts[0]);
              const orgs = hierData.organizations_by_dept?.[depts[0]] || [];
              if (orgs.length > 0) {
                setSelectedOrgId(orgs[0].id);
                const roles = hierData.roles_by_org?.[orgs[0].id] || [];
                if (roles.length > 0) {
                  setSelectedRoleId(roles[0].id);
                  setDesignation(roles[0].role_name);
                }
              }
            }
          }
        }

        if (compsData && compsData.length > 0) {
          setAllCompetencies(compsData);
        }
      } catch (err) {
        console.error("Failed to load onboarding hierarchy/competencies:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadInitData();
  }, []);

  // Cascading options derived from hierarchy
  const departmentOptions = useMemo(() => {
    if (!hierarchy || !selectedMinistry) return [];
    return hierarchy.departments_by_ministry?.[selectedMinistry] || [];
  }, [hierarchy, selectedMinistry]);

  const organizationOptions = useMemo(() => {
    if (!hierarchy || !selectedDepartment) return [];
    return hierarchy.organizations_by_dept?.[selectedDepartment] || [];
  }, [hierarchy, selectedDepartment]);

  const roleOptions = useMemo(() => {
    if (!hierarchy || !selectedOrgId) return [];
    return hierarchy.roles_by_org?.[Number(selectedOrgId)] || [];
  }, [hierarchy, selectedOrgId]);

  // Active selected role details & expected competencies
  const selectedRoleDetails = useMemo(() => {
    if (!roleOptions.length || !selectedRoleId) return null;
    return roleOptions.find((r) => r.id === Number(selectedRoleId)) || null;
  }, [roleOptions, selectedRoleId]);

  const roleExpectedCompetencies: RoleCompetencyRequirement[] = useMemo(() => {
    return selectedRoleDetails?.competencies || [];
  }, [selectedRoleDetails]);

  // Handle cascading dropdown changes
  function handleMinistryChange(min: string) {
    setSelectedMinistry(min);
    const depts = hierarchy?.departments_by_ministry?.[min] || [];
    const firstDept = depts.length > 0 ? depts[0] : "";
    setSelectedDepartment(firstDept);

    const orgs = firstDept ? hierarchy?.organizations_by_dept?.[firstDept] || [] : [];
    const firstOrgId = orgs.length > 0 ? orgs[0].id : "";
    setSelectedOrgId(firstOrgId);

    const roles = firstOrgId ? hierarchy?.roles_by_org?.[Number(firstOrgId)] || [] : [];
    const firstRoleId = roles.length > 0 ? roles[0].id : "";
    setSelectedRoleId(firstRoleId);
    if (firstRoleId && roles.length > 0) {
      setDesignation(roles[0].role_name);
    }
  }

  function handleDepartmentChange(dept: string) {
    setSelectedDepartment(dept);
    const orgs = hierarchy?.organizations_by_dept?.[dept] || [];
    const firstOrgId = orgs.length > 0 ? orgs[0].id : "";
    setSelectedOrgId(firstOrgId);

    const roles = firstOrgId ? hierarchy?.roles_by_org?.[Number(firstOrgId)] || [] : [];
    const firstRoleId = roles.length > 0 ? roles[0].id : "";
    setSelectedRoleId(firstRoleId);
    if (firstRoleId && roles.length > 0) {
      setDesignation(roles[0].role_name);
    }
  }

  function handleOrgChange(orgIdVal: string) {
    const orgIdNum = orgIdVal ? Number(orgIdVal) : "";
    setSelectedOrgId(orgIdNum);

    const roles = orgIdNum ? hierarchy?.roles_by_org?.[orgIdNum] || [] : [];
    const firstRoleId = roles.length > 0 ? roles[0].id : "";
    setSelectedRoleId(firstRoleId);
    if (firstRoleId && roles.length > 0) {
      setDesignation(roles[0].role_name);
    }
  }

  function handleRoleChange(roleIdVal: string) {
    const roleIdNum = roleIdVal ? Number(roleIdVal) : "";
    setSelectedRoleId(roleIdNum);
    const matched = roleOptions.find((r) => r.id === roleIdNum);
    if (matched) {
      setDesignation(matched.role_name);
    }
  }

  // Pre-select role-relevant competencies into Step 2 when role changes
  useEffect(() => {
    if (roleExpectedCompetencies.length > 0 && Object.keys(selectedSkills).length === 0) {
      const initialSkills: Record<number, SelectedSkillState> = {};
      roleExpectedCompetencies.slice(0, 3).forEach((rc) => {
        initialSkills[rc.competency_id] = {
          competencyId: rc.competency_id,
          name: rc.competency_name,
          category: rc.category,
          currentLevel: Math.max(1, rc.required_level - 1),
          notSureAssess: false,
        };
      });
      setSelectedSkills(initialSkills);
    }
  }, [roleExpectedCompetencies]);

  // Skill selection handlers
  function toggleSkillSelection(comp: Competency) {
    setSelectedSkills((prev) => {
      const next = { ...prev };
      if (next[comp.id]) {
        delete next[comp.id];
      } else {
        next[comp.id] = {
          competencyId: comp.id,
          name: comp.name,
          category: comp.category,
          currentLevel: 3, // default Intermediate
          notSureAssess: false,
        };
      }
      return next;
    });
  }

  function setSkillLevel(competencyId: number, level: number) {
    setSelectedSkills((prev) => {
      const item = prev[competencyId];
      if (!item) return prev;
      return {
        ...prev,
        [competencyId]: {
          ...item,
          currentLevel: level,
          notSureAssess: false,
        },
      };
    });
  }

  function setSkillAssessMe(competencyId: number) {
    setSelectedSkills((prev) => {
      const item = prev[competencyId];
      if (!item) return prev;
      return {
        ...prev,
        [competencyId]: {
          ...item,
          currentLevel: 0,
          notSureAssess: true,
        },
      };
    });
  }

  function selectAllRoleCompetencies() {
    const next = { ...selectedSkills };
    roleExpectedCompetencies.forEach((rc) => {
      if (!next[rc.competency_id]) {
        next[rc.competency_id] = {
          competencyId: rc.competency_id,
          name: rc.competency_name,
          category: rc.category,
          currentLevel: Math.max(1, rc.required_level - 1),
          notSureAssess: false,
        };
      }
    });
    setSelectedSkills(next);
  }

  // Group competencies into domains for Step 2
  const groupedCompetencies = useMemo(() => {
    const groups: Record<string, Competency[]> = {
      STATISTICAL: [],
      TECHNICAL: [],
      DIGITAL_GOVERNANCE: [],
      BEHAVIOURAL_MANAGERIAL: [],
    };

    allCompetencies.forEach((c) => {
      const cat = c.category.toUpperCase();
      if (cat.includes("STAT") || cat === "STATISTICAL") {
        groups.STATISTICAL.push(c);
      } else if (cat.includes("TECH") || cat.includes("DATA") || cat === "TECHNICAL") {
        groups.TECHNICAL.push(c);
      } else if (cat.includes("GOV") || cat.includes("DIGITAL") || cat.includes("PRIVACY")) {
        groups.DIGITAL_GOVERNANCE.push(c);
      } else {
        groups.BEHAVIOURAL_MANAGERIAL.push(c);
      }
    });

    return groups;
  }, [allCompetencies]);

  const filteredCompetencies = useMemo(() => {
    let list: Competency[] = [];
    if (activeCategoryTab === "ALL") {
      list = allCompetencies;
    } else {
      list = groupedCompetencies[activeCategoryTab] || [];
    }

    if (skillSearch.trim()) {
      const q = skillSearch.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allCompetencies, activeCategoryTab, groupedCompetencies, skillSearch]);

  // Step 3: Competency Map comparison computation
  const competencyMapRows = useMemo(() => {
    const rows: Array<{
      competencyId: number;
      name: string;
      category: string;
      currentLevel: number;
      currentDisplay: string;
      requiredLevel: number;
      status: "MEETS" | "DEVELOPMENT_NEEDED" | "ASSESSMENT_REQUIRED";
      statusLabel: string;
    }> = [];

    const declaredMap = new Map<number, SelectedSkillState>();
    Object.values(selectedSkills).forEach((s) => declaredMap.set(s.competencyId, s));

    roleExpectedCompetencies.forEach((rc) => {
      const declared = declaredMap.get(rc.competency_id);
      if (declared) {
        if (declared.notSureAssess || declared.currentLevel === 0) {
          rows.push({
            competencyId: rc.competency_id,
            name: rc.competency_name,
            category: rc.category,
            currentLevel: 0,
            currentDisplay: "Assess me",
            requiredLevel: rc.required_level,
            status: "ASSESSMENT_REQUIRED",
            statusLabel: "? Assessment required",
          });
        } else if (declared.currentLevel >= rc.required_level) {
          rows.push({
            competencyId: rc.competency_id,
            name: rc.competency_name,
            category: rc.category,
            currentLevel: declared.currentLevel,
            currentDisplay: `Level ${declared.currentLevel}`,
            requiredLevel: rc.required_level,
            status: "MEETS",
            statusLabel: "✓ Meets expectation",
          });
        } else {
          rows.push({
            competencyId: rc.competency_id,
            name: rc.competency_name,
            category: rc.category,
            currentLevel: declared.currentLevel,
            currentDisplay: `Level ${declared.currentLevel}`,
            requiredLevel: rc.required_level,
            status: "DEVELOPMENT_NEEDED",
            statusLabel: "↑ Development needed",
          });
        }
        declaredMap.delete(rc.competency_id);
      } else {
        rows.push({
          competencyId: rc.competency_id,
          name: rc.competency_name,
          category: rc.category,
          currentLevel: 0,
          currentDisplay: "Undeclared",
          requiredLevel: rc.required_level,
          status: "ASSESSMENT_REQUIRED",
          statusLabel: "? Assessment required",
        });
      }
    });

    declaredMap.forEach((declared) => {
      if (declared.notSureAssess || declared.currentLevel === 0) {
        rows.push({
          competencyId: declared.competencyId,
          name: declared.name,
          category: declared.category,
          currentLevel: 0,
          currentDisplay: "Assess me",
          requiredLevel: 0,
          status: "ASSESSMENT_REQUIRED",
          statusLabel: "? Assessment required",
        });
      } else {
        rows.push({
          competencyId: declared.competencyId,
          name: declared.name,
          category: declared.category,
          currentLevel: declared.currentLevel,
          currentDisplay: `Level ${declared.currentLevel}`,
          requiredLevel: 0,
          status: "MEETS",
          statusLabel: "✓ Baseline recorded",
        });
      }
    });

    return rows;
  }, [roleExpectedCompetencies, selectedSkills]);

  // Counts for Step 3 summary cards
  const summaryStats = useMemo(() => {
    const expected = roleExpectedCompetencies.length;
    const declared = Object.keys(selectedSkills).length;
    const assessmentReq = competencyMapRows.filter(
      (r) => r.status === "ASSESSMENT_REQUIRED" || r.status === "DEVELOPMENT_NEEDED"
    ).length;

    return {
      roleName: selectedRoleDetails?.role_name || "Official Statistical Role",
      expected,
      declared,
      assessmentRequired: assessmentReq,
    };
  }, [roleExpectedCompetencies, selectedSkills, competencyMapRows, selectedRoleDetails]);

  // Form Progress Percentage Calculation
  const progressPercent = useMemo(() => {
    let score = 0;
    if (fullName && email && password && confirmPassword) score += 20;
    if (selectedMinistry && selectedDepartment && selectedOrgId && selectedRoleId) score += 20;
    if (Object.keys(selectedSkills).length > 0) score += 30;
    if (currentStep >= 2) score += 15;
    if (currentStep === 3) score += 15;
    return Math.min(100, score);
  }, [fullName, email, password, confirmPassword, selectedMinistry, selectedDepartment, selectedOrgId, selectedRoleId, selectedSkills, currentStep]);

  // Validation logic
  function validateStep1(): boolean {
    setGeneralError("");
    setFullNameError("");
    setEmailError("");
    setEmployeeIdError("");
    setPasswordError("");

    let hasError = false;

    if (!fullName.trim()) {
      setFullNameError("Please enter your full name.");
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Please enter your official email address.");
      hasError = true;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid official email address.");
      hasError = true;
    }

    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      hasError = true;
    } else if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      hasError = true;
    }

    if (!selectedMinistry) {
      setGeneralError("Please select your Ministry.");
      hasError = true;
    } else if (!selectedDepartment) {
      setGeneralError("Please select your Department.");
      hasError = true;
    } else if (!selectedOrgId) {
      setGeneralError("Please select your Organization.");
      hasError = true;
    } else if (!selectedRoleId) {
      setGeneralError("Please select your Role / Job Function.");
      hasError = true;
    }

    return !hasError;
  }

  function validateStep2(): boolean {
    setGeneralError("");
    const selectedCount = Object.keys(selectedSkills).length;
    if (selectedCount === 0) {
      setGeneralError("Please select at least 1 competency/skill that you currently possess or wish to assess.");
      return false;
    }
    return true;
  }

  // Handle final submission
  async function handleFinalSubmit() {
    if (submitting) return;
    setApiError(null);
    setGeneralError("");
    setSubmitting(true);

    try {
      const skillsPayload = Object.values(selectedSkills).map((s) => ({
        competency_id: s.competencyId,
        declared_level: s.notSureAssess ? 1 : Math.max(1, s.currentLevel),
        not_sure_assess: s.notSureAssess,
      }));

      const payload: UserOnboardingPayload = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim() || undefined,
        employee_id: employeeId.trim() || undefined,
        password: password,
        ministry: selectedMinistry,
        department: selectedDepartment,
        organization_id: Number(selectedOrgId),
        role_id: Number(selectedRoleId),
        division_unit: divisionUnit.trim() || undefined,
        designation: designation.trim() || undefined,
        experience_years: Number(experienceYears) || 0,
        education: education,
        specialization: specialization.trim() || undefined,
        career_goal: "Official Statistical Competency Enhancement",
        selected_skills: skillsPayload,
      };

      const userProfile = await registerOnboardingUser(payload);

      // Successfully created profile in DB
      setAuthSession({
        userId: userProfile.id,
        user: {
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          role_name: userProfile.role_name || userProfile.designation || undefined,
          organization_name: userProfile.organization_name || userProfile.organization || undefined,
          designation: userProfile.designation || undefined,
        },
      });

      // Find first assessment priority topic
      const firstGap = competencyMapRows.find(
        (r) => r.status === "ASSESSMENT_REQUIRED" || r.status === "DEVELOPMENT_NEEDED"
      );

      setCreatedProfile({
        id: userProfile.id,
        name: userProfile.name,
        roleName: userProfile.role_name || selectedRoleDetails?.role_name || "Official",
        orgName: userProfile.organization_name || selectedMinistry,
        expectedCount: summaryStats.expected,
        declaredCount: summaryStats.declared,
        assessmentRequiredCount: summaryStats.assessmentRequired,
        firstGapTopic: firstGap ? firstGap.name : roleExpectedCompetencies[0]?.competency_name || "Survey Design",
      });
    } catch (err: any) {
      console.error("Registration error:", err);
      const detail = normalizeApiError(err);
      setApiError(detail);

      if (detail.type === "DUPLICATE_EMAIL" || detail.field === "email") {
        setEmailError("This email is already registered.");
        setCurrentStep(1);
      } else if (detail.type === "DUPLICATE_EMPLOYEE_ID" || detail.field === "employee_id") {
        setEmployeeIdError("An account with this Employee ID already exists.");
        setCurrentStep(1);
      } else if (detail.type === "PASSWORD_MISMATCH" || detail.type === "INVALID_PASSWORD" || detail.field === "password") {
        setPasswordError(detail.message);
        setCurrentStep(1);
      } else if (detail.type === "INVALID_EMAIL") {
        setEmailError(detail.message);
        setCurrentStep(1);
      } else if (detail.field === "role_id" || detail.type === "INVALID_ROLE") {
        setCurrentStep(1);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Diagnostic Handoff
  function handleStartDiagnostic() {
    if (!createdProfile) {
      router.push("/assessments");
      return;
    }
    const topicParam = encodeURIComponent(createdProfile.firstGapTopic || "Statistical Methodology");
    router.push(`/assessments?topic=${topicParam}&mode=diagnostic`);
  }

  return (
    <main className="min-h-[100dvh] w-full bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between transition-colors duration-200 relative overflow-x-hidden">
      {/* Dynamic Ambient Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-sky-500/10 dark:bg-sky-500/5 blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 -right-24 h-[450px] w-[450px] rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-20 left-10 h-[400px] w-[400px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl animate-float-slow" style={{ animationDelay: "-3s" }} />
      </div>

      {/* National Tricolor Strip */}
      <div className="gov-tricolor-strip w-full relative z-10" aria-hidden="true" />

      {/* Full-Width Top Header */}
      <header className="border-b border-[var(--border)] bg-[var(--header)] text-[var(--header-text)] px-4 sm:px-8 lg:px-12 py-3.5 shadow-sm relative z-10">
        <div className="w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white/90 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/pragati-parikshan-logo.jpeg"
                alt="PragatiParikshan Logo"
                width={40}
                height={40}
                className="h-full w-full object-contain"
                priority
              />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">PragatiParikshan</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  SIH26101
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden sm:block">
                Official Statistical System (OSS) • MoSPI Competency Intelligence Platform
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>National Civil Service Capacity Building Framework</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Full-Width Canvas Layout */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-6 flex-1 relative z-10">
        {/* Structured Duplicate Email Alert */}
        {apiError && apiError.type === "DUPLICATE_EMAIL" && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:p-5 text-[var(--foreground)] shadow-xs animate-fade-slide-up"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-xl sm:text-2xl mt-0.5 leading-none shrink-0" aria-hidden="true">
                  ⚠️
                </span>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[var(--foreground)]">
                    Account already exists
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--muted)]">
                    An account with this email already exists. Please sign in with your existing account.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2.5">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Go to Sign In →
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setApiError(null);
                        setEmailError("");
                      }}
                      className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] hover:bg-[var(--panel-soft)] text-xs font-semibold text-[var(--foreground)] transition cursor-pointer"
                    >
                      Use a Different Email
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setApiError(null);
                  setEmailError("");
                }}
                className="text-slate-400 hover:text-[var(--foreground)] p-1 rounded-md transition text-lg leading-none cursor-pointer"
                aria-label="Dismiss alert"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {/* Other API Errors */}
        {apiError && apiError.type !== "DUPLICATE_EMAIL" && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-700 dark:text-red-300 flex items-center justify-between shadow-xs animate-fade-slide-up"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg" aria-hidden="true">⚠️</span>
              <span>{apiError.message}</span>
            </div>
            <div className="flex items-center gap-2">
              {apiError.action === "LOGIN" && (
                <Link
                  href="/login"
                  className="text-xs font-bold underline hover:opacity-80 px-2 py-1"
                >
                  Go to Sign In
                </Link>
              )}
              <button
                type="button"
                onClick={() => setApiError(null)}
                className="text-xs font-bold underline hover:opacity-80 px-2 py-1 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Client Step Validation Alert */}
        {generalError && !apiError && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center justify-between shadow-xs animate-fade-slide-up"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg" aria-hidden="true">⚠️</span>
              <span>{generalError}</span>
            </div>
            <button
              type="button"
              onClick={() => setGeneralError("")}
              className="text-xs font-bold underline hover:opacity-80 px-2 py-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr] 2xl:grid-cols-[460px_1fr] items-start">
          {/* ================= LEFT SIDEBAR (Sticky, Progress, Context) ================= */}
          <aside className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]/90 backdrop-blur-md p-6 sm:p-7 shadow-[var(--card-shadow)] lg:sticky lg:top-6 transition-all duration-300 hover:shadow-lg">
            {/* Branding & Subtitle */}
            <div className="flex items-center gap-3.5 pb-6 border-b border-[var(--border-subtle)]">
              <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border-2 border-sky-500/30 bg-white shadow-xs">
                <Image
                  src="/pragati-parikshan-logo.jpeg"
                  alt="PragatiParikshan"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--foreground)] tracking-tight">PragatiParikshan</h2>
                <p className="text-xs font-medium text-[var(--primary)]">Onboarding &amp; Baseline Assessment</p>
              </div>
            </div>

            {/* Overview Heading */}
            <div className="mt-6">
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
                Official Capacity Alignment
              </h1>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--muted)]">
                Establish cadre alignment, declare existing proficiency, and benchmark baseline competencies against official OSS standards.
              </p>
            </div>

            {/* Live Registration Progress Bar */}
            <div className="mt-6 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-soft)]">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-[var(--foreground)]">Profile Readiness</span>
                <span className="text-[var(--primary)] font-bold">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-[var(--primary)] to-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* 3-Step Interactive Navigator */}
            <div className="mt-6 space-y-3">
              {/* Step 1 Indicator */}
              <div
                onClick={() => currentStep > 1 && setCurrentStep(1)}
                className={`group flex items-start gap-3.5 rounded-xl border p-4 transition-all duration-300 ${
                  currentStep === 1
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--foreground)] shadow-sm scale-[1.02]"
                    : currentStep > 1
                    ? "border-emerald-500/30 bg-emerald-500/5 text-[var(--foreground)] cursor-pointer hover:border-emerald-500/60"
                    : "border-[var(--border-subtle)] bg-[var(--panel-soft)] text-[var(--muted)] opacity-70"
                }`}
              >
                <div className="relative">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-transform duration-200 ${
                      currentStep === 1
                        ? "bg-[var(--primary)] text-white animate-pulse-ring"
                        : currentStep > 1
                        ? "bg-emerald-600 text-white animate-check-pop"
                        : "bg-[var(--border)] text-[var(--muted)]"
                    }`}
                  >
                    {currentStep > 1 ? "✓" : "1"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--foreground)]">1. Role &amp; Cadre Setup</span>
                    {currentStep === 1 && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--primary)] text-white">
                        Active
                      </span>
                    )}
                    {currentStep > 1 && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Complete
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1 leading-snug">
                    Ministry, Department, Cadre &amp; Institutional Role
                  </p>
                </div>
              </div>

              {/* Step 2 Indicator */}
              <div
                onClick={() => {
                  if (currentStep === 3) setCurrentStep(2);
                }}
                className={`group flex items-start gap-3.5 rounded-xl border p-4 transition-all duration-300 ${
                  currentStep === 2
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--foreground)] shadow-sm scale-[1.02]"
                    : currentStep > 2
                    ? "border-emerald-500/30 bg-emerald-500/5 text-[var(--foreground)] cursor-pointer hover:border-emerald-500/60"
                    : "border-[var(--border-subtle)] bg-[var(--panel-soft)] text-[var(--muted)] opacity-75"
                }`}
              >
                <div className="relative">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-transform duration-200 ${
                      currentStep === 2
                        ? "bg-[var(--primary)] text-white animate-pulse-ring"
                        : currentStep > 2
                        ? "bg-emerald-600 text-white animate-check-pop"
                        : "bg-[var(--border)] text-[var(--muted)]"
                    }`}
                  >
                    {currentStep > 2 ? "✓" : "2"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--foreground)]">2. Skill Inventory</span>
                    {currentStep === 2 && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--primary)] text-white">
                        Active
                      </span>
                    )}
                    {currentStep > 2 && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Complete
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1 leading-snug">
                    Declare self-reported proficiency or flag for assessment
                  </p>
                </div>
              </div>

              {/* Step 3 Indicator */}
              <div
                className={`flex items-start gap-3.5 rounded-xl border p-4 transition-all duration-300 ${
                  currentStep === 3
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--foreground)] shadow-sm scale-[1.02]"
                    : "border-[var(--border-subtle)] bg-[var(--panel-soft)] text-[var(--muted)] opacity-75"
                }`}
              >
                <div className="relative">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-transform duration-200 ${
                      currentStep === 3
                        ? "bg-[var(--primary)] text-white animate-pulse-ring"
                        : "bg-[var(--border)] text-[var(--muted)]"
                    }`}
                  >
                    3
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--foreground)]">3. Competency Matrix</span>
                    {currentStep === 3 && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--primary)] text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1 leading-snug">
                    Benchmark against mandate and activate diagnostic
                  </p>
                </div>
              </div>
            </div>

          </aside>

          {/* ================= RIGHT EXPANSIVE FORM CANVAS ================= */}
          <main className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]/95 backdrop-blur-md p-6 sm:p-8 lg:p-10 shadow-[var(--card-shadow)] flex flex-col justify-between min-h-[680px] transition-all duration-300">
            {/* ================= STEP 1: ROLE SETUP ================= */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-fade-slide-up">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
                      Step 1 — Official Identity &amp; Cadre Alignment
                    </h3>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-[var(--panel-soft)] border border-[var(--border)] text-[var(--muted)]">
                      Part 1 of 3
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5">
                    Provide your institutional credentials and cadre structure to pull accredited competency benchmarks.
                  </p>
                </div>

                {/* Section A: Personal & Account Credentials */}
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-soft)]/50 p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--primary)] text-white text-xs font-bold">
                      A
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                      Personal &amp; Account Credentials
                    </h4>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">Full Name *</span>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (fullNameError) setFullNameError("");
                        }}
                        placeholder="e.g. Rahul Sharma"
                        className={`${fieldClass} ${fullNameError ? "border-red-500 ring-2 ring-red-500/20 focus:border-red-500" : ""}`}
                      />
                      {fullNameError && (
                        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-slide-up">
                          <span>⚠️</span>
                          <span>{fullNameError}</span>
                        </p>
                      )}
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">Official Email *</span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                          if (apiError?.type === "DUPLICATE_EMAIL" || apiError?.field === "email") {
                            setApiError(null);
                          }
                        }}
                        placeholder="e.g. rahul.sharma@gov.in"
                        className={`${fieldClass} ${emailError ? "border-red-500 ring-2 ring-red-500/20 focus:border-red-500" : ""}`}
                      />
                      {emailError && (
                        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-slide-up">
                          <span>⚠️</span>
                          <span>{emailError}</span>
                        </p>
                      )}
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">Mobile Number</span>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className={fieldClass}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">Employee ID / Code</span>
                      <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => {
                          setEmployeeId(e.target.value);
                          if (employeeIdError) setEmployeeIdError("");
                          if (apiError?.type === "DUPLICATE_EMPLOYEE_ID" || apiError?.field === "employee_id") {
                            setApiError(null);
                          }
                        }}
                        placeholder="e.g. MOSPI-ISS-8492"
                        className={`${fieldClass} ${employeeIdError ? "border-red-500 ring-2 ring-red-500/20 focus:border-red-500" : ""}`}
                      />
                      {employeeIdError && (
                        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-slide-up">
                          <span>⚠️</span>
                          <span>{employeeIdError}</span>
                        </p>
                      )}
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">Password *</span>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordError) setPasswordError("");
                        }}
                        placeholder="Min. 6 characters"
                        className={`${fieldClass} ${passwordError ? "border-red-500 ring-2 ring-red-500/20 focus:border-red-500" : ""}`}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">Confirm Password *</span>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (passwordError) setPasswordError("");
                        }}
                        placeholder="Re-enter password"
                        className={`${fieldClass} ${passwordError ? "border-red-500 ring-2 ring-red-500/20 focus:border-red-500" : ""}`}
                      />
                      {passwordError && (
                        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-slide-up">
                          <span>⚠️</span>
                          <span>{passwordError}</span>
                        </p>
                      )}
                    </label>
                  </div>
                </div>

                {/* Section B: Institutional Hierarchy & Cadre */}
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-soft)]/50 p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--primary)] text-white text-xs font-bold">
                      B
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                      Institutional Hierarchy &amp; Statistical Cadre
                    </h4>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                    {/* Ministry */}
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">Ministry *</span>
                      <select
                        value={selectedMinistry}
                        onChange={(e) => handleMinistryChange(e.target.value)}
                        className={selectClass}
                      >
                        {hierarchy?.ministries?.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Department */}
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">Department *</span>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        className={selectClass}
                      >
                        {departmentOptions.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Organization */}
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">Organization / Directorate *</span>
                      <select
                        value={selectedOrgId}
                        onChange={(e) => handleOrgChange(e.target.value)}
                        className={selectClass}
                      >
                        {organizationOptions.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Division / Unit */}
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">Division / Unit (Optional)</span>
                      <input
                        type="text"
                        value={divisionUnit}
                        onChange={(e) => setDivisionUnit(e.target.value)}
                        placeholder="e.g. Sampling Design &amp; Survey Cell"
                        className={fieldClass}
                      />
                    </label>

                    {/* Role / Job Function (Dynamic backend Role) */}
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--foreground)] flex items-center justify-between">
                        <span>Role / Job Function * (Pulls Official Cadre Competencies)</span>
                        <span className="text-[11px] text-[var(--primary)] font-bold">Auto-links Mandated Baseline</span>
                      </span>
                      <select
                        value={selectedRoleId}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className={`${selectClass} font-semibold text-[var(--foreground)] bg-[var(--panel)]`}
                      >
                        {roleOptions.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.role_name} {r.service_cadre ? `(${r.service_cadre})` : ""}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Designation */}
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">Designation *</span>
                      <input
                        type="text"
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Statistical Officer"
                        className={fieldClass}
                      />
                    </label>

                    {/* Experience Years */}
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">Years of Experience *</span>
                      <input
                        type="number"
                        min={0}
                        max={45}
                        required
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 0)}
                        className={fieldClass}
                      />
                    </label>

                    {/* Highest Qualification */}
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">Highest Qualification *</span>
                      <select
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className={selectClass}
                      >
                        <option value="Post Graduate / Masters (Statistics/Maths/Economics)">
                          Post Graduate / Masters (Statistics/Maths/Economics)
                        </option>
                        <option value="Ph.D. / Doctorate">Ph.D. / Doctorate</option>
                        <option value="Bachelor of Statistics / B.Sc.">Bachelor of Statistics / B.Sc.</option>
                        <option value="B.Tech / B.E. (Computer Science/Data)">B.Tech / B.E. (Computer Science/Data)</option>
                        <option value="Graduate / Other Degree">Graduate / Other Degree</option>
                      </select>
                    </label>

                    {/* Specialization */}
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">Field / Specialization (Optional)</span>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="e.g. Econometric Modelling / Survey Sampling"
                        className={fieldClass}
                      />
                    </label>
                  </div>
                </div>

                {/* Read-Only Role Competency Preview Blueprint */}
                {roleExpectedCompetencies.length > 0 && (
                  <div className="rounded-xl border border-sky-500/25 bg-sky-500/5 p-5 animate-fade-slide-up">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎯</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                          Mandated Baseline Competencies for {selectedRoleDetails?.role_name}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300">
                        {roleExpectedCompetencies.length} Required Skills
                      </span>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                      {roleExpectedCompetencies.map((rc) => (
                        <div
                          key={rc.competency_id}
                          className="flex items-center justify-between rounded-lg bg-[var(--panel)] border border-[var(--border-subtle)] px-3.5 py-2.5 text-xs shadow-xs hover:border-sky-500/40 transition-colors"
                        >
                          <span className="font-semibold text-[var(--foreground)] truncate pr-2">
                            {rc.competency_name}
                          </span>
                          <span className="shrink-0 font-bold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-300">
                            L{rc.required_level}/5
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1 Actions */}
                <div className="pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-subtle)]">
                  <Link href="/login" className="text-xs font-semibold text-[var(--teal)] hover:underline flex items-center gap-1">
                    <span>← Already have an account? Sign in</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep1()) {
                        setCurrentStep(2);
                      }
                    }}
                    className="flex h-12 items-center justify-center rounded-xl bg-[var(--primary)] px-8 text-sm font-bold text-white hover:bg-[var(--primary-hover)] transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Continue to Current Skills →
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: CURRENT SKILLS ================= */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-slide-up">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
                      Step 2 — Inventory Your Competencies
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                      Declare your self-reported proficiency levels (1–5) or mark &quot;Not sure / Assess me&quot; for automated AI diagnostics.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllRoleCompetencies}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary-soft)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all duration-200"
                    >
                      + Add All Role Mandates
                    </button>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      {Object.keys(selectedSkills).length} Selected
                    </span>
                  </div>
                </div>


                {/* Category Filters & Search Controls */}
                <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between bg-[var(--panel-soft)] p-3 rounded-xl border border-[var(--border-subtle)]">
                  <div className="flex flex-wrap gap-1.5">
                    {["ALL", "STATISTICAL", "TECHNICAL", "DIGITAL_GOVERNANCE", "BEHAVIOURAL_MANAGERIAL"].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveCategoryTab(tab)}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                          activeCategoryTab === tab
                            ? "bg-[var(--primary)] text-white shadow-xs scale-105"
                            : "bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border-subtle)]"
                        }`}
                      >
                        {tab === "ALL" ? "All Domains" : CATEGORY_DISPLAY_MAP[tab] || tab}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Search competencies by name..."
                      className="h-10 w-full xl:w-64 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition"
                    />
                    {skillSearch && (
                      <button
                        type="button"
                        onClick={() => setSkillSearch("")}
                        className="absolute right-2.5 top-2.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Multi-Column Competency Catalog Grid */}
                <div className="max-h-[480px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3.5">
                    {filteredCompetencies.map((comp) => {
                      const isSelected = !!selectedSkills[comp.id];
                      const currentSkillState = selectedSkills[comp.id];
                      const isExpectedInRole = roleExpectedCompetencies.some((rc) => rc.competency_id === comp.id);
                      const reqObj = roleExpectedCompetencies.find((rc) => rc.competency_id === comp.id);

                      return (
                        <div
                          key={comp.id}
                          className={`rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                            isSelected
                              ? "border-[var(--primary)] bg-[var(--primary-soft)]/25 shadow-sm ring-1 ring-[var(--primary)]/30"
                              : "border-[var(--border-subtle)] bg-[var(--panel-soft)]/60 hover:border-[var(--border)] hover:bg-[var(--panel-soft)] hover:-translate-y-0.5"
                          }`}
                        >
                          <div>
                            {/* Card Header: Checkbox & Name */}
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                id={`comp-${comp.id}`}
                                checked={isSelected}
                                onChange={() => toggleSkillSelection(comp)}
                                className="mt-1 h-4 w-4 rounded accent-[var(--primary)] cursor-pointer shrink-0"
                              />
                              <label htmlFor={`comp-${comp.id}`} className="cursor-pointer flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-sm font-bold text-[var(--foreground)]">
                                    {comp.name}
                                  </span>
                                  {isExpectedInRole && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                                      Req: L{reqObj?.required_level}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[var(--muted)] line-clamp-2 mt-1 leading-snug">
                                  {comp.description || `${CATEGORY_DISPLAY_MAP[comp.category] || comp.category} competency standard`}
                                </p>
                              </label>
                            </div>
                          </div>

                          {/* Interactive Level Picker (Shown when Selected) */}
                          {isSelected && (
                            <div className="mt-3.5 pt-3 border-t border-[var(--border-subtle)] animate-fade-slide-up">
                              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted)] mb-2">
                                <span>Selected Proficiency:</span>
                                <span className="text-[var(--primary)]">
                                  {currentSkillState.notSureAssess
                                    ? "Flagged for Diagnostic"
                                    : LEVEL_NAMES[currentSkillState.currentLevel]}
                                </span>
                              </div>

                              <div className="grid grid-cols-6 gap-1">
                                {[1, 2, 3, 4, 5].map((lvl) => {
                                  const isActive = !currentSkillState.notSureAssess && currentSkillState.currentLevel === lvl;
                                  return (
                                    <button
                                      key={lvl}
                                      type="button"
                                      onClick={() => setSkillLevel(comp.id, lvl)}
                                      className={`h-7 rounded text-[11px] font-bold transition-all duration-150 ${
                                        isActive
                                          ? "bg-[var(--primary)] text-white shadow-xs scale-105"
                                          : "bg-[var(--panel)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--primary)]"
                                      }`}
                                      title={`Level ${lvl} - ${LEVEL_NAMES[lvl]}`}
                                    >
                                      L{lvl}
                                    </button>
                                  );
                                })}

                                <button
                                  type="button"
                                  onClick={() => setSkillAssessMe(comp.id)}
                                  className={`h-7 rounded text-[10px] font-bold transition-all duration-150 ${
                                    currentSkillState.notSureAssess
                                      ? "bg-amber-500 text-white shadow-xs scale-105"
                                      : "bg-[var(--panel)] text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/10"
                                  }`}
                                  title="Flag for full diagnostic assessment"
                                >
                                  Assess
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2 Actions */}
                <div className="pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex h-12 items-center justify-center rounded-xl border border-[var(--border)] px-6 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--panel-soft)] transition"
                  >
                    ← Back to Role Setup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) {
                        setCurrentStep(3);
                      }
                    }}
                    className="flex h-12 items-center justify-center rounded-xl bg-[var(--primary)] px-8 text-sm font-bold text-white hover:bg-[var(--primary-hover)] transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Review Competency Matrix →
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: COMPETENCY MATRIX ================= */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-slide-up">
                <div>
                  <h3 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
                    Step 3 — Review Baseline Competency Matrix
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                    Your baseline proficiency is benchmarked against mandated official role requirements. Review gaps before activating your diagnostic plan.
                  </p>
                </div>

                {/* 4 High-Impact Summary Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-soft)] p-4">
                    <div className="text-xs font-semibold text-[var(--muted)]">Designated Cadre</div>
                    <div className="text-base font-extrabold text-[var(--foreground)] truncate mt-1">
                      {summaryStats.roleName}
                    </div>
                  </div>

                  <div className="rounded-xl border border-sky-500/25 bg-sky-500/10 p-4">
                    <div className="text-xs font-semibold text-sky-800 dark:text-sky-300">Mandated Baseline</div>
                    <div className="text-2xl font-black text-sky-900 dark:text-sky-200 mt-1">
                      {summaryStats.expected} <span className="text-xs font-normal">skills</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                    <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Skills Declared</div>
                    <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">
                      {summaryStats.declared} <span className="text-xs font-normal">skills</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
                    <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">Assessment Targets</div>
                    <div className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-1">
                      {summaryStats.assessmentRequired} <span className="text-xs font-normal">priorities</span>
                    </div>
                  </div>
                </div>

                {/* Expansive Full-Width Comparison Table */}
                <div className="rounded-xl border border-[var(--border)] overflow-hidden shadow-xs">
                  <div className="max-h-[360px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--panel-soft)] text-[var(--muted)] uppercase border-b border-[var(--border)] font-bold sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3">Competency &amp; Domain</th>
                          <th className="px-4 py-3 text-center">Declared Baseline</th>
                          <th className="px-4 py-3 text-center">Mandated Target</th>
                          <th className="px-4 py-3 text-center">Proficiency Visual</th>
                          <th className="px-4 py-3 text-right">Alignment Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)]">
                        {competencyMapRows.map((row) => (
                          <tr key={row.competencyId} className="hover:bg-[var(--panel-soft)]/70 transition-colors">
                            <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                              <div>{row.name}</div>
                              <div className="text-[10px] font-normal text-[var(--muted)]">
                                {CATEGORY_DISPLAY_MAP[row.category] || row.category}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-[var(--foreground)]">
                              {row.currentDisplay}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-[var(--muted)]">
                              {row.requiredLevel > 0 ? `Level ${row.requiredLevel}` : "—"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {/* 5-segment Visual Level Indicator */}
                              <div className="inline-flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((lvl) => {
                                  const isCurrent = row.currentLevel >= lvl;
                                  const isRequired = row.requiredLevel >= lvl;
                                  return (
                                    <span
                                      key={lvl}
                                      className={`h-3 w-4 rounded-xs transition-all ${
                                        isCurrent
                                          ? "bg-emerald-500"
                                          : isRequired
                                          ? "bg-amber-500/50"
                                          : "bg-[var(--border)]"
                                      }`}
                                      title={`Level ${lvl}`}
                                    />
                                  );
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span
                                className={`inline-block font-bold px-2.5 py-1 rounded-full text-[11px] ${
                                  row.status === "MEETS"
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                                    : row.status === "DEVELOPMENT_NEEDED"
                                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                                    : "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30"
                                }`}
                              >
                                {row.statusLabel}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Final Confirmation Information */}
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-soft)] p-4 text-xs text-[var(--muted)] flex items-center gap-3">
                  <span className="text-xl shrink-0">🔒</span>
                  <div>
                    Clicking <strong>&quot;Create Profile &amp; Start Diagnostic&quot;</strong> establishes your immutable progress record, binds your cadre role requirements, and activates your tailored iGOT Karmayogi diagnostic pathway.
                  </div>
                </div>

                {/* Step 3 Actions */}
                <div className="pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setCurrentStep(2)}
                    className="flex h-12 items-center justify-center rounded-xl border border-[var(--border)] px-6 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--panel-soft)] transition disabled:opacity-50"
                  >
                    ← Back to Skills
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleFinalSubmit}
                    className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 via-[var(--primary)] to-emerald-600 px-9 text-sm font-bold text-white hover:opacity-95 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Creating your profile...</span>
                      </span>
                    ) : (
                      "Create Official Profile & Continue →"
                    )}
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ================= POST-REGISTRATION SUCCESS MODAL ================= */}
      {createdProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-slide-up">
          <div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8 shadow-2xl animate-fade-scale">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500/30 animate-check-pop">
              <span className="text-3xl font-extrabold">✓</span>
            </div>

            <h3 className="mt-5 text-center text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
              Official Profile Successfully Created
            </h3>
            <p className="mt-1.5 text-center text-xs sm:text-sm text-[var(--muted)]">
              Accredited OSS baseline registered under {createdProfile.orgName}
            </p>

            <div className="mt-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-soft)] p-5 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Cadre Role:</span>
                <span className="font-bold text-[var(--foreground)]">{createdProfile.roleName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Organization:</span>
                <span className="font-bold text-[var(--foreground)]">{createdProfile.orgName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Role Mandated Baseline:</span>
                <span className="font-bold text-[var(--foreground)]">{createdProfile.expectedCount} skills</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Declared Baseline:</span>
                <span className="font-bold text-[var(--foreground)]">{createdProfile.declaredCount} competencies</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border-subtle)] pt-3 text-amber-700 dark:text-amber-300">
                <span className="font-bold">Initial Diagnostic Target:</span>
                <span className="font-extrabold">{createdProfile.firstGapTopic}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
              <button
                type="button"
                onClick={handleStartDiagnostic}
                className="flex-1 flex h-12 items-center justify-center rounded-xl bg-[var(--primary)] text-sm font-bold text-white hover:bg-[var(--primary-hover)] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Launch Diagnostic Assessment →
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex-1 flex h-12 items-center justify-center rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--panel-soft)] transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Width Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--header)] py-4 px-6 text-center text-xs text-slate-400 relative z-10">
        © 2026 Government of India • Ministry of Statistics and Programme Implementation (MoSPI) • SIH26101 Official Platform
      </footer>
    </main>
  );
}
