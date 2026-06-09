import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { getInsights } from '@/lib/api';
import { Brain, Award, BarChart2, Layers } from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Strip the "model" label key and return only numeric metric entries */
function numericEntries(metricsObj: Record<string, any>): [string, number][] {
  return Object.entries(metricsObj).filter(
    ([, v]) => typeof v === 'number' && !isNaN(v)
  ) as [string, number][];
}

/** Human-readable metric labels */
const METRIC_LABELS: Record<string, string> = {
  accuracy:  'Accuracy',
  roc_auc:   'ROC AUC',
  precision: 'Precision',
  recall:    'Recall',
  f1:        'F1 Score',
};

/** Per-metric colour palette — cool blue/teal/indigo tones */
const METRIC_PALETTE: Record<string, { bar: string; text: string; bg: string; border: string }> = {
  accuracy:  { bar: '#0875E1', text: 'text-[#0875E1]',   bg: 'bg-[#EBF4FF]',  border: 'border-[#DBEAFE]' },
  roc_auc:   { bar: '#06A0C7', text: 'text-[#06A0C7]',   bg: 'bg-[#E0F7FA]',  border: 'border-[#B2EBF2]' },
  precision: { bar: '#6366f1', text: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-200' },
  recall:    { bar: '#0ea5e9', text: 'text-sky-600',      bg: 'bg-sky-50',     border: 'border-sky-200'   },
  f1:        { bar: '#14b8a6', text: 'text-teal-600',     bg: 'bg-teal-50',    border: 'border-teal-200'  },
};
const FALLBACK_PALETTE = { bar: '#0875E1', text: 'text-[#0875E1]', bg: 'bg-[#EBF4FF]', border: 'border-[#DBEAFE]' };

/** Model display names */
const MODEL_DISPLAY: Record<string, string> = {
  stacking_ensemble:  'Stacking Ensemble',
  logistic_regression:'Logistic Regression',
  random_forest:       'Random Forest',
};

/** Bar colours for feature importance chart */
const BAR_COLORS = [
  '#0875E1', '#06A0C7', '#0891b2', '#0284c7', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a78bfa', '#14b8a6',
];

// ── tooltip components ────────────────────────────────────────────────────────

const FeatureTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8EDF4] rounded-xl shadow-elevated px-3.5 py-2.5 text-[12.5px]">
      <p className="font-semibold text-[#0f1c2e]">{String(payload[0]?.payload?.feature ?? '').replace(/_/g, ' ')}</p>
      <p className="text-[#0875E1] font-bold mt-0.5">{Number(payload[0].value).toFixed(4)}</p>
    </div>
  );
};

// ── metric card ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  metricKey: string;
  value: number;
  index: number;
}

function MetricCard({ metricKey, value, index }: MetricCardProps) {
  const palette = METRIC_PALETTE[metricKey] ?? FALLBACK_PALETTE;
  const label   = METRIC_LABELS[metricKey] ?? metricKey.replace(/_/g, ' ');
  const pct     = value <= 1 ? value * 100 : value;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
    >
      <div className={`rounded-xl p-4 border ${palette.bg} ${palette.border}`}>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[12px] font-semibold text-[#4B5565]">{label}</span>
          <span className={`text-[15px] font-bold tabular-nums ${palette.text}`}>
            {pct.toFixed(1)}%
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden border border-white/80">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ duration: 0.75, delay: 0.15 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ background: palette.bar }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ── model comparison table ────────────────────────────────────────────────────

interface ModelTableProps {
  modelMetrics: Record<string, Record<string, any>>;
}

function ModelTable({ modelMetrics }: ModelTableProps) {
  const modelKeys = Object.keys(modelMetrics);
  // Collect numeric metric keys from first model (exclude "model" string field)
  const firstModel = Object.values(modelMetrics)[0] ?? {};
  const metricKeys = Object.keys(firstModel).filter(k => typeof firstModel[k] === 'number');

  const best: Record<string, number> = {};
  for (const mk of metricKeys) {
    best[mk] = Math.max(...modelKeys.map(k => Number(modelMetrics[k][mk] ?? 0)));
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-[#F0F3F8]">
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#8898AA] uppercase tracking-wide">Model</th>
            {metricKeys.map(k => (
              <th key={k} className="text-left px-4 py-3 text-[11px] font-semibold text-[#8898AA] uppercase tracking-wide">
                {METRIC_LABELS[k] ?? k.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {modelKeys.map((key, idx) => {
            const m = modelMetrics[key];
            const displayName = m.model ?? MODEL_DISPLAY[key] ?? key.replace(/_/g, ' ');
            return (
              <tr key={key} className={idx % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white'}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#0875E1] flex-shrink-0" />
                    <span className="font-semibold text-[#0f1c2e]">{displayName}</span>
                  </div>
                </td>
                {metricKeys.map(mk => {
                  const val  = Number(m[mk]);
                  const pct  = val <= 1 ? val * 100 : val;
                  const isBest = Math.abs(val - best[mk]) < 0.0001;
                  return (
                    <td key={mk} className="px-4 py-3.5">
                      <span className={`font-semibold tabular-nums ${isBest ? 'text-[#0875E1]' : 'text-[#4B5565]'}`}>
                        {pct.toFixed(1)}%
                        {isBest && <span className="ml-1 text-[10px] text-[#0875E1] font-bold">↑</span>}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function Insights() {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInsights()
      .then(res => { setData(res); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const featureImportance = data?.feature_importance ?? [
    { feature: 'Contract_Month-to-month', importance: 0.28 },
    { feature: 'tenure',                  importance: 0.18 },
    { feature: 'InternetService_Fiber_optic', importance: 0.12 },
    { feature: 'TotalCharges',            importance: 0.09 },
    { feature: 'MonthlyCharges',          importance: 0.08 },
    { feature: 'PaymentMethod_Electronic_check', importance: 0.07 },
  ];
  const sortedFeatures = [...featureImportance]
    .sort((a: any, b: any) => b.importance - a.importance)
    .slice(0, 10);

  const modelMetrics: Record<string, Record<string, any>> = data?.model_metrics ?? {};

  // Pick the first model for the side panel
  const sideModelKey   = Object.keys(modelMetrics)[0];
  const sideModel      = sideModelKey ? modelMetrics[sideModelKey] : null;
  const sideModelName  = sideModel?.model ?? (sideModelKey ? MODEL_DISPLAY[sideModelKey] ?? sideModelKey : 'Model');
  const sideMetrics    = sideModel ? numericEntries(sideModel) : [];

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Feature Importance chart ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-xl border border-[#E8EDF4] shadow-card h-full overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F0F3F8] flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-[#0875E1]" />
              <div>
                <h3 className="text-[14px] font-semibold text-[#0f1c2e]">Feature Importance</h3>
                <p className="text-[11.5px] text-[#8898AA]">Top predictors ranked by influence on churn</p>
              </div>
            </div>
            <div className="p-5">
              {loading ? (
                <Skeleton className="h-[380px] w-full rounded-lg bg-[#F8FAFC]" />
              ) : (
                <div className="h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sortedFeatures}
                      layout="vertical"
                      margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F3F8" />
                      <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#8898AA' }} />
                      <YAxis
                        dataKey="feature" type="category" width={145} fontSize={11}
                        tickLine={false} axisLine={false}
                        tick={{ fill: '#4B5565', fontWeight: 500 }}
                        tickFormatter={(v: string) => v.replace(/_/g, ' ')}
                      />
                      <Tooltip content={<FeatureTooltip />} cursor={{ fill: '#F5F8FF' }} />
                      <Bar dataKey="importance" radius={[0, 5, 5, 0]} maxBarSize={22}>
                        {sortedFeatures.map((_: any, i: number) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Model Performance side panel ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-xl border border-[#E8EDF4] shadow-card h-full overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#F0F3F8] flex items-center gap-2">
              <Award className="h-4 w-4 text-[#0875E1]" />
              <div>
                <h3 className="text-[14px] font-semibold text-[#0f1c2e]">Model Performance</h3>
                <p className="text-[11.5px] text-[#8898AA]">
                  {loading ? 'Loading...' : sideModelName}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {loading ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-[68px] w-full rounded-xl bg-[#F8FAFC]" />
                  ))}
                </>
              ) : sideMetrics.length === 0 ? (
                <p className="text-[13px] text-[#8898AA] text-center py-8">No metrics available</p>
              ) : (
                sideMetrics.map(([key, val], i) => (
                  <MetricCard key={key} metricKey={key} value={val} index={i} />
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Model Comparison table ───────────────────────────────── */}
      {!loading && Object.keys(modelMetrics).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <div className="bg-white rounded-xl border border-[#E8EDF4] shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F0F3F8] flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#0875E1]" />
              <div>
                <h3 className="text-[14px] font-semibold text-[#0f1c2e]">Model Comparison</h3>
                <p className="text-[11.5px] text-[#8898AA]">
                  All evaluated models — best value per metric highlighted in blue.
                  XGBoost and LightGBM are base learners inside the Stacking Ensemble and not benchmarked independently.
                </p>
              </div>
            </div>
            <ModelTable modelMetrics={modelMetrics} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
