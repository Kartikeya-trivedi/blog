import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { blogService, BlogPost } from '@/src/lib/blogService';
import Markdown from 'react-markdown';

export default function ArticlePage() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const data = blogService.getPostById(id);
      if (data) {
        setPost(data);
      }
    }
    setLoading(false);
  }, [id]);

  if (loading) return <div className="py-24 text-center">Loading entry...</div>;

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      <section className="max-w-container-max mx-auto px-margin-page pt-16">
        <nav className="flex items-center gap-2 mb-8 text-label-caps text-secondary">
          <Link to="/" className="hover:text-tertiary transition-colors">Journal</Link>
          <ChevronRight size={14} />
          <span className="text-tertiary opacity-60 font-medium">{post.category}</span>
          <ChevronRight size={14} />
          <span className="text-tertiary opacity-40 truncate max-w-[200px]">{post.title}</span>
        </nav>

        <motion.h1 
          className="text-display max-w-[800px] mb-12"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {post.title}
        </motion.h1>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12 border-b border-outline-variant pb-8">
          <div className="flex flex-col gap-2">
            <span className="text-label-caps text-secondary">AUTHOR</span>
            <span className="text-body-lg text-tertiary">{post.author}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-label-caps text-secondary">DATE</span>
            <span className="text-body-lg text-tertiary">{post.date}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-label-caps text-secondary">CATEGORY</span>
            <span className="text-body-lg text-tertiary">{post.category}</span>
          </div>
        </div>

        {post.image && (
          <div className="w-full aspect-[21/9] bg-surface-container overflow-hidden mb-section-gap">
            <img 
              alt={post.title} 
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
              src={post.image} 
            />
          </div>
        )}
      </section>

      <article className="max-w-[800px] mx-auto px-margin-page mb-section-gap">
        <div className="prose prose-neutral prose-lg max-w-none">
          {post.excerpt && (
            <p className="text-headline-md italic font-serif text-secondary mb-12 border-l-4 border-outline-variant pl-8 py-2">
              {post.excerpt}
            </p>
          )}
          <div className="markdown-body">
            <Markdown>{post.content}</Markdown>
          </div>
        </div>
      </article>

      <section className="bg-surface-container-low py-section-gap border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-margin-page">
          <div className="flex justify-between items-end mb-16">
            <h3 className="text-headline-lg text-tertiary">Related Discourse</h3>
            <Link to="/archive" className="text-label-caps text-tertiary border-b border-tertiary hover:opacity-60 transition-all">VIEW ALL JOURNAL</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center py-12 italic text-secondary border border-dashed border-outline-variant">
             Additional entries available in the full archive.
          </div>
        </div>
      </section>

      {/* Comment Section */}
      <section className="py-section-gap bg-background border-t border-outline-variant">
        <CommentSection postId={post.id} />
      </section>
    </motion.div>
  );
}

function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState({ author: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setComments(blogService.getComments(postId));
  }, [postId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.author.trim() || !newComment.content.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      blogService.addComment({
        postId,
        author: newComment.author,
        content: newComment.content
      });
      setComments(blogService.getComments(postId));
      setNewComment({ author: '', content: '' });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="max-w-[800px] mx-auto px-margin-page">
      <div className="mb-24">
        <span className="text-label-caps text-secondary mb-4 block">ENGAGEMENT</span>
        <h2 className="text-display text-4xl mb-12">Public Responses.</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8 border-b border-outline-variant pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-label-caps text-[10px] text-secondary">YOUR NAME</label>
              <input 
                type="text" 
                required
                className="bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-tertiary transition-all text-body-md"
                value={newComment.author}
                onChange={(e) => setNewComment({...newComment, author: e.target.value})}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-[10px] text-secondary">YOUR THOUGHTS</label>
            <textarea 
              required
              rows={4}
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
            {isSubmitting ? 'SUBMITTING...' : 'SHARE RESPONSE'}
          </button>
        </form>
      </div>

      <div className="space-y-16">
        {comments.length === 0 ? (
          <p className="text-body-lg text-secondary italic font-serif py-12">
            No public responses yet. Be the first to start the discourse.
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

function RelatedCard({ image, vol, title }: { image: string, vol: string, title: string }) {
  return (
    <Link to="#" className="group flex flex-col gap-6">
      <div className="w-full aspect-[4/5] bg-surface-container overflow-hidden">
        <img src={image} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-700" alt={title} />
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-label-caps text-secondary">{vol}</span>
        <h4 className="text-headline-sm text-tertiary group-hover:underline decoration-1 underline-offset-4">{title}</h4>
      </div>
    </Link>
  );
}
