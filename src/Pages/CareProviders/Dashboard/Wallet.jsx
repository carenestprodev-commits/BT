import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { FaWallet } from "react-icons/fa";
import { BsDownload } from "react-icons/bs";
import Pattern from "../../../../public/pattern.svg";
import { useDispatch, useSelector } from 'react-redux'
import { fetchWalletDashboard, fetchWalletHistory } from '../../../Redux/ProviderWallet'
function Wallet() {
 

  const dispatch = useDispatch()
  const { dashboard, history, loading } = useSelector(s => s.providerWallet || { dashboard: { current_balance: 0, total_hours: 0 }, history: [], loading: false })

  useEffect(() => {
    dispatch(fetchWalletDashboard())
    dispatch(fetchWalletHistory())
  }, [dispatch])

  // Debug logging so you can inspect what the API returned in browser console
  useEffect(() => {
    console.debug('ProviderWallet dashboard:', dashboard)
    console.debug('ProviderWallet history length:', history && history.length)
    console.debug('ProviderWallet loading:', loading)
  }, [dashboard, history, loading])

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar active="Wallet" />
      <div className="flex-1 font-sfpro px-8 py-8 ml-64">
        <button className="mb-8 text-gray-500 hover:text-gray-700 text-2xl font-bold" onClick={() => window.history.back()}>
          ←
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">Wallet History</h2>
        <div className="bg-[#eaf6fb] rounded-xl p-8 mb-8 flex flex-col items-center" style={{backgroundImage: `url(${Pattern})`}}>
          <div className="flex w-full justify-between items-center mb-6">
            <div className="text-4xl font-bold text-[#0093d1] flex items-center">
              <img src="/NiCurrency.svg" alt="Naira" className="inline-block align-middle mr-2 w-8 h-8" />
              {dashboard && typeof dashboard.current_balance !== 'undefined' ? Number(dashboard.current_balance).toLocaleString() : '0.00'}
            </div>
            <div className="text-5xl font-semibold text-[#0093d1]">{dashboard && typeof dashboard.total_hours !== 'undefined' ? dashboard.total_hours : 0}</div>
          </div>
          <div className="flex w-full justify-between items-center mb-6">
            <div className="text-gray-500 text-base">New Care Providers request</div>
            <div className="text-gray-500 text-base">Total hours</div>
          </div>
          <button className="w-full bg-[#0093d1] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition">Withdraw Fund</button>
        </div>


        <div className="flex gap-2 mb-6">
          <div className="flex w-full items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for amount"
                  className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none"
                  
                />
               
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-500 text-sm mr-2" style={{ color: '#888' }}>Date</label>
              <input
                type="date"
                className="border border-gray-200 rounded-md px-3 py-3 text-gray-700 text-sm focus:outline-none cursor-pointer"
                style={{ backgroundColor: '#fff', color: '#333', borderColor: '#e5e7eb' }}
                onFocus={e => e.target.showPicker && e.target.showPicker()}
              />
            </div>
            <button className="bg-[#0093d1] text-white px-6 rounded-md font-semibold py-2 hover:bg-[#007bb0]">Search</button>
          <button
  className="border border-[#0093d1] rounded-md px-3 py-3 text-[#0093d1] flex items-center justify-center hover:bg-[#0093d1] hover:text-white transition-colors duration-300 ease-in-out"
>
  <BsDownload />
</button>

          </div>
        </div>
        {/* Transactions header */}
        <div className="mb-4 bg-white border border-gray-100 rounded-lg px-6 py-3 flex items-center justify-between">
          <div className="font-medium text-gray-700">Transaction</div>
          <div className="text-gray-500 text-sm">Date</div>
          <div className="text-gray-700 font-medium">Amount</div>
        </div>
        <div>
          {loading && <div className="text-sm text-gray-500 mb-4">Loading...</div>}
          {(!history || history.length === 0) ? (
            <div className="text-center text-gray-500 py-8">No transactions yet.</div>
          ) : (
            history.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-6 py-4 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`bg-[#eaf6fb] rounded-full p-2 text-[#0093d1]`}><FaWallet /></span>
                  <span className="font-medium text-gray-700">{tx.transaction_title}</span>
                </div>
                <span className="text-gray-400 text-xs">{tx.transaction_date ? new Date(tx.transaction_date).toLocaleString() : ''}</span>
                <span
                  className="font-semibold flex items-center"
                  style={{ color: Number(tx.amount) >= 0 ? '#378c37' : '#a37c39' }}
                >
                  <img src="/NiCurrency.svg" alt="Naira" className="inline-block align-middle mr-1 w-4 h-4" />
                  {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Wallet;
