import { useMemo, useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaDownload,
  FaTrashAlt,
  FaEdit,
  FaChevronDown,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import dayjs from "dayjs";
import CubeIcon from "../../../public/3dcube.svg?react";
import CubeIconGreen from "../../../public/3dcubeGreen.svg?react";
import CubeIconPink from "../../../public/3dcubePink.svg?react";
import CubeIconOrange from "../../../public/3dcubeOrange.svg?react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchActivitiesStats,
  fetchAllActivities,
  fetchActivityById,
  deleteActivity,
} from "../../Redux/AdminActivities";
import {
  formatCurrencyAmount,
  getUserCurrencyInfo,
} from "../../utils/countryHelper";

// Redux-provided data will populate stats and activities

function Activities() {
  const dispatch = useDispatch();
  const { stats, activities, currentActivity } = useSelector(
    (s) =>
      s.adminActivities || { stats: {}, activities: [], currentActivity: null },
  );
  const [activeStat, setActiveStat] = useState("all");
  const [rows, setRows] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [query, setQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState({ key: "date", dir: "desc" });
  const [alert, setAlert] = useState(null);
  const alertTimer = useRef(null);
  const defaultCurrency = getUserCurrencyInfo();

  useEffect(() => {
    dispatch(fetchActivitiesStats());
    dispatch(fetchAllActivities());
  }, [dispatch]);

  // when activities from redux update, map into rows for table
  useEffect(() => {
    if (Array.isArray(activities)) {
      const mapped = activities.map((a) => ({
        id: a.request_id,
        name: a.user_name || `User ${a.request_id}`,
        careType: a.care_type,
        status:
          a.status === "pending_approval"
            ? "Pending"
            : a.status === "ongoing_activity"
              ? "Ongoing Activity"
              : a.status === "fulfilled" || a.status === "completed"
                ? "Fulfilled"
                : a.status,
        date: a.date_created ? dayjs(a.date_created).format("DD-MM-YYYY") : "",
      }));
      setRows(mapped);
    }
  }, [activities]);

  // when a single activity is loaded put into editRow
  useEffect(() => {
    if (currentActivity) {
      const a = currentActivity;
      setEditRow({
        id: a.request_id,
        name: a.requester || `User ${a.request_id}`,
        careType: a.care_type,
        timeSlot: a.time_slot || "",
        paymentRate: a.payment_rate || a.payment_rate || "",
        status: a.status || "",
        careProviderName: a.care_provider_name || "",
        careProviderPhone: a.care_provider_phone || "",
        careProviderEmail: a.care_provider_email || "",
      });
    }
  }, [currentActivity]);

  const statusOptions = useMemo(
    () => ["All", "Pending", "Ongoing Activity", "Fulfilled"],
    [],
  );
  const serviceOptions = useMemo(
    () => ["All", "Child Care", "Tutoring", "Adult & Senior Care"],
    [],
  );

  const filtered = useMemo(() => {
    let data = [...rows];

    // Stat filter
    if (activeStat === "fulfilled")
      data = data.filter((r) => r.status === "Fulfilled");
    if (activeStat === "pending")
      data = data.filter((r) => r.status === "Pending");
    if (activeStat === "ongoing")
      data = data.filter((r) => r.status === "Ongoing Activity");

    // Search
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (r) =>
          String(r.id).toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q),
      );
    }

    // Service filter
    if (serviceFilter !== "All")
      data = data.filter((r) => r.careType === serviceFilter);

    // Status filter
    if (statusFilter !== "All")
      data = data.filter((r) => r.status === statusFilter);
    if (dateFilter)
      data = data.filter((r) => dayjs(r.date, "DD-MM-YYYY").isSame(dayjs(dateFilter), "day"));

    // Sort
    data.sort((a, b) => {
      const k = sortBy.key;
      let av = a[k];
      let bv = b[k];
      if (k === "date") {
        av = dayjs(a.date, "DD-MM-YYYY").toDate();
        bv = dayjs(b.date, "DD-MM-YYYY").toDate();
      }
      if (av < bv) return sortBy.dir === "asc" ? -1 : 1;
      if (av > bv) return sortBy.dir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [rows, activeStat, query, serviceFilter, statusFilter, dateFilter, sortBy]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [activeStat, query, serviceFilter, statusFilter, dateFilter, sortBy]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function toggleSort(key) {
    setSortBy((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  function downloadCSV() {
    const csv = [
      ["Request ID", "User Name", "Care Type", "Status", "Date Created"],
      ...filtered.map((r) => [r.id, r.name, r.careType, r.status, r.date]),
    ]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activities.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-full bg-[#f3f7fb] p-4 text-slate-900 font-sfpro sm:p-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            key: "all",
            label: "All Activities",
            value: stats?.all_activities ?? 0,
            icon: CubeIcon,
          },
          {
            key: "fulfilled",
            label: "Fulfilled Requests",
            value: stats?.fulfilled_requests ?? 0,
            icon: CubeIconGreen,
          },
          {
            key: "pending",
            label: "Pending Approval",
            value: stats?.pending_approval ?? 0,
            icon: CubeIconPink,
          },
          {
            key: "ongoing",
            label: "Ongoing Activities",
            value: stats?.ongoing_activities ?? 0,
            icon: CubeIconOrange,
          },
        ].map((s) => {
          const isActive = activeStat === s.key;
          return (
            <div
              key={s.key}
              onClick={() => setActiveStat(s.key)}
              className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 shadow-[0_2px_10px_rgba(15,47,67,0.04)] ${
                isActive
                  ? "border-[#0e2f43] bg-[#0e2f43] text-white"
                  : "border-slate-200 bg-white text-slate-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full mb-5 ${
                      isActive ? "bg-white/10" : "bg-slate-100"
                    }`}
                  >
                    {(() => {
                      const Icon = s.icon || CubeIcon;
                      return (
                        <Icon
                          className={`w-5 h-5 ${
                            isActive ? "text-white" : "text-black"
                          }`}
                        />
                      );
                    })()}
                  </div>
                  <div className="text-sm font-medium">{s.label}</div>
                </div>
                <div
                  className={`ml-auto text-2xl font-semibold ${
                    isActive ? "text-white" : "text-black"
                  }`}
                >
                  {s.value.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* success/error alert */}
      {alert && (
        <div
          className={`mb-4 px-4 py-3 rounded-md ${
            alert.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
          role="alert"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm">{alert.text}</div>
            <button
              onClick={() => {
                setAlert(null);
                if (alertTimer.current) {
                  clearTimeout(alertTimer.current);
                  alertTimer.current = null;
                }
              }}
              className="text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Controls: search left, filters right */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-4">
        <div className="flex-1 w-full">
          <div className="relative z-40 flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-[0_1px_3px_rgba(15,47,67,0.05)]">
            <FaSearch className="text-slate-400 mr-2" />
            <input
              type="search"
              tabIndex={0}
              className="w-full bg-white text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="search care provider"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 md:mt-0">
          <div className="relative">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2 pr-8 text-sm text-slate-900"
            >
              <option value="All">Service Type</option>
              {serviceOptions
                .filter((s) => s !== "All")
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>
            <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2 pr-8 text-sm text-slate-900"
            >
              <option value="All">Filter by Status</option>
              {statusOptions
                .filter((s) => s !== "All")
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>
            <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900">
              <FaCalendarAlt className="text-slate-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="outline-none text-sm text-black bg-white"
              />
            </div>
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

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_4px_16px_rgba(15,47,67,0.04)]">
        <table className="w-full text-sm">
          <thead className="bg-[#f5f9fc] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2.5">
                <input type="checkbox" />
              </th>
              <th
                className="cursor-pointer px-3 py-2.5 text-left"
                onClick={() => toggleSort("id")}
              >
                Request ID
              </th>
              <th
                className="cursor-pointer px-3 py-2.5 text-left"
                onClick={() => toggleSort("name")}
              >
                User Name
              </th>
              <th
                className="cursor-pointer px-3 py-2.5 text-left"
                onClick={() => toggleSort("careType")}
              >
                Care Type
              </th>
              <th
                className="cursor-pointer px-3 py-2.5 text-left"
                onClick={() => toggleSort("status")}
              >
                Status
              </th>
              <th
                className="cursor-pointer px-3 py-2.5 text-left"
                onClick={() => toggleSort("date")}
              >
                Date Created
              </th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-slate-100 last:border-b-0 hover:bg-cyan-50/40"
              >
                <td className="px-3 py-2.5">
                  <input type="checkbox" />
                </td>
                <td className="px-3 py-2.5 font-semibold">{r.id}</td>
                <td className="px-3 py-2.5">{r.name}</td>
                <td className="px-3 py-2.5">{r.careType}</td>
                <td className="px-3 py-2.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      r.status === "Pending"
                        ? "bg-purple-50 text-purple-600"
                        : r.status === "Ongoing Activity"
                          ? "bg-sky-50 text-sky-600"
                          : "bg-green-50 text-green-600"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2.5">{r.date}</td>
                <td className="flex items-center gap-3 px-3 py-2.5 text-slate-500">
                  <button title="delete" onClick={() => setDeleteRow(r)}>
                    <FaTrashAlt />
                  </button>
                  <button
                    title="edit"
                    onClick={() => {
                      setEditRow({ id: r.id, name: "Loading..." });
                      dispatch(fetchActivityById(r.id));
                    }}
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400">
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
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length}
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
            <span className="min-w-[84px] text-center text-xs text-slate-500">Page {page} / {totalPages}</span>
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

      {/* Edit / Details Modal */}
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setEditRow(null)}
          />
          <div className="relative z-50 w-[380px] rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <button
              className="absolute right-3 top-3 text-slate-500 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"
              onClick={() => setEditRow(null)}
            >
              ✕
            </button>
            <h3 className="text-lg font-medium mb-4">Details</h3>

            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Requester</span>
                <span className="text-right">{editRow.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">
                  Care Provider&apos;s Name
                </span>
                <span className="text-right">
                  {editRow.careProviderName || "Ezeonu Justina"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">
                  Care Provider&apos;s Phone Number
                </span>
                <span className="text-right">
                  {editRow.careProviderPhone || "+234123456789"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">
                  Care Provider&apos;s Email
                </span>
                <span className="text-right">
                  {editRow.careProviderEmail || "olivia@untitledui.com"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Care Type</span>
                <span className="text-right">{editRow.careType}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Time Slot</span>
                <span className="text-right">07:00 am - 09:30 pm</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Payment Rate</span>
                <span className="text-right">
                  {editRow.paymentRate
                    ? formatCurrencyAmount(
                        editRow.paymentRate,
                        defaultCurrency.currencyCode,
                        defaultCurrency.currencySymbol,
                      )
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Status</span>
                <span className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs bg-purple-50 text-purple-600">
                    {editRow.status}
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button className="w-full bg-[#0b93c6] text-white py-2 rounded-md mb-3">
                Message
              </button>
              <button
                className="w-full border border-[#0b93c6] text-[#0b93c6] py-2 rounded-md"
                onClick={() => setEditRow(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDeleteRow(null)}
          />
          <div className="relative z-50 w-[320px] rounded-xl border border-slate-200 bg-white p-5 text-center shadow-xl">
            <button
              className="absolute right-3 top-3 text-slate-400 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"
              onClick={() => setDeleteRow(null)}
            >
              ✕
            </button>
            <h4 className="text-lg font-medium mb-2">Cancel Request</h4>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to cancel request?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md"
                onClick={async () => {
                  try {
                    await dispatch(deleteActivity(deleteRow.id)).unwrap();
                    setRows((prev) =>
                      prev.filter((x) => x.id !== deleteRow.id),
                    );
                    setDeleteRow(null);
                    if (alertTimer.current) {
                      clearTimeout(alertTimer.current);
                      alertTimer.current = null;
                    }
                    setAlert({ type: "success", text: "Activity removed" });
                    alertTimer.current = setTimeout(() => setAlert(null), 3000);
                  } catch (e) {
                    console.error("Delete activity failed", e);
                    if (alertTimer.current) {
                      clearTimeout(alertTimer.current);
                      alertTimer.current = null;
                    }
                    setAlert({
                      type: "error",
                      text: "Failed to delete activity",
                    });
                    alertTimer.current = setTimeout(() => setAlert(null), 3000);
                  }
                }}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md"
                onClick={() => setDeleteRow(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Activities;
