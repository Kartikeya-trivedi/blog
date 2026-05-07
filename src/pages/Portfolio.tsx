import { motion } from 'motion/react';
import { Circle, Square, Layout, PenTool, Image as LucideImage, Type } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'ShowKase',
    desc: 'An AI-powered portfolio tool for builders to tell their stories.',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1551288049-bbbda536639a?q=80&w=2070&auto=format&fit=crop',
    cols: 'col-span-12 md:col-span-8'
  },
  {
    id: 2,
    title: 'Mindrix',
    desc: 'Co-founded an AI startup focused on cutting-edge solutions.',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop',
    cols: 'col-span-12 md:col-span-4 mt-0 md:mt-24'
  },
  {
    id: 3,
    title: 'Multimodal AI Research',
    desc: 'Research on benchmarking targeting top NLP venues.',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2070&auto=format&fit=crop',
    cols: 'col-span-12 md:col-span-4'
  },
  {
    id: 4,
    title: 'MLSA KIIT vertical',
    desc: 'Leading the ML vertical and community teaching events.',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop',
    cols: 'col-span-12 md:col-span-8'
  }
];

export default function PortfolioPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-container-max mx-auto px-margin-page"
    >
      {/* Hero Section */}
      <section className="mt-24 mb-section-gap grid grid-cols-12 gap-8 items-end">
        <div className="col-span-12 lg:col-span-7">
          <span className="text-label-caps text-secondary block mb-6">RESEARCHER & BUILDER</span>
          <h1 className="text-display leading-tight mb-8">
            Building systems that <span className="italic text-secondary">matter</span> through tech and community.
          </h1>
          <p className="text-body-lg text-secondary max-w-xl font-serif">
            I'm Kartikeya, a CS student at KIIT obsessed with the intersection of Machine Learning, Formula 1 strategy, and Stoic philosophy. I build things that scratch the itch of systems design—where every decision has a downstream consequence. <span className="font-bold text-tertiary">The Editorial</span> is my digital monograph.
          </p>
        </div>
        <div className="col-span-12 lg:col-span-5 aspect-[3/4] bg-surface-container overflow-hidden border border-outline-variant">
          <img 
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover grayscale brightness-90 contrast-110" 
            src="/me.jpg" 
            alt="Portrait - The Editorial"
          />
        </div>
      </section>

      {/* Selected Works */}
      <section className="mb-section-gap">
        <div className="flex justify-between items-end border-b border-outline-variant pb-4 mb-12">
          <h2 className="text-headline-md">Current Trajectory</h2>
          <span className="text-label-caps text-secondary">PROJECTS & RESEARCH</span>
        </div>
        <div className="grid grid-cols-12 gap-8">
          {projects.map((project) => (
            <motion.div 
              key={project.id} 
              className={`${project.cols} group cursor-pointer`}
              whileHover={{ y: -10 }}
            >
              <div className="aspect-[16/9] md:aspect-auto overflow-hidden bg-surface-container-low border border-outline-variant mb-6">
                <img 
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" 
                  src={project.image} 
                  alt={project.title}
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-headline-sm mb-2 group-hover:italic transition-all">{project.title}</h3>
                  <p className="text-secondary text-body-md italic">{project.desc}</p>
                </div>
                <span className="text-label-caps pt-2">{project.year}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Expertise */}
      <section className="mb-section-gap">
        <div className="grid grid-cols-12 gap-8 border-t border-tertiary pt-16">
          <div className="col-span-12 lg:col-span-4">
            <h2 className="text-headline-lg leading-tight font-serif italic text-tertiary">Technical <br/>Stack</h2>
          </div>
          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-8">
            <div className="border-l border-outline-variant pl-8">
              <h4 className="text-label-caps text-secondary mb-6">MACHINE LEARNING</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-tertiary rounded-full"></span><span className="text-body-md">LLM Deployment (Production)</span></li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-tertiary rounded-full"></span><span className="text-body-md">Fine-tuning Pipelines</span></li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-tertiary rounded-full"></span><span className="text-body-md">Multimodal Benchmarking</span></li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-tertiary rounded-full"></span><span className="text-body-md">Live AI Judges & Tournament Apps</span></li>
              </ul>
            </div>
            <div className="border-l border-outline-variant pl-8">
              <h4 className="text-label-caps text-secondary mb-6">PHILOSOPHY & LEADERSHIP</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3"><Square size={10} className="text-tertiary"/><span className="text-body-md">ML Vertical Lead @ MLSA KIIT</span></li>
                <li className="flex items-center gap-3"><Square size={10} className="text-tertiary"/><span className="text-body-md">Technical Teaching & Community</span></li>
                <li className="flex items-center gap-3"><Square size={10} className="text-tertiary"/><span className="text-body-md">Stoic Grounding (Marcus Aurelius)</span></li>
                <li className="flex items-center gap-3"><Square size={10} className="text-tertiary"/><span className="text-body-md">Strategic Thinking (F1 & Cricket)</span></li>
              </ul>
            </div>
            
            <div className="col-span-12 border-t border-outline-variant pt-16 mt-8">
              <h4 className="text-label-caps text-secondary mb-8">MILESTONES</h4>
              <div className="space-y-8">
                <HistoryItem title="Co-Founder, Mindrix" date="2023 — PRESENT" />
                <HistoryItem title="Research Lead, MLSA KIIT" date="2023 — PRESENT" />
                <HistoryItem title="Core Member, KIIT Computer Science" date="2022 — PRESENT" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-section-gap py-32 bg-background border border-outline-variant text-center">
        <h2 className="text-display italic mb-12 text-tertiary"> लखनऊ to the world.</h2>
        <div className="flex justify-center gap-8">
          <a href="mailto:hello@kartikeya.build" className="border-b border-tertiary pb-2 text-label-caps hover:opacity-70 transition-opacity">hello@kartikeya.build</a>
          <a href="#" className="border-b border-tertiary pb-2 text-label-caps hover:opacity-70 transition-opacity">LINKEDIN</a>
        </div>
      </section>
    </motion.div>
  );
}

function HistoryItem({ title, date }: { title: string, date: string }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-baseline gap-4 border-b border-outline-variant pb-8 last:border-0 last:pb-0">
      <div className="text-headline-sm">{title}</div>
      <div className="text-secondary text-label-caps">{date}</div>
    </div>
  );
}
