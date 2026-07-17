import { useMemo, useState, useEffect } from "react";
import {
  FaSearch,
  FaDownload,
  FaCalendarAlt,
  FaWallet,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEarningsStats,
  fetchProviderEarnings,
  fetchProviderEarningById,
} from "../../Redux/AdminEarning";

function Earnings() {
  const dispatch = useDispatch();
  const {
    stats,
    providerEarnings,
    currentProviderEarning,
    currentLoading,
  } = useSelector(
    (s) =>
      s.adminEarning || {
        stats: {},
        providerEarnings: [],
        currentProviderEarning: null,
        currentLoading: false,
      }
  );
  const [rows, setRows] = useState([]);
  const [activeStat, setActiveStat] = useState("careProviders");
  const [detailRow, setDetailRow] = useState(null);
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchEarningsStats());
    dispatch(fetchProviderEarnings());
  }, [dispatch]);

  useEffect(() => {
    setRows((providerEarnings || []).map((t) => ({
      id: t.transaction_id,
      user: t.user_name || "Unknown provider",
      amount: t.amount,
      time: t.time,
      date: t.date,
      bookingId: t.booking_id,
    })));
  }, [providerEarnings]);

  const filtered = useMemo(() => {
    let data = [...rows];
    if (q.trim()) {
      const t = q.toLowerCase();
      data = data.filter(
        (r) =>
          String(r.id).toLowerCase().includes(t) || r.user.toLowerCase().includes(t)
      );
    }
    if (date) {
      data = data.filter((r) => dayjs(r.date).isSame(dayjs(date), "day"));
    }
    return data;
  }, [rows, q, date]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [q, date]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function downloadCSV() {
    const csv = [
      ["Transaction ID", "Care Provider", "Amount", "Time", "Date", "Booking ID"],
      ...filtered.map((r) => [r.id, r.user, r.amount, r.time, r.date, r.bookingId || ""]),
    ]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "earnings.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadRowCSV(row) {
    const csv = [
      ["Transaction ID", "Care Provider", "Amount", "Time", "Date", "Booking ID"],
      [row.id, row.user, row.amount, row.time, row.date, row.bookingId || ""],
    ]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${row.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    if (currentProviderEarning) {
      const t = currentProviderEarning;
      setDetailRow({
        id: t.transaction_id,
        user: t.user_name || "Unknown provider",
        amount: t.amount,
        time: t.time,
        date: t.date,
        bookingId: t.booking_id,
      });
    }
  }, [currentProviderEarning]);

  return (
    <div className="min-h-full bg-[#f3f7fb] p-4 text-slate-900 font-sfpro sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[
          {
            key: "careProviders",
            label: "Care Provider Earnings",
            value: stats?.care_provider_earnings ?? 0,
          },
          {
            key: "platform",
            label: "Platform Earnings",
            value: stats?.platform_earnings ?? stats?.platform ?? 0,
          },
        ].map((s) => {
          const active = activeStat === s.key;
          return (
            <div
              key={s.key}
              onClick={() => {
                setActiveStat(active ? "careProviders" : s.key);
              }}
              className={`cursor-pointer rounded-xl border p-4 shadow-[0_2px_10px_rgba(15,47,67,0.04)] ${
                active
                  ? "border-[#0e2f43] bg-[#0e2f43] text-white"
                  : "border-slate-200 bg-white text-slate-900"
              } flex items-center gap-4`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  active ? "bg-white/10" : "bg-slate-100"
                }`}
              >
                <FaWallet className="text-[#0ea5d7]" />
              </div>
              <div>
                <div className="text-sm opacity-80">{s.label}</div>
                <div className="text-2xl font-semibold mt-2">
                  {typeof s.value === "number"
                    ? `₦${Number(s.value).toLocaleString()}`
                    : s.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-4">
        <div className="flex-1 w-full">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-[0_1px_3px_rgba(15,47,67,0.05)]">
            <FaSearch className="text-slate-400 mr-2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="search care provider"
              className="w-full bg-white text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 md:mt-0">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900">
            <FaCalendarAlt className="text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="outline-none text-sm text-black bg-white"
            />
          </div>
          <button
            onClick={downloadCSV}
            className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-[#0d99c9] transition hover:bg-cyan-50 active:scale-[0.98]"
            aria-label="download"
          >
            <FaDownload className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_4px_16px_rgba(15,47,67,0.04)]">
        <table className="w-full text-sm">
          <thead className="bg-[#f5f9fc] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2.5">
                <input type="checkbox" />
              </th>
              <th className="px-3 py-2.5 text-left">Transaction ID</th>
              <th className="px-3 py-2.5 text-left">Care Provider</th>
              <th className="px-3 py-2.5 text-left">Amount</th>
              <th className="px-3 py-2.5 text-left">Time</th>
              <th className="px-3 py-2.5 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((r) => (
              <tr
                key={r.id}
                onClick={() => {
                  setDetailRow({ id: r.id, user: "Loading..." });
                  dispatch(fetchProviderEarningById(r.id));
                }}
                className="cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-cyan-50/40"
              >
                <td className="px-3 py-2.5">
                  <input onClick={(e) => e.stopPropagation()} type="checkbox" />
                </td>
                <td className="px-3 py-2.5 font-semibold">{r.id}</td>
                <td className="px-3 py-2.5">{r.user}</td>
                <td className="px-3 py-2.5">₦{Number(r.amount || 0).toLocaleString()}</td>
                <td className="px-3 py-2.5">{r.time}</td>
                <td className="px-3 py-2.5">{r.date ? dayjs(r.date).format("DD-MM-YYYY") : "—"}</td>
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  No results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filtered.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 sm:flex-row">
          <span>
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronLeft /> Previous
            </button>
            <span className="min-w-[84px] text-center text-xs text-slate-500">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <FaChevronRight />
            </button>
          </div>
        </div>
      )}
      {/* Details Modal */}
      {detailRow && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDetailRow(null)}
          />
          <div className="relative z-50 flex max-h-[80vh] w-[340px] flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <button
              className="absolute right-3 top-3 text-slate-400 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"
              onClick={() => setDetailRow(null)}
            >
              ✕
            </button>
            <h3 className="text-lg font-medium mb-4">Details</h3>
            <div className="flex-1 overflow-y-auto text-sm text-slate-700 space-y-3 pr-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Transaction ID</span>
                <span className="text-right">{detailRow.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Care provider</span>
                <span className="text-right">{detailRow.user}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Amount</span>
                <span className="text-right">₦{Number(detailRow.amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Time</span>
                <span className="text-right">{detailRow.time}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Booking</span>
                <span className="text-right">{detailRow.bookingId || "—"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Date</span>
                <span className="text-right">
                  {detailRow.date ? dayjs(detailRow.date).format("DD-MM-YYYY") : "—"}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <button
                className="w-full bg-[#0b93c6] text-white py-2 rounded-md mb-3"
                onClick={() => downloadRowCSV(detailRow)}
              >
                Download
              </button>
              {currentLoading && (
                <p className="mt-2 text-center text-xs text-slate-400">Loading latest details…</p>
              )}
              <button
                className="w-full border border-slate-200 text-slate-700 py-2 rounded-md"
                onClick={() => setDetailRow(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Earnings;
