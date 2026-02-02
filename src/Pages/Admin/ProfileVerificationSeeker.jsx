import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVerifications,
  fetchVerificationById,
  postVerificationAction,
  clearCurrentVerification,
} from "../../Redux/Verification";

function ProfileVerificationSeeker() {
  const dispatch = useDispatch();
  const {
    items,
    current,
    currentLoading,
    actionLoading,
    actionError,
    actionSuccess,
  } = useSelector((s) => s.verification || {});
  useEffect(() => {
    dispatch(fetchVerifications());
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

  const pageSize = 8;
  const seekerRows = (items || []).filter((x) => x.user_type === "seeker");

  const filtered = useMemo(() => {
    if (!query) return seekerRows;
    const q = query.toLowerCase();
    return seekerRows.filter((r) => (r.name || "").toLowerCase().includes(q));
  }, [seekerRows, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

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
    <div className="bg-white font-sfpro">
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-1/3">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search care provider"
            className="pl-10 pr-3 py-2 w-full rounded border border-gray-200 bg-white text-sm text-black"
          />
        </div>
      </div>

      <div className="flex flex-col min-h-[60vh]">
        <div className="overflow-hidden rounded border border-gray-100 text-black flex-1">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left w-12">
                  <input type="checkbox" />
                </th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Verification Type</th>
                <th className="p-3 text-left">Payment Option</th>
                <th className="p-3 text-left">Payment Status</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Feedback</th>
                <th className="p-3 text-left">Last Updated</th>
                <th className="p-3 text-left w-12">...</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 align-top">
                    <input type="checkbox" />
                  </td>
                  <td className="p-3 align-top font-medium text-black">
                    {r.name}
                  </td>
                  <td className="p-3 align-top text-black">
                    {r.verification_type}
                  </td>
                  <td className="p-3 align-top text-black">
                    {r.payment_option}
                  </td>
                  <td className="p-3 align-top text-black">
                    {r.payment_status}
                  </td>
                  <td className="p-3 align-top text-black">{r.status}</td>
                  <td className="p-3 align-top text-black">{r.feedback}</td>
                  <td className="p-3 align-top text-black">
                    {r.last_updated
                      ? dayjs(r.last_updated).format("DD-MM-YYYY")
                      : ""}
                  </td>
                  <td className="p-3 align-top">
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
                        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow z-10 text-sm">
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
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
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

        {showDetailId && (current || currentLoading) && (
          <div
            className={`fixed inset-0 z-40 flex items-start justify-center p-6 ${
              current ? "" : "pointer-events-none"
            }`}
          >
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => {
                dispatch(clearCurrentVerification());
                setShowDetailId(null);
              }}
            />
            <div className="relative z-50 bg-white max-w-lg w-full rounded shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 border-b flex justify-between items-start">
                <h3 className="text-lg font-medium text-black">
                  Verification Details
                </h3>
                <button
                  onClick={() => {
                    dispatch(clearCurrentVerification());
                    setShowDetailId(null);
                  }}
                  className="text-gray-400"
                >
                  ✕
                </button>
              </div>
              <div className="p-5 overflow-y-auto text-sm flex-1">
                {currentLoading && <div>Loading...</div>}
                {current && (
                  <>
                    <div className="mb-3">
                      <div className="text-gray-500 text-xs">Name</div>
                      <div className="text-gray-900">{current.name}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-gray-500 text-xs">
                        Verification Type
                      </div>
                      <div className="text-gray-900">
                        {current.verification_type}
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="text-gray-500 text-xs">
                        Payment Option
                      </div>
                      <div className="text-gray-900">
                        {current.payment_option}
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="text-gray-500 text-xs">
                        Payment Status
                      </div>
                      <div className="text-gray-900">
                        {current.payment_status}
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="text-gray-500 text-xs">Status</div>
                      <div className="text-gray-900">{current.status}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-gray-500 text-xs">Feedback</div>
                      <div className="text-gray-900">{current.feedback}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-gray-500 text-xs">Last Updated</div>
                      <div className="text-gray-900">
                        {current.last_updated
                          ? dayjs(current.last_updated).format("DD-MM-YYYY")
                          : ""}
                      </div>
                    </div>
                    {current.government_id_url && (
                      <div className="mb-3">
                        <div className="text-gray-500 text-xs">
                          Government ID
                        </div>
                        <div className="mt-2">
                          <img
                            src={current.government_id_url}
                            alt="gov-id"
                            className="max-h-60 w-auto border"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
                {actionError && (
                  <div className="text-red-600">
                    {actionError?.status ||
                      actionError?.error ||
                      "Action failed"}
                  </div>
                )}
                {actionSuccess && (
                  <div className="text-green-700">
                    {actionSuccess?.status || "Success"}
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex flex-col gap-3">
                <button
                  disabled={actionLoading}
                  onClick={() =>
                    dispatch(
                      postVerificationAction({
                        id: showDetailId,
                        action: "approve",
                      }),
                    )
                  }
                  className="w-full bg-green-600 text-white py-2 rounded"
                >
                  Approve
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => setShowManualPaymentModal(true)}
                  className="w-full bg-yellow-600 text-white py-2 rounded"
                >
                  Mark Manual Payment
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() =>
                    dispatch(
                      postVerificationAction({
                        id: showDetailId,
                        action: "reject",
                        feedback: "Image too blurry",
                      }),
                    )
                  }
                  className="w-full border border-red-600 text-red-600 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Payment Modal */}
        {showManualPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
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
                          manual_payment_method:
                            manualPaymentData.payment_method,
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
      </div>
    </div>
  );
}

export default ProfileVerificationSeeker;
