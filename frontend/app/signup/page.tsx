import Link from "next/link";

const fieldClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[#303030] px-3 text-sm text-white outline-none placeholder:text-[var(--muted)]";

const interests = ["Data Analysis", "Statistical Methods", "Survey Methodology", "Data Visualization", "Official Statistics", "Policy Analysis"];

export default function SignUpPage() {
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
          <form className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--muted)]">Full name</span>
              <input type="text" defaultValue="Roshan Talreja" className={fieldClass} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--muted)]">Official email</span>
              <input type="email" defaultValue="roshan@stats.gov.in" className={fieldClass} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--muted)]">Employee ID</span>
              <input type="text" placeholder="MOSPI-2048" className={fieldClass} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--muted)]">Department</span>
              <input type="text" defaultValue="Statistics" className={fieldClass} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--muted)]">Role</span>
              <input type="text" defaultValue="Statistical Officer" className={fieldClass} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--muted)]">Organization</span>
              <input type="text" defaultValue="MoSPI" className={fieldClass} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--muted)]">Password</span>
              <input type="password" defaultValue="password123" className={fieldClass} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--muted)]">Confirm password</span>
              <input type="password" defaultValue="password123" className={fieldClass} />
            </label>

            <fieldset className="md:col-span-2">
              <legend className="mb-3 text-sm text-[var(--muted)]">Select your areas</legend>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <label key={interest} className="rounded-md border border-[var(--border)] bg-[#303030] px-3 py-2 text-sm text-white">
                    <input type="checkbox" defaultChecked={index < 3} className="mr-2 accent-[var(--teal)]" />
                    {interest}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="md:col-span-2">
              <Link href="/dashboard" className="flex h-11 w-full items-center justify-center rounded-md bg-[var(--primary)] text-sm font-semibold text-white hover:bg-[#60a5fa]">
                Create Account
              </Link>
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
