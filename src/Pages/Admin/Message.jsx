import { useMemo, useState, useEffect } from 'react'
import { FaSearch } from 'react-icons/fa'
import dayjs from 'dayjs'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNotifications, fetchNotificationById, resendNotification, archiveNotification, clearCurrentNotification, createNotification } from '../../Redux/AdminMessage'

function Message() {
  const dispatch = useDispatch()
  const { items = [], current, currentLoading } = useSelector((s) => s.adminMessage || {})
  const [query, setQuery] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [showSendModal, setShowSendModal] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [form, setForm] = useState({ title: '', body: '', audience: 'providers' })

  useEffect(() => { dispatch(fetchNotifications()) }, [dispatch])

  const filtered = useMemo(() => {
    if (!query) return items
    const q = query.toLowerCase()
    return (items || []).filter(r => (r.title || '').toLowerCase().includes(q))
  }, [items, query])

  return (
    <div className="bg-white text-black">
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-1/3">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search for notification" className="pl-10 pr-3 py-2 w-full rounded border border-gray-200 bg-white text-sm text-black" />
        </div>
        <div>
          <button onClick={() => setShowSendModal(true)} className="px-4 py-2 bg-[#0ea5d7] text-white rounded">Send Message</button>
        </div>
      </div>

      <div className="overflow-hidden rounded border border-gray-100 text-black">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left w-12"><input type="checkbox" /></th>
              <th className="p-3 text-left">Message Title</th>
              <th className="p-3 text-left">Audience</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Date Sent</th>
              <th className="p-3 text-left">Delivery Status</th>
              <th className="p-3 text-left w-12">...</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="p-3 align-top"><input type="checkbox" /></td>
                <td className="p-3 align-top font-medium text-black">{r.title}</td>
                <td className="p-3 align-top text-black">{r.audience}</td>
                <td className="p-3 align-top text-black">{r.type || r.broadcast_type}</td>
                <td className="p-3 align-top text-black">{r.sent_at ? dayjs(r.sent_at).format('DD-MM-YYYY') : ''}</td>
                <td className="p-3 align-top text-black">{r.delivery_status}</td>
                <td className="p-3 align-top">
                  <div className="relative inline-block">
                    <button onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)} className="px-2 py-1 rounded hover:bg-gray-100 text-black">•••</button>
                    {openMenuId === r.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow z-10 text-sm">
                        <ul>
                          <li onClick={() => { dispatch(fetchNotificationById(r.id)); setOpenMenuId(null) }} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-black">View</li>
                          <li onClick={() => { dispatch(resendNotification(r.id)); setOpenMenuId(null) }} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-black">Resend</li>
                          <li onClick={() => { dispatch(archiveNotification(r.id)); setOpenMenuId(null) }} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-black">Archive</li>
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

      {/* Send Message Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-black ">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowSendModal(false)} />
          <div className="relative z-50 bg-white max-w-3xl w-full rounded shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Message Title</h3>
              <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="w-full p-3 border border-gray-200 rounded mb-4 bg-white" placeholder="Input title" />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <select value={form.audience} onChange={(e) => setForm(f => ({ ...f, audience: e.target.value }))} className="p-3 border border-gray-200 rounded bg-white">
                  <option value="providers">Providers</option>
                  <option value="seekers">Seekers</option>
                  <option value="all_users">All Users</option>
                </select>
                <select className="p-3 border border-gray-200 rounded bg-white">
                  <option>Select Option</option>
                </select>
              </div>

              <textarea value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))} className="w-full p-3 border border-gray-200 rounded h-48 mb-4 bg-white" placeholder="Input message" />

              <div className="flex justify-end">
                <button onClick={() => setShowSendModal(false)} className="px-4 py-2 mr-3 border rounded">Cancel</button>
                <button onClick={async () => {
                  // submit
                  const res = await dispatch(createNotification(form))
                  if (res && res.payload) {
                    setShowSendModal(false)
                    setSuccessMsg(res.payload.message || 'Broadcast queued')
                    setTimeout(() => setSuccessMsg(''), 3000)
                    setForm({ title: '', body: '', audience: 'providers' })
                  } else {
                    setSuccessMsg('Failed to queue broadcast')
                    setTimeout(() => setSuccessMsg(''), 3000)
                  }
                }} className="px-6 py-2 bg-[#0ea5d7] text-white rounded">Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success alert */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-60">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded shadow">{successMsg}</div>
        </div>
      )}

      {/* View Notification Modal (from API) */}
      {current || currentLoading ? (
        <div className={`fixed inset-0 z-40 flex items-start justify-center p-6 ${current ? '' : 'pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/30" onClick={() => { /* leaving as no-op - clear handled elsewhere */ }} />
          <div className="relative z-50 bg-white max-w-lg w-full rounded shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex justify-between items-start">
              <h3 className="text-lg font-medium text-black">Notification</h3>
            </div>
            <div className="p-5 overflow-y-auto text-sm flex-1">
              {currentLoading && <div>Loading...</div>}
              {current && (
                <>
                  <div className="mb-3"><div className="text-gray-500 text-xs">Title</div><div className="text-gray-900">{current.title}</div></div>
                  <div className="mb-3"><div className="text-gray-500 text-xs">Audience</div><div className="text-gray-900">{current.audience}</div></div>
                  <div className="mb-3"><div className="text-gray-500 text-xs">Sent At</div><div className="text-gray-900">{current.sent_at ? dayjs(current.sent_at).format('DD-MM-YYYY HH:mm') : ''}</div></div>
                  <div className="mb-3"><div className="text-gray-500 text-xs">Delivery Status</div><div className="text-gray-900">{current.delivery_status}</div></div>
                </>
              )}
            </div>
              <div className="p-4 border-t flex justify-end">
                <button onClick={() => { dispatch(clearCurrentNotification()) }} className="px-4 py-2 border rounded">Close</button>
              </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Message
