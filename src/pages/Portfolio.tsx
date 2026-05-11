import { motion } from 'motion/react';
import { Circle, Square, Layout, PenTool, Image as LucideImage, Type } from 'lucide-react';
import { projects, milestones } from '../lib/data';



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
            src="/me.jpeg" 
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <h3 className="text-headline-sm mb-2 group-hover:italic transition-all">{project.title}</h3>
                  <p className="text-body-md italic text-secondary break-words">{project.desc}</p>
                </div>
                <span className="shrink-0 text-label-caps pt-0 sm:pt-2">{project.year}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Expertise — two-column stack + milestones as separate rows (milestones must not live inside the 2-col grid or columns overlap on mobile) */}
      <section className="mb-section-gap">
        <div className="grid grid-cols-12 gap-8 border-t border-tertiary pt-16">
          <div className="col-span-12 lg:col-span-4">
            <h2 className="text-headline-lg leading-tight font-serif italic text-tertiary">Technical <br/>Stack</h2>
          </div>
          <div className="col-span-12 flex min-w-0 flex-col gap-16 lg:col-span-8">
            <div className="grid min-w-0 grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-8 md:gap-y-0">
              <div className="min-w-0 border-l border-outline-variant pl-6 sm:pl-8">
                <h4 className="text-label-caps text-secondary mb-6">MACHINE LEARNING</h4>
                <ul className="space-y-4">
                  <li className="flex min-w-0 items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tertiary" /><span className="min-w-0 break-words text-body-md">LLM Deployment (Production)</span></li>
                  <li className="flex min-w-0 items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tertiary" /><span className="min-w-0 break-words text-body-md">Fine-tuning Pipelines</span></li>
                  <li className="flex min-w-0 items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tertiary" /><span className="min-w-0 break-words text-body-md">Multimodal Benchmarking</span></li>
                  <li className="flex min-w-0 items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tertiary" /><span className="min-w-0 break-words text-body-md">Live AI Judges & Tournament Apps</span></li>
                </ul>
              </div>
              <div className="min-w-0 border-l border-outline-variant pl-6 sm:pl-8">
                <h4 className="text-label-caps text-secondary mb-6">PHILOSOPHY & LEADERSHIP</h4>
                <ul className="space-y-4">
                  <li className="flex min-w-0 items-start gap-3"><Square size={10} className="mt-1 shrink-0 text-tertiary" /><span className="min-w-0 break-words text-body-md">ML Domain Lead @ MLSA KIIT</span></li>
                  <li className="flex min-w-0 items-start gap-3"><Square size={10} className="mt-1 shrink-0 text-tertiary" /><span className="min-w-0 break-words text-body-md">Technical Teaching & Community</span></li>
                  <li className="flex min-w-0 items-start gap-3"><Square size={10} className="mt-1 shrink-0 text-tertiary" /><span className="min-w-0 break-words text-body-md">Stoic Grounding (Marcus Aurelius)</span></li>
                  <li className="flex min-w-0 items-start gap-3"><Square size={10} className="mt-1 shrink-0 text-tertiary" /><span className="min-w-0 break-words text-body-md">Strategic Thinking (F1 & Cricket)</span></li>
                </ul>
              </div>
            </div>
            <div className="min-w-0 border-t border-outline-variant pt-12">
              <h4 className="text-label-caps text-secondary mb-8">MILESTONES</h4>
              <div className="space-y-8">
                {milestones.map((milestone, idx) => (
                  <HistoryItem key={idx} title={milestone.title} date={milestone.date} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-section-gap border border-outline-variant bg-background px-margin-page py-20 text-left sm:py-32 sm:px-12">
        <h2 className="text-display mb-10 text-tertiary italic sm:mb-12"> लखनऊ to the world.</h2>
        <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-10 sm:gap-y-4">
          <a
            href="mailto:hello@kartikeya.build"
            className="w-fit max-w-full break-all border-b border-tertiary pb-2 text-label-caps tracking-[0.12em] hover:opacity-70 sm:break-normal sm:tracking-[0.15em]"
          >
            hello@kartikeya.build
          </a>
          <a href="#" className="w-fit shrink-0 border-b border-tertiary pb-2 text-label-caps tracking-[0.15em] hover:opacity-70">
            LINKEDIN
          </a>
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
