import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ArrowUpRight,
  Edit2,
  Trash2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Bar, BarChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { blogService, BlogPost } from '@/src/lib/blogService';
import { analyticsClient } from '@/src/lib/analyticsService';
import AdminLayout from '@/src/components/AdminLayout';

export default function DashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [chartData, setChartData] = useState<{ day: string; visitor: number }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      // Sync slugs for any legacy posts that don't have one yet
      await blogService.syncSlugs();

      const data = await blogService.getPosts();
      setPosts(data);
    };

    fetchPosts();

    // Fetch real visitor data for the chart
    analyticsClient.getSummary().then((summary) => {
      // Use the last 12 days for the chart
      const last12 = summary.viewsByDay.slice(-12);
      setChartData(
        last12.map((d) => ({
          day: new Date(d.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase(),
          visitor: d.views,
        }))
      );
    }).catch(() => {
      // Fallback: empty chart
      setChartData([]);
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      await blogService.deletePost(id);
      const data = await blogService.getPosts();
      setPosts(data);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-container-max mx-auto px-margin-page py-12"
    >
      <AdminLayout>
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
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <Tooltip cursor={{ fill: '#faf9f7' }} />
                    <Bar dataKey="visitor">
                      {chartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={index > Math.floor(chartData.length / 2) ? '#000' : '#e5e2e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-secondary text-body-md italic">
                  Collecting visitor data…
                </div>
              )}
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
      </AdminLayout>
    </motion.div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <span className="flex items-center gap-2 text-label-caps text-secondary text-[10px]">
      <span className={cn("w-2 h-2 rounded-full", color)} /> {label}
    </span>
  );
}
