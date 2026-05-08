import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Analytics Storage ────────────────────────────────────────────────
interface PageViewRecord {
  id: string;
  path: string;
  title: string;
  referrer: string;
  timestamp: string;
  sessionId: string;
}

interface SessionRecord {
  sessionId: string;
  firstSeen: string;
  lastActive: string;
  pageCount: number;
  pages: string[];
}

interface AnalyticsData {
  pageviews: PageViewRecord[];
  sessions: SessionRecord[];
  heartbeats: { sessionId: string; lastPing: string }[];
}

const ANALYTICS_FILE = path.join(__dirname, "analytics-data.json");

function loadAnalytics(): AnalyticsData {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      return JSON.parse(fs.readFileSync(ANALYTICS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Failed to load analytics data:", e);
  }
  return { pageviews: [], sessions: [], heartbeats: [] };
}

function saveAnalytics(data: AnalyticsData): void {
  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save analytics data:", e);
  }
}

// ─── Server Setup ─────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Multer config for file storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({ storage });

  app.use(express.json({ limit: "50mb" }));

  // API Route for Image Upload
  app.post("/api/upload", upload.single("image"), (req: express.Request & { file?: Express.Multer.File }, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  });

  // Serve static files from public
  app.use("/uploads", express.static(uploadsDir));

  // ─── Analytics API Routes ───────────────────────────────────────────

  // POST /api/analytics/track — Record a page view (public)
  app.post("/api/analytics/track", (req, res) => {
    const { path: pagePath, title, referrer, sessionId } = req.body;
    if (!pagePath || !sessionId) {
      return res.status(400).json({ error: "Missing path or sessionId" });
    }

    const analytics = loadAnalytics();
    const now = new Date().toISOString();

    // Record page view
    const pageview: PageViewRecord = {
      id: Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 8),
      path: pagePath,
      title: title || "",
      referrer: referrer || "",
      timestamp: now,
      sessionId,
    };
    analytics.pageviews.push(pageview);

    // Update or create session
    let session = analytics.sessions.find((s) => s.sessionId === sessionId);
    if (session) {
      session.lastActive = now;
      session.pageCount++;
      if (!session.pages.includes(pagePath)) {
        session.pages.push(pagePath);
      }
    } else {
      analytics.sessions.push({
        sessionId,
        firstSeen: now,
        lastActive: now,
        pageCount: 1,
        pages: [pagePath],
      });
    }

    // Trim old data: keep last 90 days of pageviews, last 500 sessions
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    analytics.pageviews = analytics.pageviews.filter((pv) => pv.timestamp > ninetyDaysAgo);
    analytics.sessions = analytics.sessions.slice(-500);

    saveAnalytics(analytics);
    res.json({ ok: true });
  });

  // POST /api/analytics/heartbeat — Keep session alive for real-time count
  app.post("/api/analytics/heartbeat", (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    const analytics = loadAnalytics();
    const now = new Date().toISOString();

    const existing = analytics.heartbeats.find((h) => h.sessionId === sessionId);
    if (existing) {
      existing.lastPing = now;
    } else {
      analytics.heartbeats.push({ sessionId, lastPing: now });
    }

    // Clean up stale heartbeats (older than 30 seconds)
    const cutoff = new Date(Date.now() - 30000).toISOString();
    analytics.heartbeats = analytics.heartbeats.filter((h) => h.lastPing > cutoff);

    saveAnalytics(analytics);
    res.json({ ok: true });
  });

  // GET /api/analytics/summary — Aggregated analytics data
  app.get("/api/analytics/summary", (req, res) => {
    const analytics = loadAnalytics();
    const now = new Date();

    // Today & Yesterday
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();

    const todayViews = analytics.pageviews.filter((pv) => pv.timestamp >= todayStart).length;
    const yesterdayViews = analytics.pageviews.filter(
      (pv) => pv.timestamp >= yesterdayStart && pv.timestamp < todayStart
    ).length;

    const changePercent = yesterdayViews > 0 ? ((todayViews - yesterdayViews) / yesterdayViews) * 100 : todayViews > 0 ? 100 : 0;

    // Active now (heartbeats in last 30s)
    const heartbeatCutoff = new Date(Date.now() - 30000).toISOString();
    const activeNow = analytics.heartbeats.filter((h) => h.lastPing > heartbeatCutoff).length;

    // Session stats
    const recentSessions = analytics.sessions.slice(-100);
    let totalDuration = 0;
    let bounceCount = 0;

    for (const s of recentSessions) {
      const duration = (new Date(s.lastActive).getTime() - new Date(s.firstSeen).getTime()) / 1000;
      totalDuration += duration;
      if (s.pageCount <= 1) bounceCount++;
    }

    const avgSessionDuration = recentSessions.length > 0 ? totalDuration / recentSessions.length : 0;
    const bounceRate = recentSessions.length > 0 ? (bounceCount / recentSessions.length) * 100 : 0;

    // Views by day (last 30 days)
    const viewsByDay: { date: string; views: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStart = dayDate.toISOString();
      const dayEnd = new Date(dayDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
      const count = analytics.pageviews.filter((pv) => pv.timestamp >= dayStart && pv.timestamp < dayEnd).length;
      viewsByDay.push({ date: dayStart.split("T")[0], views: count });
    }

    // Views by hour (all time, aggregated)
    const viewsByHour: { hour: number; views: number }[] = [];
    for (let h = 0; h < 24; h++) {
      const count = analytics.pageviews.filter((pv) => new Date(pv.timestamp).getHours() === h).length;
      viewsByHour.push({ hour: h, views: count });
    }

    // Top pages
    const pageCounts: Record<string, number> = {};
    for (const pv of analytics.pageviews) {
      pageCounts[pv.path] = (pageCounts[pv.path] || 0) + 1;
    }
    const topPages = Object.entries(pageCounts)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // This month vs last month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    const thisMonthViews = analytics.pageviews.filter((pv) => pv.timestamp >= thisMonthStart).length;
    const lastMonthViews = analytics.pageviews.filter(
      (pv) => pv.timestamp >= lastMonthStart && pv.timestamp < thisMonthStart
    ).length;

    res.json({
      totalViews: analytics.pageviews.length,
      todayViews,
      yesterdayViews,
      changePercent,
      activeNow,
      avgSessionDuration,
      bounceRate,
      viewsByDay,
      viewsByHour,
      topPages,
      recentViews: analytics.pageviews.slice(-25).reverse(),
      thisMonthViews,
      lastMonthViews,
    });
  });

  // GET /api/analytics/recent — Recent page views for live feed
  app.get("/api/analytics/recent", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const analytics = loadAnalytics();
    const recent = analytics.pageviews.slice(-limit).reverse();
    res.json(recent);
  });

  // ─── Vite / Static ─────────────────────────────────────────────────

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
