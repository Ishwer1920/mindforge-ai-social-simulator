import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "../context/AppContext";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const tooltipStyle = {
  background: "oklch(0.16 0.018 280)",
  border: "1px solid oklch(0.3 0.03 280 / 0.4)",
  borderRadius: "10px",
  color: "oklch(0.97 0.01 260)",
};

const REGION_COLORS = [
  "oklch(0.6 0.22 295)",
  "oklch(0.65 0.2 210)",
  "oklch(0.72 0.18 145)",
  "oklch(0.72 0.2 50)",
];

export default function Analytics() {
  const { analyticsData, posts, audienceRegions, fanLoyalty } = useApp();

  const followerData = analyticsData.followerGrowth.map((v, i) => ({
    day: DAYS[i % DAYS.length],
    followers: v,
  }));

  const engagementData = posts.map((p, i) => ({
    name: `Post ${i + 1}`,
    likes: p.likes,
    comments: p.comments.length,
    shares: p.shares,
  }));

  const topPost =
    posts.find((p) => p.id === analyticsData.topPostId) ?? posts[0];

  const watchTimeData = posts
    .filter((p) => p.watchTime !== undefined)
    .map((p, i) => ({
      name: `Post ${i + 1}`,
      watchTime: p.watchTime as number,
    }));

  const avgWatchTime =
    watchTimeData.length > 0
      ? Math.round(
          watchTimeData.reduce((acc, d) => acc + d.watchTime, 0) /
            watchTimeData.length,
        )
      : 0;
  const highRetention = watchTimeData.filter((d) => d.watchTime >= 70).length;
  const completionRate =
    avgWatchTime > 0 ? Math.min(100, Math.round(avgWatchTime * 0.85)) : 0;

  const regionData = [
    { name: "North America", value: audienceRegions.northAmerica },
    { name: "Europe", value: audienceRegions.europe },
    { name: "Asia", value: audienceRegions.asia },
    { name: "South America", value: audienceRegions.southAmerica },
  ];

  const statCards = [
    {
      label: "Followers Gained Today",
      value: analyticsData.followersGainedToday.toLocaleString(),
      icon: "👤",
      ocid: "analytics.followers_card",
    },
    {
      label: "Total Likes Today",
      value: analyticsData.totalLikesToday.toLocaleString(),
      icon: "❤️",
      ocid: "analytics.likes_card",
    },
    {
      label: "Total Comments Today",
      value: analyticsData.totalCommentsToday.toLocaleString(),
      icon: "💬",
      ocid: "analytics.comments_card",
    },
    {
      label: "Engagement Rate",
      value: `${analyticsData.engagementRate.toFixed(1)}%`,
      icon: "📈",
      ocid: "analytics.engagement_card",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon, ocid }) => (
          <div key={label} data-ocid={ocid} className="glass-card p-4">
            <div className="text-2xl mb-2">{icon}</div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Top Performing Post */}
      {topPost && (
        <div className="glass-card p-5">
          <h2 className="font-semibold mb-4">🏆 Top Performing Post</h2>
          <div className="flex gap-4">
            <img
              src={topPost.imageUrl}
              alt=""
              className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1 line-clamp-2">
                {topPost.caption}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {topPost.authorUsername}
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "Likes", value: topPost.likes.toLocaleString() },
                  {
                    label: "Comments",
                    value: topPost.comments.length.toString(),
                  },
                  { label: "Shares", value: topPost.shares.toString() },
                  {
                    label: "Score",
                    value: Math.floor(topPost.engagementScore).toLocaleString(),
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "oklch(0.75 0.22 295)" }}
                    >
                      {value}
                    </p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audience Regions */}
      <div className="glass-card p-5">
        <h2 className="font-semibold mb-1">🌍 Audience Regions</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Best posting time: 2–6 PM EST for peak North American reach
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={regionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {regionData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={REGION_COLORS[index % REGION_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [`${value}%`, "Share"]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2.5 w-full">
            {regionData.map((region, i) => (
              <div key={region.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{region.name}</span>
                  <span
                    className="font-semibold"
                    style={{ color: REGION_COLORS[i] }}
                  >
                    {region.value}%
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.22 0.02 280)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${region.value}%`,
                      background: REGION_COLORS[i],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Follower Growth */}
      <div className="glass-card p-5">
        <h2 className="font-semibold mb-5">📈 Follower Growth</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={followerData}>
            <defs>
              <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(0.6 0.22 295)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(0.6 0.22 295)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.25 0.025 280 / 0.4)"
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "oklch(0.55 0.02 270)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.55 0.02 270)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="followers"
              stroke="oklch(0.6 0.22 295)"
              strokeWidth={2}
              fill="url(#colorFollowers)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Post Engagement — Likes */}
      <div className="glass-card p-5">
        <h2 className="font-semibold mb-5">📊 Likes per Post</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={engagementData}>
            <defs>
              <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="oklch(0.6 0.22 295)"
                  stopOpacity={1}
                />
                <stop
                  offset="100%"
                  stopColor="oklch(0.65 0.2 210)"
                  stopOpacity={0.7}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.25 0.025 280 / 0.4)"
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "oklch(0.55 0.02 270)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.55 0.02 270)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar
              dataKey="likes"
              fill="url(#colorLikes)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Comments per Post */}
      <div className="glass-card p-5">
        <h2 className="font-semibold mb-5">💬 Comments per Post</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={engagementData}>
            <defs>
              <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="oklch(0.65 0.2 175)"
                  stopOpacity={1}
                />
                <stop
                  offset="100%"
                  stopColor="oklch(0.65 0.2 210)"
                  stopOpacity={0.7}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.25 0.025 280 / 0.4)"
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "oklch(0.55 0.02 270)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.55 0.02 270)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar
              dataKey="comments"
              fill="url(#colorComments)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Watch Time & Retention */}
      {watchTimeData.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="font-semibold mb-1">👁 Watch Time & Retention</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Avg watch time: {avgWatchTime}% &nbsp;&middot;&nbsp; Completion
            rate: {completionRate}%
          </p>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              {
                label: "Avg Watch Time",
                value: `${avgWatchTime}%`,
                color: "oklch(0.65 0.2 210)",
              },
              {
                label: "High Retention",
                value: `${highRetention} posts`,
                color: "oklch(0.72 0.18 145)",
              },
              {
                label: "Completion Rate",
                value: `${completionRate}%`,
                color: "oklch(0.6 0.22 295)",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className="text-lg font-bold" style={{ color }}>
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={watchTimeData}>
              <defs>
                <linearGradient id="colorWatch" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="oklch(0.65 0.2 210)"
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor="oklch(0.6 0.22 295)"
                    stopOpacity={0.6}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.25 0.025 280 / 0.4)"
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "oklch(0.55 0.02 270)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "oklch(0.55 0.02 270)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v}%`, "Watch Time"]}
              />
              <Bar
                dataKey="watchTime"
                fill="url(#colorWatch)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Engagement Trends */}
      <div className="glass-card p-5">
        <h2 className="font-semibold mb-5">
          🔥 Engagement Trends (Likes vs Shares)
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={engagementData}>
            <defs>
              <linearGradient id="colorLikes2" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="oklch(0.6 0.22 295)"
                  stopOpacity={1}
                />
                <stop
                  offset="100%"
                  stopColor="oklch(0.55 0.22 295)"
                  stopOpacity={0.7}
                />
              </linearGradient>
              <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="oklch(0.65 0.2 50)"
                  stopOpacity={1}
                />
                <stop
                  offset="100%"
                  stopColor="oklch(0.65 0.2 50)"
                  stopOpacity={0.6}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.25 0.025 280 / 0.4)"
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "oklch(0.55 0.02 270)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.55 0.02 270)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              wrapperStyle={{ color: "oklch(0.75 0.02 270)", fontSize: 12 }}
            />
            <Bar
              dataKey="likes"
              fill="url(#colorLikes2)"
              radius={[3, 3, 0, 0]}
              name="Likes"
            />
            <Bar
              dataKey="shares"
              fill="url(#colorShares)"
              radius={[3, 3, 0, 0]}
              name="Shares"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Fan Loyalty Breakdown */}
      <div className="glass-card p-5" data-ocid="analytics.fan_loyalty.card">
        <h2 className="font-semibold mb-2">💜 Fan Loyalty Breakdown</h2>
        <p className="text-xs text-muted-foreground mb-5">
          Higher-tier fans contribute more engagement — Ultra Fans give 4x the
          engagement weight.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: "Fans", value: fanLoyalty.fans, color: "#6366f1" },
                  {
                    name: "Super Fans",
                    value: fanLoyalty.superFans,
                    color: "#8b5cf6",
                  },
                  {
                    name: "VIP Fans",
                    value: fanLoyalty.vipFans,
                    color: "#06b6d4",
                  },
                  {
                    name: "Ultra Fans",
                    value: fanLoyalty.ultraFans,
                    color: "#eab308",
                  },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {[
                  { name: "Fans", value: fanLoyalty.fans, color: "#6366f1" },
                  {
                    name: "Super Fans",
                    value: fanLoyalty.superFans,
                    color: "#8b5cf6",
                  },
                  {
                    name: "VIP Fans",
                    value: fanLoyalty.vipFans,
                    color: "#06b6d4",
                  },
                  {
                    name: "Ultra Fans",
                    value: fanLoyalty.ultraFans,
                    color: "#eab308",
                  },
                ].map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [v.toLocaleString(), ""]}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "11px",
                  color: "oklch(0.75 0.02 260)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {[
              {
                label: "Fans",
                count: fanLoyalty.fans,
                color: "#6366f1",
                multiplier: "1x",
                icon: "👤",
              },
              {
                label: "Super Fans",
                count: fanLoyalty.superFans,
                color: "#8b5cf6",
                multiplier: "2x",
                icon: "⭐",
              },
              {
                label: "VIP Fans",
                count: fanLoyalty.vipFans,
                color: "#06b6d4",
                multiplier: "3x",
                icon: "💎",
              },
              {
                label: "Ultra Fans",
                count: fanLoyalty.ultraFans,
                color: "#eab308",
                multiplier: "4x",
                icon: "👑",
              },
            ].map((tier) => {
              const total =
                fanLoyalty.fans +
                fanLoyalty.superFans +
                fanLoyalty.vipFans +
                fanLoyalty.ultraFans;
              const pct =
                total > 0 ? ((tier.count / total) * 100).toFixed(1) : "0.0";
              return (
                <div key={tier.label} className="flex items-center gap-3">
                  <span className="text-xl w-7 flex-shrink-0">{tier.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">
                        {tier.label}
                      </span>
                      <span className="text-xs" style={{ color: tier.color }}>
                        {tier.multiplier} engagement
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full"
                      style={{ background: "oklch(0.22 0.02 280)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: tier.color }}
                      />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {tier.count.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Story Performance Section */}
      <StoryPerformanceSection />
    </div>
  );
}

function StoryPerformanceSection() {
  const { stories } = useApp();
  const userStories = stories.filter((s) => s.userId === "me");

  if (userStories.length === 0) {
    return (
      <div className="glass-card p-5 space-y-3">
        <h3 className="font-semibold text-foreground text-base">
          \ud83d\udcf8 Story Performance
        </h3>
        <p className="text-sm text-muted-foreground">
          Post your first story to see analytics here.
        </p>
      </div>
    );
  }

  const totalViews = userStories.reduce(
    (acc, s) => acc + (s.viewCount ?? 0),
    0,
  );
  const avgViewRate =
    userStories.reduce((acc, s) => acc + (s.viewRate ?? 0), 0) /
    userStories.length;
  const bestStory = [...userStories].sort(
    (a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0),
  )[0];
  const avgRetention =
    userStories.reduce((acc, s) => acc + (s.retentionScore ?? 0), 0) /
    userStories.length;
  const avgDelta =
    userStories.reduce((acc, s) => acc + (s.performanceDelta ?? 0), 0) /
    userStories.length;

  const chartData = userStories.slice(-10).map((s, i) => ({
    name: `Story ${i + 1}`,
    views: s.viewCount ?? 0,
  }));

  const hour = new Date().getHours();
  const bestTimeStr =
    hour >= 18 && hour <= 22 ? "Now is great!" : "7 PM (peak engagement)";

  return (
    <div className="glass-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-base">
          \ud83d\udcf8 Story Performance
        </h3>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: "oklch(0.28 0.06 295 / 0.5)",
            color: "oklch(0.75 0.15 295)",
          }}
        >
          {userStories.length} stories
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Total Views",
            value: totalViews.toLocaleString(),
            icon: "\ud83d\udc41",
          },
          {
            label: "Avg View Rate",
            value: `${avgViewRate.toFixed(1)}%`,
            icon: "\ud83d\udcc8",
          },
          {
            label: "Best Story",
            value: (bestStory?.viewCount ?? 0).toLocaleString(),
            icon: "\ud83d\udd25",
          },
          {
            label: "Avg Retention",
            value: `${Math.round(avgRetention)}%`,
            icon: "\u23f1",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-3 space-y-1"
            style={{
              background: "oklch(0.16 0.02 280 / 0.6)",
              border: "1px solid oklch(0.28 0.025 280 / 0.4)",
            }}
          >
            <span className="text-base">{stat.icon}</span>
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Best story highlight */}
      {bestStory && (
        <div
          className="rounded-2xl p-3 flex items-center gap-3"
          style={{
            background: "oklch(0.22 0.06 295 / 0.3)",
            border: "1px solid oklch(0.45 0.15 295 / 0.3)",
          }}
        >
          <span className="text-xl">\ud83c\udfc6</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">
              Best Performing Story
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {(bestStory.viewCount ?? 0).toLocaleString()} views ·{" "}
              {(bestStory.viewRate ?? 0).toFixed(1)}% reach
            </p>
          </div>
          <span
            className="text-xs font-bold"
            style={{
              color:
                (bestStory.performanceDelta ?? 0) >= 0
                  ? "oklch(0.72 0.18 145)"
                  : "oklch(0.65 0.2 25)",
            }}
          >
            {(bestStory.performanceDelta ?? 0) >= 0 ? "+" : ""}
            {(bestStory.performanceDelta ?? 0).toFixed(0)}%
          </span>
        </div>
      )}

      {/* Comparison line */}
      <p className="text-xs text-muted-foreground">
        {avgDelta >= 0
          ? `\ud83d\udcc8 Your stories performed ${avgDelta.toFixed(0)}% better than average`
          : `\u26a0\ufe0f Your stories performed ${Math.abs(avgDelta).toFixed(0)}% below average`}
      </p>

      {/* Best posting time */}
      <div
        className="rounded-xl px-3 py-2 flex items-center gap-2"
        style={{ background: "oklch(0.2 0.04 295 / 0.4)" }}
      >
        <span className="text-sm">\ud83d\udcc5</span>
        <p className="text-xs text-muted-foreground">
          Best time to post stories:{" "}
          <span className="text-foreground font-medium">{bestTimeStr}</span>
        </p>
      </div>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Story Views (last {chartData.length})
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.25 0.02 280 / 0.4)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fill: "oklch(0.55 0.04 280)" }}
              />
              <YAxis tick={{ fontSize: 9, fill: "oklch(0.55 0.04 280)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="views"
                radius={[4, 4, 0, 0]}
                fill="oklch(0.6 0.22 295)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
