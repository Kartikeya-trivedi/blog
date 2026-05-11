import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, X, Hash, Clock } from 'lucide-react';
import { blogService, BlogPost } from '@/src/lib/blogService';
import { cn } from '@/src/lib/utils';

export default function JournalPage() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const posts = await blogService.getPosts();
      setAllPosts(posts.filter(p => p.status === 'PUBLISHED'));
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allPosts.forEach(post => {
      post.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || post.tags?.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [allPosts, searchQuery, selectedTag]);

  const calculateReadTime = (content: string) => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / 200));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto w-full min-w-0 max-w-container-max px-margin-page"
    >
      {/* Hero Featured Post */}
      <section className="mt-16 mb-section-gap">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative mb-8 aspect-square w-full max-w-full min-w-0 overflow-hidden sm:mb-12 sm:aspect-[4/3] lg:aspect-[21/9]"
            >
              <img 
                alt="Featured post" 
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-full w-full max-w-full object-cover filter grayscale transition-all duration-1000 hover:grayscale-0" 
                src="/chair.jpeg" 
              />
            </motion.div>
          </div>
          <div className="col-span-12 md:col-start-3 md:col-span-8 text-center">

            <h1 className="text-display mb-8">Building Something That Actually Matters: A Systems Approach to Life and ML.</h1>
            <p className="text-body-lg text-secondary mb-10 max-w-2xl mx-auto italic font-serif">
              Exploring the downstream consequences of decisions in software, machine learning, and the pursuit of a meaningful life.
            </p>
            <Link 
              to="/archive" 
              className="inline-block border-b border-primary pb-1 text-label-caps hover:text-secondary hover:border-secondary transition-all"
            >
              The Full Perspective
            </Link>
          </div>
        </div>
      </section>

      {/* Utilities: Search & Tags */}
      <section className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-outline-variant">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
          <input 
            type="text" 
            placeholder="Search the editorial..."
            className="w-full bg-surface-container border-0 pl-12 pr-4 py-3 text-body-md focus:outline-none focus:ring-1 focus:ring-tertiary transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-tertiary"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {allTags.slice(0, 6).map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={cn(
                "px-4 py-1.5 text-[10px] font-mono border rounded-full transition-all flex items-center gap-1.5",
                selectedTag === tag 
                  ? "bg-tertiary text-white border-tertiary shadow-lg" 
                  : "border-outline-variant text-secondary hover:border-tertiary hover:text-tertiary"
              )}
            >
              <Hash size={10} /> {tag.toUpperCase()}
            </button>
          ))}
          {selectedTag && (
            <button 
              onClick={() => setSelectedTag(null)}
              className="px-4 py-1.5 text-[10px] font-mono border border-transparent text-secondary hover:text-tertiary underline decoration-dotted"
            >
              CLEAR FILTER
            </button>
          )}
        </div>
      </section>

      {/* Content Grid */}
      <section className="grid grid-cols-12 gap-8 pt-4 mb-section-gap">
        <div className="col-span-12 md:col-span-8">
          <div className="flex justify-between items-baseline mb-12">
            <h2 className="text-label-caps text-tertiary">
              {selectedTag ? `CATEGORIZED: ${selectedTag}` : searchQuery ? `SEARCH RESULTS FOR: ${searchQuery}` : "NOTES ON SYSTEMS & BUILDING"}
            </h2>
            <span className="text-[10px] font-mono text-secondary">{filteredPosts.length} ENTRIES</span>
          </div>
          
          <div className="space-y-0">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="py-24 text-center text-label-caps animate-pulse">RECOVERING DATA FROM CLOUD ARCHIVE...</div>
              ) : filteredPosts.length === 0 ? (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-24 text-center text-body-lg text-secondary italic border-b border-outline-variant"
                >
                  No match found for your inquiry.
                </motion.p>
              ) : (
                filteredPosts.map((article) => (
                  <motion.div
                    key={article.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Link 
                      to={`/article/${article.slug || article.id}`}
                      className="group block border-b border-outline-variant py-12 first:pt-0"
                    >
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                             <span className="text-label-caps text-secondary text-[10px]">{article.date} — {article.category}</span>
                             <div className="flex items-center gap-1 text-[10px] font-mono text-secondary opacity-60">
                               <Clock size={10} /> {calculateReadTime(article.content)} MIN READ
                             </div>
                          </div>
                          <h3 className="text-headline-md group-hover:italic transition-all duration-300">{article.title}</h3>
                          {article.excerpt && (
                            <p className="mt-4 text-body-md text-secondary line-clamp-2 italic font-serif max-w-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                              {article.excerpt}
                            </p>
                          )}
                          <div className="mt-4 flex gap-2 flex-wrap">
                            {article.tags?.map(tag => (
                              <span key={tag} className="text-[9px] font-mono text-secondary/60 bg-surface-container px-2 py-0.5 rounded italic">#{tag.toLowerCase()}</span>
                            ))}
                          </div>
                        </div>
                        <motion.div whileHover={{ x: 8 }} className="hidden sm:block">
                          <ArrowRight size={24} className="text-outline group-hover:text-tertiary transition-colors" />
                        </motion.div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
          <div className="mt-16">
            <Link to="/archive" className="text-label-caps border border-tertiary px-10 py-4 hover:bg-tertiary hover:text-white transition-all inline-block">
              View Full Archive
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="col-span-12 md:col-start-10 md:col-span-3">
          <div className="sticky top-32">
            <div className="w-24 h-24 mb-8 grayscale overflow-hidden border border-outline-variant hover:grayscale-0 transition-all duration-1000">
              <img 
                alt="Portrait" 
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
                src="/me.jpeg" 
              />
            </div>
            <h4 className="text-headline-sm mb-4">The Editorial</h4>
            <p className="text-body-md text-secondary mb-8">
              The personal journal and repository of Kartikeya. Researcher, Builder, and CS student exploring technical depth.
            </p>
            <div className="space-y-4 pt-8 border-t border-outline-variant">
              <a href="mailto:hello@kartikeya.build" className="flex items-center gap-2 text-label-caps text-tertiary hover:text-secondary transition-colors text-[10px]">
                CORRESPONDENCE
              </a>
              <Link to="/portfolio" className="flex items-center gap-2 text-label-caps text-tertiary hover:text-secondary transition-colors text-[10px]">
                PORTFOLIO
              </Link>
              <Link to="/archive" className="flex items-center gap-2 text-label-caps text-tertiary hover:text-secondary transition-colors text-[10px]">
                THE ARCHIVES
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </motion.div>
  );
}
