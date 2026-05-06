import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { blogService, BlogPost } from '@/src/lib/blogService';
import { Save, ArrowLeft, Image as ImageIcon, Eye, Edit3 } from 'lucide-react';
import Markdown from 'react-markdown';

export default function WritePostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPreview, setIsPreview] = useState(false);
  
  const [post, setPost] = useState<BlogPost>({
    id: id || Math.random().toString(36).substr(2, 9),
    title: '',
    content: '',
    excerpt: '',
    category: 'Design',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    author: 'Kartikeya Trivedi',
    status: 'DRAFT'
  });

  useEffect(() => {
    if (id) {
      const existing = blogService.getPostById(id);
      if (existing) setPost(existing);
    }
  }, [id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPost({ ...post, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (status: 'DRAFT' | 'PUBLISHED') => {
    if (!post.title.trim()) {
      alert('Please provide a title for the article.');
      return;
    }
    const finalPost = { ...post, status };
    blogService.savePost(finalPost);
    navigate('/admin');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[1000px] mx-auto px-margin-page py-12"
    >
      <header className="flex justify-between items-center mb-12">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-label-caps text-secondary hover:text-tertiary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsPreview(!isPreview)}
            className="px-6 py-2 border border-outline-variant text-label-caps hover:bg-surface-container transition-all flex items-center gap-2"
          >
            {isPreview ? <Edit3 size={16} /> : <Eye size={16} />}
            {isPreview ? 'Back to Edit' : 'Preview'}
          </button>
          <button 
            onClick={() => handleSave('DRAFT')}
            className="px-6 py-2 border border-outline-variant text-label-caps hover:bg-surface-container transition-all"
          >
            Save Draft
          </button>
          <button 
            onClick={() => handleSave('PUBLISHED')}
            className="px-6 py-2 bg-tertiary text-white text-label-caps flex items-center gap-2 hover:opacity-90 transition-all"
          >
            <Save size={16} /> Publish Post
          </button>
        </div>
      </header>

      <div className="space-y-8">
        <div>
          <input 
            type="text"
            placeholder="ARTICLE TITLE"
            className="w-full text-display text-4xl font-serif bg-transparent border-b border-outline-variant py-4 focus:outline-none focus:border-tertiary transition-all"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-secondary text-[10px]">CATEGORY</label>
            <select 
              className="bg-surface-container border-0 px-4 py-3 text-body-md"
              value={post.category}
              onChange={(e) => setPost({ ...post, category: e.target.value })}
            >
              <option>Design</option>
              <option>Architecture</option>
              <option>Philosophy</option>
              <option>Curation</option>
              <option>Archive</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-secondary text-[10px]">COVER IMAGE</label>
            <input 
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            {post.image ? (
              <div className="relative group aspect-video bg-surface-container overflow-hidden border border-outline-variant">
                <img 
                  src={post.image} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                  alt="Post cover" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-white text-label-caps underline"
                  >
                    Change
                  </button>
                  <button 
                    onClick={() => setPost({ ...post, image: undefined })}
                    className="text-white text-label-caps underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-surface-container border-2 border-dashed border-outline-variant p-8 flex flex-col items-center justify-center gap-3 text-secondary hover:text-tertiary hover:border-tertiary transition-all"
              >
                <ImageIcon size={32} />
                <span className="text-label-caps">Upload Image</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-secondary text-[10px]">AUTHOR</label>
            <input 
              type="text"
              className="bg-surface-container border-0 px-4 py-3 text-body-md"
              value={post.author}
              onChange={(e) => setPost({ ...post, author: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-secondary text-[10px]">PUBLISH DATE</label>
            <input 
              type="text"
              className="bg-surface-container border-0 px-4 py-3 text-body-md"
              value={post.date}
              onChange={(e) => setPost({ ...post, date: e.target.value })}
            />
          </div>
        </div>

        <div>
           <label className="text-label-caps text-secondary text-[10px] block mb-2">EXCERPT / SUBTITLE</label>
           <textarea 
            placeholder="A brief summary..."
            className="w-full bg-surface-container border-0 p-4 text-body-md italic font-serif min-h-[80px]"
            value={post.excerpt}
            onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
          />
        </div>

        <div className="pt-8">
          <label className="text-label-caps text-secondary text-[10px] block mb-4">CONTENT {isPreview && '(PREVIEW)'}</label>
          {isPreview ? (
            <div className="bg-white border border-outline-variant p-12 min-h-[500px]">
              <div className="prose prose-neutral prose-lg max-w-none markdown-body">
                <Markdown>{post.content || '_No content written yet._'}</Markdown>
              </div>
            </div>
          ) : (
            <textarea 
              placeholder="Begin your manifesto..."
              className="w-full bg-surface-container border-0 p-8 text-body-lg min-h-[500px] leading-relaxed font-mono text-sm"
              value={post.content}
              onChange={(e) => setPost({ ...post, content: e.target.value })}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
