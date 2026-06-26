export const SITE = {
  projectName: "QueueStorm Investigator",
  competition: "bKash SUST CSE Carnival 2026",
  teamName: "cDNA_Bug_Slayers",
} as const;

export interface TeamMember {
  name: string;
  role: string;
  github: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Mushfique Raiyan",
    role: "Team Leader",
    github: "https://github.com/mushfiqueraiyan",
  },
  {
    name: "Mahfuz Zayn",
    role: "Engineer 2",
    github: "https://github.com/mahfuzzayn",
  },
  {
    name: "Md. Rabbi Islam",
    role: "Engineer 3",
    github: "https://github.com/fazlerabbi8",
  },
] as const;
