import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Users, Clock, TrendingDown, TrendingUp, RefreshCw, Activity } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import AdminLayout from '@/src/components/AdminLayout';
import { analyticsClient, AnalyticsSummary, PageView } from '@/src/lib/analyticsService';

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentViews, setRecentViews] = useState<PageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveRefreshing, setLiveRefreshing] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const fetchData = async () => {
    try {
      const [summaryData, recentData] = await Promise.all([
        analyticsClient.getSummary(),
        analyticsClient.getRecentViews(25),
      ]);
      setSummary(summaryData);
      setRecentViews(recentData);
    } catch (e) {
      console.error('Failed to load analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const refreshLive = async () => {
    setLiveRefreshing(true);
    try {
      const [summaryData, recentData] = await Promise.all([
        analyticsClient.getSummary(),
        analyticsClient.getRecentViews(25),
      ]);
      setSummary(summaryData);
      setRecentViews(recentData);
    } catch (e) { /* silent */ }
    setLiveRefreshing(false);
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 seconds for real-time feel
    intervalRef.current = window.setInterval(refreshLive, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-container-max mx-auto px-margin-page py-12"
      >
        <AdminLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-outline-variant border-t-tertiary rounded-full"
            />
          </div>
        </AdminLayout>
      </motion.div>
    );
  }

  if (!summary) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-container-max mx-auto px-margin-page py-12"
      >
        <AdminLayout>
          <div className="text-center py-20 text-secondary">Failed to load analytics data.</div>
        </AdminLayout>
      </motion.div>
    );
  }

  const kpiCards = [
    {
      label: 'Page Views Today',
      value: summary.todayViews.toLocaleString(),
      change: summary.changePercent,
      icon: Eye,
      accent: false,
    },
    {
      label: 'Active Now',
      value: summary.activeNow.toString(),
      icon: Users,
      pulse: true,
      accent: true,
    },
    {
      label: 'Avg. Session',
      value: formatDuration(summary.avgSessionDuration),
      icon: Clock,
      accent: false,
    },
    {
      label: 'Bounce Rate',
      value: `${summary.bounceRate.toFixed(1)}%`,
      icon: TrendingDown,
      accent: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-container-max mx-auto px-margin-page py-12"
    >
      <AdminLayout>
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-headline-lg">Analytics</h2>
            <p className="text-secondary text-body-md">
              Real-time visitor insights · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={refreshLive}
            disabled={liveRefreshing}
            className="flex items-center gap-2 text-label-caps text-secondary hover:text-tertiary transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={liveRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-6 border border-outline-variant flex flex-col gap-3 ${
                card.accent ? 'bg-tertiary text-white' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-label-caps text-[10px] ${card.accent ? 'text-white/60' : 'text-secondary'}`}>
                  {card.label}
                </span>
                <card.icon size={16} className={card.accent ? 'text-white/40' : 'text-secondary/40'} />
              </div>
              <div className="flex items-end gap-3">
                <span className={`text-display text-[36px] leading-none ${card.accent ? 'text-white' : ''}`}>
                  {card.value}
                </span>
                {card.change !== undefined && (
                  <span className={`text-[12px] flex items-center gap-1 mb-1 ${
                    card.change >= 0 ? 'text-[#2e7d32]' : 'text-[#c62828]'
                  }`}>
                    {card.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(card.change).toFixed(0)}%
                  </span>
                )}
                {card.pulse && (
                  <span className="relative mb-2 ml-1">
                    <span className="absolute w-2 h-2 bg-[#66bb6a] rounded-full animate-ping" />
                    <span className="relative w-2 h-2 bg-[#66bb6a] rounded-full block" />
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-12 gap-6">
          {/* Views Over Time — Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 lg:col-span-8 bg-white border border-outline-variant p-8 flex flex-col gap-6"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-headline-sm">Views Over Time</h4>
              <span className="text-label-caps text-secondary text-[10px]">Last 30 days</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.viewsByDay}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e2e1" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#5e5e5d', fontFamily: 'Manrope' }}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#5e5e5d', fontFamily: 'Manrope' }}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #c4c7c7',
                      borderRadius: 0,
                      fontFamily: 'Manrope',
                      fontSize: 12,
                    }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#000"
                    strokeWidth={2}
                    fill="url(#viewsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="col-span-12 lg:col-span-4 flex flex-col gap-6"
          >
            <div className="bg-tertiary text-white p-8 flex flex-col justify-between min-h-[140px]">
              <p className="text-label-caps opacity-70">This Month</p>
              <h5 className="text-display text-[36px] mt-2">{summary.thisMonthViews.toLocaleString()}</h5>
              <p className="text-[11px] text-white/50 mt-2">total page views</p>
            </div>
            <div className="bg-surface-container border border-outline-variant p-8 flex flex-col justify-between min-h-[140px]">
              <p className="text-label-caps text-secondary">Last Month</p>
              <h5 className="text-display text-[36px] mt-2">{summary.lastMonthViews.toLocaleString()}</h5>
              <p className="text-[11px] text-secondary/50 mt-2">total page views</p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row: Peak Hours + Top Pages */}
        <div className="grid grid-cols-12 gap-6">
          {/* Peak Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 lg:col-span-6 bg-white border border-outline-variant p-8 flex flex-col gap-6"
          >
            <h4 className="text-headline-sm">Peak Hours</h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.viewsByHour}>
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#5e5e5d', fontFamily: 'Manrope' }}
                    tickFormatter={(h) => `${h}:00`}
                    interval={2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #c4c7c7',
                      borderRadius: 0,
                      fontFamily: 'Manrope',
                      fontSize: 12,
                    }}
                    labelFormatter={(h) => `${h}:00 — ${h}:59`}
                  />
                  <Bar dataKey="views" fill="#000" radius={[2, 2, 0, 0]}>
                    {summary.viewsByHour.map((entry, index) => {
                      const maxViews = Math.max(...summary.viewsByHour.map(h => h.views));
                      const opacity = maxViews > 0 ? 0.2 + (entry.views / maxViews) * 0.8 : 0.2;
                      return <rect key={index} fill={`rgba(0,0,0,${opacity})`} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Top Pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="col-span-12 lg:col-span-6 bg-white border border-outline-variant p-8 flex flex-col gap-6"
          >
            <h4 className="text-headline-sm">Top Pages</h4>
            <div className="flex flex-col gap-3">
              {summary.topPages.length === 0 ? (
                <p className="text-secondary text-body-md italic">No page data yet.</p>
              ) : (
                summary.topPages.slice(0, 8).map((page, i) => {
                  const maxViews = summary.topPages[0]?.views || 1;
                  const width = Math.max(8, (page.views / maxViews) * 100);
                  return (
                    <div key={page.path} className="flex items-center gap-4">
                      <span className="text-[11px] text-secondary w-5 text-right">{i + 1}</span>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[13px] font-medium truncate max-w-[200px]">{page.path}</span>
                          <span className="text-[11px] text-secondary ml-2">{page.views}</span>
                        </div>
                        <div className="h-1.5 bg-surface-container-low w-full">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                            className="h-full bg-tertiary"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-outline-variant p-8 flex flex-col gap-6"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h4 className="text-headline-sm">Live Activity</h4>
              <span className="relative">
                <span className="absolute w-2 h-2 bg-[#66bb6a] rounded-full animate-ping" />
                <span className="relative w-2 h-2 bg-[#66bb6a] rounded-full block" />
              </span>
            </div>
            <span className="text-label-caps text-secondary text-[10px]">
              Auto-refreshing every 5s
            </span>
          </div>

          <div className="max-h-[320px] overflow-y-auto flex flex-col divide-y divide-surface-container-low">
            <AnimatePresence mode="popLayout">
              {recentViews.length === 0 ? (
                <p className="text-secondary text-body-md italic py-8 text-center">
                  No activity recorded yet. Start browsing the blog!
                </p>
              ) : (
                recentViews.map((view) => (
                  <motion.div
                    key={view.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    layout
                    className="flex items-center gap-4 py-3"
                  >
                    <Activity size={14} className="text-secondary/40 flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <span className="text-[13px] font-medium truncate block">{view.path}</span>
                      <span className="text-[11px] text-secondary">
                        Session {view.sessionId.slice(0, 10)}…
                      </span>
                    </div>
                    <span className="text-[11px] text-secondary flex-shrink-0">
                      {formatTimeAgo(view.timestamp)}
                    </span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AdminLayout>
    </motion.div>
  );
}
