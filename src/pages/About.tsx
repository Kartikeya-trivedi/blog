import { motion } from 'motion/react';

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[800px] mx-auto px-margin-page py-24"
    >
      <section className="mb-24 text-center">
        <span className="text-label-caps text-secondary mb-6 block">MANIFESTO</span>
        <h1 className="text-display mb-12">The Case for Intentional Silence.</h1>
        <p className="text-body-lg text-secondary italic font-serif">
          In a world of excessive noise, clarity is the ultimate luxury.
        </p>
      </section>

      <section className="space-y-12 mb-32">
        <div className="prose prose-neutral max-w-none">
          <p className="text-body-lg leading-relaxed">
            Founded in 2024, <span className="font-bold">The Editorial</span> was born from a desire to return to the fundamentals of publishing. We believe that digital space should be treated with the same reverence as physical stock. Every pixel, every character, and every margin is an opportunity to express a quiet authority.
          </p>
          <p className="text-body-lg leading-relaxed mt-8">
            Our mission is not to provide more information, but to provide better context. We curate essays on modern architecture, minimalist design, and the philosophical underpinnings of the tech-driven human experience. We reject the "feed" culture in favor of the "monograph"—stand-alone works that retain their value over time.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-outline-variant pt-24 mb-32">
        <div>
          <h3 className="text-headline-sm mb-6">Our Principles</h3>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <span className="text-label-caps font-bold">01</span>
              <div>
                <p className="text-body-md font-bold mb-1">AESTHETIC RIGOR</p>
                <p className="text-body-md text-secondary">A commitment to monochromatic discipline and classical grid structures.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-label-caps font-bold">02</span>
              <div>
                <p className="text-body-md font-bold mb-1">COGNITIVE DEPTH</p>
                <p className="text-body-md text-secondary">Content that demands attention rather than begging for it.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-label-caps font-bold">03</span>
              <div>
                <p className="text-body-md font-bold mb-1">TEMPORAL PERMANENCE</p>
                <p className="text-body-md text-secondary">Designing for the future archive, not the temporary scroll.</p>
              </div>
            </li>
          </ul>
        </div>
        <div className="aspect-[3/4] bg-surface-container overflow-hidden grayscale">
          <img 
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYF_A-Z6vH1E_n_T7m3P6fP7vF_U_r0fU_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v_v" 
            alt="Minimalist Architecture" 
          />
        </div>
      </section>

      <section className="text-center py-24 border-y border-outline-variant">
        <h2 className="text-headline-lg italic font-serif mb-8">Curated in Copenhagen.</h2>
        <p className="text-label-caps text-secondary">ESTABLISHED MMXXIV</p>
      </section>
    </motion.div>
  );
}
