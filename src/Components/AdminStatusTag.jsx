const STATUS_STYLES = {
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  fulfilled: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  sent: "bg-sky-50 text-sky-700 ring-sky-200",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  clear: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-violet-50 text-violet-700 ring-violet-200",
  pending_approval: "bg-violet-50 text-violet-700 ring-violet-200",
  in_review: "bg-amber-50 text-amber-700 ring-amber-200",
  under_review: "bg-amber-50 text-amber-700 ring-amber-200",
  in_progress: "bg-amber-50 text-amber-700 ring-amber-200",
  ongoing_activity: "bg-sky-50 text-sky-700 ring-sky-200",
  open: "bg-rose-50 text-rose-700 ring-rose-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
  declined: "bg-rose-50 text-rose-700 ring-rose-200",
  suspended: "bg-slate-100 text-slate-700 ring-slate-200",
  documents_received: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  physical_documents: "bg-cyan-50 text-cyan-700 ring-cyan-200",
};

const formatStatus = (value) =>
  String(value || "—")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AdminStatusTag({ value, className = "" }) {
  const key = String(value || "").toLowerCase().replace(/\s+/g, "_");
  const tone = STATUS_STYLES[key] || "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <span
      className={"inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset " + tone + " " + className}
    >
      {formatStatus(value)}
    </span>
  );
}
