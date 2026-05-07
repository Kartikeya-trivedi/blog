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
        <span className="text-label-caps text-secondary mb-6 block">THE EDITORIAL</span>
        <h1 className="text-display mb-12">Researcher, Builder, and someone who stays up too late watching race replays.</h1>
        <p className="text-body-lg text-secondary italic font-serif">
          Figuring out what it looks like to build something that actually matters.
        </p>
      </section>

      <section className="space-y-12 mb-32">
        <div className="prose prose-neutral max-w-none prose-lg">
          <p className="text-body-lg leading-relaxed first-letter:text-7xl first-letter:font-serif first-letter:mr-3 first-letter:float-left">
            I am a second-year Computer Science student at KIIT University. I grew up in Lucknow, and that city is still very much part of me — the LSG loyalty runs deep, and every IPL season is taken seriously.
          </p>
          <p className="text-body-lg leading-relaxed mt-8">
            Cricket for me isn't just a sport, it's almost a language. The way Bumrah sets up a batsman over four overs, the way Pooran can change a game in six balls, the tactical chess of a Test match — I find the same kind of pattern recognition there that I do in Machine Learning.
          </p>
          <p className="text-body-lg leading-relaxed mt-8">
            Then there's Formula 1 — another obsession. The engineering, the strategy, the milliseconds. I'm the kind of person who watches the technical analysis videos after a race, not just the highlights. F1 scratches the same itch as systems design: everything is interconnected, every decision has a downstream consequence, and the margin between brilliant and catastrophic is razor thin.
          </p>
        </div>
      </section>

      <section className="my-32 aspect-[3/4] max-w-md mx-auto bg-surface-container overflow-hidden grayscale border border-outline-variant relative group">
        <img 
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
          src="/me.jpg" 
          alt="Portrait - Mirror Selfie" 
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-label-caps text-white bg-black/50 px-4 py-2 backdrop-blur-sm">TECHNICAL PRECISION & STRATEGIC DEPTH</span>
        </div>
      </section>

      <section className="space-y-12 mb-32">
        <div className="prose prose-neutral max-w-none prose-lg">
          <p className="text-body-lg leading-relaxed">
            Off the track and pitch, I read. Marcus Aurelius' <span className="italic">Meditations</span> is a book I return to — not as a productivity hack or an aesthetic pose, but because Stoicism as a framework for staying grounded while moving fast actually resonates with how I try to live. I'm curious about Vedic astrology, dream science, and the kind of questions that don't have clean answers.
          </p>
          <p className="text-body-lg leading-relaxed mt-8">
            On the software and ML side, I build constantly. I’ve led community events where I’ve taught people to deploy LLMs in production, built tournament apps with live AI judges, designed fine-tuning pipelines, and am currently working on an AI-powered portfolio tool called <span className="font-bold text-tertiary">ShowKase</span>. I co-founded <span className="font-bold">Mindrix</span>, an AI startup, and published research on multimodal AI benchmarking targeting top NLP venues.
          </p>
          <p className="text-body-lg leading-relaxed mt-8 border-l-4 border-tertiary pl-8 italic">
            I lead the ML vertical at MLSA KIIT and genuinely enjoy the teaching and community side of it — not just the building in isolation.
          </p>
          <p className="text-body-lg leading-relaxed mt-8">
            But the label I'd probably resist most is "ML guy." I'm someone who happens to be good at ML. The curiosity came first — about systems, about people, about why things work the way they do. The tech is just the current best expression of that.
          </p>
        </div>
      </section>

      <section className="text-center py-24 border-y border-outline-variant bg-surface-container/30">
        <h2 className="text-display italic font-serif mb-8 max-w-lg mx-auto"> लखनऊ से संसार तक.</h2>
        <p className="text-label-caps text-secondary tracking-[0.2em]">CURATED BY KARTIKEYA TRIVEDI</p>
      </section>
    </motion.div>
  );
}
