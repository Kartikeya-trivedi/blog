export interface ArchiveVolume {
  volume: string;
  period: string;
  status: 'ACTIVE' | 'ARCHIVED';
  subjects: string[];
}

export const archives: ArchiveVolume[] = [];

export interface Project {
  id: number;
  title: string;
  desc: string;
  year: string;
  image: string;
  cols: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: 'Tech',
    desc: 'For my full technical portfolio, agentic systems, and research infrastructure, visit kartikeya.me.',
    year: '2025-2026',
    image: '/tech.png',
    cols: 'col-span-12 md:col-span-8'
  },
  {
    id: 2,
    title: 'Mindrix',
    desc: 'Co-founded an AI startup focused on cutting-edge solutions.',
    year: '2025-2026',
    image: '/mindrix.png',
    cols: 'col-span-12 md:col-span-4 mt-0 md:mt-24'
  },
  {
    id: 3,
    title: 'Multimodal AI Research',
    desc: 'Research on benchmarking targeting top NLP venues.',
    year: '2025-2026',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2070&auto=format&fit=crop',
    cols: 'col-span-12 md:col-span-4'
  },
  {
    id: 4,
    title: 'MLSA KIIT domain',
    desc: 'Leading the ML domain and community teaching events.',
    year: '2025-2026',
    image: '/mlsa.jpeg',
    cols: 'col-span-12 md:col-span-8'
  }
];

export interface Milestone {
  title: string;
  date: string;
}

export const milestones: Milestone[] = [
  { title: "Co-Founder, Mindrix", date: "2025 — 2026" },
  { title: "ML Lead, MLSA KIIT", date: "2025 — 2026" },
  { title: "Core Member, KIIT Computer Science", date: "2025 — 2026" }
];
