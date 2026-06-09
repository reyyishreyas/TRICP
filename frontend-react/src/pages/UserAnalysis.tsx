import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultCustomerPayload, predictUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, Brain, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const riskMeta: Record<string, { color: string; bg: string; border: string; bar: string; label: string }> = {
  Low:    { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: '#10b981', label: 'Low Risk' },
  Medium: { color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   bar: '#f59e0b', label: 'Medium Risk' },
  High:   { color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',     bar: '#ef4444', label: 'High Risk' },
};

function RiskGauge({ probability }: { probability: number }) {
  const pct = Math.min(probability, 1);
  const circumference = 2 * Math.PI * 44;
  const offset = circumference * (1 - pct);
  const color = pct >= 0.6 ? '#ef4444' : pct >= 0.35 ? '#f59e0b' : '#10b981';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 130, height: 130 }}>
      <svg width="130" height="130" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#F0F3F8" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="44" fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-bold text-[#0f1c2e] leading-none">{(pct * 100).toFixed(0)}%</span>
        <span className="text-[10px] text-[#8898AA] font-medium mt-0.5">churn risk</span>
      </div>
    </div>
  );
}

const ExplainTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8EDF4] rounded-xl shadow-elevated px-3 py-2.5 text-[12px]">
      <p className="font-semibold text-[#0f1c2e]">{payload[0]?.payload?.feature?.replace(/_/g, ' ')}</p>
      <p className="font-bold mt-0.5" style={{ color: payload[0]?.payload?.direction === 'increase' ? '#ef4444' : '#0875E1' }}>
        {payload[0].value?.toFixed(2)}%
      </p>
    </div>
  );
};

const fieldGroup = [
  { key: 'tenure', label: 'Tenure (months)', type: 'number' },
  { key: 'MonthlyCharges', label: 'Monthly Charges', type: 'number', step: '0.01' },
  { key: 'TotalCharges', label: 'Total Charges', type: 'number', step: '0.01' },
  { key: 'days_since_last_login', label: 'Days Since Login', type: 'number' },
  { key: 'avg_session_duration_minutes', label: 'Avg Session (min)', type: 'number', step: '0.1' },
  { key: 'feature_usage_score', label: 'Feature Usage Score', type: 'number', step: '0.1' },
];

export default function UserAnalysis() {
  const [formData, setFormData] = useState<any>(defaultCustomerPayload);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await predictUser(formData);
      setResult(res);
      toast.success('Prediction generated', { description: `Risk: ${res.risk_level} (${(res.churn_probability * 100).toFixed(1)}%)` });
    } catch {
      toast.error('Prediction failed', { description: 'Check backend API is running on port 8000' });
    } finally {
      setLoading(false);
    }
  };

  const risk = result ? (riskMeta[result.risk_level] || riskMeta.High) : null;

  return (
    <div className="flex flex-col lg:flex-row gap-5 max-w-[1400px]">

      {/* Form Panel */}
      <div className="w-full lg:w-[340px] flex-shrink-0">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <div className="bg-white rounded-xl border border-[#E8EDF4] shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F0F3F8]">
              <h3 className="text-[14px] font-semibold text-[#0f1c2e]">Customer Profile</h3>
              <p className="text-[12px] text-[#8898AA] mt-0.5">Input metrics to predict churn likelihood</p>
            </div>
            <div className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[12.5px] font-semibold text-[#4B5565]">Customer ID</Label>
                  <Input
                    className="h-9 text-[13px] bg-[#F8FAFC] border-[#E8EDF4] focus-visible:ring-[#0875E1]/30 focus-visible:border-[#0875E1]/40 rounded-lg"
                    value={formData.customer_id}
                    onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px] font-semibold text-[#4B5565]">Contract Type</Label>
                  <select
                    className="h-9 w-full rounded-lg border border-[#E8EDF4] bg-[#F8FAFC] px-3 text-[13px] text-[#0f1c2e] focus:outline-none focus:ring-2 focus:ring-[#0875E1]/20 focus:border-[#0875E1]/40"
                    value={formData.Contract}
                    onChange={e => setFormData({ ...formData, Contract: e.target.value })}
                  >
                    <option value="Month-to-month">Month-to-month</option>
                    <option value="One year">One year</option>
                    <option value="Two year">Two year</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {fieldGroup.map(f => (
                    <div key={f.key} className="space-y-1.5">
                      <Label className="text-[11.5px] font-semibold text-[#4B5565]">{f.label}</Label>
                      <Input
                        type={f.type}
                        step={f.step}
                        className="h-9 text-[13px] bg-[#F8FAFC] border-[#E8EDF4] focus-visible:ring-[#0875E1]/30 focus-visible:border-[#0875E1]/40 rounded-lg"
                        value={(formData as any)[f.key] ?? ''}
                        onChange={e => setFormData({
                          ...formData,
                          [f.key]: f.type === 'number' ? (f.step ? parseFloat(e.target.value) : parseInt(e.target.value)) : e.target.value,
                        })}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-lg bg-[#0875E1] hover:bg-[#0665c8] text-white text-[13.5px] font-semibold transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2 shadow-blue hover:shadow-blue-lg mt-1"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Predict Churn Risk</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Result Panel */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {!result && !loading && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[440px] border-2 border-dashed border-[#E8EDF4] rounded-xl text-center bg-white/60">
              <div className="h-16 w-16 rounded-2xl bg-[#EBF4FF] flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-[#0875E1]/60" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#4B5565]">Awaiting Analysis</h3>
              <p className="text-[13px] text-[#8898AA] mt-1.5 max-w-xs leading-relaxed">
                Fill in the customer profile and run prediction to see the AI risk assessment.
              </p>
            </motion.div>
          )}

          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[440px] bg-white rounded-xl border border-[#E8EDF4] shadow-card">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-[3px] border-[#E8EDF4] border-t-[#0875E1] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-[#0875E1]" />
                </div>
              </div>
              <p className="mt-5 text-[13.5px] font-semibold text-[#0f1c2e]">Running ML Pipeline</p>
              <p className="text-[12px] text-[#8898AA] mt-1">Stacking ensemble inference in progress...</p>
            </motion.div>
          )}

          {result && risk && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* Hero prediction card */}
              <div className="bg-white rounded-xl border border-[#E8EDF4] shadow-card overflow-hidden">
                <div className="px-5 py-4 border-b border-[#F0F3F8] flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#0875E1]" />
                  <span className="text-[13.5px] font-semibold text-[#0f1c2e]">AI Prediction Result</span>
                  <span className="ml-auto text-[11.5px] text-[#8898AA] font-medium">ID: {result.customer_id || formData.customer_id}</span>
                </div>
                <div className="p-5 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <RiskGauge probability={result.churn_probability} />
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12.5px] font-semibold border ${risk.bg} ${risk.color} ${risk.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${risk.color === 'text-emerald-700' ? 'bg-emerald-500' : risk.color === 'text-amber-700' ? 'bg-amber-500' : 'bg-red-500'}`} />
                        {risk.label}
                      </span>
                      <Badge variant="outline" className="text-[12px] font-medium text-[#4B5565] border-[#E8EDF4]">
                        Segment: {result.segment}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { label: 'Engagement', value: `${result.engagement_score} · ${result.engagement_label}` },
                        { label: 'Auto Triggered', value: result.auto_triggered ? 'Yes' : 'No' },
                        { label: 'Probability', value: `${(result.churn_probability * 100).toFixed(2)}%` },
                      ].map(d => (
                        <div key={d.label} className="bg-[#F8FAFC] rounded-lg p-3 border border-[#F0F3F8]">
                          <p className="text-[11px] text-[#8898AA] font-semibold uppercase tracking-wide">{d.label}</p>
                          <p className="text-[13px] font-bold text-[#0f1c2e] mt-0.5">{d.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Risk factors */}
                <div className="bg-white rounded-xl border border-[#E8EDF4] shadow-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#F0F3F8]">
                    <h4 className="text-[13.5px] font-semibold text-[#0f1c2e]">Key Risk Factors</h4>
                  </div>
                  <div className="p-4 space-y-2">
                    {result.top_reasons?.map((reason: string, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-2.5 p-3 rounded-lg bg-red-50 border border-red-100"
                      >
                        <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                        <span className="text-[12.5px] font-medium text-red-700">{reason}</span>
                      </motion.div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-[#F0F3F8]">
                      <p className="text-[11px] font-semibold text-[#8898AA] uppercase tracking-wide mb-2">Strategy</p>
                      <p className="text-[12.5px] text-[#4B5565] leading-relaxed bg-[#F8FAFC] p-3 rounded-lg border border-[#F0F3F8]">
                        {result.strategy}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Explainability chart */}
                <div className="bg-white rounded-xl border border-[#E8EDF4] shadow-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#F0F3F8] flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#0875E1]" />
                    <h4 className="text-[13.5px] font-semibold text-[#0f1c2e]">Feature Contributions</h4>
                  </div>
                  <div className="p-4">
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={[...result.explainability].sort((a: any, b: any) => b.contribution_pct - a.contribution_pct).slice(0, 6)}
                          margin={{ top: 0, right: 16, left: 12, bottom: 0 }}
                        >
                          <XAxis type="number" hide />
                          <YAxis dataKey="feature" type="category" width={95} fontSize={10} tickLine={false} axisLine={false}
                            tick={{ fill: '#8898AA', fontWeight: 500 }}
                            tickFormatter={(v) => v.replace(/_/g, ' ').slice(0, 14)} />
                          <Tooltip content={<ExplainTooltip />} cursor={{ fill: '#F5F8FF' }} />
                          <Bar dataKey="contribution_pct" radius={[0, 4, 4, 0]}>
                            {result.explainability.slice(0, 6).map((e: any, i: number) => (
                              <Cell key={i} fill={e.direction === 'increase' ? '#ef4444' : '#0875E1'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-[11.5px] font-medium text-[#4B5565]">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Increases risk</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#0875E1]" />Decreases risk</span>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-[#F0F3F8]">
                      <p className="text-[11px] font-semibold text-[#8898AA] uppercase tracking-wide mb-2.5">Recommended Actions</p>
                      <ul className="space-y-1.5">
                        {result.recommended_actions?.map((action: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-[12.5px] font-medium text-[#0f1c2e]">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#0875E1] mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
