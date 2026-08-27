import { useEffect, useState } from "react";
import { LoaderCircle, Search } from "lucide-react";
import AdminPagination from "../../Components/Admin/AdminPagination";
import { useAdminCollection } from "../../hooks/useAdminCollection";
import {
  WALLET_REASON_OPTIONS,
  formatDateTime,
  humanize,
  money,
} from "./walletUtils";

const inputClass =
  "w-full rounded-lg border border-[#ccdce6] bg-white px-3 py-2.5 text-sm text-[#234258] outline-none focus:border-[#1686a5]";

function AdminWalletTransactions() {
  const [search, setSearch] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [deductionReason, setDeductionReason] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  const collection = useAdminCollection({
    path: "/api/admin/wallet-transactions/",
    pageSize: 20,
    params: {
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(transactionType ? { transaction_type: transactionType } : {}),
      ...(deductionReason ? { deduction_reason: deductionReason } : {}),
      ...(status ? { status } : {}),
      ...(date ? { date } : {}),
    },
  });
  const {
    rows,
    page,
    setPage,
    count,
    pageSize,
    totalPages,
    loading,
    error,
  } = collection;

  useEffect(() => {
    setPage(1);
  }, [date, deductionReason, search, setPage, status, transactionType]);

  return (
    <div className="min-h-full px-4 py-5 sm:px-8 sm:py-7">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#0E2F43]">
            Wallet transactions
          </h1>
          <p className="text-sm text-slate-500">
            Review every wallet movement, including admin deductions.
          </p>
        </div>

        <section className="overflow-hidden bg-white shadow-[0_8px_30px_rgba(28,66,88,0.04)]">
          <div className="grid gap-3 border-b border-[#e8eff4] p-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="flex min-w-0 items-center gap-2 rounded-lg border border-[#ccdce6] px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search user or description"
                className="min-w-0 flex-1 text-sm text-[#234258] outline-none placeholder:text-slate-400"
                aria-label="Search wallet transactions"
              />
            </label>
            <select
              value={transactionType}
              onChange={(event) => setTransactionType(event.target.value)}
              className={inputClass}
              aria-label="Filter transaction type"
            >
              <option value="">All movements</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="fee_deduction">Fee deductions</option>
            </select>
            <select
              value={deductionReason}
              onChange={(event) => setDeductionReason(event.target.value)}
              className={inputClass}
              aria-label="Filter deduction reason"
            >
              <option value="">All deduction reasons</option>
              {WALLET_REASON_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className={inputClass}
              aria-label="Filter transaction status"
            >
              <option value="">All statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={inputClass}
              aria-label="Filter transactions by date"
            />
          </div>

          {error && (
            <p className="px-5 py-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="bg-[#f8fbfc] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-3 py-3 font-semibold">Movement</th>
                  <th className="px-3 py-3 font-semibold">Amount</th>
                  <th className="px-3 py-3 font-semibold">Reason</th>
                  <th className="px-3 py-3 font-semibold">Description</th>
                  <th className="px-3 py-3 font-semibold">Recorded by</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f5]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-slate-500">
                      <LoaderCircle className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-slate-500">
                      No wallet transactions found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const isDebit =
                      row.transaction_type === "fee_deduction" ||
                      row.transaction_type === "withdrawal";
                    return (
                      <tr key={row.id} className="text-[#344054]">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#234258]">
                            {row.user_name || "Unnamed user"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.user_email}
                          </p>
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={
                              isDebit
                                ? "rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
                                : "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                            }
                          >
                            {row.transaction_type_label ||
                              humanize(row.transaction_type)}
                          </span>
                        </td>
                        <td
                          className={
                            isDebit
                              ? "px-3 py-4 font-semibold text-red-700"
                              : "px-3 py-4 font-semibold text-emerald-700"
                          }
                        >
                          {isDebit ? "−" : "+"}
                          {money(row.amount)}
                        </td>
                        <td className="px-3 py-4 text-slate-500">
                          {row.deduction_reason_label ||
                            (row.deduction_reason
                              ? humanize(row.deduction_reason)
                              : "—")}
                        </td>
                        <td className="max-w-[280px] px-3 py-4 text-slate-600">
                          <span title={row.description}>{row.description || "—"}</span>
                        </td>
                        <td className="px-3 py-4 text-slate-500">
                          {row.created_by_name || "System"}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          <p>{formatDateTime(row.created_at)}</p>
                          <p className="mt-1 text-xs capitalize">{row.status}</p>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <AdminPagination
            page={page}
            count={count}
            pageSize={pageSize}
            totalPages={totalPages}
            onPage={setPage}
          />
        </section>
      </div>
    </div>
  );
}

export default AdminWalletTransactions;
