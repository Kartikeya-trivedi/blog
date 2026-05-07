import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Info, AlertTriangle, Lightbulb } from 'lucide-react';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'neutral',
  securityLevel: 'loose',
});

const MermaidContainer = ({ chart }: { chart: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      mermaid.render(id, chart).then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      });
    }
  }, [chart]);

  return <div ref={containerRef} className="mermaid-chart flex justify-center my-8 bg-white p-4 rounded border border-outline-variant" />;
};

const CodeBlock = ({ language, value }: { language?: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-lg overflow-hidden border border-outline-variant">
      {language && (
        <div className="flex justify-between items-center px-4 py-2 bg-secondary/10 border-b border-outline-variant">
          <span className="text-[10px] font-mono uppercase tracking-widest text-secondary">{language}</span>
          <button 
            onClick={handleCopy}
            className="text-secondary hover:text-tertiary transition-colors"
            title="Copy code"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          </button>
        </div>
      )}
      <SyntaxHighlighter
        language={language || 'text'}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.7',
          backgroundColor: '#1e1e1e',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

const Callout = ({ type, children }: { type: 'note' | 'warning' | 'tip'; children: React.ReactNode }) => {
  const styles = {
    note: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: <Info size={18} className="text-blue-500" />,
      label: 'NOTE'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      icon: <AlertTriangle size={18} className="text-amber-500" />,
      label: 'WARNING'
    },
    tip: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      icon: <Lightbulb size={18} className="text-green-500" />,
      label: 'TIP'
    }
  };

  const style = styles[type];

  return (
    <div className={`my-8 p-6 border rounded-lg flex gap-4 ${style.bg} ${style.border} ${style.text}`}>
      <div className="mt-1">{style.icon}</div>
      <div>
        <div className="text-[10px] font-bold tracking-widest mb-1 opacity-70">{style.label}</div>
        <div className="text-body-md font-sans italic">{children}</div>
      </div>
    </div>
  );
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const value = String(children).replace(/\n$/, '');

            if (inline) {
              return <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
            }

            if (match && match[1] === 'mermaid') {
              return <MermaidContainer chart={value} />;
            }

            return <CodeBlock language={match ? match[1] : undefined} value={value} />;
          },
          div({ node, className, children, ...props }) {
            if (className?.includes('callout-note')) return <Callout type="note">{children}</Callout>;
            if (className?.includes('callout-warning')) return <Callout type="warning">{children}</Callout>;
            if (className?.includes('callout-tip')) return <Callout type="tip">{children}</Callout>;
            return <div className={className} {...props}>{children}</div>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-tertiary pl-6 my-8 italic text-headline-sm text-secondary opacity-80 leading-relaxed">
                {children}
              </blockquote>
            );
          },
          h1: ({ children }) => {
            const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            return <h1 id={id} className="text-display mt-24 mb-8 scroll-mt-20">{children}</h1>;
          },
          h2: ({ children }) => {
            const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            return <h2 id={id} className="text-headline-lg mt-16 mb-6 scroll-mt-20">{children}</h2>;
          },
          h3: ({ children }) => {
            const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            return <h3 id={id} className="text-headline-md mt-12 mb-4 scroll-mt-20">{children}</h3>;
          },
          p: ({ children }) => <p className="text-body-lg mb-8 text-on-surface/90 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-outside ml-6 mb-8 space-y-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-outside ml-6 mb-8 space-y-3">{children}</ol>,
          li: ({ children }) => <li className="text-body-lg text-on-surface/90">{children}</li>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-12">
              <table className="w-full border-collapse border border-outline-variant font-sans text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => <th className="border border-outline-variant bg-surface-container px-4 py-3 text-left font-bold uppercase tracking-wider">{children}</th>,
          td: ({ children }) => <td className="border border-outline-variant px-4 py-3">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
