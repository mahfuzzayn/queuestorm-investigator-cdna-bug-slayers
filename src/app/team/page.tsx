import Link from "next/link";
import { ArrowLeft, Users, GitBranch } from "lucide-react";
import { SITE, TEAM_MEMBERS } from "@/lib/site-data";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function TeamPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Back link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 border-2 border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-neo-sm press-inner transition-all duration-150 hover:bg-[var(--muted)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </Link>

      {/* Hero */}
      <div className="mb-10 border-2 border-[var(--border)] bg-[var(--card)] text-center shadow-neo">
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-2 border-[var(--border)] bg-[var(--accent)] shadow-neo-sm">
            <Users className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
            Meet the Team
          </h1>
          <p className="mt-2 text-sm font-bold tracking-wider text-[var(--muted-foreground)]">
            {SITE.teamName.replace(/_/g, " ")} &mdash; {SITE.competition}
          </p>
        </div>
      </div>

      {/* Team members */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM_MEMBERS.map((member) => (
          <div
            key={member.name}
            className="flex flex-col border-2 border-[var(--border)] bg-[var(--card)] shadow-neo transition-[box-shadow,transform] duration-150 ease"
          >
            {/* Avatar placeholder with initials */}
            <div className="flex items-center justify-center border-b-2 border-[var(--border)] bg-[var(--accent)] px-6 py-8">
              <div className="flex h-20 w-20 items-center justify-center border-2 border-[var(--border)] bg-[var(--card)] shadow-neo-sm">
                <span className="text-2xl font-black uppercase tracking-tight">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col px-5 py-5 sm:px-6">
              <h3 className="text-base font-extrabold uppercase tracking-tight">
                {member.name}
              </h3>

              <span className="mt-2 inline-flex self-start border-2 border-[var(--border)] bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {member.role}
              </span>

              <div className="mt-auto pt-5">
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-[var(--border)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-neo-sm press-inner transition-all duration-150 hover:bg-[var(--muted)]"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  GitHub
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
