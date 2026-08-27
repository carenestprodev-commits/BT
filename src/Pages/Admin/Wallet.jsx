import { useEffect, useState } from "react";
import { LoaderCircle, Search, WalletCards, X } from "lucide-react";
import AdminPagination from "../../Components/Admin/AdminPagination";
import { useAdminCollection } from "../../hooks/useAdminCollection";
import { deductAdminWallet } from "../../Redux/AdminWallet";
import {
  WALLET_REASON_OPTIONS,
  formatDateTime,
  money,
} from "./walletUtils";

const inputClass =
  "w-full rounded-lg border border-[#ccdce6] bg-white px-3 py-2.5 text-sm text-[#234258] outline-none focus:border-[#1686a5]";

function AdminWallet() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState(WALLET_REASON_OPTIONS[0][0]);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const collection = useAdminCollection({
    path: "/api/admin/wallets/",
    pageSize: 20,
    params: {
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(role ? { user_type: role } : {}),
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
  }, [role, search, setPage]);

  const openDeduction = (user) => {
    setSelectedUser(user);
    setAmount("");
    setReason(WALLET_REASON_OPTIONS[0][0]);
    setDescription("");
    setFormError("");
  };

  const closeDeduction = () => {
    if (!saving) setSelectedUser(null);
  };

  const submitDeduction = async (event) => {
    event.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    setFormError("");
    try {
      await deductAdminWallet({
        userId: selectedUser.id,
        amount,
        reason,
        description: description.trim(),
      });
      await collection.reload();
      setSelectedUser(null);
    } catch (submitError) {
      setFormError(submitError.message || "Unable to deduct from this wallet.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full px-4 py-5 sm:px-8 sm:py-7">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#0E2F43]">Wallets</h1>
          <p className="text-sm text-slate-500">
            View user balances and record admin deductions.
          </p>
        </div>

        <section className="overflow-hidden bg-white shadow-[0_8px_30px_rgba(28,66,88,0.04)]">
          <div className="flex flex-col gap-3 border-b border-[#e8eff4] p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#ccdce6] px-3 py-2 sm:max-w-md">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email"
                className="min-w-0 flex-1 text-sm text-[#234258] outline-none placeholder:text-slate-400"
                aria-label="Search wallets"
              />
            </label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className={inputClass + " sm:w-48"}
              aria-label="Filter wallets by user type"
            >
              <option value="">All users</option>
              <option value="provider">Care providers</option>
              <option value="seeker">Care seekers</option>
            </select>
          </div>

          {error && (
            <p className="px-5 py-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="bg-[#f8fbfc] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-3 py-3 font-semibold">Type</th>
                  <th className="px-3 py-3 font-semibold">Available balance</th>
                  <th className="px-3 py-3 font-semibold">Reserved</th>
                  <th className="px-3 py-3 font-semibold">Updated</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f5]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-slate-500">
                      <LoaderCircle className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-slate-500">
                      No wallets found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const available = Number(row.available_balance || 0);
                    return (
                      <tr key={row.id} className="text-[#344054]">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#234258]">
                            {row.full_name || "Unnamed user"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{row.email}</p>
                        </td>
                        <td className="px-3 py-4">
                          <span className="rounded-full bg-[#edf8fa] px-2.5 py-1 text-xs font-semibold text-[#16758d]">
                            {row.user_type_label || row.user_type}
                          </span>
                        </td>
                        <td className="px-3 py-4 font-semibold text-[#16758d]">
                          {money(row.available_balance)}
                        </td>
                        <td className="px-3 py-4 text-slate-500">
                          {money(row.reserved_balance)}
                        </td>
                        <td className="px-3 py-4 text-slate-500">
                          {formatDateTime(row.wallet_updated_at)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            disabled={available <= 0}
                            onClick={() => openDeduction(row)}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#0f708a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0b5b70] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                          >
                            <WalletCards className="h-4 w-4" />
                            {available > 0 ? "Deduct" : "No funds"}
                          </button>
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

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#06172c]/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDeduction();
          }}
        >
          <form
            onSubmit={submitDeduction}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deduct-wallet-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="deduct-wallet-title" className="text-lg font-bold text-[#0E2F43]">
                  Deduct from wallet
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedUser.full_name || selectedUser.email}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDeduction}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close deduction form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-lg bg-[#f5fafb] px-4 py-3 text-sm text-[#234258]">
              Available balance:{" "}
              <span className="font-bold">{money(selectedUser.available_balance)}</span>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-[#344054]">
                Amount
                <input
                  required
                  min="0.01"
                  step="0.01"
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className={inputClass + " mt-1.5"}
                  placeholder="0.00"
                />
              </label>
              <label className="block text-sm font-semibold text-[#344054]">
                Reason
                <select
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className={inputClass + " mt-1.5"}
                >
                  {WALLET_REASON_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-[#344054]">
                {reason === "other" ? "Description" : "Description (optional)"}
                <textarea
                  required={reason === "other"}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className={inputClass + " mt-1.5 min-h-24 resize-y"}
                  placeholder={
                    reason === "other"
                      ? "Explain what this deduction is for"
                      : "Add context for the ledger"
                  }
                />
              </label>
            </div>

            {formError && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {formError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeduction}
                disabled={saving}
                className="rounded-lg border border-[#ccdce6] px-4 py-2.5 text-sm font-semibold text-[#234258] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  saving ||
                  !amount ||
                  Number(amount) <= 0 ||
                  (reason === "other" && !description.trim())
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[#0f708a] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {saving ? "Saving..." : "Confirm deduction"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminWallet;
