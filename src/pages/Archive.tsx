import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

import { archives } from '../lib/data';

export default function ArchivePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-container-max px-margin-page py-24"
    >
      <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
        <div>
          <span className="text-label-caps text-secondary mb-4 block">THE COLLECTIONS</span>
          <h1 className="text-display">The Full Archive.</h1>
        </div>
        <p className="text-body-lg text-secondary max-w-sm mb-2">
          An organized repository of all past volumes, monographs, and visual studies published since our inception.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-px bg-outline-variant border border-outline-variant">
        {archives.map((archive) => (
          <div key={archive.volume} className="bg-background group hover:bg-surface-container-low transition-colors duration-500">
            <Link to="/" className="grid grid-cols-12 gap-8 py-16 px-8 items-center cursor-pointer">
              <div className="col-span-12 md:col-span-2">
                <span className="text-display text-4xl font-serif">VOL. {archive.volume}</span>
              </div>
              <div className="col-span-6 md:col-span-3">
                <p className="text-label-caps text-secondary mb-1">PERIOD</p>
                <p className="text-body-md font-bold">{archive.period}</p>
              </div>
              <div className="col-span-6 md:col-span-6">
                <p className="text-label-caps text-secondary mb-1">SUBJECTS</p>
                <div className="flex flex-wrap gap-2">
                  {archive.subjects.map(s => (
                    <span key={s} className="text-body-md bg-surface-container px-2 py-0.5 text-[12px]">{s}</span>
                  ))}
                </div>
              </div>
              <div className="col-span-12 md:col-span-1 text-right">
                <span className={archive.status === 'ACTIVE' ? 'text-on-tertiary-fixed-variant' : 'text-secondary opacity-50'}>
                  {archive.status}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <section className="mt-32 p-16 bg-surface-container text-left">
        <h3 className="text-headline-md mb-8">Looking for something specific?</h3>
        <div className="max-w-md">
          <input 
            type="text" 
            placeholder="SEARCH ARCHIVE..." 
            className="w-full bg-transparent border-b border-tertiary px-4 py-3 text-label-caps focus:outline-none focus:border-secondary transition-all text-left"
          />
        </div>
      </section>
    </motion.div>
  );
}
