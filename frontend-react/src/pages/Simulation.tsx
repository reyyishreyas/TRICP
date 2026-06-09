import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { defaultCustomerPayload, simulateUser } from '@/lib/api';
import { Loader2, ArrowRight, CheckCircle2, Sliders, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { toast } from 'sonner';

const riskStyle = (risk: string) => {
  if (risk === 'Low') return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: '#10b981' };
  if (risk === 'Medium') return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: '#f59e0b' };
  return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: '#ef4444' };
};

interface SliderFieldProps {
  label: string;
  value: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (val: number) => void;
}

function SliderField({ label, value, max, step, unit = '', onChange }: SliderFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-[13px] font-semibold text-[#0f1c2e]">{label}</Label>
        <span className="bg-[#EBF4FF] text-[#0875E1] text-[12px] font-bold px-2.5 py-1 rounded-md border border-[#DBEAFE] font-mono">
          {typeof value === 'number' && step < 1 ? value.toFixed(1) : value}{unit}
        </span>
      </div>
      <Slider
        defaultValue={[value]}
        value={[value]}
        max={max}
        step={step}
        onValueChange={(val) => onChange(val[0])}
        className="cursor-pointer"
      />
      <div className="flex justify-between text-[10.5px] text-[#8898AA] font-medium">
        <span>0</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function Simulation() {
  const [baseUser] = useState(defaultCustomerPayload);
  const [updates, setUpdates] = useState({
    avg_logins_per_week: 4.0,
    days_since_last_login: 8,
    feature_usage_score: 68.0,
    payment_failures_90d: 0,
    Contract: 'One year',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await simulateUser(baseUser, updates);
      setResult(res);
      toast.success('Simulation complete', {
        description: `Risk changed: ${res.original_risk_level} → ${res.new_risk_level}`,
      });
    } catch {
      toast.error('Simulation failed', { description: 'Check the backend API' });
    } finally {
      setLoading(false);
    }
  };

  const improvement = result ? result.absolute_change < 0 : false;

  return (
    <div className="flex flex-col lg:flex-row gap-5 max-w-[1400px]">
      {/* Controls */}
      <div className="w-full lg:w-[360px] flex-shrink-0">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <div className="bg-white rounded-xl border border-[#E8EDF4] shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F0F3F8] flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#0875E1]" />
              <div>
                <h3 className="text-[14px] font-semibold text-[#0f1c2e]">Scenario Controls</h3>
                <p className="text-[12px] text-[#8898AA]">Adjust variables to model intervention impact</p>
              </div>
            </div>
            <div className="p-5 space-y-6">
              <SliderField
                label="Logins per Week"
                value={updates.avg_logins_per_week}
                max={20}
                step={0.5}
                onChange={(val) => setUpdates({ ...updates, avg_logins_per_week: val })}
              />
              <SliderField
                label="Days Since Last Login"
                value={updates.days_since_last_login}
                max={90}
                step={1}
                onChange={(val) => setUpdates({ ...updates, days_since_last_login: val })}
              />
              <SliderField
                label="Feature Usage Score"
                value={updates.feature_usage_score}
                max={100}
                step={1}
                onChange={(val) => setUpdates({ ...updates, feature_usage_score: val })}
              />
              <SliderField
                label="Payment Failures (90d)"
                value={updates.payment_failures_90d}
                max={5}
                step={1}
                onChange={(val) => setUpdates({ ...updates, payment_failures_90d: val })}
              />

              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-[#0f1c2e]">Contract Type</Label>
                <select
                  className="h-9 w-full rounded-lg border border-[#E8EDF4] bg-[#F8FAFC] px-3 text-[13px] text-[#0f1c2e] focus:outline-none focus:ring-2 focus:ring-[#0875E1]/20 focus:border-[#0875E1]/40"
                  value={updates.Contract}
                  onChange={e => setUpdates({ ...updates, Contract: e.target.value })}
                >
                  <option value="Month-to-month">Month-to-month</option>
                  <option value="One year">One year</option>
                  <option value="Two year">Two year</option>
                </select>
              </div>

              <button
                onClick={handleSimulate}
                disabled={loading}
                className="w-full h-10 rounded-lg bg-[#0875E1] hover:bg-[#0665c8] text-white text-[13.5px] font-semibold transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2 shadow-blue hover:shadow-blue-lg"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Running...</>
                ) : (
                  <><Zap className="h-4 w-4" /> Run Simulation</>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Result */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {!result && !loading && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-[#E8EDF4] rounded-xl text-center bg-white/60">
              <div className="h-16 w-16 rounded-2xl bg-[#EBF4FF] flex items-center justify-center mb-4">
                <Sliders className="h-7 w-7 text-[#0875E1]/50" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#4B5565]">No Simulation Yet</h3>
              <p className="text-[13px] text-[#8898AA] mt-1.5 max-w-xs leading-relaxed">
                Adjust the controls on the left and click Run Simulation to see intervention impact.
              </p>
            </motion.div>
          )}

          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-[#E8EDF4] shadow-card">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-[3px] border-[#E8EDF4] border-t-[#0875E1] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-[#0875E1]" />
                </div>
              </div>
              <p className="mt-5 text-[13.5px] font-semibold text-[#0f1c2e]">Running What-If Analysis</p>
              <p className="text-[12px] text-[#8898AA] mt-1">Comparing base vs. intervention scenario...</p>
            </motion.div>
          )}

          {result && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* Before / After */}
              <div className="bg-white rounded-xl border border-[#E8EDF4] shadow-card overflow-hidden">
                <div className="px-5 py-4 border-b border-[#F0F3F8]">
                  <h3 className="text-[14px] font-semibold text-[#0f1c2e]">Intervention Impact</h3>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    {/* Before */}
                    <div className="flex-1 bg-[#F8FAFC] rounded-xl p-5 border border-[#E8EDF4] text-center">
                      <p className="text-[10.5px] font-semibold text-[#8898AA] uppercase tracking-widest mb-3">Before</p>
                      <p className="text-[32px] font-bold text-[#0f1c2e] leading-none">
                        {(result.original_probability * 100).toFixed(1)}%
                      </p>
                      {(() => {
                        const s = riskStyle(result.original_risk_level);
                        return (
                          <span className={`inline-flex items-center gap-1 mt-2.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
                            {result.original_risk_level} Risk
                          </span>
                        );
                      })()}
                    </div>

                    <div className="flex flex-col items-center gap-1 text-[#8898AA]">
                      <ArrowRight className="h-6 w-6" />
                      {improvement
                        ? <TrendingDown className="h-5 w-5 text-emerald-500" />
                        : <TrendingUp className="h-5 w-5 text-red-500" />}
                    </div>

                    {/* After */}
                    <div className={`flex-1 rounded-xl p-5 border text-center relative overflow-hidden ${improvement ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                      <p className="text-[10.5px] font-semibold uppercase tracking-widest mb-3 text-[#8898AA]">After</p>
                      <p className={`text-[32px] font-bold leading-none ${improvement ? 'text-emerald-700' : 'text-red-600'}`}>
                        {(result.new_probability * 100).toFixed(1)}%
                      </p>
                      {(() => {
                        const s = riskStyle(result.new_risk_level);
                        return (
                          <span className={`inline-flex items-center gap-1 mt-2.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
                            {result.new_risk_level} Risk
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Delta metrics */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className={`rounded-lg p-4 border text-center ${improvement ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8898AA] mb-1">Absolute Delta</p>
                      <p className={`text-[22px] font-bold ${improvement ? 'text-emerald-700' : 'text-red-600'}`}>
                        {improvement ? '' : '+'}{(result.absolute_change * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className={`rounded-lg p-4 border text-center ${improvement ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8898AA] mb-1">Relative Change</p>
                      <p className={`text-[22px] font-bold ${improvement ? 'text-emerald-700' : 'text-red-600'}`}>
                        {improvement ? '' : '+'}{result.relative_change_pct.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-4 p-4 bg-[#F8FAFC] rounded-lg border border-[#F0F3F8] text-[13px] text-[#4B5565] leading-relaxed font-medium">
                    {result.summary}
                  </div>
                </div>
              </div>

              {/* Risk factors + actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-[#E8EDF4] shadow-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#F0F3F8]">
                    <h4 className="text-[13.5px] font-semibold text-[#0f1c2e]">Remaining Risk Factors</h4>
                  </div>
                  <div className="p-4 space-y-2">
                    {result.new_top_reasons?.map((r: string, i: number) => (
                      <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-red-50 border border-red-100 text-[12.5px] font-medium text-red-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[#E8EDF4] shadow-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#F0F3F8]">
                    <h4 className="text-[13.5px] font-semibold text-[#0875E1]">Adjusted Actions</h4>
                  </div>
                  <div className="p-4 space-y-2">
                    {result.recommended_actions?.map((a: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#EBF4FF] border border-[#DBEAFE] text-[12.5px] font-medium text-[#0f1c2e]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#0875E1] flex-shrink-0 mt-0.5" />
                        {a}
                      </div>
                    ))}
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
