import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import { FaDownload, FaFilter, FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVerifications,
  fetchVerificationById,
  postVerificationAction,
  clearCurrentVerification,
  uploadVerificationId,
} from "../../Redux/Verification";
import { fetchAdminStats } from "../../Redux/AdminUsers";
import AdminStatusTag from "../../Components/AdminStatusTag";
import VerificationDocumentPreview from "../../Components/Admin/VerificationDocumentPreview";

function ProfileVerificationProvider() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.verification || {});
  const stats = useSelector((s) => s.adminUsers?.stats || {});
  useEffect(() => {
    dispatch(fetchVerifications());
    dispatch(fetchAdminStats());
  }, [dispatch]);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showDetailId, setShowDetailId] = useState(null);
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [manualPaymentData, setManualPaymentData] = useState({
    payment_method: "bank_transfer",
    payment_received_date: "",
    payment_reference: "",
    notes: "",
  });
  const [dateRange, setDateRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const { current, currentLoading, actionLoading, actionError, actionSuccess } =
    useSelector((s) => s.verification || {});

  const pageSize = 8;

  const providerRows = (items || []).filter((x) => x.user_type === "provider");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const cutoff = dateRange === "today" ? dayjs().startOf("day") : dateRange === "week" ? dayjs().subtract(7, "day") : dateRange === "month" ? dayjs().subtract(1, "month") : null;
    return providerRows.filter((r) => {
      const matchesQuery = !q || (r.name || "").toLowerCase().includes(q);
      const matchesDate = !cutoff || !r.last_updated || dayjs(r.last_updated).isAfter(cutoff);
      return matchesQuery && matchesDate;
    });
  }, [providerRows, query, dateRange]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);
  // ensure the table shows space for 10 rows even when there are fewer items
  const minVisibleRows = 10;
  const displayRows = [
    ...pageRows,
    ...Array(Math.max(0, minVisibleRows - pageRows.length)).fill(null),
  ];
  const pendingCount = providerRows.filter((row) =>
    ["pending", "in_review", "under_review", "sent_to_vetting", "in_progress"].includes(row.status),
  ).length;

  const downloadCSV = () => {
    const headers = ["Name", "Verification Type", "Payment Option", "Payment Status", "Status", "Feedback", "Last Updated"];
    const rows = filtered.map((row) => [row.name, row.verification_type, row.payment_option, row.payment_status, row.status, row.feedback, row.last_updated]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "care-provider-verifications.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const makePageButtons = () => {
    const pages = [];
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 4) pages.push("left-ellipsis");
      const start = Math.max(2, page - 2);
      const end = Math.min(pageCount - 1, page + 2);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < pageCount - 3) pages.push("right-ellipsis");
      pages.push(pageCount);
    }
    return pages;
  };

  return (
    <>
      <div className="min-h-full bg-[#f3f7fb] p-4 text-slate-900 font-sfpro sm:p-6">
        <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            ["Total Users", stats.total_users, "#0E3347", "text-white"],
            ["Care Providers", stats.total_providers, "white", "text-slate-900"],
            ["Care Seekers", stats.total_seekers, "white", "text-slate-900"],
            ["Pending Verifications", pendingCount, "white", "text-slate-900"],
          ].map(([label, value, background, color]) => (
            <div key={label} className={`min-h-[132px] rounded-xl border border-slate-200 px-4 py-4 ${color}`} style={{ background }}>
              <p className="text-sm opacity-75">{label}</p>
              <p className="mt-2 text-3xl font-medium">{Number(value || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_4px_16px_rgba(15,47,67,0.04)]">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div><h2 className="text-lg font-semibold">Verify Providers</h2><p className="mt-1 text-sm text-slate-500">Verify care providers</p></div>
            <button type="button" onClick={downloadCSV} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"><FaDownload /> Download</button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-300">
            {[['all', 'All time'], ['today', 'Today'], ['week', 'Past 7 days'], ['month', 'Past months']].map(([value, label]) => <button key={value} type="button" onClick={() => setDateRange(value)} className={`px-4 py-2 text-sm ${dateRange === value ? 'bg-[#f5f9fc] font-semibold text-[#0E3347]' : 'bg-white text-slate-600'}`}>{label}</button>)}
          </div>
          <div className="flex items-center gap-3">
          <div className="relative w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search care provider"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 shadow-[0_1px_3px_rgba(15,47,67,0.05)] placeholder:text-slate-400"
          />
        </div>
          <div className="relative"><button type="button" onClick={() => setShowFilters((value) => !value)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"><FaFilter /> Filters</button>{showFilters && <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg"><p className="text-slate-500">Showing {filtered.length} matching verifications</p><button type="button" onClick={() => { setQuery(''); setDateRange('all'); setShowFilters(false); }} className="mt-3 text-[#0b93c6]">Clear filters</button></div>}</div>
          </div>
      </div>

        <div className="flex flex-col min-h-[60vh]">
          <div className="flex-1 overflow-x-auto rounded-xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_4px_16px_rgba(15,47,67,0.04)]">
            <table className="w-full table-auto text-sm">
              <thead className="bg-[#f5f9fc] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-12 px-3 py-2.5 text-left">
                    <input type="checkbox" />
                  </th>
                  <th className="px-3 py-2.5 text-left">Care Provider Name</th>
                  <th className="px-3 py-2.5 text-left">Verification Type</th>
                  <th className="px-3 py-2.5 text-left">Payment Option</th>
                  <th className="px-3 py-2.5 text-left">Payment Status</th>
                  <th className="px-3 py-2.5 text-left">Verification Status</th>
                  <th className="px-3 py-2.5 text-left">Vetting Feedback</th>
                  <th className="px-3 py-2.5 text-left">Last Updated</th>
                  <th className="hidden w-12 px-3 py-2.5 text-left">...</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((r, idx) =>
                  r ? (
                    <tr key={r.id} onClick={() => { setShowDetailId(r.id); dispatch(fetchVerificationById(r.id)); }} className="cursor-pointer border-b border-slate-100 hover:bg-cyan-50/40">
                      <td className="align-top px-3 py-2.5">
                        <input type="checkbox" onClick={(event) => event.stopPropagation()} />
                      </td>
                      <td className="align-top px-3 py-2.5 font-medium text-slate-900">
                        {r.name}
                      </td>
                      <td className="align-top px-3 py-2.5 text-slate-900">
                        {r.verification_type}
                      </td>
                      <td className="align-top px-3 py-2.5 text-slate-900">
                        {r.payment_option}
                      </td>
                      <td className="align-top px-3 py-2.5 text-slate-900">
                        <AdminStatusTag value={r.payment_status} />
                      </td>
                      <td className="align-top px-3 py-2.5 text-slate-900">
                        <AdminStatusTag value={r.status} />
                      </td>
                      <td className="align-top px-3 py-2.5 text-slate-700">
                        {r.feedback || "—"}
                      </td>
                      <td className="align-top px-3 py-2.5 text-slate-900">
                        {r.last_updated
                          ? dayjs(r.last_updated).format("DD-MM-YYYY")
                          : ""}
                      </td>
                      <td className="hidden align-top px-3 py-2.5">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenMenuId(openMenuId === r.id ? null : r.id)
                            }
                            className="px-2 py-1 rounded hover:bg-gray-100 text-black"
                          >
                            •••
                          </button>
                          {openMenuId === r.id && (
                            <div className="absolute right-0 z-10 mt-2 w-44 rounded-lg border border-slate-200 bg-white text-sm shadow-lg">
                              <ul>
                                <li
                                  onClick={() => {
                                    setShowDetailId(r.id);
                                    setOpenMenuId(null);
                                    dispatch(fetchVerificationById(r.id));
                                  }}
                                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-black"
                                >
                                  View
                                </li>
                                <li
                                  onClick={() => {
                                    dispatch(
                                      postVerificationAction({
                                        id: r.id,
                                        action: "approve",
                                      }),
                                    );
                                  }}
                                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-black"
                                >
                                  Approve
                                </li>
                                <li
                                  onClick={() => {
                                    dispatch(
                                      postVerificationAction({
                                        id: r.id,
                                        action: "reject",
                                        feedback: "Rejected by admin",
                                      }),
                                    );
                                  }}
                                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-black"
                                >
                                  Reject
                                </li>
                                <li
                                  onClick={() => {
                                    dispatch(
                                      postVerificationAction({
                                        id: r.id,
                                        action: "message",
                                      }),
                                    );
                                    setOpenMenuId(null);
                                  }}
                                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-black"
                                >
                                  Message
                                </li>
                                <li
                                  onClick={() => {
                                    dispatch(
                                      postVerificationAction({
                                        id: r.id,
                                        action: "re_upload",
                                      }),
                                    );
                                    setOpenMenuId(null);
                                  }}
                                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-black"
                                >
                                  Re Upload
                                </li>
                                <li
                                  onClick={() => {
                                    dispatch(
                                      postVerificationAction({
                                        id: r.id,
                                        action: "send_prompt",
                                      }),
                                    );
                                    setOpenMenuId(null);
                                  }}
                                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-black"
                                >
                                  Send Prompt
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={`empty-${idx}`} className="border-b">
                      <td className="p-3 align-top h-12">
                        <input type="checkbox" disabled className="opacity-0" />
                      </td>
                      <td className="p-3 align-top h-12">&nbsp;</td>
                      <td className="p-3 align-top h-12">&nbsp;</td>
                      <td className="p-3 align-top h-12">&nbsp;</td>
                      <td className="p-3 align-top h-12">&nbsp;</td>
                      <td className="p-3 align-top h-12">&nbsp;</td>
                      <td className="p-3 align-top h-12">&nbsp;</td>
                      <td className="p-3 align-top h-12">&nbsp;</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
            <div>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center px-3 py-2 border rounded-md bg-white text-sm disabled:opacity-50 text-black"
              >
                ← Previous
              </button>
            </div>

            <div className="flex-1 flex justify-center text-black">
              <nav
                className="inline-flex items-center gap-2"
                aria-label="Pagination"
              >
                {makePageButtons().map((pbtn, idx) => {
                  if (pbtn === "left-ellipsis" || pbtn === "right-ellipsis") {
                    return (
                      <span
                        key={String(pbtn) + idx}
                        className="px-2 py-1 text-sm text-gray-400"
                      >
                        …
                      </span>
                    );
                  }

                  const isActive = pbtn === page;
                  return (
                    <button
                      key={pbtn}
                      onClick={() => setPage(pbtn)}
                      className={`px-3 py-1 text-black rounded-md text-sm border ${
                        isActive
                          ? "bg-[#0ea5d7] text-white"
                          : "bg-white text-black"
                      } hover:shadow-sm`}
                    >
                      {pbtn}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <button
                disabled={page === pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="inline-flex items-center px-3 py-2 border rounded-md bg-white text-sm disabled:opacity-50 text-black"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
        </section>
      </div>

      {/* Detail modal */}
      {showDetailId && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-[#0E2F43]/30"
            onClick={() => {
              setShowDetailId(null);
              dispatch(clearCurrentVerification());
            }}
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col overflow-hidden bg-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 px-6 py-5">
              <h3 className="text-lg font-medium">Verification Detail</h3>
              <button
                className="text-gray-500"
                onClick={() => {
                  setShowDetailId(null);
                  dispatch(clearCurrentVerification());
                }}
              >
                &times;
              </button>
            </div>
            <div className="mt-4 flex-1 overflow-y-auto px-6">
              {currentLoading ? (
                <div>Loading...</div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-medium">{current?.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">
                        Verification Type
                      </div>
                      <div className="font-medium">
                        {current?.verification_type}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">
                        Payment Option
                      </div>
                      <div className="font-medium">
                        {current?.payment_option}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">
                        Payment Status
                      </div>
                      <div className="font-medium">
                        <AdminStatusTag value={current?.payment_status} />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="font-medium">
                        <AdminStatusTag value={current?.status} />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Last Updated</div>
                      <div className="font-medium">
                        {current?.last_updated
                          ? dayjs(current.last_updated).format("DD-MM-YYYY")
                          : ""}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">Feedback</div>
                    <div className="font-medium">{current?.feedback}</div>
                  </div>
                  {current?.government_id_url && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-500">Government ID</div>
                      <VerificationDocumentPreview url={current.government_id_url} />
                    </div>
                  )}
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">
                      Upload Government ID
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <input type="file" id="gov-upload" className="text-sm" />
                      <button
                        className="px-4 py-2 bg-[#0d99c9] text-white rounded"
                        onClick={async () => {
                          const inp = document.getElementById("gov-upload");
                          if (!inp || !inp.files || inp.files.length === 0) {
                            alert("Please select a file to upload");
                            return;
                          }
                          const file = inp.files[0];
                          try {
                            const res = await dispatch(
                              uploadVerificationId(file),
                            );
                            // thunk returns fulfilled action or rejected action object
                            if (res && res.payload && res.payload.message) {
                              alert(res.payload.message);
                            } else if (
                              res &&
                              res.payload &&
                              typeof res.payload === "string"
                            ) {
                              alert(res.payload);
                            } else if (res && res.error && res.error.message) {
                              alert(res.error.message);
                            } else {
                              alert("Upload completed");
                            }
                          } catch (err) {
                            console.error(err);
                            alert("Upload failed");
                          }
                        }}
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 flex justify-end gap-2">
              {actionError && (
                <div className="text-red-600 mr-auto">
                  {typeof actionError === "string"
                    ? actionError
                    : actionError?.status ||
                      actionError?.error ||
                      actionError?.message ||
                      "Action failed"}
                </div>
              )}
              {actionSuccess && (
                <div className="text-green-600 mr-auto">
                  {typeof actionSuccess === "string"
                    ? actionSuccess
                    : actionSuccess?.status ||
                      actionSuccess?.message ||
                      "Success"}
                </div>
              )}
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowDetailId(null);
                  dispatch(clearCurrentVerification());
                }}
              >
                Close
              </button>
              <button
                className="btn btn-error"
                onClick={() =>
                  dispatch(
                    postVerificationAction({
                      id: showDetailId,
                      action: "reject",
                      feedback: "Rejected by admin",
                    }),
                  )
                }
                disabled={actionLoading}
              >
                {actionLoading ? "Rejecting..." : "Reject"}
              </button>
              <button
                className="btn btn-warning"
                onClick={() => setShowManualPaymentModal(true)}
                disabled={actionLoading}
              >
                Mark Manual Payment
              </button>
              <button
                className="btn btn-primary"
                onClick={() =>
                  dispatch(
                    postVerificationAction({
                      id: showDetailId,
                      action: "approve",
                    }),
                  )
                }
                disabled={actionLoading}
              >
                {actionLoading ? "Approving..." : "Approve"}
              </button>
              <button className="btn btn-outline" onClick={() => dispatch(postVerificationAction({ id: showDetailId, action: "message" }))} disabled={actionLoading}>Message</button>
              <button className="btn btn-outline" onClick={() => dispatch(postVerificationAction({ id: showDetailId, action: "re_upload" }))} disabled={actionLoading}>Request re-upload</button>
              <button className="btn btn-outline" onClick={() => dispatch(postVerificationAction({ id: showDetailId, action: "send_prompt" }))} disabled={actionLoading}>Send prompt</button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Payment Modal */}
      {showManualPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Mark Manual Payment</h3>
              <button
                className="text-gray-500"
                onClick={() => setShowManualPaymentModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={manualPaymentData.payment_method}
                  onChange={(e) =>
                    setManualPaymentData({
                      ...manualPaymentData,
                      payment_method: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={manualPaymentData.payment_received_date}
                  onChange={(e) =>
                    setManualPaymentData({
                      ...manualPaymentData,
                      payment_received_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Reference / Receipt Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., TXN123456 or Receipt #789"
                  value={manualPaymentData.payment_reference}
                  onChange={(e) =>
                    setManualPaymentData({
                      ...manualPaymentData,
                      payment_reference: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  placeholder="Add any notes about this manual payment verification..."
                  value={manualPaymentData.notes}
                  onChange={(e) =>
                    setManualPaymentData({
                      ...manualPaymentData,
                      notes: e.target.value,
                    })
                  }
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setShowManualPaymentModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  dispatch(
                    postVerificationAction({
                      id: showDetailId,
                      action: "approve",
                      manualPayment: {
                        payment_verified_manually: true,
                        manual_payment_method: manualPaymentData.payment_method,
                        manual_payment_date:
                          manualPaymentData.payment_received_date,
                        manual_payment_reference:
                          manualPaymentData.payment_reference,
                        manual_payment_notes: manualPaymentData.notes,
                      },
                    }),
                  );
                  setShowManualPaymentModal(false);
                  setManualPaymentData({
                    payment_method: "bank_transfer",
                    payment_received_date: "",
                    payment_reference: "",
                    notes: "",
                  });
                }}
                disabled={
                  actionLoading || !manualPaymentData.payment_received_date
                }
              >
                {actionLoading ? "Approving..." : "Approve & Mark Paid"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfileVerificationProvider;
