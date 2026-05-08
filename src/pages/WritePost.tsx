import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { blogService, BlogPost } from '@/src/lib/blogService';
import { cn } from '@/src/lib/utils';
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Save, ArrowLeft, Image as ImageIcon, Eye, Info, AlertTriangle, Lightbulb, Sigma, Share2 } from 'lucide-react';
import { MarkdownRenderer } from '@/src/components/MarkdownRenderer';

export default function WritePostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [stats, setStats] = useState({ words: 0, time: 0 });
  const [isSaving, setIsSaving] = useState(false);
  
  const [post, setPost] = useState<BlogPost>({
    id: id || '', // Supabase will generate if empty
    title: '',
    content: '',
    excerpt: '',
    category: 'Opinion',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    author: 'Kartikeya Trivedi',
    status: 'DRAFT',
    tags: [],
    series: '',
    seriesOrder: 1,
    canonicalUrl: ''
  });

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        const existing = await blogService.getPostById(id);
        if (existing) setPost(existing);
      };
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    const words = post.content.trim() ? post.content.trim().split(/\s+/).length : 0;
    const time = Math.max(1, Math.ceil(words / 200)); 
    setStats({ words, time });
  }, [post.content]);

  // Note: Local upload will still fail on Vercel unless using Vercel Blob. 
  // We recommend using external URLs for images for now or Vercel Blob later.
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      const imageUrl = data.url;

      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const marker = `\n<div align="center">\n\n![Image](${imageUrl})\n\n</div>\n`;

      setPost(prev => {
        const contentBefore = prev.content.substring(0, start);
        const contentAfter = prev.content.substring(end);
        return {
          ...prev,
          content: contentBefore + marker + contentAfter
        };
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Image upload requires a running backend. On Vercel, please use direct image URLs in your markdown.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = textarea.value.substring(start, end);
    const newText = before + selection + after;

    setPost(prev => ({
      ...prev,
      content: prev.content.substring(0, start) + newText + prev.content.substring(end)
    }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selection.length);
    }, 0);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          uploadImage(file);
          e.preventDefault();
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        uploadImage(file);
      }
    }
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!post.title.trim()) {
      alert('Please provide a title for the article.');
      return;
    }
    
    setIsSaving(true);
    try {
      const finalPost = { ...post, status };
      await blogService.savePost(finalPost);
      navigate('/admin');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      alert(`Failed to save to cloud archive.\n\nDetails: ${message}`);
      console.error('Save error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-screen bg-background"
    >
      {/* Stats Bar */}
      <div className="bg-surface-container border-b border-outline-variant px-margin-page py-2 flex justify-between items-center text-[10px] text-secondary font-mono uppercase tracking-widest sticky top-0 z-50">
        <div className="flex gap-6">
          <span>Words: {stats.words}</span>
          <span>EST. reading time: {stats.time} MIN</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> CLOUD CONNECTED</span>
          <span className="w-[1px] h-3 bg-outline-variant"></span>
          <span>{post.status}</span>
        </div>
      </div>

      <div className={cn(
        "mx-auto px-margin-page py-12 transition-all duration-500 w-full",
        viewMode === 'split' ? "max-w-[1400px]" : "max-w-[1000px]"
      )}>
      <header className="flex justify-between items-center mb-12">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-label-caps text-secondary hover:text-tertiary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="flex gap-4">
          <div className="flex border border-outline-variant rounded p-0.5 mr-4">
            <button 
              onClick={() => setViewMode('edit')}
              className={cn(
                "px-4 py-1.5 text-label-caps text-[10px] transition-all",
                viewMode === 'edit' ? "bg-tertiary text-white" : "hover:bg-surface-container"
              )}
            >
              Edit
            </button>
            <button 
              onClick={() => setViewMode('split')}
              className={cn(
                "px-4 py-1.5 text-label-caps text-[10px] transition-all",
                viewMode === 'split' ? "bg-tertiary text-white" : "hover:bg-surface-container"
              )}
            >
              Split
            </button>
            <button 
              onClick={() => setViewMode('preview')}
              className={cn(
                "px-4 py-1.5 text-label-caps text-[10px] transition-all",
                viewMode === 'preview' ? "bg-tertiary text-white" : "hover:bg-surface-container"
              )}
            >
              Preview
            </button>
          </div>
          <button 
            disabled={isSaving}
            onClick={() => handleSave('DRAFT')}
            className="px-6 py-2 border border-outline-variant text-label-caps hover:bg-surface-container transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button 
            disabled={isSaving}
            onClick={() => handleSave('PUBLISHED')}
            className="px-6 py-2 bg-tertiary text-white text-label-caps flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Save size={16} /> {isSaving ? 'Publishing...' : 'Publish Post'}
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
              <option>Opinion</option>
              <option>Cricket</option>
              <option>F1</option>
              <option>Software Development</option>
              <option>Lifestyle</option>
              <option>Gen AI</option>
              <option>Machine Learning</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-secondary text-[10px]">COVER IMAGE URL</label>
            <input 
              type="text"
              placeholder="https://images.unsplash.com/..."
              className="bg-surface-container border-0 px-4 py-3 text-body-md font-mono text-[10px]"
              value={post.image || ''}
              onChange={(e) => setPost({ ...post, image: e.target.value })}
            />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-secondary text-[10px]">TAGS (COMMA SEPARATED)</label>
            <input 
              type="text" 
              placeholder="Gen AI, Formula 1, Strategy..."
              className="w-full bg-surface-container border-0 p-3 text-body-sm focus:outline-none font-mono"
              value={post.tags?.join(', ') || ''}
              onChange={(e) => setPost({ ...post, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-secondary text-[10px]">CANONICAL URL</label>
            <input 
              type="text" 
              placeholder="https://dev.to/username/post"
              className="w-full bg-surface-container border-0 p-3 text-body-sm focus:outline-none font-mono text-[10px]"
              value={post.canonicalUrl || ''}
              onChange={(e) => setPost({ ...post, canonicalUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2 flex flex-col gap-2">
            <label className="text-label-caps text-secondary text-[10px]">SERIES NAME</label>
            <input 
              type="text" 
              placeholder="The Stoic Researcher..."
              className="w-full bg-surface-container border-0 p-3 text-body-sm focus:outline-none"
              value={post.series || ''}
              onChange={(e) => setPost({ ...post, series: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-secondary text-[10px]">SERIES ORDER</label>
            <input 
              type="number" 
              className="w-full bg-surface-container border-0 p-3 text-body-sm focus:outline-none"
              value={post.seriesOrder || 1}
              onChange={(e) => setPost({ ...post, seriesOrder: parseInt(e.target.value) || 1 })}
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
          <div className="flex justify-between items-center mb-4">
            <label className="text-label-caps text-secondary text-[10px] block uppercase">
              {viewMode === 'split' ? 'Editor | Live Preview' : viewMode === 'preview' ? 'Full Preview' : 'Markdown Content'}
            </label>
            <div className="group relative">
              <Info size={14} className="text-tertiary cursor-help" />
              <div className="absolute right-0 bottom-full mb-2 w-64 bg-surface-container-highest p-4 text-[10px] text-tertiary border border-outline-variant opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                <p className="font-bold mb-2">TECHNICAL MARKDOWN SUPPORT:</p>
                <ul className="space-y-1 list-disc pl-3">
                  <li>Math: Use $...$ for inline or $$...$$ for block LaTeX.</li>
                  <li>Diagrams: Use ```mermaid code blocks.</li>
                  <li>Images: On Vercel, use direct URLs.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={cn(
            "grid gap-8 transition-all duration-500",
            viewMode === 'split' ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
          )}>
            {(viewMode === 'edit' || viewMode === 'split') && (
              <div className="flex flex-col border border-outline-variant bg-surface-container overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 p-2 bg-surface-container border-b border-outline-variant">
                  <ToolbarButton icon={<Bold size={14} />} onClick={() => insertText('**', '**')} title="Bold" />
                  <ToolbarButton icon={<Italic size={14} />} onClick={() => insertText('*', '*')} title="Italic" />
                  <div className="w-[1px] h-4 bg-outline-variant self-center mx-1" />
                  <ToolbarButton icon={<Heading1 size={14} />} onClick={() => insertText('# ', '')} title="Heading 1" />
                  <ToolbarButton icon={<Heading2 size={14} />} onClick={() => insertText('## ', '')} title="Heading 2" />
                  <div className="w-[1px] h-4 bg-outline-variant self-center mx-1" />
                  <ToolbarButton icon={<List size={14} />} onClick={() => insertText('- ', '')} title="Bullet List" />
                  <ToolbarButton icon={<ListOrdered size={14} />} onClick={() => insertText('1. ', '')} title="Numbered List" />
                  <div className="w-[1px] h-4 bg-outline-variant self-center mx-1" />
                  <ToolbarButton icon={<AlignLeft size={14} />} onClick={() => insertText('<div align="left">\n\n', '\n\n</div>')} title="Align Left" />
                  <ToolbarButton icon={<AlignCenter size={14} />} onClick={() => insertText('<div align="center">\n\n', '\n\n</div>')} title="Align Center" />
                  <ToolbarButton icon={<AlignRight size={14} />} onClick={() => insertText('<div align="right">\n\n', '\n\n</div>')} title="Align Right" />
                  <div className="w-[1px] h-4 bg-outline-variant self-center mx-1" />
                  <ToolbarButton icon={<Info size={14} />} onClick={() => insertText('<div class="callout-note">\n\n', '\n\n</div>')} title="Note Callout" />
                  <ToolbarButton icon={<AlertTriangle size={14} />} onClick={() => insertText('<div class="callout-warning">\n\n', '\n\n</div>')} title="Warning Callout" />
                  <ToolbarButton icon={<Lightbulb size={14} />} onClick={() => insertText('<div class="callout-tip">\n\n', '\n\n</div>')} title="Tip Callout" />
                  <div className="w-[1px] h-4 bg-outline-variant self-center mx-1" />
                  <ToolbarButton icon={<Sigma size={14} />} onClick={() => insertText('$', '$')} title="Inline Math" />
                  <ToolbarButton icon={<Share2 size={14} />} onClick={() => insertText('```mermaid\ngraph TD;\n  A-->B;\n```', '')} title="Mermaid Diagram" />
                  <div className="w-[1px] h-4 bg-outline-variant self-center mx-1" />
                  <ToolbarButton icon={<ImageIcon size={14} />} onClick={() => alert('For Vercel deployment, please paste image URLs directly.')} title="Insert Image" />
                </div>
                
                <div className="relative group/editor">
                  <textarea 
                    ref={textareaRef}
                    placeholder="Begin your manifesto..."
                    className={cn(
                      "w-full bg-transparent border-0 p-8 text-body-lg min-h-[600px] leading-relaxed font-mono text-sm focus:outline-none transition-all",
                      viewMode === 'split' ? "h-full" : ""
                    )}
                    value={post.content}
                    onChange={(e) => setPost({ ...post, content: e.target.value })}
                  />
                </div>
              </div>
            )}
            
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={cn(
                "bg-white border border-outline-variant p-12 min-h-[600px] overflow-auto relative",
                viewMode === 'split' ? "h-[600px] lg:h-auto" : ""
              )}>
                <MarkdownRenderer content={post.content || '_No content written yet._'} />
              </div>
            )}
        </div>
      </div>
    </div>
  </div>
</motion.div>
  );
}

function ToolbarButton({ icon, onClick, title }: { icon: React.ReactNode, onClick: () => void, title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-2 hover:bg-surface-container-highest rounded text-secondary hover:text-tertiary transition-all"
    >
      {icon}
    </button>
  );
}
