import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useScroll, useSpring, AnimatePresence, LayoutGroup } from 'motion/react';
import { ChevronRight, Twitter, Linkedin, Link as LinkIcon, ExternalLink, Bookmark, Clock, Minimize2, Maximize2, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { blogService, BlogPost } from '@/src/lib/blogService';
import { MarkdownRenderer } from '@/src/components/MarkdownRenderer';
import { cn } from '@/src/lib/utils';

export default function ArticlePage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [isZenMode, setIsZenMode] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [activeId, setActiveId] = useState<string>('');
  const tocRef = useRef<HTMLUListElement>(null);
  const zenTocRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { 
        rootMargin: '-100px 0% -80% 0%',
        threshold: 0
      }
    );

    const headingElements = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [post?.content, loading]);

  useEffect(() => {
    const fetchPost = async () => {
      if (slug) {
        try {
          setLoading(true);
          const data = await blogService.getPostBySlug(slug);
          if (data) {
            setPost(data);
            const all = (await blogService.getPosts()).filter(p => p.id !== data.id && p.status === 'PUBLISHED');
            const sameCategory = all.filter(p => p.category === data.category);
            setRelatedPosts(sameCategory.length > 0 ? sameCategory.slice(0, 3) : all.slice(0, 3));
            const postComments = await blogService.getComments(data.id);
            setComments(postComments);
          }
        } catch (error) {
          console.error('Error fetching post:', error);
        } finally {
          setLoading(false);
          window.scrollTo(0, 0);
        }
      } else {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  // Lock body scroll in zen mode on mobile
  useEffect(() => {
    if (isZenMode) {
      document.documentElement.classList.add('zen-mode');
    } else {
      document.documentElement.classList.remove('zen-mode');
    }
    return () => document.documentElement.classList.remove('zen-mode');
  }, [isZenMode]);

  const toc = useMemo(() => {
    if (!post?.content) return [];
    // Match lines starting with 1-6 hashtags, followed by optional space, then text
    const headings = post.content.match(/^#{1,6}\s*.*$/gm) || [];
    return headings.map(h => {
      const level = (h.match(/#/g) || []).length;
      const text = h.replace(/^#+\s*/, '').trim();
      // Improved ID generation to match common markdown parsers
      const id = text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+$/g, '');
      return { level, text, id };
    }).filter(item => item.text.length > 0);
  }, [post?.content]);

  const calculateReadTime = (content: string) => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / 200));
  };

  const handleShare = (platform: 'twitter' | 'linkedin' | 'copy') => {
    const url = window.location.href;
    const title = post?.title || 'The Editorial Post';
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
    }
  };

  const onCommentAdded = async () => {
    if (post) {
      const postComments = await blogService.getComments(post.id);
      setComments(postComments);
    }
  };

  if (loading) return <div className="py-48 text-center text-label-caps animate-pulse">Retreiving manuscript from archives...</div>;

  if (!post) {
    return (
      <div className="max-w-container-max mx-auto px-margin-page py-24 text-center">
        <h1 className="text-display mb-8">Post not found.</h1>
        <Link to="/" className="text-label-caps border border-tertiary px-8 py-3 hover:bg-tertiary hover:text-white transition-all">
          Return to Journal
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full min-w-0"
    >
      {/* Reading Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-tertiary z-[100] origin-left" style={{ scaleX }} />

      {/* ── ZEN MODE OVERLAY ── */}
      <AnimatePresence>
        {isZenMode && (
          <motion.div
            key="zen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-background overflow-y-auto"
          >
            {/* Zen top bar */}
            <div className="sticky top-0 bg-background/90 backdrop-blur-sm border-b border-outline-variant z-10">
              <div className="max-w-[1200px] mx-auto px-6 sm:px-12 py-3 flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-secondary opacity-50">{post.category} — {post.title}</span>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-1">
                    <button onClick={() => handleShare('twitter')} className="p-1.5 hover:bg-surface-container rounded-full transition-colors"><Twitter size={14} /></button>
                    <button onClick={() => handleShare('linkedin')} className="p-1.5 hover:bg-surface-container rounded-full transition-colors"><Linkedin size={14} /></button>
                    <button onClick={() => handleShare('copy')} className="p-1.5 hover:bg-surface-container rounded-full transition-colors"><LinkIcon size={14} /></button>
                  </div>
                  <button
                    onClick={() => setIsZenMode(false)}
                    className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-secondary hover:text-tertiary transition-colors border border-outline-variant px-3 py-1.5 rounded-full"
                  >
                    <Maximize2 size={12} />
                    Exit Zen
                  </button>
                </div>
              </div>
            </div>

            {/* Zen body — wide on desktop, narrow on mobile */}
            <div className="max-w-[1200px] mx-auto px-6 sm:px-12 py-10 sm:py-16 lg:py-20 flex gap-16">

              {/* Main article — full width mobile, ~70% desktop */}
              <div className="flex-1 min-w-0">
                <div className="max-w-[760px]">
                  <h1 className="font-serif text-[32px] sm:text-[52px] lg:text-[64px] leading-[1.1] tracking-[-0.02em] font-normal mb-6 sm:mb-8">
                    {post.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-10 pb-8 border-b border-outline-variant text-[11px] font-mono text-secondary uppercase tracking-widest">
                    <span>{post.author}</span>
                    <span className="opacity-30">·</span>
                    <span>{post.date}</span>
                    <span className="opacity-30">·</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {calculateReadTime(post.content)} min read</span>
                  </div>

                  {post.excerpt && (
                    <p className="font-serif italic text-[20px] sm:text-[24px] leading-[1.6] text-secondary mb-12 border-l-4 border-outline-variant pl-6">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="zen-article-content">
                    <MarkdownRenderer content={post.content} />
                  </div>
                </div>
              </div>

              {/* Mini TOC — desktop only, sticky right column */}
              {toc.length > 0 && (
                <aside className="hidden lg:block w-[220px] shrink-0">
                  <div className="sticky top-24 border-l border-outline-variant pl-6 py-2 relative">
                    <h4 className="text-[9px] font-mono tracking-[0.2em] uppercase text-secondary opacity-50 mb-5">On this page</h4>
                    <ul ref={zenTocRef} className="space-y-3 relative">
                      {toc.map(({ id, text, level }, i) => (
                        <li 
                          key={i} 
                          data-id={id}
                          style={{ marginLeft: level > 1 ? `${(level - 1) * 0.75}rem` : '0' }}
                          className="relative"
                        >
                          {activeId === id && (
                            <motion.div
                              layoutId="zen-toc-slider"
                              className="absolute left-[-25px] w-[2px] bg-tertiary h-full rounded-full"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <a
                            href={`#${id}`}
                            className={cn(
                              "text-[11px] font-mono leading-tight hover:text-tertiary transition-colors block",
                              activeId === id || (level === 1 && !activeId && i === 0) ? "text-tertiary font-bold" : "text-secondary opacity-60"
                            )}
                          >
                            {text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NORMAL MODE ── */}
      {/* Zen Mode FAB */}
      <AnimatePresence>
        {!isZenMode && (
          <motion.button
            key="fab"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsZenMode(true)}
            title="Enter Zen Mode"
            className="fixed bottom-6 left-4 z-40 flex items-center gap-2 rounded-full bg-tertiary py-2.5 pl-3 pr-4 text-[11px] font-mono uppercase tracking-widest text-white shadow-lg transition-all hover:opacity-90 md:left-auto md:right-6"
          >
            <Minimize2 size={14} />
            <span className="hidden sm:inline">Zen</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Article header section */}
      <section className="max-w-container-max mx-auto px-margin-page pt-8 sm:pt-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 mb-6 sm:mb-8 text-[10px] text-secondary font-mono tracking-widest uppercase overflow-hidden">
          <Link to="/" className="hover:text-tertiary transition-colors shrink-0">Journal</Link>
          <ChevronRight size={10} className="shrink-0" />
          <span className="text-tertiary opacity-60 shrink-0 truncate">{post.category}</span>
          <ChevronRight size={10} className="shrink-0" />
          <span className="text-tertiary opacity-40 truncate">{post.title}</span>
        </nav>

        {/* Series badge */}
        {post.series && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-surface-container border border-outline-variant rounded-full text-[10px] font-mono text-tertiary max-w-full overflow-hidden">
            <Bookmark size={12} className="text-tertiary shrink-0" />
            <span className="uppercase tracking-widest opacity-60 shrink-0">Series:</span>
            <span className="font-bold truncate">{post.series}</span>
            <span className="px-1.5 py-0.5 bg-tertiary text-white rounded-full shrink-0">PART {post.seriesOrder || 1}</span>
          </div>
        )}

        {/* Title */}
        <motion.h1
          className="font-serif leading-[1.1] tracking-[-0.02em] font-normal text-[32px] sm:text-[52px] lg:text-[72px] mb-6 sm:mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {post.title}
        </motion.h1>

        {/* Metadata */}
        <div className="border-b border-outline-variant pb-5 sm:pb-8 mb-6 sm:mb-10">
          <div className="flex flex-wrap gap-x-8 gap-y-3 mb-5">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono tracking-[0.18em] uppercase text-secondary opacity-60">Author</span>
              <span className="text-[14px] sm:text-[16px] font-sans font-medium text-tertiary">{post.author}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono tracking-[0.18em] uppercase text-secondary opacity-60">Date</span>
              <span className="text-[14px] sm:text-[16px] font-sans font-medium text-tertiary">{post.date}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono tracking-[0.18em] uppercase text-secondary opacity-60">Read Time</span>
              <span className="text-[14px] sm:text-[16px] font-sans font-medium text-tertiary flex items-center gap-1.5">
                <Clock size={14} /> {calculateReadTime(post.content)} min
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono tracking-[0.18em] uppercase text-secondary opacity-60 mr-1">Share</span>
            <button onClick={() => handleShare('twitter')} className="p-1.5 hover:bg-surface-container rounded-full transition-colors"><Twitter size={16} /></button>
            <button onClick={() => handleShare('linkedin')} className="p-1.5 hover:bg-surface-container rounded-full transition-colors"><Linkedin size={16} /></button>
            <button onClick={() => handleShare('copy')} className="p-1.5 hover:bg-surface-container rounded-full transition-colors"><LinkIcon size={16} /></button>
          </div>
        </div>
      </section>

      {/* Hero image — full viewport width on mobile, constrained on desktop */}
      {post.image && (
        <section className="mb-8 w-full min-w-0 sm:mb-16 lg:max-w-container-max lg:mx-auto lg:px-margin-page" aria-label="Article cover">
          <div className="aspect-square w-full min-w-0 overflow-hidden sm:aspect-[4/3] lg:aspect-[21/9] lg:rounded-lg">
            <img
              alt={post.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              decoding="async"
              className="block h-full w-full object-cover"
              src={post.image}
            />
          </div>
        </section>
      )}

      {/* Article body + TOC — simpler layout on mobile to prevent truncation */}
      <div className="max-w-container-max mx-auto px-margin-page flex flex-col lg:grid lg:grid-cols-12 lg:gap-12 relative">
        {/* TOC Sidebar — desktop only */}
        <aside className="hidden lg:block col-span-3 sticky top-32 h-fit">
          <div className="border-l border-outline-variant pl-8 py-2 relative">
            <h4 className="text-label-caps text-tertiary mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-tertiary rounded-full" />
              DOCUMENT INDEX
            </h4>
            <ul ref={tocRef} className="space-y-4 relative">
              {toc.map(({ id, text, level }, i) => (
                <li 
                  key={i} 
                  data-id={id}
                  className={cn(
                    "text-[11px] font-mono leading-tight transition-colors flex items-start gap-2 relative",
                    activeId === id || (level === 1 && !activeId && i === 0) ? "text-tertiary font-bold" : "text-secondary opacity-60"
                  )} 
                  style={{ marginLeft: level > 1 ? `${(level - 1) * 1}rem` : '0' }}
                >
                  {activeId === id && (
                    <motion.div
                      layoutId="toc-slider"
                      className="absolute left-[-33.5px] w-[3px] bg-tertiary h-full rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {level > 1 && <span className={cn(
                    "mt-1.5 w-1 h-1 rounded-full flex-shrink-0",
                    activeId === id ? "bg-tertiary" : "bg-current"
                  )} />}
                  <a href={`#${id}`} className="hover:underline tracking-tight uppercase">{text}</a>
                </li>
              ))}
              {toc.length === 0 && <li className="text-[11px] font-mono text-secondary italic">No structured markers found.</li>}
            </ul>

            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-outline-variant">
                <h4 className="text-label-caps text-tertiary mb-6">TAXONOMY</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-mono bg-surface-container px-2 py-1 rounded text-secondary italic">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {post.canonicalUrl && (
              <div className="mt-12 pt-8 border-t border-outline-variant">
                <a
                  href={post.canonicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[10px] font-mono text-secondary hover:text-tertiary transition-colors"
                >
                  <ExternalLink size={14} /> CANONICAL SOURCE
                </a>
              </div>
            )}
          </div>
        </aside>

        {/* Article content — full width on mobile */}
        <article className="w-full mb-section-gap min-w-0 break-words pb-24 sm:pb-20 lg:col-span-8 lg:col-start-5 lg:w-auto">
          {post.excerpt && (
            <p className="font-serif italic text-[18px] sm:text-[24px] leading-normal text-secondary mb-8 border-l-4 border-outline-variant pl-5 sm:pl-8 py-2">
              {post.excerpt}
            </p>
          )}
          <MarkdownRenderer content={post.content} />
        </article>
      </div>

      {/* Related posts */}
      <section className="bg-surface-container-low py-section-gap border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-margin-page">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10 sm:mb-16">
            <h3 className="font-serif text-[32px] sm:text-[48px] leading-[1.2] font-normal text-tertiary">Related Discourse</h3>
            <Link to="/archive" className="text-label-caps text-tertiary border-b border-tertiary hover:opacity-60 transition-all text-xs self-start sm:self-auto">VIEW FULL ARCHIVE</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            {relatedPosts.map(related => (
              <RelatedCard
                key={related.id}
                id={related.id}
                slug={related.slug}
                image={related.image || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop"}
                category={related.category}
                title={related.title}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Comments */}
      <section className="py-section-gap bg-background border-t border-outline-variant">
        <CommentSection postId={post.id} comments={comments} onCommentAdded={onCommentAdded} />
      </section>
    </motion.div>
  );
}

function CommentSection({ postId, comments, onCommentAdded }: { postId: string, comments: any[], onCommentAdded: () => void }) {
  const [newComment, setNewComment] = useState({ author: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.author.trim() || !newComment.content.trim()) return;
    setIsSubmitting(true);
    try {
      await blogService.addComment({ postId, author: newComment.author, content: newComment.content });
      onCommentAdded();
      setNewComment({ author: '', content: '' });
    } catch (e) {
      alert('Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[720px] mx-auto px-margin-page">
      <div className="mb-16 sm:mb-24">
        <span className="text-label-caps text-secondary mb-4 block text-[10px]">PARTICIPATION</span>
        <h2 className="font-serif text-[36px] sm:text-[48px] leading-[1.2] font-normal mb-10 sm:mb-12">Public Responses.</h2>

        <form onSubmit={handleSubmit} className="space-y-8 border-b border-outline-variant pb-12 sm:pb-16">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-[10px] text-secondary">IDENTITY</label>
            <input
              type="text"
              required
              placeholder="YOUR NAME"
              className="bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-tertiary transition-all text-body-md"
              value={newComment.author}
              onChange={(e) => setNewComment({...newComment, author: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-[10px] text-secondary">OBSERVATION</label>
            <textarea
              required
              rows={4}
              placeholder="SHARE YOUR PERSPECTIVE..."
              className="bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-tertiary transition-all text-body-md resize-none"
              value={newComment.content}
              onChange={(e) => setNewComment({...newComment, content: e.target.value})}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="text-label-caps bg-tertiary text-white px-8 sm:px-10 py-4 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'TRANSMITTING...' : 'COMMIT RESPONSE'}
          </button>
        </form>
      </div>

      <div className="space-y-12 sm:space-y-16">
        {comments.length === 0 ? (
          <p className="text-body-lg text-secondary italic font-serif py-12">
            The transcript is currently silent. Be the first to initiate discourse.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-4">
              <div className="flex justify-between items-end border-b border-outline-variant pb-2">
                <span className="text-label-caps font-bold">{comment.author}</span>
                <span className="text-label-caps text-[10px] text-secondary">{comment.date}</span>
              </div>
              <p className="text-body-lg leading-relaxed text-secondary italic font-serif">
                "{comment.content}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RelatedCard({ id, slug, image, category, title }: { id: string, slug?: string, image: string, category: string, title: string }) {
  return (
    <Link to={`/article/${slug || id}`} className="group flex flex-col gap-4 sm:gap-6">
      <div className="w-full aspect-[16/10] bg-surface-container overflow-hidden">
        <img src={image} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700" alt={title} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-label-caps text-secondary text-[10px]">{category}</span>
        <h4 className="font-serif text-[20px] sm:text-[24px] leading-[1.4] font-medium text-tertiary group-hover:italic transition-all">{title}</h4>
      </div>
    </Link>
  );
}
