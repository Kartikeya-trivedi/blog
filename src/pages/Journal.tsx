import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { blogService, BlogPost } from '@/src/lib/blogService';

export default function JournalPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const stored = blogService.getPosts().filter(p => p.status === 'PUBLISHED');
    setPosts(stored);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-container-max mx-auto px-margin-page"
    >
      {/* Hero Featured Post */}
      <section className="mt-16 mb-section-gap">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12">
            <motion.div 
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              className="relative w-full aspect-[21/9] overflow-hidden mb-12"
            >
              <img 
                alt="Featured post" 
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-1000" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC299pS3S3pdd7coXossBSS-XnnoIdNtauaFzXqtogbBvqrypZ3zEDTqXF1_fhP2pywfPoxXmocpCaJ1_bYfoB3Sl6HXApSbIY7wWDMWgaVMIi-3wuN0X1lORmsQ2BKN2sdAC3GVQIcmrf85G8M23K0Y2gQCO4pbcpd87yuCej6KcepdTdCUcNzfP0-1jxCighj3dno0tBHLzv1_NmFHz0RU1DOfaeF63es97IQb1tu6BJzxkaugVoTlUg7IpVtRVMkK5YtjbTzBxE" 
              />
            </motion.div>
          </div>
          <div className="col-span-12 md:col-start-3 md:col-span-8 text-center">
            <span className="text-label-caps text-secondary mb-4 block">ESSAY — VOL. IV</span>
            <h1 className="text-display mb-8">The Architecture of Silence: Finding Clarity in Modern Minimalism</h1>
            <p className="text-body-lg text-secondary mb-10 max-w-2xl mx-auto italic font-serif">
              An exploration of how intentional physical spaces influence the cognitive depth of our creative output in an increasingly noisy digital landscape.
            </p>
            <Link 
              to="/article/manifesto-minimalism" 
              className="inline-block border-b border-primary pb-1 text-label-caps hover:text-secondary hover:border-secondary transition-all"
            >
              Read the Monograph
            </Link>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="grid grid-cols-12 gap-8 border-t border-outline-variant pt-16 mb-section-gap">
        <div className="col-span-12 md:col-span-8">
          <h2 className="text-label-caps text-tertiary mb-12">RECENT ENTRIES</h2>
          <div className="space-y-0">
            {posts.length === 0 ? (
              <p className="py-24 text-center text-body-lg text-secondary italic border-b border-outline-variant">
                The archives are currently quiet. Stay tuned for new entries.
              </p>
            ) : (
              posts.map((article) => (
                <Link 
                  key={article.id} 
                  to={`/article/${article.id}`}
                  className="group block border-b border-outline-variant py-12 first:pt-0"
                >
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <span className="text-label-caps text-secondary block mb-2">{article.date} — {article.category}</span>
                      <h3 className="text-headline-md group-hover:italic transition-all duration-300">{article.title}</h3>
                    </div>
                    <motion.div whileHover={{ x: 8 }}>
                      <ArrowRight size={24} className="text-outline group-hover:text-tertiary transition-colors" />
                    </motion.div>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="mt-16">
            <Link to="/archive" className="text-label-caps border border-tertiary px-10 py-4 hover:bg-tertiary hover:text-white transition-all inline-block">
              View Full Archive
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="col-span-12 md:col-start-10 md:col-span-3 mt-24 md:mt-0">
          <div className="sticky top-24">
            <div className="w-24 h-24 mb-8 grayscale overflow-hidden">
              <img 
                alt="Kartikeya Trivedi" 
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0LGkvhkPCr6J-Fs2Oilt4wanvbZA_Y6xLwTx_Ce4LUX6kCZTBCW-5RT1bPHe-G-ZORF3yIwXBfXRJBPMYpOPE1jNZnheXo61NCzHr90XXd2W37yqpsl629OOYzHu39P9LQ1hxZlp1y2-ZWc8F_NewQpvHCTJMizQVirFu7sJxVb03YrI4RATY48lYvVLWPNiOkbAyHX40G62oxzK_FzM90MK8n2baTd5aMUE-Z977aZ7UxOMsbreI_apgNvsEBbnR3TnHvToHVHM" 
              />
            </div>
            <h4 className="text-headline-sm mb-4">Kartikeya Trivedi</h4>
            <p className="text-body-md text-secondary mb-8">
              Writer and curator exploring the intersection of modern architecture, minimalist design, and the digital human experience.
            </p>
            <div className="space-y-4">
              <a href="mailto:hello@theeditorial.com" className="flex items-center gap-2 text-label-caps text-tertiary hover:text-secondary transition-colors">
                CORRESPONDENCE
              </a>
              <a href="#" className="flex items-center gap-2 text-label-caps text-tertiary hover:text-secondary transition-colors">
                RSS SUBSCRIPTION
              </a>
            </div>
          </div>
        </aside>
      </section>
    </motion.div>
  );
}

