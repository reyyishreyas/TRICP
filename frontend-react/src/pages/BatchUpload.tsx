import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud, FileText, CheckCircle2, Download,
  Loader2, Mail, FileSpreadsheet, Settings, X,
  Users, AlertTriangle, Send, ShieldCheck,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { batchPredictUpload } from '@/lib/api';
import { toast } from 'sonner';

interface ToggleProps {
  label: string;
  description?: string;
  icon: React.ElementType;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ label, description, icon: Icon, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#E8EDF4] cursor-pointer hover:bg-[#F0F7FF] hover:border-[#DBEAFE] transition-all group select-none">
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${checked ? 'bg-[#EBF4FF]' : 'bg-[#F0F3F8]'}`}>
          <Icon className={`h-4 w-4 transition-colors ${checked ? 'text-[#0875E1]' : 'text-[#8898AA]'}`} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#0f1c2e]">{label}</p>
          {description && <p className="text-[11.5px] text-[#8898AA]">{description}</p>}
        </div>
      </div>
      <div
        className={`relative w-10 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${checked ? 'bg-[#0875E1]' : 'bg-[#D1D9E6]'}`}
        onClick={() => onChange(!checked)}
      >
        <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
    </label>
  );
}

interface StatPillProps {
  label: string;
  value: number | string;
  color?: 'default' | 'red' | 'green' | 'blue';
}

function StatPill({ label, value, color = 'default' }: StatPillProps) {
  const styles = {
    default: 'bg-[#F8FAFC] border-[#E8EDF4] text-[#0f1c2e]',
    red:     'bg-red-50 border-red-200 text-red-700',
    green:   'bg-emerald-50 border-emerald-200 text-emerald-700',
    blue:    'bg-[#EBF4FF] border-[#DBEAFE] text-[#0875E1]',
  };
  return (
    <div className={`rounded-xl border p-4 ${styles[color]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8898AA] mb-1">{label}</p>
      <p className="text-[24px] font-bold leading-none">{value}</p>
    </div>
  );
}

export default function BatchUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [dryRun, setDryRun] = useState(false);
  const [sendEmails, setSendEmails] = useState(true);
  const [includeCsv, setIncludeCsv] = useState(true);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) { setFile(accepted[0]); setResult(null); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  });

  const handleProcess = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(10);
    setResult(null);

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 18, 88));
    }, 450);

    try {
      const res = await batchPredictUpload(file, sendEmails, dryRun, includeCsv);
      clearInterval(interval);
      setProgress(100);
      setResult(res);
      toast.success('Batch job complete', { description: `${res.total_users} users processed` });
      if (res.email_mode === 'stub' && res.send_emails && !res.dry_run) {
        toast.warning('SMTP not configured — emails not sent', { description: 'Set Gmail credentials in backend/.env' });
      }
    } catch {
      clearInterval(interval);
      toast.error('Batch processing failed');
    } finally {
      setTimeout(() => { setUploading(false); setProgress(0); }, 600);
    }
  };

  const handleDownload = () => {
    if (!result?.enriched_csv_base64) return;
    const blob = new Blob([atob(result.enriched_csv_base64)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'batch_enriched.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 max-w-[900px]">
      {/* Upload zone */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-white rounded-xl border border-[#E8EDF4] shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0F3F8]">
            <h3 className="text-[14px] font-semibold text-[#0f1c2e]">Upload Customer CSV</h3>
            <p className="text-[12px] text-[#8898AA] mt-0.5">Drag and drop or click to select a CSV file</p>
          </div>
          <div className="p-5">
            <div
              {...getRootProps()}
              className={[
                'rounded-xl border-2 border-dashed p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200',
                isDragActive
                  ? 'border-[#0875E1] bg-[#EBF4FF]'
                  : file
                  ? 'border-[#0875E1]/40 bg-[#F0F7FF]'
                  : 'border-[#D1D9E6] bg-[#F8FAFC] hover:border-[#0875E1]/40 hover:bg-[#F0F7FF]',
              ].join(' ')}
            >
              <input {...getInputProps()} />
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center">
                    <div className="h-14 w-14 rounded-2xl bg-[#EBF4FF] flex items-center justify-center mb-4">
                      <UploadCloud className="h-7 w-7 text-[#0875E1]" />
                    </div>
                    <p className="text-[15px] font-semibold text-[#0f1c2e]">Drop your CSV here</p>
                    <p className="text-[13px] text-[#8898AA] mt-1.5 max-w-xs">
                      Drag & drop or click to browse. Ensure headers match the customer schema.
                    </p>
                    <span className="mt-4 px-4 py-1.5 text-[12px] font-semibold bg-white border border-[#E8EDF4] rounded-full text-[#4B5565] shadow-card">
                      .csv files only
                    </span>
                  </motion.div>
                ) : (
                  <motion.div key="file" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center">
                    <div className="h-14 w-14 rounded-2xl bg-[#EBF4FF] flex items-center justify-center mb-3">
                      <FileText className="h-7 w-7 text-[#0875E1]" />
                    </div>
                    <p className="text-[15px] font-semibold text-[#0875E1]">{file.name}</p>
                    <p className="text-[12.5px] text-[#8898AA] mt-1">{(file.size / 1024).toFixed(1)} KB · Ready to process</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="mt-3 flex items-center gap-1.5 text-[12px] text-[#8898AA] hover:text-red-500 font-medium transition-colors"
                    >
                      <X className="h-3.5 w-3.5" /> Remove file
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Schema hint */}
            {!file && (
              <div className="mt-4 p-4 bg-[#EBF4FF] rounded-lg border border-[#DBEAFE] text-[12px] text-[#4B5565]">
                <div className="flex items-start gap-2">
                  <span className="text-lg leading-none mt-0.5">📄</span>
                  <div>
                    <p className="font-semibold text-[#0f1c2e] mb-1">Note for Bulk Uploads</p>
                    <p className="text-[#4B5565] leading-relaxed">
                      Ensure your CSV includes an <span className="font-semibold text-[#0875E1]">email</span> column alongside your behavioral metrics.
                      TRICP uses this column to automatically route retention emails to your <span className="font-semibold text-red-600">High-Risk</span> users the moment they are flagged.
                    </p>
                    <p className="text-[#8898AA] mt-1.5 leading-relaxed">
                      Also required: <span className="font-semibold text-[#0f1c2e]">user_id</span> (or customer_id) plus model features — gender, SeniorCitizen, tenure, Contract, MonthlyCharges, InternetService, PaymentMethod, and behavioral fields. <em>Churn column is ignored if present.</em>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Options + run */}
      <AnimatePresence>
        {file && !result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl border border-[#E8EDF4] shadow-card p-5 space-y-4">
              <h4 className="text-[13.5px] font-semibold text-[#0f1c2e]">Processing Options</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Toggle
                  label="Dry Run"
                  description="Preview only, no emails"
                  icon={Settings}
                  checked={dryRun}
                  onChange={setDryRun}
                />
                <Toggle
                  label="Send Emails"
                  description="Trigger retention emails"
                  icon={Mail}
                  checked={sendEmails}
                  onChange={setSendEmails}
                />
                <Toggle
                  label="Include CSV"
                  description="Return enriched export"
                  icon={FileSpreadsheet}
                  checked={includeCsv}
                  onChange={setIncludeCsv}
                />
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[12px] font-semibold text-[#8898AA]">
                    <span>Processing batch...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )}

              <button
                onClick={handleProcess}
                disabled={uploading}
                className="w-full h-10 rounded-lg bg-[#0875E1] hover:bg-[#0665c8] text-white text-[13.5px] font-semibold transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2 shadow-blue hover:shadow-blue-lg"
              >
                {uploading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing Batch...</>
                  : <><Send className="h-4 w-4" /> Run Batch Job</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatPill label="Total Users" value={result.total_users} color="default" />
              <StatPill label="High Risk ≥70%" value={result.high_risk_users} color="red" />
              <StatPill label="Emails Sent" value={result.emails_sent} color="blue" />
              <StatPill label="Would Send" value={result.would_send} color="green" />
              <StatPill label="Failed" value={result.failed} color={result.failed > 0 ? 'red' : 'default'} />
            </div>

            {/* Success card */}
            <div className="bg-white rounded-xl border border-emerald-200 shadow-card p-8 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-[18px] font-bold text-[#0f1c2e] mb-1">Batch Complete</h3>
              <p className="text-[13px] text-[#8898AA] mb-5">
                {result.total_users} customers analyzed · {result.high_risk_users} flagged as high risk
              </p>

              {result.email_mode === 'stub' && result.send_emails && !result.dry_run && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-[12.5px] font-medium px-4 py-2.5 rounded-lg mb-4">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  SMTP not configured — set Gmail credentials in backend/.env to send emails.
                </div>
              )}

              {result.dry_run && (
                <div className="flex items-center gap-2 bg-[#EBF4FF] border border-[#DBEAFE] text-[#0875E1] text-[12.5px] font-medium px-4 py-2.5 rounded-lg mb-4">
                  <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                  Dry run — no emails were sent.
                </div>
              )}

              <div className="flex gap-3">
                {result.enriched_csv_base64 && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#0875E1] text-[#0875E1] text-[13px] font-semibold hover:bg-[#EBF4FF] transition-colors"
                  >
                    <Download className="h-4 w-4" /> Download Enriched CSV
                  </button>
                )}
                <button
                  onClick={() => { setFile(null); setResult(null); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#E8EDF4] text-[#4B5565] text-[13px] font-semibold hover:bg-[#F8FAFC] transition-colors"
                >
                  <Users className="h-4 w-4" /> New Batch
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
