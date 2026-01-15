/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { FaWallet, FaTimes } from "react-icons/fa";
import { BsDownload } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWalletDashboard,
  fetchWalletHistory,
} from "../../../Redux/ProviderWallet";
import { BASE_URL, getAuthHeaders } from "../../../Redux/config";

// Modal Component for Date Filter
function DateFilterModal({ isOpen, onClose, onApply }) {
  const [activeTab, setActiveTab] = useState("custom");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (!isOpen) return null;

  const handleView = () => {
    onApply({ startDate, endDate, period: activeTab });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FaTimes />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Wallet History</h2>

          <div className="flex gap-2 mb-6">
            <button
              className={`px-4 py-2 rounded ${
                activeTab === "custom"
                  ? "border-2 border-[#0093d1] text-[#0093d1]"
                  : "border border-gray-300 text-gray-600"
              }`}
              onClick={() => setActiveTab("custom")}
            >
              Custom Period
            </button>
            <button
              className={`px-4 py-2 rounded ${
                activeTab === "thisWeek"
                  ? "border-2 border-[#0093d1] text-[#0093d1]"
                  : "border border-gray-300 text-gray-600"
              }`}
              onClick={() => setActiveTab("thisWeek")}
            >
              This Week
            </button>
            <button
              className={`px-4 py-2 rounded ${
                activeTab === "lastWeek"
                  ? "border-2 border-[#0093d1] text-[#0093d1]"
                  : "border border-gray-300 text-gray-600"
              }`}
              onClick={() => setActiveTab("lastWeek")}
            >
              Last Week
            </button>
          </div>

          {activeTab === "custom" && (
            <>
              <div className="mb-4">
                <input
                  type="date"
                  placeholder="Start date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#0093d1]"
                />
              </div>

              <div className="mb-6">
                <input
                  type="date"
                  placeholder="End date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#0093d1]"
                />
              </div>
            </>
          )}

          <button
            onClick={handleView}
            className="w-full bg-[#0093d1] text-white py-3 rounded font-semibold hover:bg-[#007bb0] mb-3"
          >
            View
          </button>

          <button
            onClick={() => {}}
            className="w-full border border-[#0093d1] text-[#0093d1] py-3 rounded font-semibold hover:bg-[#0093d1] hover:text-white transition"
          >
            Download ↓
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal Component for Transaction Details
function TransactionDetailsModal({ isOpen, onClose, transaction }) {
  if (!isOpen || !transaction) return null;

  const generatePDF = () => {
    const content = `
      Transaction Receipt
      
      Transaction Number: ${transaction.id || "N/A"}
      Status: ${transaction.transaction_title || "N/A"}
      Transaction Date: ${
        transaction.transaction_date
          ? new Date(transaction.transaction_date).toLocaleDateString()
          : "N/A"
      }
      Transaction Time: ${
        transaction.transaction_date
          ? new Date(transaction.transaction_date).toLocaleTimeString()
          : "N/A"
      }
      Amount Paid: ₦${Number(transaction.amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    `;

    alert(
      "PDF download functionality would be implemented here with a proper PDF library like jsPDF"
    );
    console.log(content);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FaTimes />
        </button>

        <div className="p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={onClose}
              className="mr-3 text-gray-600 hover:text-gray-800"
            >
              ←
            </button>
            <h2 className="text-xl font-semibold">Details</h2>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Transaction Number</span>
              <span className="text-gray-800 font-medium">
                #{transaction.id || "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Status</span>
              <span className="text-[#0093d1] font-medium">
                {transaction.transaction_title || "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Transaction Date</span>
              <span className="text-gray-800">
                {transaction.transaction_date
                  ? new Date(transaction.transaction_date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )
                  : "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Transaction Time</span>
              <span className="text-gray-800">
                {transaction.transaction_date
                  ? new Date(transaction.transaction_date).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )
                  : "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-gray-500 text-sm">Amount Paid</span>
              <span className="text-gray-800 font-bold text-lg">
                ₦
                {Number(transaction.amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <button
            onClick={generatePDF}
            className="w-full border border-[#0093d1] text-[#0093d1] py-3 rounded font-semibold hover:bg-[#0093d1] hover:text-white transition"
          >
            Download ↓
          </button>
        </div>
      </div>
    </div>
  );
}

function Wallet() {
  const dispatch = useDispatch();
  const { dashboard, history, loading } = useSelector(
    (s) =>
      s.providerWallet || {
        dashboard: { current_balance: 0, total_hours: 0 },
        history: [],
        loading: false,
      }
  );

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    dispatch(fetchWalletDashboard());
    dispatch(fetchWalletHistory());
  }, [dispatch]);

  const handleDateFilter = (filterData) => {
    console.log("Filter data:", filterData);
    // Implement filtering logic here
  };

  const handleSearch = () => {
    console.log("Searching for:", searchTerm);
    // Implement search logic here
  };

  const filteredHistory =
    history?.filter(
      (tx) =>
        tx.amount?.toString().includes(searchTerm) ||
        tx.transaction_title?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="flex min-h-screen bg-white font-sfpro">
      <Sidebar active="Wallet" />
      <div className="flex-1 md:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header */}
          <div className="flex items-center mb-6 lg:mb-8">
            <button
              className="mr-3 text-gray-600 hover:text-gray-800 text-xl"
              onClick={() => window.history.back()}
            >
              ←
            </button>
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">
              Wallet History
            </h2>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-[#e0f4fb] to-[#d0ecf7] rounded-xl p-6 lg:p-8 mb-6 lg:mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
              {/* Balance Section */}
              <div className="mb-4 lg:mb-0 w-full lg:w-auto">
                <div className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#0093d1] flex items-center">
                  <span className="mr-2">₦</span>
                  {dashboard && typeof dashboard.current_balance !== "undefined"
                    ? Number(dashboard.current_balance).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )
                    : "0.00"}
                </div>
                <div className="text-gray-600 text-sm lg:text-base mt-2">
                  New Care Providers request
                </div>
              </div>

              {/* Vertical Divider - Hidden on mobile */}
              <div className="hidden lg:block w-px h-20 bg-gray-300 mx-8"></div>

              {/* Hours Section */}
              <div className="w-full lg:w-auto text-left lg:text-right">
                <div className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#0093d1]">
                  {dashboard && typeof dashboard.total_hours !== "undefined"
                    ? dashboard.total_hours
                    : 0}
                </div>
                <div className="text-gray-600 text-sm lg:text-base mt-2">
                  Total hours
                </div>
              </div>
            </div>

            {/* Withdraw Button */}
            <button
              className={`w-full bg-[#0093d1] text-white py-3 lg:py-4 rounded-lg font-semibold hover:bg-[#007bb0] transition ${
                isWithdrawing ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={async () => {
                try {
                  setIsWithdrawing(true);
                  const raw = localStorage.getItem("user");
                  let country = "";
                  if (raw) {
                    try {
                      const u = JSON.parse(raw);
                      country = (u.country || "").toString().toLowerCase();
                    } catch {
                      country = "";
                    }
                  }

                  const payment_method =
                    country === "nigeria" ? "paystack" : "stripe";

                  const res = await fetch(
                    `${BASE_URL}/api/payments/wallet/request-payout/`,
                    {
                      method: "POST",
                      headers: getAuthHeaders(),
                      body: JSON.stringify({ payment_method }),
                    }
                  );

                  if (!res.ok) {
                    const txt = await res.text();
                    alert(`Failed to request payout: ${txt}`);
                    setIsWithdrawing(false);
                    return;
                  }

                  const data = await res.json();
                  const url =
                    data &&
                    (data.onboarding_url || data.onboardingUrl || data.url);
                  if (url) {
                    window.open(url, "_blank");
                  } else {
                    alert("No onboarding URL returned from server.");
                  }
                } catch (err) {
                  console.error("request-payout error", err);
                  alert("An error occurred while requesting payout.");
                } finally {
                  setIsWithdrawing(false);
                }
              }}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? "Please wait..." : "Withdraw Fund"}
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col lg:flex-row gap-3 mb-6">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Search for amount"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:border-[#0093d1]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDateModalOpen(true)}
                className="flex-1 lg:flex-none border border-gray-300 rounded-lg px-4 py-3 text-gray-600 text-sm hover:border-[#0093d1] focus:outline-none whitespace-nowrap"
              >
                Date 📅
              </button>

              <button
                onClick={handleSearch}
                className="flex-1 lg:flex-none bg-[#0093d1] text-white px-6 lg:px-8 py-3 rounded-lg font-semibold hover:bg-[#007bb0] text-sm"
              >
                Search
              </button>

              <button className="border border-[#0093d1] rounded-lg px-4 py-3 text-[#0093d1] flex items-center justify-center hover:bg-[#0093d1] hover:text-white transition">
                <BsDownload />
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {loading && (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            )}

            {!loading && (!filteredHistory || filteredHistory.length === 0) ? (
              <div className="text-center text-gray-500 py-12">
                No transactions yet.
              </div>
            ) : (
              filteredHistory.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => {
                    setSelectedTransaction(tx);
                    setIsDetailsModalOpen(true);
                  }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-gray-200 rounded-lg px-4 lg:px-6 py-4 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <span className="bg-green-50 rounded-full p-2 text-green-600">
                      <FaWallet />
                    </span>
                    <span className="font-medium text-gray-800 text-sm lg:text-base">
                      {tx.transaction_title}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 w-full sm:w-auto">
                    <span className="text-gray-400 text-xs lg:text-sm">
                      {tx.transaction_date
                        ? new Date(tx.transaction_date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            }
                          ) +
                          " | " +
                          new Date(tx.transaction_date).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )
                        : ""}
                    </span>

                    <span
                      className="font-bold text-base lg:text-lg"
                      style={{
                        color: Number(tx.amount) >= 0 ? "#22c55e" : "#ef4444",
                      }}
                    >
                      ₦
                      {Number(tx.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DateFilterModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onApply={handleDateFilter}
      />

      <TransactionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
}

export default Wallet;
