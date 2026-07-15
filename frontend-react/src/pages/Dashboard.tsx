import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Users, AlertTriangle, Activity, TrendingUp, ArrowUpRight, ArrowDownRight, UserSearch, UploadCloud, FlaskConical, Brain, ChevronRight } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { getInsights } from '@/lib/api';
import { NavLink } from 'react-router-dom';

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 340, damping: 26 } },
};

interface StatCardProps {
  title: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  sub?: string;
}

function StatCard({ title, value, delta, positive, icon: Icon, iconColor, iconBg, sub }: StatCardProps) {
  return (
    <motion.div variants={fadeUp}>
      <div className="bg-white rounded-xl border border-[#E8EDF4] p-5 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-default">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[12px] font-semibold text-[#8898AA] uppercase tracking-wide">{title}</p>
          <div className={`h-8 w-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`h-[15px] w-[15px] ${iconColor}`} />
          </div>
        </div>
        <div className="text-[28px] font-bold text-[#0f1c2e] tracking-tight leading-none mb-2">{value}</div>
        {delta ? (
          <div className={`flex items-center gap-1 text-[12px] font-semibold ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
            {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {delta}
          </div>
        ) : (
          <p className="text-[12px] text-[#8898AA] font-medium">{sub}</p>
        )}
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#E8EDF4] p-5 shadow-card animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-3 w-24 bg-[#F0F3F8] rounded" />
        <div className="h-8 w-8 bg-[#F0F3F8] rounded-lg" />
      </div>
      <div className="h-8 w-20 bg-[#F0F3F8] rounded mb-3" />
      <div className="h-3 w-28 bg-[#F0F3F8] rounded" />
    </div>
  );
}

const BarTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8EDF4] rounded-xl shadow-elevated px-4 py-3 text-[12.5px]">
      <p className="font-semibold text-[#0f1c2e] mb-1">{label}</p>
      <p className="text-[#0875E1] font-bold">{payload[0].value?.toLocaleString()} users</p>
    </div>
  );
};

const PieTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8EDF4] rounded-xl shadow-elevated px-4 py-3 text-[12.5px]">
      <p className="font-semibold text-[#0f1c2e]">{payload[0].name}</p>
      <p className="text-[#0875E1] font-bold mt-0.5">{payload[0].value?.toLocaleString()}</p>
    </div>
  );
};

const RISK_COLORS: Record<string, string> = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };
const ENGAGE_COLORS: Record<string, string> = { High: '#0875E1', Moderate: '#06A0C7', Low: '#ef4444' };

const workflows = [
  {
    icon: UserSearch,
    title: 'Single Predict',
    subtitle: 'On-Demand Analysis',
    path: '/user-analysis',
    color: 'text-[#0875E1]',
    bg: 'bg-[#EBF4FF]',
    border: 'border-[#DBEAFE] hover:border-[#0875E1]/40',
    points: [
      { label: 'Risk Categorization', desc: 'Definitive Low, Medium, or High risk classification' },
      { label: 'Granular Risk Scoring', desc: 'Exact probability percentage of churn likelihood' },
      { label: 'Root-Cause Analysis', desc: 'Isolates the exact feature metrics driving the score' },
    ],
  },
  {
    icon: UploadCloud,
    title: 'Bulk CSV Upload',
    subtitle: 'Scale Operations',
    path: '/batch',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200 hover:border-emerald-400/50',
    points: [
      { label: 'Automated Triage', desc: 'Parses CSV and segments users into risk buckets instantly' },
      { label: 'High-Risk Auto-Emailer', desc: 'Automatically dispatches targeted recovery emails on churn flags' },
      { label: 'Enriched Export', desc: 'Download a scored CSV with risk scores appended per row' },
    ],
  },
  {
    icon: FlaskConical,
    title: 'Transparent AI Models',
    subtitle: 'White-Box ML',
    path: '/insights',
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200 hover:border-violet-400/50',
    points: [
      { label: 'Feature Importance', desc: 'Ranked breakdown of which signals matter most' },
      { label: 'Model Benchmarks', desc: 'Accuracy, ROC AUC, Precision, and Recall per model' },
      { label: 'Stacking Ensemble', desc: 'XGBoost + LightGBM + RF + LR meta-learner architecture' },
    ],
  },
];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getInsights()
      .then((res) => { setData(res); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const riskData = Object.entries(
    data?.predicted_risk_distribution || { Low: 520, Medium: 310, High: 170 }
  ).map(([k, v]) => ({ name: k, value: v as number }));

  const engageData = Object.entries(
    data?.engagement_distribution || { High: 420, Moderate: 360, Low: 220 }
  ).map(([k, v]) => ({ name: k, value: v as number }));

  return (
    <div className="space-y-8 max-w-[1400px]">

      {/* ── Hero Introduction ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative bg-white rounded-2xl border border-[#E8EDF4] shadow-card overflow-hidden"
      >
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0875E1] via-[#06A0C7] to-[#0875E1]/20 rounded-t-2xl" />

        <div className="px-7 pt-8 pb-7">
          <div className="flex items-start gap-4">
            <img src="/logo.png" alt="TRICP" className="h-12 w-12 rounded-xl object-contain flex-shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-[22px] font-bold text-[#0f1c2e] tracking-tight">Welcome to TRICP</h2>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-[#EBF4FF] text-[#0875E1] border border-[#DBEAFE] rounded-full">
                  Telecom Retention Intelligence &amp; Churn Predictor
                </span>
              </div>
              <p className="text-[14px] text-[#4B5565] mt-2 leading-relaxed max-w-3xl font-medium">
                Precision Churn Forecasting &amp; Automated Retention Workflows.{' '}
                <span className="text-[#8898AA]">
                  TRICP bridges the gap between complex machine learning and immediate business action — monitor customer health, 
                  dive into individual risk profiles, or process bulk cohorts to trigger instant, automated retention campaigns.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#F0F3F8]" />

        {/* Workflow cards */}
        <div className="px-7 py-6">
          <p className="text-[11.5px] font-semibold text-[#8898AA] uppercase tracking-widest mb-4">Core Workflows</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workflows.map((w) => (
              <NavLink key={w.path} to={w.path}
                className={`group block bg-[#F8FAFC] hover:bg-white rounded-xl border ${w.border} transition-all duration-200 p-4 hover:shadow-card`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`h-9 w-9 rounded-lg ${w.bg} flex items-center justify-center flex-shrink-0`}>
                    <w.icon className={`h-[18px] w-[18px] ${w.color}`} />
                  </div>
                  <div>
                    <p className="text-[13.5px] font-bold text-[#0f1c2e]">{w.title}</p>
                    <p className="text-[11.5px] text-[#8898AA] font-medium">{w.subtitle}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {w.points.map((p) => (
                    <li key={p.label} className="flex items-start gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0 ${w.color.replace('text-', 'bg-').replace('[', '').replace(']', '')}`}
                        style={{ background: w.color.includes('#') ? w.color.replace('text-[', '').replace(']', '') : undefined }} />
                      <div>
                        <span className="text-[12px] font-semibold text-[#0f1c2e]">{p.label}:</span>{' '}
                        <span className="text-[12px] text-[#8898AA] font-medium">{p.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className={`flex items-center gap-1 mt-3 text-[12px] font-semibold ${w.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Open <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Tooltips hint bar */}
        <div className="border-t border-[#F0F3F8]">
          <div className="px-7 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <Brain className="h-3.5 w-3.5 text-[#0875E1] flex-shrink-0" />
              <span className="text-[11.5px] text-[#8898AA]">
                <span className="font-semibold text-[#4B5565]">Risk Level:</span> The classified urgency tier based on churn probability. High-risk profiles trigger retention emails automatically.
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-[#0875E1] flex-shrink-0" />
              <span className="text-[11.5px] text-[#8898AA]">
                <span className="font-semibold text-[#4B5565]">Reasoning Engine:</span> Behavioral signals and drops that contributed most to the user's risk score.
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stat cards ──────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={data?.total_users ? data.total_users.toLocaleString() : '7,043'}
            delta="+4.2% from last month"
            positive
            icon={Users}
            iconColor="text-[#0875E1]"
            iconBg="bg-[#EBF4FF]"
          />
          <StatCard
            title="Observed Churn Rate"
            value={data?.overall_churn_rate ? `${(data.overall_churn_rate * 100).toFixed(1)}%` : '26.5%'}
            delta="+1.1% from last month"
            positive={false}
            icon={TrendingUp}
            iconColor="text-red-500"
            iconBg="bg-red-50"
          />
          <StatCard
            title="Mean Risk Score"
            value={data?.churn_probability_summary?.mean ? `${(data.churn_probability_summary.mean * 100).toFixed(1)}%` : '24.5%'}
            sub="Average predicted probability"
            icon={AlertTriangle}
            iconColor="text-amber-500"
            iconBg="bg-amber-50"
          />
          <StatCard
            title="P90 Risk Level"
            value={data?.churn_probability_summary?.p90 ? `${(data.churn_probability_summary.p90 * 100).toFixed(1)}%` : '68.0%'}
            sub="Top 10% highest risk bucket"
            icon={Activity}
            iconColor="text-[#06A0C7]"
            iconBg="bg-[#EBF4FF]"
          />
        </motion.div>
      )}

      {/* ── Charts ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="bg-white rounded-xl border border-[#E8EDF4] shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F0F3F8]">
              <h3 className="text-[14px] font-semibold text-[#0f1c2e]">Risk Distribution</h3>
              <p className="text-[12px] text-[#8898AA] mt-0.5">Users segmented by predicted churn risk bucket</p>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="h-[240px] bg-[#F8FAFC] rounded-lg animate-pulse" />
              ) : (
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#8898AA', fontWeight: 500 }} />
                      <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#8898AA' }} />
                      <Tooltip content={<BarTip />} cursor={{ fill: '#F5F8FF', radius: 8 }} />
                      <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={60}>
                        {riskData.map((e, i) => <Cell key={i} fill={RISK_COLORS[e.name] || '#0875E1'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {!loading && (
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#F0F3F8]">
                  {riskData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-[12px] font-medium text-[#4B5565]">
                      <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: RISK_COLORS[d.name] }} />
                      {d.name} ({d.value?.toLocaleString()})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="bg-white rounded-xl border border-[#E8EDF4] shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F0F3F8]">
              <h3 className="text-[14px] font-semibold text-[#0f1c2e]">Engagement Distribution</h3>
              <p className="text-[12px] text-[#8898AA] mt-0.5">User activity level segmentation across the base</p>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="h-[240px] bg-[#F8FAFC] rounded-lg animate-pulse" />
              ) : (
                <div className="h-[240px] flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={engageData} cx="50%" cy="50%" innerRadius={68} outerRadius={96}
                        paddingAngle={4} dataKey="value" stroke="none"
                        animationBegin={100} animationDuration={700}>
                        {engageData.map((e, i) => <Cell key={i} fill={ENGAGE_COLORS[e.name] || '#0875E1'} />)}
                      </Pie>
                      <Tooltip content={<PieTip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              {!loading && (
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#F0F3F8]">
                  {engageData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-[12px] font-medium text-[#4B5565]">
                      <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: ENGAGE_COLORS[d.name] }} />
                      {d.name} ({d.value?.toLocaleString()})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[13px] text-amber-700 font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          Backend unavailable — showing fallback data. Start the API server to see live metrics.
        </div>
      )}
    </div>
  );
}
