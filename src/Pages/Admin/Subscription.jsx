import React, { useMemo, useState, useEffect } from 'react';
import { FaSearch, FaDownload, FaChevronDown } from 'react-icons/fa';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubscriptions, fetchSubscriptionById, clearCurrentSubscription } from '../../Redux/AdminSubscription';

function Subscription() {
  const dispatch = useDispatch();
  const { subscriptions, current } = useSelector(s => s.adminSubscription || { subscriptions: [], current: null });
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  // detail modal will use `current` from the adminSubscription slice

  useEffect(() => {
    dispatch(fetchSubscriptions())
  }, [dispatch])

  useEffect(() => {
    // map API subscriptions into the local rows shape used by the UI
    if (Array.isArray(subscriptions)) {
      const mapped = subscriptions.map(s => ({
        id: s.id,
        name: (s.user && (s.user.first_name || s.user.last_name)) ? `${s.user.first_name || ''} ${s.user.last_name || ''}`.trim() : (s.user?.email || s.user?.username || `User-${s.id}`),
        role: s.user?.is_provider ? 'Care Providers' : 'Care Seekers',
        plan: s.plan || s.subscription_plan || 'Unknown',
        amount: s.amount ? String(s.amount) : s.price ? String(s.price) : '0.00',
        start: s.start_date ? dayjs(s.start_date).format('DD-MM-YYYY') : (s.start ? dayjs(s.start).format('DD-MM-YYYY') : ''),
        end: s.end_date ? dayjs(s.end_date).format('DD-MM-YYYY') : (s.end ? dayjs(s.end).format('DD-MM-YYYY') : ''),
        raw: s,
      }))
      setRows(mapped)
    }
  }, [subscriptions])

  const filtered = useMemo(() => {
    let data = [...rows];
    if (q.trim()) {
      const t = q.toLowerCase();
      data = data.filter(r => r.name.toLowerCase().includes(t));
    }
    if (roleFilter !== 'All') data = data.filter(r => r.role === roleFilter);
    if (planFilter !== 'All') data = data.filter(r => r.plan === planFilter);
    if (date) data = data.filter(r => r.start === dayjs(date).format('DD-MM-YYYY'));
    return data;
  }, [rows, q, roleFilter, planFilter, date]);

  function downloadCSV() {
    const csv = [
      ['Name','User Role','Plan','Amount','Start Date','End Date'],
      ...filtered.map(r => [r.name, r.role, r.plan, r.amount, r.start, r.end]),
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'subscriptions.csv'; a.click(); URL.revokeObjectURL(url);
  }

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page-1)*pageSize, page*pageSize);

  const pageCount = totalPages;
  const makePageButtons = () => {
    const pages = []
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 4) pages.push('left-ellipsis')
      const start = Math.max(2, page - 2)
      const end = Math.min(pageCount - 1, page + 2)
      for (let i = start; i <= end; i++) pages.push(i)
      if (page < pageCount - 3) pages.push('right-ellipsis')
      pages.push(pageCount)
    }
    return pages
  }

  return (
    <div className="p-6 text-black bg-white">
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center bg-white rounded-md px-3 py-2 shadow-sm text-black">
            <FaSearch className="text-slate-400 mr-2" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="search care provider" className="outline-none w-full text-sm bg-white text-black" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="appearance-none px-4 py-2 border rounded-md text-sm bg-white text-black pr-8">
              <option value="All">Role</option>
              <option value="Care Providers">Care Providers</option>
              <option value="Care Seekers">Care Seekers</option>
            </select>
            <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="appearance-none px-4 py-2 border rounded-md text-sm bg-white text-black pr-8">
              <option value="All">Subscription Plan</option>
              <option value="Free">Free</option>
              <option value="Premium">Premium</option>
            </select>
            <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex items-center px-4 py-2 border rounded-md text-sm bg-white text-black gap-2">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="outline-none text-sm text-black bg-white" />
          </div>

          <button onClick={downloadCSV} className="px-3 py-2 border rounded-md flex items-center justify-center" aria-label="download">
            <FaDownload className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md shadow-sm overflow-hidden text-black">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="p-3"><input type="checkbox" /></th>
              <th className="p-3 text-left">User Name</th>
              <th className="p-3 text-left">User Role</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Start Date</th>
              <th className="p-3 text-left">End Date</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-b last:border-b-0 hover:bg-slate-50 cursor-pointer" onClick={() => { dispatch(fetchSubscriptionById(r.id)); }}>
                <td className="p-3"><input onClick={e => e.stopPropagation()} type="checkbox" /></td>
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3">{r.role}</td>
                <td className="p-3">{r.plan}</td>
                <td className="p-3">{r.amount}</td>
                <td className="p-3">{r.start}</td>
                <td className="p-3">{r.end}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <button disabled={page===1} onClick={() => setPage(p => Math.max(1, p-1))} className="inline-flex items-center px-3 py-2 border rounded-md bg-white text-sm disabled:opacity-50 text-black">← Previous</button>
        </div>

        <div className="flex-1 flex justify-center text-black">
          <nav className="inline-flex items-center gap-2" aria-label="Pagination">
            {makePageButtons().map((pbtn, idx) => {
              if (pbtn === 'left-ellipsis' || pbtn === 'right-ellipsis') {
                return (
                  <span key={String(pbtn) + idx} className="px-2 py-1 text-sm text-gray-400">…</span>
                )
              }

              const isActive = pbtn === page
              return (
                <button
                  key={pbtn}
                  onClick={() => setPage(pbtn)}
                  className={`px-3 py-1 text-black rounded-md text-sm border ${isActive ? 'bg-[#0ea5d7] text-white' : 'bg-white text-black'} hover:shadow-sm`}
                >
                  {pbtn}
                </button>
              )
            })}
          </nav>
        </div>

        <div>
          <button disabled={page===totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))} className="inline-flex items-center px-3 py-2 border rounded-md bg-white text-sm disabled:opacity-50 text-black">Next →</button>
        </div>
      </div>

      {/* Details modal (driven from Redux current subscription) */}
      {current && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div className="absolute inset-0 bg-black/30" onClick={() => dispatch(clearCurrentSubscription())} />
          <div className="relative bg-white w-[340px] rounded-lg shadow-lg p-6 z-50 max-h-[80vh] flex flex-col">
            <button className="absolute right-3 top-3 text-slate-400 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center" onClick={() => dispatch(clearCurrentSubscription())}>✕</button>
            <h3 className="text-lg font-medium mb-4">Details</h3>
            <div className="flex-1 overflow-y-auto text-sm text-slate-700 space-y-3 pr-2">
              <div className="flex justify-between py-2 border-b"><span className="text-slate-500">Name</span><span className="text-right">{(current.user && (current.user.first_name || current.user.last_name)) ? `${current.user.first_name || ''} ${current.user.last_name || ''}`.trim() : (current.user?.email || current.user?.username || `User-${current.id}`)}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-slate-500">Role</span><span className="text-right">{current.user?.is_provider ? 'Care Providers' : 'Care Seekers'}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-slate-500">Plan</span><span className="text-right">{current.plan || current.subscription_plan || 'Unknown'}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-slate-500">Amount</span><span className="text-right">{current.amount ?? current.price ?? '0.00'}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-slate-500">Start Date</span><span className="text-right">{current.start_date ? dayjs(current.start_date).format('DD-MM-YYYY') : (current.start ? dayjs(current.start).format('DD-MM-YYYY') : '')}</span></div>
              <div className="flex justify-between py-2"><span className="text-slate-500">End Date</span><span className="text-right">{current.end_date ? dayjs(current.end_date).format('DD-MM-YYYY') : (current.end ? dayjs(current.end).format('DD-MM-YYYY') : '')}</span></div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Subscription;
