import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaDownload, FaSearch } from "react-icons/fa";
import AdminStatusTag from "../../Components/AdminStatusTag";
import { BASE_URL } from "../../Redux/config";
import { fetchWithAuth } from "../../lib/fetchWithAuth";

const STATUS_OPTIONS = [
  ["draft", "Draft"],
  ["published", "Published"],
  ["in_progress", "In progress"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

const formatDate = (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "—");
const formatBudget = (row) => {
  const min = Number(row.price_min || 0);
  const max = Number(row.price_max || 0);
  if (!min && !max) return "—";
  if (min && max && min !== max) return `₦${min.toLocaleString()} – ₦${max.toLocaleString()}`;
  return `₦${(max || min).toLocaleString()}`;
};

function JobRequests() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), page_size: "8" });
        if (query.trim()) params.set("search", query.trim());
        if (status !== "All") params.set("status", status);
        const response = await fetchWithAuth(`${BASE_URL}/api/admin/job-requests/?${params}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data?.detail || "Unable to load job requests");
        if (!cancelled) {
          setRows(data.results || []);
          setTotalCount(data.count || 0);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load job requests");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page, query, status]);

  useEffect(() => { setPage(1); }, [query, status]);

  const totalPages = Math.max(1, Math.ceil(totalCount / 8));
  const downloadCSV = () => {
    const csv = [
      ["ID", "Title", "Seeker", "Care type", "Status", "Budget", "Start date", "Created date"],
      ...rows.map((row) => [row.id, row.title, row.seeker_name, row.service_category_label, row.status_label, formatBudget(row), formatDate(row.start_date), formatDate(row.created_at)]),
    ].map((line) => line.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "job-requests.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full bg-[#f3f7fb] p-4 font-sfpro text-slate-900 sm:p-6">
      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_16px_rgba(15,47,67,0.04)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#EAECF0] px-5 py-5 sm:px-6">
          <div><h2 className="text-lg font-semibold text-[#344054]">Job requests</h2><p className="mt-1 text-xs text-[#667085]">View all care requests posted by seekers</p></div>
          <button type="button" onClick={downloadCSV} className="inline-flex items-center gap-2 rounded-lg border border-[#D0D5DD] px-4 py-2 text-sm font-semibold text-[#344054] hover:bg-slate-50"><FaDownload /> Download</button>
        </div>
        <div className="flex justify-end gap-3 border-b border-[#EAECF0] px-5 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center rounded-lg border border-[#D0D5DD] px-3 py-2 sm:max-w-[390px]"><FaSearch className="mr-2 shrink-0 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search job requests" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" /></div>
          <div className="relative"><button type="button" onClick={() => setFilterOpen((value) => !value)} className="inline-flex items-center gap-3 rounded-lg border border-[#D0D5DD] px-4 py-2 text-sm font-semibold text-[#344054]">Filters <FaChevronDown /></button>{filterOpen && <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-[#EAECF0] bg-white p-3 shadow-lg"><label className="text-xs font-medium text-slate-500">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-sm"><option value="All">All statuses</option>{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-[#f5f9fc] text-[11px] font-semibold uppercase tracking-wide text-slate-500"><tr><th className="w-12 px-5 py-3 text-left"><input type="checkbox" aria-label="Select all job requests" /></th><th className="px-3 py-3 text-left">ID</th><th className="px-3 py-3 text-left">Job request</th><th className="px-3 py-3 text-left">Seeker</th><th className="px-3 py-3 text-left">Care type</th><th className="px-3 py-3 text-left">Status</th><th className="px-3 py-3 text-left">Budget</th><th className="px-3 py-3 text-left">Start date</th><th className="px-3 py-3 text-left">Created date</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={9} className="p-8 text-center text-slate-500">Loading job requests...</td></tr>}
              {!loading && error && <tr><td colSpan={9} className="p-8 text-center text-red-600">{error}</td></tr>}
              {!loading && !error && !rows.length && <tr><td colSpan={9} className="p-8 text-center text-slate-500">No job requests found.</td></tr>}
              {!loading && !error && rows.map((row) => <tr key={row.id} className="border-b border-slate-100 hover:bg-cyan-50/40"><td className="px-5 py-4"><input type="checkbox" aria-label={`Select request ${row.id}`} /></td><td className="px-3 py-4 font-semibold text-[#344054]">{row.id}</td><td className="max-w-[250px] px-3 py-4 text-[#475467]"><span className="line-clamp-2">{row.title || row.summary || "—"}</span></td><td className="px-3 py-4 text-[#475467]">{row.seeker_name || "—"}</td><td className="px-3 py-4 text-[#475467]">{row.service_category_label || "—"}</td><td className="px-3 py-4"><AdminStatusTag value={row.status} /></td><td className="px-3 py-4 text-[#475467]">{formatBudget(row)}</td><td className="px-3 py-4 text-[#475467]">{formatDate(row.start_date)}</td><td className="px-3 py-4 text-[#475467]">{formatDate(row.created_at)}</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#EAECF0] px-5 py-4 text-sm font-medium text-[#344054] sm:px-6"><button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex items-center gap-2 rounded-lg border border-[#D0D5DD] px-4 py-2 disabled:opacity-50"><FaChevronLeft /> Previous</button><div className="flex items-center gap-2">{Array.from({ length: Math.min(totalPages, 7) }, (_, index) => index + 1).map((number) => <button key={number} type="button" onClick={() => setPage(number)} className={`h-9 w-9 rounded-lg text-sm ${number === page ? "bg-[#f5f9fc] font-semibold text-[#0E2F43]" : "text-[#475467] hover:bg-slate-50"}`}>{number}</button>)}</div><button type="button" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="inline-flex items-center gap-2 rounded-lg border border-[#D0D5DD] px-4 py-2 disabled:opacity-50">Next <FaChevronRight /></button></div>
      </section>
    </div>
  );
}

export default JobRequests;
