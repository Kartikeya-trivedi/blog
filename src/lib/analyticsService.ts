import { supabase } from './supabase';

export interface PageView {
  id: string;
  path: string;
  title: string;
  referrer: string;
  timestamp: string;
  sessionId: string;
}

function mapRowToView(row: any): PageView {
  return {
    id: row.id,
    path: row.path,
    title: row.title,
    referrer: row.referrer,
    timestamp: row.created_at,
    sessionId: row.session_id,
  };
}

export interface AnalyticsSummary {
  totalViews: number;
  todayViews: number;
  yesterdayViews: number;
  changePercent: number;
  activeNow: number;
  avgSessionDuration: number;
  bounceRate: number;
  viewsByDay: { date: string; views: number }[];
  viewsByHour: { hour: number; views: number }[];
  topPages: { path: string; views: number }[];
  recentViews: PageView[];
  thisMonthViews: number;
  lastMonthViews: number;
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('editorial_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
    sessionStorage.setItem('editorial_session_id', sessionId);
  }
  return sessionId;
}

export const analyticsClient = {
  trackPageView: async (path: string, title: string = document.title): Promise<void> => {
    try {
      const sessionId = getSessionId();
      
      // 1. Record Page View
      await supabase.from('page_views').insert({
        path,
        title,
        referrer: document.referrer || '',
        session_id: sessionId
      });

      // 2. Update/Create Session (for active now count)
      await supabase.from('sessions').upsert({
        session_id: sessionId,
        last_active: new Date().toISOString(),
      }, { onConflict: 'session_id' });

    } catch (e) {
      console.warn('Analytics tracking failed:', e);
    }
  },

  heartbeat: async (): Promise<void> => {
    try {
      await supabase.from('sessions').upsert({
        session_id: getSessionId(),
        last_active: new Date().toISOString(),
      }, { onConflict: 'session_id' });
    } catch (e) { /* silent */ }
  },

  getSummary: async (): Promise<AnalyticsSummary> => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();

      // Fetch all page views from last 30 days
      const { data: views, error } = await supabase
        .from('page_views')
        .select('*')
        .gte('created_at', thirtyDaysAgo);

      if (error) throw error;

      // Fetch active sessions (last 30 seconds)
      const heartbeatCutoff = new Date(Date.now() - 30000).toISOString();
      const { count: activeNow } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', heartbeatCutoff);

      const todayViews = views.filter(v => v.created_at >= todayStart).length;
      const yesterdayViews = views.filter(v => v.created_at >= yesterdayStart && v.created_at < todayStart).length;
      const changePercent = yesterdayViews > 0 ? ((todayViews - yesterdayViews) / yesterdayViews) * 100 : todayViews > 0 ? 100 : 0;

      // Views by day
      const viewsByDay: { date: string; views: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        const count = views.filter(v => v.created_at.startsWith(dayStr)).length;
        viewsByDay.push({ date: dayStr, views: count });
      }

      // Views by hour
      const viewsByHour: { hour: number; views: number }[] = [];
      for (let h = 0; h < 24; h++) {
        const count = views.filter(v => new Date(v.created_at).getHours() === h).length;
        viewsByHour.push({ hour: h, views: count });
      }

      // Top pages
      const pageCounts: Record<string, number> = {};
      views.forEach(v => { pageCounts[v.path] = (pageCounts[v.path] || 0) + 1; });
      const topPages = Object.entries(pageCounts)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // This/Last Month
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const thisMonthViews = views.filter(v => v.created_at >= thisMonthStart).length;
      const lastMonthViews = views.filter(v => v.created_at >= lastMonthStart && v.created_at < thisMonthStart).length;

      return {
        totalViews: views.length,
        todayViews,
        yesterdayViews,
        changePercent,
        activeNow: activeNow || 0,
        avgSessionDuration: 0, // Simplified for now
        bounceRate: 0,
        viewsByDay,
        viewsByHour,
        topPages,
        recentViews: views.slice(-25).reverse().map(mapRowToView),
        thisMonthViews,
        lastMonthViews
      };
    } catch (e) {
      console.error('Failed to compute summary:', e);
      throw e;
    }
  },

  getRecentViews: async (limit: number = 20): Promise<PageView[]> => {
    const { data, error } = await supabase
      .from('page_views')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data ?? []).map(mapRowToView);
  },
};
