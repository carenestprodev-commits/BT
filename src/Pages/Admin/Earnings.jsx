import { useMemo, useState, useEffect } from "react";
import { FaSearch, FaDownload, FaCalendarAlt } from "react-icons/fa";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEarningsStats,
  fetchSeekerTransactions,
  fetchPlatformTransactions,
  fetchTransactionById,
} from "../../Redux/AdminEarning";

function Earnings() {
  const dispatch = useDispatch();
  const {
    stats,
    seekerTransactions,
    platformTransactions,
    currentTransaction,
  } = useSelector(
    (s) =>
      s.adminEarning || {
        stats: {},
        seekerTransactions: [],
        platformTransactions: [],
        currentTransaction: null,
      }
  );
  const [rows, setRows] = useState([]);
  const [activeStat, setActiveStat] = useState("all");
  const [detailRow, setDetailRow] = useState(null);
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    dispatch(fetchEarningsStats());
    // preload both lists (optional); can be lazy loaded when tile clicked
    dispatch(fetchSeekerTransactions());
    dispatch(fetchPlatformTransactions());
  }, [dispatch]);

  useEffect(() => {
    // refresh rows whenever seeker/platform arrays change and activeStat changes
    if (activeStat === "careSeekers")
      setRows(
        seekerTransactions.map((t) => ({
          id: t.transaction_id,
          user: t.user_name,
          amount: t.amount,
          time: t.time,
          date: t.date,
          source: "careSeekers",
        }))
      );
    else if (activeStat === "platform")
      setRows(
        platformTransactions.map((t) => ({
          id: t.transaction_id,
          user: t.user_name,
          amount: t.amount,
          time: t.time,
          date: t.date,
          source: "platform",
        }))
      );
    else
      setRows([
        ...seekerTransactions.map((t) => ({
          id: t.transaction_id,
          user: t.user_name,
          amount: t.amount,
          time: t.time,
          date: t.date,
          source: "careSeekers",
        })),
        ...platformTransactions.map((t) => ({
          id: t.transaction_id,
          user: t.user_name,
          amount: t.amount,
          time: t.time,
          date: t.date,
          source: "platform",
        })),
      ]);
  }, [seekerTransactions, platformTransactions, activeStat]);

  const filtered = useMemo(() => {
    let data = [...rows];
    // stat filter
    if (activeStat === "careSeekers")
      data = data.filter((r) => r.source === "careSeekers");
    if (activeStat === "platform")
      data = data.filter((r) => r.source === "platform");
    if (q.trim()) {
      const t = q.toLowerCase();
      data = data.filter(
        (r) =>
          r.id.toLowerCase().includes(t) || r.user.toLowerCase().includes(t)
      );
    }
    if (date) {
      data = data.filter((r) => r.date === dayjs(date).format("DD-MM-YYYY"));
    }
    return data;
  }, [rows, q, date, activeStat]);

  function downloadCSV() {
    const csv = [
      ["Transaction ID", "User Name", "Amount", "Time", "Date"],
      ...filtered.map((r) => [r.id, r.user, r.amount, r.time, r.date]),
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
      ["Transaction ID", "User Name", "Amount", "Time", "Date"],
      [row.id, row.user, row.amount, row.time, row.date],
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

  // when a single transaction is fetched, open modal
  useEffect(() => {
    if (currentTransaction) {
      const t = currentTransaction;
      setDetailRow({
        id: t.transaction_id,
        user: t.user_name,
        amount: t.amount,
        time: t.time,
        date: t.date,
      });
    }
  }, [currentTransaction]);

  return (
    <div className="p-4 sm:p-6 text-black bg-white font-sfpro">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[
          {
            key: "careSeekers",
            label: "Care Seekers Earnings",
            value: stats?.care_seekers_earnings ?? stats?.careSeekers ?? 0,
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
                setActiveStat(active ? "all" : s.key);
                if (s.key === "careSeekers")
                  dispatch(fetchSeekerTransactions());
                if (s.key === "platform") dispatch(fetchPlatformTransactions());
              }}
              className={`p-6 rounded-lg cursor-pointer ${
                active
                  ? "bg-[#0e2f43] text-white"
                  : "bg-white text-black border"
              } flex items-center gap-4`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  active ? "bg-white/10" : "bg-slate-100"
                }`}
              >
                💼
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
          <div className="flex items-center bg-white rounded-md px-3 py-2 shadow-sm text-black">
            <FaSearch className="text-slate-400 mr-2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="search for transaction"
              className="outline-none w-full text-sm bg-white text-black"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 md:mt-0">
          <div className="flex items-center px-4 py-2 border rounded-md text-sm bg-white text-black gap-2">
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
            className="px-3 py-2 border rounded-md flex items-center justify-center"
            aria-label="download"
          >
            <FaDownload className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-x-auto text-black">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="p-3">
                <input type="checkbox" />
              </th>
              <th className="p-3 text-left">Transaction ID</th>
              <th className="p-3 text-left">User Name</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                onClick={() => {
                  setDetailRow({ id: r.id, user: "Loading..." });
                  dispatch(fetchTransactionById(r.id));
                }}
                className="border-b last:border-b-0 hover:bg-slate-50 cursor-pointer"
              >
                <td className="p-3">
                  <input onClick={(e) => e.stopPropagation()} type="checkbox" />
                </td>
                <td className="p-3 font-semibold">{r.id}</td>
                <td className="p-3">{r.user}</td>
                <td className="p-3">{r.amount}</td>
                <td className="p-3">{r.time}</td>
                <td className="p-3">{r.date}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  No results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Details Modal */}
      {detailRow && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDetailRow(null)}
          />
          <div className="relative bg-white w-[340px] rounded-lg shadow-lg p-6 z-50 max-h-[80vh] flex flex-col">
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
                <span className="text-slate-500">User Name</span>
                <span className="text-right">{detailRow.user}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Amount</span>
                <span className="text-right">{detailRow.amount}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Time</span>
                <span className="text-right">{detailRow.time}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Date</span>
                <span className="text-right">{detailRow.date}</span>
              </div>
            </div>
            <div className="mt-4">
              <button
                className="w-full bg-[#0b93c6] text-white py-2 rounded-md mb-3"
                onClick={() => downloadRowCSV(detailRow)}
              >
                Download
              </button>
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
