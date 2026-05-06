import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "../context/AppContext";

const CPM_BY_NICHE: Record<string, number> = {
  Tech: 7,
  Finance: 7,
  Education: 4,
  Fitness: 5,
  Travel: 5,
  Comedy: 3.5,
  Fashion: 3.5,
  Gaming: 3.5,
  Memes: 2,
  Food: 2,
};

const NICHE_COLORS: Record<string, string> = {
  Tech: "#6366f1",
  Finance: "#22c55e",
  Fitness: "#f97316",
  Comedy: "#eab308",
  Memes: "#a855f7",
  Travel: "#06b6d4",
  Gaming: "#ec4899",
  Fashion: "#f43f5e",
  Food: "#f59e0b",
  Education: "#14b8a6",
};

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

const TOOLTIP_STYLE = {
  backgroundColor: "oklch(0.18 0.02 280)",
  border: "1px solid oklch(0.35 0.03 280)",
  borderRadius: "8px",
  color: "oklch(0.97 0.01 260)",
};

export default function Monetization() {
  const {
    monetization,
    acceptSponsorship,
    negotiateSponsorship,
    navigate,
    profile,
    celebrityMode,
  } = useApp();
  const niche = profile.niche || "Tech";
  const cpm = CPM_BY_NICHE[niche] ?? 3.5;
  const nicheColor = NICHE_COLORS[niche] ?? "#a855f7";

  const {
    totalEarnings,
    adRevenue,
    tipRevenue,
    merchRevenue,
    sponsorRevenue,
    dailyEarnings,
    monthlyEarnings,
    topEarningPosts,
    activeSponsorships,
  } = monetization;

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const pieData = [
    { name: "Ad Revenue", value: Math.max(adRevenue, 0.01), color: "#a855f7" },
    { name: "Tips", value: Math.max(tipRevenue, 0.01), color: "#6366f1" },
    { name: "Merch", value: Math.max(merchRevenue, 0.01), color: "#22c55e" },
    {
      name: "Sponsorships",
      value: Math.max(sponsorRevenue, 0.01),
      color: "#eab308",
    },
  ];

  const lineData = dailyEarnings.map((v, i) => ({
    day: `D${i + 1}`,
    value: v,
  }));
  const barData = monthlyEarnings.map((v, i) => ({
    month: MONTHS[i],
    value: v,
  }));

  const cardStyle: React.CSSProperties = {
    background: "oklch(0.16 0.018 280 / 0.8)",
    border: "1px solid oklch(0.28 0.025 280 / 0.5)",
    borderRadius: "16px",
    backdropFilter: "blur(16px)",
  };

  const summaryCards = [
    {
      label: "Total Earnings",
      value: fmt(totalEarnings),
      icon: "💰",
      ocid: "monetization.total_earnings.card",
      delta: "+12.4%",
    },
    {
      label: "Ad Revenue",
      value: fmt(adRevenue),
      icon: "📺",
      ocid: "monetization.ad_revenue.card",
      delta: "+8.1%",
    },
    {
      label: "Fan Tips",
      value: fmt(tipRevenue),
      icon: "💸",
      ocid: "monetization.tips.card",
      delta: "+22.3%",
    },
    {
      label: "Merch Sales",
      value: fmt(merchRevenue),
      icon: "🛍️",
      ocid: "monetization.merch.card",
      delta: "+5.6%",
    },
    {
      label: "Brand Deals",
      value: fmt(sponsorRevenue),
      icon: "🤝",
      ocid: "monetization.sponsorships.card",
      delta:
        activeSponsorships.length > 0
          ? `${activeSponsorships.length} active`
          : "None yet",
    },
  ];

  return (
    <div
      data-ocid="monetization.page"
      className="max-w-5xl mx-auto py-6 px-4 space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-3"
      >
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Monetization
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your creator earnings overview
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{
            background: `${nicheColor}22`,
            border: `1px solid ${nicheColor}55`,
            color: nicheColor,
          }}
        >
          <span>🎯</span>
          <span>
            {niche} · CPM ${cpm.toFixed(2)}
          </span>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            data-ocid={card.ocid}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={cardStyle}
            className="p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg">{card.icon}</span>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  background: "oklch(0.68 0.2 150 / 0.15)",
                  color: "oklch(0.68 0.2 150)",
                }}
              >
                {card.delta}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p
                className="text-base font-bold"
                style={{ color: "oklch(0.72 0.18 150)" }}
              >
                {card.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={cardStyle}
          className="p-5"
          data-ocid="monetization.daily_chart.chart_point"
        >
          <h3 className="text-sm font-semibold mb-4">Revenue Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: number) => [fmt(value), ""]}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "11px",
                  color: "oklch(0.75 0.02 260)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Daily Line */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          style={cardStyle}
          className="p-5"
        >
          <h3 className="text-sm font-semibold mb-4">
            Daily Earnings (30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <XAxis
                dataKey="day"
                tick={{ fill: "oklch(0.6 0.02 280)", fontSize: 9 }}
                interval={4}
              />
              <YAxis tick={{ fill: "oklch(0.6 0.02 280)", fontSize: 10 }} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: number) => [fmt(value), "Earnings"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Monthly Bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={cardStyle}
        className="p-5"
        data-ocid="monetization.monthly_chart.chart_point"
      >
        <h3 className="text-sm font-semibold mb-4">
          Monthly Earnings (12 Months)
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData}>
            <XAxis
              dataKey="month"
              tick={{ fill: "oklch(0.6 0.02 280)", fontSize: 10 }}
            />
            <YAxis tick={{ fill: "oklch(0.6 0.02 280)", fontSize: 10 }} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value: number) => [fmt(value), "Revenue"]}
            />
            <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Earning Posts */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        style={cardStyle}
        className="p-5"
      >
        <h3 className="text-sm font-semibold mb-4">🏆 Top Earning Posts</h3>
        <div className="space-y-3">
          {topEarningPosts.map((post, i) => (
            <div
              key={post.postId}
              className="flex items-center justify-between py-2"
              style={{
                borderBottom:
                  i < topEarningPosts.length - 1
                    ? "1px solid oklch(0.25 0.02 280 / 0.4)"
                    : "none",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "oklch(0.55 0.22 295 / 0.2)",
                    color: "oklch(0.65 0.22 295)",
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-sm truncate max-w-[200px]">
                  {post.label}...
                </span>
              </div>
              <span
                className="font-semibold text-sm"
                style={{ color: "oklch(0.72 0.18 150)" }}
              >
                {fmt(post.earnings)}
              </span>
            </div>
          ))}
          {topEarningPosts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No earning posts yet
            </p>
          )}
        </div>
      </motion.div>

      {/* Active Sponsorships */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={cardStyle}
        className="p-5"
      >
        <h3 className="text-sm font-semibold mb-4">🤝 Active Sponsorships</h3>
        {activeSponsorships.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🎯</p>
            <p className="text-sm text-muted-foreground">
              Reach 10K followers to unlock brand deals!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Current: {profile.followers.toLocaleString()} / 10,000
            </p>
            <div
              className="w-full mt-3 h-1.5 rounded-full"
              style={{ background: "oklch(0.22 0.02 280)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (profile.followers / 10000) * 100)}%`,
                  background: "oklch(0.65 0.22 295)",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeSponsorships.map((deal, i) => (
              <div
                key={deal.id}
                className="p-4 rounded-xl"
                style={{
                  background: "oklch(0.13 0.016 280 / 0.6)",
                  border: "1px solid oklch(0.28 0.025 280 / 0.4)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{deal.brandName}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {deal.tier} deal
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full capitalize"
                    style={{
                      background:
                        deal.status === "active"
                          ? "oklch(0.68 0.2 150 / 0.2)"
                          : "oklch(0.72 0.2 65 / 0.2)",
                      color:
                        deal.status === "active"
                          ? "oklch(0.68 0.2 150)"
                          : "oklch(0.72 0.2 65)",
                    }}
                  >
                    {deal.status}
                  </span>
                </div>
                <p
                  className="text-lg font-bold mt-2"
                  style={{ color: "oklch(0.72 0.18 150)" }}
                >
                  {fmt(deal.dealValue)}
                </p>
                {deal.status === "pending" && (
                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      data-ocid={`monetization.accept_deal.button.${i + 1}`}
                      onClick={() => acceptSponsorship(deal.id)}
                      className="w-full py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.2 240))",
                        color: "white",
                      }}
                    >
                      Accept ${deal.dealValue.toLocaleString()} ✓
                    </button>
                    <p className="text-[10px] text-muted-foreground text-center">
                      or negotiate:
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {([1.25, 1.5, 2] as const).map((mult) => (
                        <button
                          key={mult}
                          type="button"
                          data-ocid={`monetization.negotiate_${mult.toString().replace(".", "_")}.button.${i + 1}`}
                          onClick={() => negotiateSponsorship(deal.id, mult)}
                          title={
                            mult === 1.25
                              ? "Always accepted"
                              : mult === 1.5
                                ? "70% chance"
                                : "40% chance — risky!"
                          }
                          className="py-1 rounded-lg text-[10px] font-semibold transition-all hover:opacity-80"
                          style={{
                            background:
                              mult === 2
                                ? "oklch(0.55 0.22 25 / 0.25)"
                                : mult === 1.5
                                  ? "oklch(0.7 0.2 65 / 0.2)"
                                  : "oklch(0.68 0.2 150 / 0.2)",
                            color:
                              mult === 2
                                ? "oklch(0.65 0.22 25)"
                                : mult === 1.5
                                  ? "oklch(0.75 0.2 65)"
                                  : "oklch(0.72 0.2 145)",
                            border: `1px solid ${mult === 2 ? "oklch(0.55 0.22 25 / 0.4)" : mult === 1.5 ? "oklch(0.7 0.2 65 / 0.3)" : "oklch(0.68 0.2 150 / 0.3)"}`,
                          }}
                        >
                          {mult}x
                          {mult === 1.25 ? " 🟢" : mult === 1.5 ? " 🟡" : " 🔴"}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-muted-foreground text-center">
                      🟢 safe · 🟡 risky · 🔴 high risk
                    </p>
                  </div>
                )}
                {deal.status === "active" && deal.acceptedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted {new Date(deal.acceptedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Merch Store Preview */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        style={cardStyle}
        className="p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">🛍️ Merch Store Preview</h3>
          <button
            type="button"
            data-ocid="monetization.merch_store.button"
            onClick={() => navigate("merch-store")}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-90"
            style={{
              background: "oklch(0.55 0.22 295 / 0.2)",
              color: "oklch(0.65 0.22 295)",
            }}
          >
            Go to Merch Store →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              id: "m1",
              name: "MindForge Hoodie",
              price: 49.99,
              emoji: "👕",
              totalSales: 12,
            },
            {
              id: "m2",
              name: "Creator Cap",
              price: 24.99,
              emoji: "🧢",
              totalSales: 8,
            },
            {
              id: "m3",
              name: "Digital Creator Pack",
              price: 9.99,
              emoji: "💾",
              totalSales: 23,
            },
          ].map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl text-center"
              style={{
                background: "oklch(0.13 0.016 280 / 0.6)",
                border: "1px solid oklch(0.25 0.02 280 / 0.4)",
              }}
            >
              <div className="text-3xl mb-1">{item.emoji}</div>
              <p className="text-xs font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.totalSales} sold
              </p>
              <p
                className="text-xs font-semibold mt-1"
                style={{ color: "oklch(0.72 0.18 150)" }}
              >
                ${item.price}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Brand Empire - Celebrity Mode Only */}
      {celebrityMode && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.04 80 / 0.3), oklch(0.15 0.03 60 / 0.2))",
            border: "1px solid oklch(0.7 0.18 80 / 0.4)",
            borderRadius: "1rem",
            padding: "1.25rem",
          }}
          data-ocid="monetization.brand_empire.card"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⭐</span>
            <div>
              <h3 className="font-bold text-foreground">Brand Empire</h3>
              <p className="text-xs text-muted-foreground">
                Celebrity-tier mega deals
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              {
                name: "Global Tech Partnership",
                brand: "TechCorp Elite",
                value: 75000,
                emoji: "💻",
              },
              {
                name: "Luxury Fashion Collab",
                brand: "PrestigeWear",
                value: 50000,
                emoji: "👗",
              },
              {
                name: "Celebrity Endorsement",
                brand: "MegaBrand Global",
                value: 100000,
                emoji: "🌟",
              },
            ].map((deal, idx) => (
              <div
                key={deal.name}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: "oklch(0.13 0.016 280 / 0.8)",
                  border: "1px solid oklch(0.7 0.18 80 / 0.2)",
                }}
                data-ocid={`monetization.brand_empire.item.${idx + 1}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{deal.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {deal.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {deal.brand}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm font-black"
                    style={{ color: "oklch(0.78 0.18 80)" }}
                  >
                    ${deal.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">per deal</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
