import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  BarChart2, 
  Settings, 
  Plus, 
  MoreHorizontal, 
  ArrowUpRight,
  Zap,
  User,
  Edit2,
  Trash2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import { blogService, BlogPost } from '@/src/lib/blogService';

const data = [
  { day: '01 OCT', visitor: 40 },
  { day: '03 OCT', visitor: 45 },
  { day: '05 OCT', visitor: 38 },
  { day: '07 OCT', visitor: 55 },
  { day: '09 OCT', visitor: 62 },
  { day: '11 OCT', visitor: 58 },
  { day: '13 OCT', visitor: 75 },
  { day: '15 OCT', visitor: 82 },
  { day: '17 OCT', visitor: 85 },
  { day: '19 OCT', visitor: 92 },
  { day: '21 OCT', visitor: 88 },
  { day: '23 OCT', visitor: 95 },
];

export default function DashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setPosts(blogService.getPosts());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      blogService.deletePost(id);
      setPosts(blogService.getPosts());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-container-max mx-auto px-margin-page py-12"
    >
      <div className="flex gap-12 flex-col lg:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h3 className="text-label-caps text-secondary opacity-50">MANAGEMENT</h3>
            <nav className="flex flex-col gap-2">
              <NavItem icon={<FileText size={20} />} label="Posts" active />
              <NavItem icon={<BarChart2 size={20} />} label="Analytics" />
              <NavItem icon={<Settings size={20} />} label="Settings" />
            </nav>
          </div>
          <div className="mt-auto p-6 bg-surface-container-low border border-outline-variant flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-fixed rounded-full flex items-center justify-center">
                <User size={20} className="text-tertiary" />
              </div>
              <div>
                <p className="text-label-caps text-[11px] text-secondary">Editor-in-Chief</p>
                <p className="text-body-md font-bold leading-tight">Kartikeya Trivedi</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow flex flex-col gap-12">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h2 className="text-headline-lg">Dashboard Overview</h2>
              <p className="text-secondary text-body-md">System state as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <Link 
              to="/admin/write"
              className="bg-tertiary text-white px-6 py-3 text-label-caps hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Create New Post
            </Link>
          </header>

          {/* Stats Cards */}
          {/* ... (stats keep as is for visual interest) ... */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-8 bg-white border border-outline-variant p-8 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h4 className="text-headline-sm">Visitor Trends</h4>
                <div className="flex gap-4">
                  <LegendItem color="bg-tertiary" label="This Month" />
                  <LegendItem color="bg-outline-variant" label="Last Month" />
                </div>
              </div>
              
              <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <Tooltip cursor={{ fill: '#faf9f7' }} />
                    <Bar dataKey="visitor">
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index > 5 ? '#000' : '#e5e2e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
              <div className="bg-tertiary text-white p-8 flex flex-col justify-between min-h-[160px]">
                <p className="text-label-caps opacity-70">Total Published</p>
                <h5 className="text-display text-4xl mt-2">{posts.filter(p => p.status === 'PUBLISHED').length}</h5>
                <div className="flex items-center gap-1 text-[11px] text-primary-fixed mt-4">
                  <ArrowUpRight size={12} /> Live on journal
                </div>
              </div>
              <div className="bg-surface-container border border-outline-variant p-8 flex flex-col justify-between min-h-[160px]">
                <p className="text-label-caps text-secondary">Active Drafts</p>
                <h5 className="text-display text-4xl mt-2">{posts.filter(p => p.status === 'DRAFT').length}</h5>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-outline-variant pb-4">
              <h4 className="text-headline-sm">Recent Posts</h4>
              <Link to="/archive" className="text-label-caps text-secondary underline underline-offset-4 hover:text-tertiary">View Journal</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="py-4 text-label-caps text-secondary">ARTICLE TITLE</th>
                    <th className="py-4 text-label-caps text-secondary">CATEGORY</th>
                    <th className="py-4 text-label-caps text-secondary">DATE</th>
                    <th className="py-4 text-label-caps text-secondary">STATUS</th>
                    <th className="py-4 text-label-caps text-secondary text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="text-body-md">
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center italic text-secondary">No posts found. Start by creating one.</td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} className="border-b border-surface-container-high group hover:bg-surface-container-low transition-colors">
                        <td className="py-6">
                          <div className="flex flex-col">
                            <span className="font-bold">{post.title}</span>
                            <span className="text-[12px] text-secondary">by {post.author}</span>
                          </div>
                        </td>
                        <td className="py-6 text-secondary">{post.category}</td>
                        <td className="py-6 text-secondary">{post.date}</td>
                        <td className="py-6">
                          <span className={cn(
                            "text-label-caps text-[10px] px-2 py-1 uppercase tracking-wider",
                            post.status === 'PUBLISHED' ? "bg-surface-container-highest text-tertiary" : "bg-primary-fixed text-tertiary"
                          )}>
                            {post.status}
                          </span>
                        </td>
                        <td className="py-6 text-right">
                          <div className="flex justify-end gap-4">
                            <button 
                              onClick={() => navigate(`/admin/edit/${post.id}`)}
                              className="text-secondary hover:text-tertiary transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(post.id)}
                              className="text-secondary hover:text-error transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <a 
      href="#" 
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-all",
        active ? "bg-tertiary text-white" : "text-secondary hover:bg-surface-container"
      )}
    >
      {icon}
      <span className="text-body-md">{label}</span>
    </a>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <span className="flex items-center gap-2 text-label-caps text-secondary text-[10px]">
      <span className={cn("w-2 h-2 rounded-full", color)} /> {label}
    </span>
  );
}
