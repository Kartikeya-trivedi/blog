import { useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { ChevronRight, ArrowLeft, Share2, Twitter, Linkedin, Link as LinkIcon, ExternalLink, Bookmark, Clock } from 'lucide-react';
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
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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

  const toc = useMemo(() => {
    if (!post?.content) return [];
    const headings = post.content.match(/^#+\s+.+$/gm) || [];
    return headings.map(h => {
      const level = (h.match(/#/g) || []).length;
      const text = h.replace(/^#+\s+/, '');
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return { level, text, id };
    });
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
      className="w-full relative"
    >
      {/* Reading Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-tertiary z-[100] origin-left" style={{ scaleX }} />

      <section className="max-w-container-max mx-auto px-margin-page pt-16">
        <nav className="flex items-center gap-2 mb-8 text-[10px] text-secondary font-mono tracking-widest uppercase">
          <Link to="/" className="hover:text-tertiary transition-colors">Journal</Link>
          <ChevronRight size={10} />
          <span className="text-tertiary opacity-60">{post.category}</span>
          <ChevronRight size={10} />
          <span className="text-tertiary opacity-40 truncate max-w-[200px]">{post.title}</span>
        </nav>

        {post.series && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-surface-container border border-outline-variant rounded-full text-[10px] font-mono text-tertiary">
            <Bookmark size={12} className="text-tertiary" />
            <span className="uppercase tracking-widest opacity-60">Series:</span>
            <span className="font-bold">{post.series}</span>
            <span className="px-1.5 py-0.5 bg-tertiary text-white rounded-full">PART {post.seriesOrder || 1}</span>
          </div>
        )}

        <motion.h1 
          className="font-serif leading-[1.1] tracking-[-0.02em] font-normal text-[36px] sm:text-[56px] lg:text-[72px] max-w-[900px] mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {post.title}
        </motion.h1>

        <div className="flex flex-col gap-6 mb-8 sm:mb-12 border-b border-outline-variant pb-6 sm:pb-8">
          <div className="flex flex-wrap gap-8 sm:gap-12">
            <div className="flex flex-col gap-1.5">
              <span className="text-label-caps text-secondary text-[10px]">AUTHOR</span>
              <span className="text-body-md text-tertiary font-medium">{post.author}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-label-caps text-secondary text-[10px]">DATE</span>
              <span className="text-body-md text-tertiary font-medium">{post.date}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-label-caps text-secondary text-[10px]">READ TIME</span>
              <span className="text-body-md text-tertiary font-medium flex items-center gap-1.5">
                <Clock size={16} /> {calculateReadTime(post.content)} MIN
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-label-caps text-secondary text-[10px] mr-1">SHARE</span>
            <button onClick={() => handleShare('twitter')} className="p-2 hover:bg-surface-container rounded-full transition-colors"><Twitter size={18} /></button>
            <button onClick={() => handleShare('linkedin')} className="p-2 hover:bg-surface-container rounded-full transition-colors"><Linkedin size={18} /></button>
            <button onClick={() => handleShare('copy')} className="p-2 hover:bg-surface-container rounded-full transition-colors"><LinkIcon size={18} /></button>
          </div>
        </div>

        {post.image && (
          <div className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] overflow-hidden mb-10 sm:mb-16">
            <img 
              alt={post.title} 
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover" 
              src={post.image} 
            />
          </div>
        )}
      </section>

      <div className="max-w-container-max mx-auto px-margin-page grid grid-cols-12 gap-8 lg:gap-12 relative overflow-hidden">
        {/* TOC Sidebar */}
        <aside className="hidden lg:block col-span-3 sticky top-32 h-fit">
          <div className="border-l border-outline-variant pl-8 py-2">
             <h4 className="text-label-caps text-tertiary mb-6 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-tertiary rounded-full"></span>
               DOCUMENT INDEX
             </h4>
             <ul className="space-y-4">
               {toc.map(({ id, text, level }, i) => (
                 <li key={i} className={cn(
                   "text-[11px] font-mono leading-tight transition-colors flex items-start gap-2",
                   level === 1 ? "text-tertiary font-bold" : "text-secondary opacity-60"
                 )} style={{ marginLeft: level > 1 ? `${(level - 1) * 1}rem` : '0' }}>
                   {level > 1 && <span className="mt-1.5 w-1 h-1 bg-current rounded-full flex-shrink-0" />}
                   <a href={`#${id}`} className="hover:underline tracking-tight uppercase">
                      {text}
                   </a>
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

        <article className="col-span-12 lg:col-span-8 lg:col-start-5 mb-section-gap min-w-0">
          <div className="prose-container">
            {post.excerpt && (
              <p className="text-headline-md italic font-serif text-secondary mb-12 border-l-4 border-outline-variant pl-8 py-2 leading-relaxed">
                {post.excerpt}
              </p>
            )}
            <MarkdownRenderer content={post.content} />
          </div>
        </article>
      </div>

      <section className="bg-surface-container-low py-section-gap border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-margin-page">
          <div className="flex justify-between items-end mb-16">
            <h3 className="text-headline-lg text-tertiary">Related Discourse</h3>
            <Link to="/archive" className="text-label-caps text-tertiary border-b border-tertiary hover:opacity-60 transition-all text-xs">VIEW FULL ARCHIVE</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
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

      {/* Comment Section */}
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
      await blogService.addComment({
        postId,
        author: newComment.author,
        content: newComment.content
      });
      onCommentAdded();
      setNewComment({ author: '', content: '' });
    } catch (e) {
      alert('Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto px-margin-page">
      <div className="mb-24">
        <span className="text-label-caps text-secondary mb-4 block text-[10px]">PARTICIPATION</span>
        <h2 className="text-display text-4xl mb-12">Public Responses.</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8 border-b border-outline-variant pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            className="text-label-caps bg-tertiary text-white px-10 py-4 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'TRANSMITTING...' : 'COMMIT RESPONSE'}
          </button>
        </form>
      </div>

      <div className="space-y-16">
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
    <Link to={`/article/${slug || id}`} className="group flex flex-col gap-6">
      <div className="w-full aspect-[16/10] bg-surface-container overflow-hidden">
        <img src={image} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700" alt={title} />
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-label-caps text-secondary text-[10px]">{category}</span>
        <h4 className="text-headline-sm text-tertiary group-hover:italic transition-all">{title}</h4>
      </div>
    </Link>
  );
}
