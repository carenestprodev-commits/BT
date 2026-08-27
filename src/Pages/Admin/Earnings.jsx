import { useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import AdminPagination from "../../Components/Admin/AdminPagination";
import { useClientPagination } from "../../hooks/useAdminCollection";
import { fetchEarningsStats, fetchSeekerTransactions } from "../../Redux/AdminEarning";

const money = (value) => `₦${Number(value || 0).toLocaleString()}`;
const statusStyle = { successful: "bg-emerald-50 text-emerald-700", pending: "bg-amber-50 text-amber-700", failed: "bg-rose-50 text-rose-700" };

export default function Earnings() {
  const dispatch = useDispatch();
  const { stats, seekerTransactions: transactions, seekerLoading } = useSelector((state) => state.adminEarning);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => { dispatch(fetchEarningsStats()); dispatch(fetchSeekerTransactions()); }, [dispatch]);
  const rows = useMemo(() => (transactions || []).filter((item) => {
    const text = `${item.transaction_id} ${item.user_name} ${item.user_email} ${item.booking_id || ""}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (!status || item.status === status);
  }), [transactions, query, status]);
  const { page, setPage, pageSize, totalPages, visibleRows } = useClientPagination(rows, { pageSize: 12, resetKey: `${query}|${status}` });

  const download = () => {
    const data = [["Reference", "User", "Email", "Purpose", "Booking", "Gateway", "Status", "Amount", "Created"], ...rows.map((row) => [row.transaction_id, row.user_name, row.user_email, row.purpose, row.booking_id || "", row.payment_gateway, row.status, row.amount, row.created_at])];
    const csv = data.map((line) => line.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "payments.csv"; anchor.click(); URL.revokeObjectURL(url);
  };

  return <div className="min-h-full bg-[#f3f7fb] p-4 text-slate-900 sm:p-6">
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      {[["Successful payments", stats?.care_seekers_earnings], ["Provider wallet credits", stats?.care_provider_earnings], ["Recorded platform revenue", stats?.platform_earnings]].map(([label, value]) => <div key={label}><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold">{money(value)}</p></div>)}
    </div>
    <div className="mb-4 flex flex-col gap-3 md:flex-row">
      <label className="flex flex-1 items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm"><Search size={17} className="text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reference, user, email or booking" className="w-full bg-transparent text-sm outline-none" /></label>
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm outline-none"><option value="">All statuses</option><option value="successful">Successful</option><option value="pending">Pending</option><option value="failed">Failed</option></select>
      <button onClick={download} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0E2F43] px-4 py-2 text-sm font-medium text-white"><Download size={16} /> Export</button>
    </div>
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["Reference", "Customer", "Purpose", "Gateway", "Amount", "Status", "Created"].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead>
      <tbody>{visibleRows.map((row) => <tr key={row.id} onClick={() => setSelected(row)} className="cursor-pointer border-t border-slate-100 hover:bg-cyan-50/40"><td className="px-4 py-3 font-medium text-[#0E2F43]">{row.transaction_id}</td><td className="px-4 py-3"><div>{row.user_name || "—"}</div><div className="text-xs text-slate-500">{row.user_email}</div></td><td className="px-4 py-3">{row.purpose}{row.booking_id ? <div className="text-xs text-slate-500">Booking #{row.booking_id}</div> : null}</td><td className="px-4 py-3 capitalize">{row.payment_gateway}</td><td className="px-4 py-3 font-medium">{money(row.amount)}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyle[row.status] || "bg-slate-100"}`}>{row.status}</span></td><td className="px-4 py-3">{dayjs(row.created_at).format("DD MMM YYYY, HH:mm")}</td></tr>)}{!seekerLoading && !visibleRows.length && <tr><td colSpan="7" className="px-4 py-12 text-center text-slate-500">No payments found.</td></tr>}</tbody>
    </table></div>
    <AdminPagination page={page} count={rows.length} totalPages={totalPages} pageSize={pageSize} onPage={setPage} />
    {selected && <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30" onClick={() => setSelected(null)}><aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-wide text-slate-500">Payment reconciliation</p><h2 className="mt-1 break-all text-lg font-semibold">{selected.transaction_id}</h2></div><button onClick={() => setSelected(null)} className="text-2xl text-slate-400">×</button></div><dl className="mt-7 space-y-4 text-sm">{[["Status", selected.status], ["Amount", money(selected.amount)], ["Customer", selected.user_name], ["Email", selected.user_email], ["Role", selected.user_role], ["Purpose", selected.purpose], ["Plan", selected.plan_name], ["Booking", selected.booking_id ? `#${selected.booking_id}` : null], ["Gateway", selected.payment_gateway], ["Checkout URL", selected.checkout_url], ["Created", dayjs(selected.created_at).format("DD MMM YYYY, HH:mm:ss")], ["Last updated", dayjs(selected.updated_at).format("DD MMM YYYY, HH:mm:ss")]].map(([label, value]) => <div key={label} className="flex items-start justify-between gap-5 border-b border-slate-100 pb-3"><dt className="text-slate-500">{label}</dt><dd className="max-w-[65%] break-all text-right font-medium capitalize">{value || "—"}</dd></div>)}</dl></aside></div>}
  </div>;
}
