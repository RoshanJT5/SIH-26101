import Link from "next/link";

const competencyRows = [
  { label: "Statistics", value: 82, target: 90 },
  { label: "Data Analysis", value: 61, target: 85 },
  { label: "Visualization", value: 42, target: 80 },
  { label: "Survey Methods", value: 73, target: 85 },
  { label: "Policy", value: 51, target: 75 },
];

const problems = [
  ["Identify the gap", "Manual competency mapping makes it hard to know what each officer needs next."],
  ["Connect the resource", "Skill gaps need to map directly to relevant official courses and approved material."],
  ["Generate evaluation", "Training teams need faster MCQs, quizzes, and assessments from trusted documents."],
];

const path = [
  ["01", "Baseline assessment", "Measure role-level competency across statistics, surveys, policy, and visualization."],
  ["02", "Competency map", "Compare current capability with target levels for each official and department."],
  ["03", "Personalized path", "Recommend courses because of a specific gap, not because a course is popular."],
  ["04", "Reassessment", "Feed results back into the profile so improvement becomes visible over time."],
];

const resources = [
  ["Statistical Methods", "94%", "Skill gap"],
  ["Data Visualization", "88%", "Role requirement"],
  ["Survey Methodology", "81%", "Assessment result"],
  ["Data Quality", "76%", "Department priority"],
];

const analytics = [
  ["Employees assessed", "1,248"],
  ["Learning paths active", "923"],
  ["Average competency", "74%"],
  ["Priority gaps", "17"],
];

const generatorSteps = ["Analyzing source material", "Mapping learning objectives", "Drafting MCQs", "Checking answer quality"];

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--header)]">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center gap-5 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md border border-[var(--border)] bg-[#1f1f1f] text-sm font-bold text-[var(--teal)]">
              SL
            </span>
            <span className="font-semibold text-white">StatLearn AI</span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm lg:flex">
            {["Platform", "Workflow", "Assessment", "Courses", "Analytics"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="rounded-md px-3 py-2 text-[var(--muted)] hover:bg-[#303030] hover:text-white">
                {item}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/login" className="hidden rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-white hover:border-[var(--teal)] sm:inline-flex">
              Login
            </Link>
            <Link href="/signup" className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#60a5fa]">
              Register
            </Link>
          </div>
        </div>
      </header>

      <section id="platform" className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:py-14">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit rounded-md border border-[var(--border)] bg-[#232323] px-3 py-2 text-sm text-[var(--muted)]">
            SIH26101 / Ministry of Statistics and Programme Implementation
          </div>
          <h1 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.035em] text-white sm:text-5xl xl:text-6xl">
            Smart learning for India&apos;s official statistical system
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">
            Identify competency gaps, recommend the right learning path, and measure workforce capability.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--primary)] px-5 text-sm font-semibold text-white hover:bg-[#60a5fa]">
              Get Started
            </Link>
            <Link href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[#303030] px-5 text-sm font-semibold text-white hover:border-[var(--teal)]">
              Explore Platform
            </Link>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm">
            {["Assess skills", "Find gaps", "Learn again"].map((item) => (
              <div key={item} className="rounded-md border border-[var(--border)] bg-[#232323] p-3 text-[var(--muted)]">
                <span className="block text-white">{item}</span>
                <span className="mt-1 block text-xs">Part of the same loop</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
          <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Officer Learning Profile</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Statistical Officer / MoSPI &amp; Central Statistics</p>
            </div>
            <span className="rounded-md bg-[#14331f] px-2 py-1 text-xs text-[#37d46f]">82% ready</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <section className="rounded-md bg-[#303030] p-5">
              <div className="space-y-4">
                {competencyRows.map((row) => (
                  <div key={row.label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-white">{row.label}</span>
                      <span className="text-[var(--muted)]">{row.value}% / target {row.target}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#454545]">
                      <div className="h-2 rounded-full bg-[var(--teal)]" style={{ width: `${row.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="grid gap-4">
              <div className="rounded-md bg-[#303030] p-4">
                <div className="text-xs text-[var(--muted)]">Priority Skill Gap</div>
                <div className="mt-2 text-lg font-semibold text-white">Data Visualization</div>
                <div className="mt-3 rounded-md bg-[#3a2020] px-2 py-1 text-xs text-[#ff8f8f]">38% below target</div>
              </div>
              <div className="rounded-md bg-[#303030] p-4">
                <div className="text-xs text-[var(--muted)]">Next Course</div>
                <div className="mt-2 text-lg font-semibold text-white">Official Data Dashboards</div>
                <div className="mt-3 text-xs text-[#37d46f]">94% match</div>
              </div>
              <div className="rounded-md bg-[#303030] p-4">
                <div className="text-xs text-[var(--muted)]">Assessment</div>
                <div className="mt-2 text-lg font-semibold text-white">Statistical Methods</div>
                <div className="mt-3 text-xs text-[var(--amber)]">4 questions pending</div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="workflow" className="border-y border-[var(--border)] bg-[#171717]">
        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {problems.map(([title, text]) => (
              <article key={title} className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-2xl font-semibold text-white">The product loop</h2>
            <div className="mt-5 grid gap-3 lg:grid-cols-4">
              {path.map(([step, title, text]) => (
                <article key={title} className="rounded-md bg-[#303030] p-4">
                  <div className="text-sm font-semibold text-[var(--teal)]">{step}</div>
                  <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="assessment" className="mx-auto grid max-w-[1440px] gap-5 px-4 py-10 sm:px-6 xl:grid-cols-[1fr_0.86fr]">
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-2xl font-semibold text-white">Intelligent skill assessment</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            The platform turns a quiz result into a competency estimate, then explains what should improve next.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-[680px] w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-[var(--muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Skill</th>
                  <th className="px-3 py-2 font-medium">Current</th>
                  <th className="px-3 py-2 font-medium">Target</th>
                  <th className="px-3 py-2 font-medium">Gap signal</th>
                </tr>
              </thead>
              <tbody>
                {competencyRows.map((row) => {
                  const gap = row.target - row.value;
                  return (
                    <tr key={row.label} className="bg-[#303030]">
                      <td className="rounded-l-md px-3 py-3 font-medium text-white">{row.label}</td>
                      <td className="px-3 py-3 text-[var(--muted)]">{row.value}%</td>
                      <td className="px-3 py-3 text-[var(--muted)]">{row.target}%</td>
                      <td className="rounded-r-md px-3 py-3">
                        <span className={`rounded-md px-2 py-1 text-xs ${gap > 30 ? "bg-[#3a2020] text-[#ff8f8f]" : gap > 10 ? "bg-[#3a311d] text-[#ffd46b]" : "bg-[#14331f] text-[#37d46f]"}`}>
                          {gap}% gap
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-2xl font-semibold text-white">Personalized learning path</h2>
          <div className="mt-5 space-y-3">
            {["Data Visualization / 72% complete", "Statistical Inference / 40% complete", "Survey Sampling / Not started"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-md bg-[#303030] p-4 text-sm text-white">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-[#1f1f1f] text-xs text-[var(--teal)]">{index + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-md bg-[#14331f] p-4">
            <h3 className="text-base font-semibold text-[#37d46f]">AI Recommendation</h3>
            <p className="mt-2 text-sm leading-6 text-[#b8f5c9]">
              Prioritize Statistical Inference because your assessment score is below the target competency level.
            </p>
          </div>
        </div>
      </section>

      <section id="courses" className="border-y border-[var(--border)] bg-[#171717]">
        <div className="mx-auto grid max-w-[1440px] gap-5 px-4 py-10 sm:px-6 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-2xl font-semibold text-white">AI Assessment Generator</h2>
            <div className="mt-5 grid gap-3 text-sm">
              {["Source: Official Statistical Manual", "Difficulty: Medium", "Question type: MCQ", "Questions: 10"].map((item) => (
                <div key={item} className="rounded-md bg-[#303030] p-3 text-[var(--muted)]">{item}</div>
              ))}
            </div>
            <div className="mt-5 space-y-2">
              {generatorSteps.map((step, index) => (
                <div key={step} className="flex items-center justify-between rounded-md bg-[#303030] px-3 py-2 text-sm">
                  <span className="text-white">{step}</span>
                  <span className={index < 3 ? "text-[#37d46f]" : "text-[var(--amber)]"}>{index < 3 ? "Done" : "Review"}</span>
                </div>
              ))}
            </div>
            <button className="mt-5 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">Generate Assessment</button>
          </div>

          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-2xl font-semibold text-white">Course intelligence</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              iGOT and internal resources are ranked by match, reason, and role requirement.
            </p>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-[620px] w-full text-left text-sm">
                <thead className="text-[var(--muted)]">
                  <tr>
                    <th className="pb-3 font-medium">Course</th>
                    <th className="pb-3 font-medium">Match</th>
                    <th className="pb-3 font-medium">Reason</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {resources.map(([course, match, reason]) => (
                    <tr key={course}>
                      <td className="py-4 font-medium text-white">{course}</td>
                      <td className="py-4 text-[#37d46f]">{match}</td>
                      <td className="py-4 text-[var(--muted)]">{reason}</td>
                      <td className="py-4">
                        <Link href="/courses" className="rounded-md border border-[var(--border)] px-3 py-2 text-xs text-white hover:border-[var(--teal)]">
                          View course
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="analytics" className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6">
        <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-2xl font-semibold text-white">Workforce capability overview</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {analytics.map(([label, value]) => (
                <div key={label} className="rounded-md bg-[#303030] p-4">
                  <div className="text-2xl font-semibold text-white">{value}</div>
                  <div className="mt-1 text-sm text-[var(--muted)]">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
            <h2 className="text-2xl font-semibold text-white">Built for SIH demonstration</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Judges can see the full journey in one product: registration, role setup, assessment, skill map, personalized course recommendation, AI question generation, and analytics.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--primary)] px-5 text-sm font-semibold text-white hover:bg-[#60a5fa]">
                Open Dashboard
              </Link>
              <Link href="/assessments" className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[#303030] px-5 text-sm font-semibold text-white hover:border-[var(--teal)]">
                Try Assessment
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer id="about" className="border-t border-[var(--border)] bg-[#171717]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-6 text-sm text-[var(--muted)] sm:px-6 md:flex-row md:items-center md:justify-between">
          <span>StatLearn AI for SIH26101 and MoSPI smart education workflows.</span>
          <span>Assess. Understand. Recommend. Learn. Improve.</span>
        </div>
      </footer>
    </main>
  );
}
