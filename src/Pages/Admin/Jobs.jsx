import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaSearch,
} from "react-icons/fa";
import AdminStatusTag from "../../Components/AdminStatusTag";
import { BASE_URL } from "../../Redux/config";
import { fetchWithAuth } from "../../lib/fetchWithAuth";

const STATUS_OPTIONS = [
  ["pending_approval", "Awaiting seeker review"],
  ["active", "Active"],
  ["completed", "Completed"],
  ["rejected", "Rejected"],
  ["cancelled_by_seeker", "Cancelled by seeker"],
  ["cancelled_by_provider", "Cancelled by provider"],
];
const COMPLETION_SOURCES = ["active", "rejected"];

const formatDate = (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "—");

function Jobs() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [statusValue, setStatusValue] = useState("");
  const [walletAmount, setWalletAmount] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), page_size: "8" });
        if (query.trim()) params.set("search", query.trim());
        if (statusFilter !== "All") params.set("status", statusFilter);
        const response = await fetchWithAuth(BASE_URL + "/api/admin/jobs/?" + params.toString());
        const data = await response.json();
        if (!response.ok) throw new Error(data?.detail || "Unable to load jobs");
        if (!cancelled) {
          setRows(Array.isArray(data) ? data : data.results || []);
          setTotalCount(Array.isArray(data) ? data.length : data.count || 0);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load jobs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadJobs();
    return () => {
      cancelled = true;
    };
  }, [page, query, statusFilter, refreshKey]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const visibleRows = rows;

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const downloadCSV = () => {
    const csv = [
      ["ID", "Job request", "Provider", "Status", "Agreed rate", "Hired at", "Completed at"],
      ...rows.map((row) => [
        row.id,
        row.job_request_title || "",
        row.provider_name || "",
        row.status_label || row.status || "",
        row.agreed_rate || "",
        formatDate(row.hired_at),
        formatDate(row.completed_at),
      ]),
    ]
      .map((line) => line.map((cell) => "\"" + String(cell).replace(/"/g, "\"\"") + "\"").join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "jobs.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const openJob = (row) => {
    setSelectedJob(row);
    setStatusValue(row.status);
    setWalletAmount("");
    setStatusError("");
  };

  const saveStatus = async (event) => {
    event.preventDefault();
    setStatusSaving(true);
    setStatusError("");

    const completionTransition =
      COMPLETION_SOURCES.includes(selectedJob.status) && statusValue === "completed";
    const payload = { status: statusValue };
    if (completionTransition && walletAmount.trim()) {
      payload.provider_wallet_amount = walletAmount;
    }

    try {
      const response = await fetchWithAuth(
        BASE_URL + "/api/admin/jobs/" + selectedJob.id + "/status/",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.detail || data?.provider_wallet_amount?.[0] || "Unable to update booking status"
        );
      }

      setSelectedJob(null);
      setRefreshKey((value) => value + 1);
    } catch (saveError) {
      setStatusError(saveError.message || "Unable to update booking status");
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f3f7fb] p-4 text-slate-900 font-sfpro sm:p-6">
      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_16px_rgba(15,47,67,0.04)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#EAECF0] px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-[#344054]">Bookings</h2>
            <p className="mt-1 text-xs text-[#667085]">View all booking details</p>
          </div>
          <button
            type="button"
            onClick={downloadCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-4 py-2 text-sm font-semibold text-[#344054] transition hover:bg-slate-50"
          >
            <FaDownload className="text-slate-500" />
            Download
          </button>
        </div>

        <div className="flex justify-end gap-3 border-b border-[#EAECF0] px-5 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 sm:max-w-[390px]">
            <FaSearch className="mr-2 shrink-0 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search bookings"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
              className="inline-flex items-center gap-3 rounded-lg border border-[#D0D5DD] bg-white px-4 py-2 text-sm font-semibold text-[#344054] hover:bg-slate-50"
            >
              Filters
              <FaChevronDown className="text-slate-500" />
            </button>
            {filterOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-[#EAECF0] bg-white p-3 shadow-lg">
                <label className="text-xs font-medium text-slate-500">
                  Status
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                  >
                    <option value="All">All statuses</option>
                    {STATUS_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-[#f5f9fc] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-12 px-5 py-3 text-left">
                  <input type="checkbox" aria-label="Select all bookings" />
                </th>
                <th className="px-3 py-3 text-left">ID</th>
                <th className="px-3 py-3 text-left">Job request</th>
                <th className="px-3 py-3 text-left">Provider</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-left">Agreed rate</th>
                <th className="px-3 py-3 text-left">Hired at</th>
                <th className="px-3 py-3 text-left">Completed at</th>
                <th className="w-16 px-5 py-3 text-left">...</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    Loading bookings...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && visibleRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No bookings found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                visibleRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-cyan-50/40"
                  >
                    <td className="px-5 py-4">
                      <input type="checkbox" aria-label={"Select booking " + row.id} />
                    </td>
                    <td className="px-3 py-4 font-semibold text-[#344054]">{row.id}</td>
                    <td className="max-w-[220px] px-3 py-4 text-[#475467]">
                      <span className="line-clamp-2">{row.job_request_title || "—"}</span>
                    </td>
                    <td className="px-3 py-4 text-[#475467]">{row.provider_name || "—"}</td>
                    <td className="px-3 py-4">
                      <AdminStatusTag value={row.status} />
                    </td>
                    <td className="px-3 py-4 text-[#475467]">
                      {row.agreed_rate ? "₦" + Number(row.agreed_rate).toLocaleString() : "—"}
                    </td>
                    <td className="px-3 py-4 text-[#475467]">{formatDate(row.hired_at)}</td>
                    <td className="px-3 py-4 text-[#475467]">{formatDate(row.completed_at)}</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => openJob(row)}
                        className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
                        aria-label={"View booking " + row.id}
                      >
                        •••
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#EAECF0] px-5 py-4 text-sm font-medium text-[#344054] sm:px-6">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-4 py-2 disabled:opacity-50"
          >
            <FaChevronLeft /> Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={"h-9 w-9 rounded-lg text-sm " + (pageNumber === page ? "bg-[#f5f9fc] font-semibold text-[#0E2F43]" : "text-[#475467] hover:bg-slate-50")}
              >
                {pageNumber}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-4 py-2 disabled:opacity-50"
          >
            Next <FaChevronRight />
          </button>
        </div>
      </section>

      {selectedJob && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setSelectedJob(null)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#EAECF0] p-6">
              <div>
                <h2 className="text-xl font-bold text-[#0E2F43]">Booking details</h2>
                <p className="mt-1 text-xs text-[#A6A6A7]">Booking #{selectedJob.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                aria-label="Close booking details"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3 text-sm">
                {[
                  ["Job request", selectedJob.job_request_title || "—"],
                  ["Provider", selectedJob.provider_name || "—"],
                  ["Status", <AdminStatusTag key="status" value={selectedJob.status} />],
                  ["Agreed rate", selectedJob.agreed_rate ? "₦" + Number(selectedJob.agreed_rate).toLocaleString() : "—"],
                  ["Payment status", <AdminStatusTag key="payment" value={selectedJob.payment_status} />],
                  ["Hired at", formatDate(selectedJob.hired_at)],
                  ["Completed at", formatDate(selectedJob.completed_at)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 border-b border-gray-50 pb-2">
                    <span className="text-[#A6A6A7]">{label}</span>
                    <span className="max-w-[60%] text-right font-semibold text-[#0E2F43]">{value}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={saveStatus} className="mt-7 border-t border-[#EAECF0] pt-5">
                <h3 className="text-sm font-semibold text-[#0E2F43]">Change booking status</h3>
                <label className="mt-4 block text-xs font-medium text-slate-500">
                  Status
                  <select
                    value={statusValue}
                    onChange={(event) => {
                      setStatusValue(event.target.value);
                      setWalletAmount("");
                      setStatusError("");
                    }}
                    className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0E2F43]"
                  >
                    {STATUS_OPTIONS.map(([value, label]) => (
                      <option
                        key={value}
                        value={value}
                        disabled={
                          value === "completed" &&
                          selectedJob.status !== "completed" &&
                          !COMPLETION_SOURCES.includes(selectedJob.status)
                        }
                      >
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                {COMPLETION_SOURCES.includes(selectedJob.status) && statusValue === "completed" && (
                  <label className="mt-4 block text-xs font-medium text-slate-500">
                    Provider wallet credit (offline payment)
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={walletAmount}
                      onChange={(event) => setWalletAmount(event.target.value)}
                      required={selectedJob.payment_status !== "paid"}
                      placeholder="Amount to add"
                      className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0E2F43]"
                    />
                    <span className="mt-1 block font-normal text-slate-400">
                      Required unless this booking already has an online wallet credit.
                    </span>
                  </label>
                )}
                {statusError && <p className="mt-3 text-xs text-red-600">{statusError}</p>}
                <button
                  type="submit"
                  disabled={statusSaving || statusValue === selectedJob.status}
                  className="mt-5 w-full rounded-lg bg-[#0E2F43] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174b68] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {statusSaving ? "Saving..." : "Save status"}
                </button>
              </form>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

export default Jobs;
