import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { blogService, BlogPost } from '@/src/lib/blogService';
import { cn } from '@/src/lib/utils';
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Save, ArrowLeft, Image as ImageIcon, Eye, Info, AlertTriangle, Lightbulb, Sigma, Share2, Type, TableOfContents, Upload, Link2, X, Wand2, Maximize, Minimize, History, BarChart2, Clock, Check, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { MarkdownRenderer } from '@/src/components/MarkdownRenderer';

export default function WritePostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [coverImageMode, setCoverImageMode] = useState<'url' | 'upload'>('url');
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [stats, setStats] = useState({ words: 0, time: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [revisions, setRevisions] = useState<BlogPost[]>([]);
  const [showRevisions, setShowRevisions] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  
  // Undo/Redo History
  const [history, setHistory] = useState<{ past: string[], future: string[] }>({ past: [], future: [] });
  const [lastSavedContent, setLastSavedContent] = useState('');
  
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
    canonicalUrl: '',
    slug: ''
  });

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        const existing = await blogService.getPostById(id);
        if (existing) {
          setPost(existing);
          setLastSavedContent(existing.content);
        }
      };
      fetchPost();
    }
  }, [id]);

  // Debounced history push for typing
  useEffect(() => {
    if (post.content === lastSavedContent) return;
    
    const timer = setTimeout(() => {
      setHistory(prev => ({
        past: [...prev.past, lastSavedContent].slice(-50),
        future: []
      }));
      setLastSavedContent(post.content);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [post.content, lastSavedContent]);

  const undo = () => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);
    
    setHistory({
      past: newPast,
      future: [post.content, ...history.future]
    });
    setLastSavedContent(previous);
    setPost(prev => ({ ...prev, content: previous }));
  };

  const redo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    const newFuture = history.future.slice(1);
    
    setHistory({
      past: [...history.past, post.content],
      future: newFuture
    });
    setLastSavedContent(next);
    setPost(prev => ({ ...prev, content: next }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Undo/Redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }
    if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      redo();
      return;
    }

    // Formatting Shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        insertText('**', '**');
      } else if (e.key === 'i') {
        e.preventDefault();
        insertText('*', '*');
      } else if (e.key === 'k') {
        e.preventDefault();
        insertText('[', '](url)');
      }
    }

    // Tab Handling
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      if (start === end) {
        // Single cursor - insert tab
        const newContent = value.substring(0, start) + '    ' + value.substring(end);
        setPost(prev => ({ ...prev, content: newContent }));
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
      } else {
        // Multi-line selection - indent/outdent
        const lines = value.split('\n');
        const startLineIndex = value.substring(0, start).split('\n').length - 1;
        const endLineIndex = value.substring(0, end).split('\n').length - 1;

        const newLines = lines.map((line, i) => {
          if (i >= startLineIndex && i <= endLineIndex) {
            if (e.shiftKey) {
              return line.startsWith('    ') ? line.substring(4) : line.startsWith('\t') ? line.substring(1) : line;
            }
            return '    ' + line;
          }
          return line;
        });

        const newContent = newLines.join('\n');
        setPost(prev => ({ ...prev, content: newContent }));
        
        // Re-select the lines
        setTimeout(() => {
          const newStart = newLines.slice(0, startLineIndex).join('\n').length + (startLineIndex > 0 ? 1 : 0);
          const newEnd = newLines.slice(0, endLineIndex + 1).join('\n').length;
          textarea.setSelectionRange(newStart, newEnd);
        }, 0);
      }
    }

    // Smart Newlines (List continuation)
    if (e.key === 'Enter') {
      const start = textarea.selectionStart;
      const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
      const currentLine = textarea.value.substring(lineStart, start);
      
      const listMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)\s+/);
      const quoteMatch = currentLine.match(/^(\s*)>\s*/);
      
      if (listMatch || quoteMatch) {
        const indent = listMatch ? listMatch[1] : quoteMatch![1];
        const marker = listMatch ? listMatch[2] : '>';
        
        // If the line is empty (just the marker), remove it (end list/quote)
        if (currentLine.trim() === marker) {
          e.preventDefault();
          const newContent = textarea.value.substring(0, lineStart) + '\n' + textarea.value.substring(start);
          setPost(prev => ({ ...prev, content: newContent }));
          return;
        }

        e.preventDefault();
        let nextMarker = marker;
        if (listMatch && /\d+\./.test(marker)) {
          nextMarker = (parseInt(marker) + 1) + '.';
        }
        
        const insertion = `\n${indent}${nextMarker} `;
        const newContent = textarea.value.substring(0, start) + insertion + textarea.value.substring(start);
        setPost(prev => ({ ...prev, content: newContent }));
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + insertion.length;
        }, 0);
      }
    }

    // Auto-pairing
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`',
      '*': '*',
      '_': '_',
    };

    if (pairs[e.key]) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selection = textarea.value.substring(start, end);

      if (selection) {
        // Wrap selection
        e.preventDefault();
        insertText(e.key, pairs[e.key]);
      } else {
        // Insert pair if not preceded by a letter (simple heuristic)
        const charBefore = textarea.value.substring(start - 1, start);
        if (!/[a-zA-Z0-9]/.test(charBefore) || ['"', "'", '`'].includes(e.key)) {
          e.preventDefault();
          const newContent = textarea.value.substring(0, start) + e.key + pairs[e.key] + textarea.value.substring(start);
          setPost(prev => ({ ...prev, content: newContent }));
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 1;
          }, 0);
        }
      }
    }

    // Handle backspace for pairs
    if (e.key === 'Backspace') {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end) {
        const charBefore = textarea.value.substring(start - 1, start);
        const charAfter = textarea.value.substring(start, start + 1);
        if (pairs[charBefore] === charAfter) {
          e.preventDefault();
          const newContent = textarea.value.substring(0, start - 1) + textarea.value.substring(start + 1);
          setPost(prev => ({ ...prev, content: newContent }));
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - 1;
          }, 0);
        }
      }
    }
  };

  useEffect(() => {
    const savedRevisions = localStorage.getItem('blog_revisions');
    if (savedRevisions) {
      try {
        setRevisions(JSON.parse(savedRevisions));
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (post.title || post.content) {
        setRevisions(prev => {
          // don't save if it's the exact same as the last revision
          if (prev.length > 0 && prev[0].content === post.content && prev[0].title === post.title) return prev;
          const newRevisions = [{...post, _savedAt: new Date().toLocaleTimeString()}, ...prev].slice(0, 10);
          localStorage.setItem('blog_revisions', JSON.stringify(newRevisions));
          return newRevisions;
        });
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [post]);

  useEffect(() => {
    const words = post.content.trim() ? post.content.trim().split(/\s+/).length : 0;
    const time = Math.max(1, Math.ceil(words / 200)); 
    setStats({ words, time });
  }, [post.content]);

  const restoreRevision = (rev: any) => {
    if (confirm('Restore this revision? Your current draft will be overwritten.')) {
      setPost(rev);
      setShowRevisions(false);
    }
  };

  const handleAiAction = async (actionType: 'grammar' | 'rephrase' | 'custom') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = post.content.substring(start, end);
    
    if (!selection && actionType !== 'custom') {
      alert("Please select some text first to use AI editing.");
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      alert("GEMINI_API_KEY is not defined in environment variables.");
      return;
    }

    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      let prompt = '';
      if (actionType === 'grammar') {
        prompt = `Fix any grammatical errors in the following text, return ONLY the corrected text with no extra commentary:\n\n${selection}`;
      } else if (actionType === 'rephrase') {
        prompt = `Rephrase the following text to flow better and sound more professional. Return ONLY the new text with no extra commentary:\n\n${selection}`;
      } else {
        prompt = `${aiPrompt}\n\n${selection ? 'Text: ' + selection : ''}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const resultText = response.text || '';
      
      if (resultText) {
        if (selection) {
          const newContent = post.content.substring(0, start) + resultText + post.content.substring(end);
          setHistory(prev => ({
            past: [...prev.past, post.content].slice(-50),
            future: []
          }));
          setLastSavedContent(newContent);
          setPost(prev => ({
            ...prev,
            content: newContent
          }));
        } else {
          insertText(resultText, '');
        }
      }
      setShowAi(false);
      setAiPrompt('');
    } catch (e) {
      alert("AI Generation failed: " + (e as Error).message);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Note: Local upload will still fail on Vercel unless using Vercel Blob. 
  // We recommend using external URLs for images for now or Vercel Blob later.
  const uploadImage = async (file: File) => {
    try {
      const imageUrl = await blogService.uploadImage(file);
      
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const marker = `\n<div align="center">\n\n![Image](${imageUrl})\n\n</div>\n`;

      setPost(prev => {
        const contentBefore = prev.content.substring(0, start);
        const contentAfter = prev.content.substring(end);
        const newContent = contentBefore + marker + contentAfter;
        
        setHistory(h => ({
          past: [...h.past, prev.content].slice(-50),
          future: []
        }));
        setLastSavedContent(newContent);
        
        return {
          ...prev,
          content: newContent
        };
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please ensure you have a public "blog-images" bucket in your Supabase storage.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleCoverImageUpload = async (file: File) => {
    setIsCoverUploading(true);
    try {
      const url = await blogService.uploadImage(file);
      setPost(prev => ({ ...prev, image: url }));
    } catch (err) {
      alert('Cover image upload failed. Check your Supabase storage bucket.');
    } finally {
      setIsCoverUploading(false);
    }
  };

  const insertToc = () => {
    const headings = post.content.match(/^#{1,3}\s+.+$/gm) || [];
    if (headings.length === 0) {
      alert('No headings found in your content yet. Add some # headings first.');
      return;
    }
    const tocLines = headings.map(h => {
      const level = (h.match(/^#+/) || [''])[0].length;
      const text = h.replace(/^#+\s+/, '');
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      const indent = '  '.repeat(level - 1);
      return `${indent}- [${text}](#${id})`;
    });
    const tocBlock = `## Table of Contents\n\n${tocLines.join('\n')}\n\n`;
    insertText(tocBlock, '');
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = textarea.value.substring(start, end);
    const oldContent = post.content;
    const newContent = oldContent.substring(0, start) + before + selection + after + oldContent.substring(end);

    setHistory(prev => ({
      past: [...prev.past, oldContent].slice(-50),
      future: []
    }));
    setLastSavedContent(newContent);

    setPost(prev => ({
      ...prev,
      content: newContent
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

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!post.title.trim()) {
      alert('Please provide a title for the article.');
      return;
    }
    
    setIsSaving(true);
    try {
      const finalPost = { 
        ...post, 
        status,
        slug: post.slug || slugify(post.title)
      };
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
      <div className={cn("bg-surface-container border-b border-outline-variant px-margin-page py-2 flex justify-between items-center text-[10px] text-secondary font-mono uppercase tracking-widest sticky top-0 z-50 transition-all", zenMode && "opacity-0 pointer-events-none absolute")}>
        <div className="flex gap-6">
          <span>Words: {stats.words}</span>
          <span>EST. reading time: {stats.time} MIN</span>
          <button onClick={() => setShowRevisions(true)} className="flex items-center gap-1 hover:text-tertiary transition-colors">
            <History size={12} /> {revisions.length} Revisions Saved
          </button>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setShowSeo(!showSeo)} className="flex items-center gap-1 hover:text-tertiary transition-colors">
            <BarChart2 size={12} /> SEO Score
          </button>
          <span className="w-[1px] h-3 bg-outline-variant"></span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> CLOUD CONNECTED</span>
          <span className="w-[1px] h-3 bg-outline-variant"></span>
          <span>{post.status}</span>
        </div>
      </div>

      <div className="flex relative">
        <div className={cn(
          "mx-auto px-margin-page transition-all duration-500 w-full",
          viewMode === 'split' ? "max-w-[1400px]" : "max-w-[1000px]",
          zenMode ? "py-4 max-w-[800px]" : "py-12",
          showSeo ? "mr-[320px]" : ""
        )}>
        
        {!zenMode && (
          <header className="flex justify-between items-center mb-12">
            <button 
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-label-caps text-secondary hover:text-tertiary transition-colors"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <div className="flex gap-4 items-center">
              <div className="flex border border-outline-variant rounded p-0.5 mr-2">
                <button onClick={() => setViewMode('edit')} className={cn("px-4 py-1.5 text-label-caps text-[10px] transition-all", viewMode === 'edit' ? "bg-tertiary text-white" : "hover:bg-surface-container")}>Edit</button>
                <button onClick={() => setViewMode('split')} className={cn("px-4 py-1.5 text-label-caps text-[10px] transition-all", viewMode === 'split' ? "bg-tertiary text-white" : "hover:bg-surface-container")}>Split</button>
                <button onClick={() => setViewMode('preview')} className={cn("px-4 py-1.5 text-label-caps text-[10px] transition-all", viewMode === 'preview' ? "bg-tertiary text-white" : "hover:bg-surface-container")}>Preview</button>
              </div>
              <div className="flex items-center border border-outline-variant rounded p-0.5 mr-4">
                <input type="datetime-local" className="bg-transparent text-[10px] uppercase font-mono px-2 outline-none text-secondary" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                <button 
                  disabled={isSaving || !scheduleDate}
                  onClick={() => handleSave('SCHEDULED' as any)}
                  className="px-4 py-1.5 bg-surface-container hover:bg-outline-variant transition-colors text-label-caps text-[10px] flex items-center gap-1 disabled:opacity-30 border-l border-outline-variant"
                  title="Schedule Post"
                >
                  <Clock size={12} /> Schedule
                </button>
              </div>
              <button disabled={isSaving} onClick={() => handleSave('DRAFT')} className="px-6 py-2 border border-outline-variant text-label-caps hover:bg-surface-container transition-all disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button disabled={isSaving} onClick={() => handleSave('PUBLISHED')} className="px-6 py-2 bg-tertiary text-white text-label-caps flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
                <Save size={16} /> {isSaving ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </header>
        )}

      <div className="space-y-8">
        {!zenMode && (
          <>
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
            <div className="flex justify-between items-center">
              <label className="text-label-caps text-secondary text-[10px]">COVER IMAGE</label>
              <div className="flex gap-1 border border-outline-variant rounded overflow-hidden">
                <button
                  type="button"
                  onClick={() => setCoverImageMode('url')}
                  className={cn('px-3 py-1 text-[9px] font-mono uppercase tracking-widest transition-all flex items-center gap-1', coverImageMode === 'url' ? 'bg-tertiary text-white' : 'hover:bg-surface-container')}
                ><Link2 size={10} /> URL</button>
                <button
                  type="button"
                  onClick={() => setCoverImageMode('upload')}
                  className={cn('px-3 py-1 text-[9px] font-mono uppercase tracking-widest transition-all flex items-center gap-1', coverImageMode === 'upload' ? 'bg-tertiary text-white' : 'hover:bg-surface-container')}
                ><Upload size={10} /> Upload</button>
              </div>
            </div>

            {coverImageMode === 'url' ? (
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                className="bg-surface-container border-0 px-4 py-3 text-body-md font-mono text-[10px]"
                value={post.image || ''}
                onChange={(e) => setPost({ ...post, image: e.target.value })}
              />
            ) : (
              <div>
                <input
                  type="file"
                  ref={coverImageInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverImageUpload(f); }}
                />
                <div
                  onClick={() => !isCoverUploading && coverImageInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleCoverImageUpload(f); }}
                  className={cn(
                    'border-2 border-dashed border-outline-variant bg-surface-container px-4 py-5 text-center cursor-pointer hover:border-tertiary transition-all',
                    isCoverUploading && 'opacity-50 cursor-wait'
                  )}
                >
                  {isCoverUploading ? (
                    <span className="text-[10px] font-mono text-secondary animate-pulse">UPLOADING...</span>
                  ) : post.image ? (
                    <div className="flex items-center justify-between gap-2">
                      <img src={post.image} className="h-10 w-16 object-cover rounded" alt="cover" />
                      <span className="text-[10px] font-mono text-secondary truncate flex-1 text-left">Uploaded ✓</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setPost(p => ({...p, image: ''})); }} className="text-secondary hover:text-red-500"><X size={12}/></button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload size={18} className="text-secondary" />
                      <span className="text-[10px] font-mono text-secondary">CLICK OR DRAG IMAGE HERE</span>
                    </div>
                  )}
                </div>
              </div>
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

          </>
        )}

        <div className={cn("pt-8 transition-all", zenMode ? "pt-0" : "")}>
          {!zenMode && (
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
                    <li>Images: Paste, drop, or upload to Cloud Storage.</li>
                    <li>Captions: Use &lt;div class="caption"&gt;Text&lt;/div&gt;</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className={cn(
            "grid gap-8 transition-all duration-500",
            viewMode === 'split' ? "grid-cols-1 lg:grid-cols-2 h-[calc(100vh-300px)] min-h-[600px]" : "grid-cols-1"
          )}>
            {(viewMode === 'edit' || viewMode === 'split') && (
              <div className={cn("flex flex-col border border-outline-variant bg-surface-container overflow-hidden transition-all duration-300", zenMode && "fixed inset-0 z-[100] m-0 border-0 rounded-none bg-background")}>
                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 p-2 bg-surface-container border-b border-outline-variant items-center sticky top-0 z-10 shadow-sm">
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
                  <ToolbarButton icon={<Type size={14} />} onClick={() => insertText('<div class="caption">', '</div>')} title="Add Caption" />
                  <ToolbarButton icon={<Share2 size={14} />} onClick={() => insertText('```mermaid\ngraph TD;\n  A-->B;\n```', '')} title="Mermaid Diagram" />
                  <ToolbarButton icon={<TableOfContents size={14} />} onClick={insertToc} title="Insert Table of Contents" />
                  <div className="w-[1px] h-4 bg-outline-variant self-center mx-1" />
                  <ToolbarButton icon={<Link2 size={14} />} onClick={() => insertText('[', '](url)')} title="Insert Link" />
                  <ToolbarButton icon={<ImageIcon size={14} />} onClick={() => fileInputRef.current?.click()} title="Insert Image" />
                  <div className="w-[1px] h-4 bg-outline-variant self-center mx-1" />
                  <ToolbarButton icon={<Wand2 size={14} className="text-purple-500" />} onClick={() => setShowAi(!showAi)} title="Gemini Magic Assistant" />
                  <div className="flex-1" />
                  <ToolbarButton icon={zenMode ? <Minimize size={14} /> : <Maximize size={14} />} onClick={() => setZenMode(!zenMode)} title="Toggle Zen Mode" />

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                  
                  {/* AI Assistant Popover */}
                  {showAi && (
                    <div className="absolute top-12 right-12 w-80 bg-white border border-outline-variant shadow-xl z-50 p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                        <span className="text-[10px] font-mono text-tertiary flex items-center gap-1"><Wand2 size={12}/> AI ASSISTANT</span>
                        <button onClick={() => setShowAi(false)}><X size={14} className="text-secondary"/></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button disabled={isAiLoading} onClick={() => handleAiAction('grammar')} className="text-[10px] bg-surface-container hover:bg-outline-variant p-2 text-center rounded disabled:opacity-50">Fix Grammar</button>
                        <button disabled={isAiLoading} onClick={() => handleAiAction('rephrase')} className="text-[10px] bg-surface-container hover:bg-outline-variant p-2 text-center rounded disabled:opacity-50">Rephrase</button>
                      </div>
                      <div className="flex flex-col gap-2 mt-2">
                        <textarea 
                          placeholder="Or type custom prompt..."
                          className="w-full text-xs p-2 border border-outline-variant bg-surface-container focus:outline-none min-h-[60px]"
                          value={aiPrompt}
                          onChange={e => setAiPrompt(e.target.value)}
                        />
                        <button disabled={isAiLoading} onClick={() => handleAiAction('custom')} className="bg-tertiary text-white text-[10px] p-2 hover:opacity-90 transition-all flex justify-center items-center gap-1">
                          {isAiLoading ? <RefreshCw size={12} className="animate-spin" /> : 'Generate'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="relative group/editor flex-1 overflow-hidden">
                  <textarea 
                    ref={textareaRef}
                    placeholder="Begin your manifesto..."
                    className={cn(
                      "w-full bg-transparent border-0 p-8 text-body-lg h-full leading-snug font-mono text-sm focus:outline-none transition-all resize-none overflow-y-auto",
                      zenMode ? "max-w-[800px] mx-auto text-base p-16 h-screen" : ""
                    )}
                    value={post.content}
                    onChange={(e) => setPost({ ...post, content: e.target.value })}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  />
                </div>
              </div>
            )}
            
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={cn(
                "bg-white border border-outline-variant p-12 overflow-y-auto relative",
                viewMode === 'split' ? "h-full" : "min-h-[600px]"
              )}>
                <MarkdownRenderer content={post.content || '_No content written yet._'} />
              </div>
            )}
        </div>
      </div>
      </div>
      
      {/* SEO Sidebar */}
      {showSeo && (
        <motion.div 
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed right-0 top-0 bottom-0 w-[320px] bg-surface-container border-l border-outline-variant p-6 overflow-y-auto z-40 pt-20"
        >
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant">
            <h3 className="text-label-caps flex items-center gap-2"><BarChart2 size={16}/> SEO Analysis</h3>
            <button onClick={() => setShowSeo(false)} className="text-secondary hover:text-tertiary"><X size={16}/></button>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-4 border border-outline-variant rounded">
               <h4 className="text-[10px] font-mono text-secondary mb-2">READABILITY SCORE</h4>
               <div className="flex items-end gap-2">
                 <span className="text-2xl text-tertiary font-serif">{stats.words < 50 ? 'N/A' : (stats.words < 300 ? 'Easy' : 'Moderate')}</span>
                 <span className="text-[10px] text-secondary mb-1">({stats.time} min read)</span>
               </div>
            </div>
            
            <div className="bg-white p-4 border border-outline-variant rounded">
               <h4 className="text-[10px] font-mono text-secondary mb-2">GOOGLE SNIPPET PREVIEW</h4>
               <div className="space-y-1">
                 <div className="text-[12px] text-[#1a0dab] truncate hover:underline cursor-pointer">
                   {post.title || 'Untitled Article'}
                 </div>
                 <div className="text-[11px] text-[#006621] truncate flex items-center gap-1">
                   {post.canonicalUrl || 'https://yoursite.com/blog/...' }
                 </div>
                 <div className="text-[11px] text-[#545454] line-clamp-2 leading-snug">
                   {post.date} - {post.excerpt || post.content.replace(/[#*`_]/g, '').slice(0, 150) || 'Write an excerpt or content to see snippet preview...'}
                 </div>
               </div>
            </div>

            <div className="bg-white p-4 border border-outline-variant rounded">
               <h4 className="text-[10px] font-mono text-secondary mb-2">TOP KEYWORDS</h4>
               <div className="flex flex-wrap gap-2">
                 {post.content.split(/\s+/).filter(w => w.length > 5).slice(0, 5).map((w, i) => (
                   <span key={i} className="text-[10px] bg-surface-container px-2 py-1 text-secondary uppercase truncate max-w-full">
                     {w.replace(/[^\w]/g, '')}
                   </span>
                 ))}
               </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Revisions Modal */}
      {showRevisions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white w-[500px] max-h-[80vh] overflow-y-auto p-8 relative shadow-2xl">
            <button onClick={() => setShowRevisions(false)} className="absolute top-6 right-6 text-secondary hover:text-tertiary"><X size={16}/></button>
            <h2 className="text-headline-sm mb-6 flex items-center gap-2"><History size={20}/> Local Revisions</h2>
            <p className="text-body-sm text-secondary mb-6 italic">Auto-saves from this browser session. Restoring will overwrite current draft.</p>
            <div className="space-y-4">
              {revisions.length === 0 ? <p className="text-sm">No revisions saved yet.</p> : null}
              {revisions.map((rev, i) => (
                <div key={i} className="border border-outline-variant p-4 hover:border-tertiary transition-all flex justify-between items-center group cursor-pointer" onClick={() => restoreRevision(rev)}>
                  <div>
                    <div className="font-bold text-tertiary">{rev.title || 'Untitled'}</div>
                    <div className="text-[10px] font-mono text-secondary mt-1">Saved at {(rev as any)._savedAt || 'Unknown time'}</div>
                  </div>
                  <button className="text-[10px] bg-tertiary text-white px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity">Restore</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
