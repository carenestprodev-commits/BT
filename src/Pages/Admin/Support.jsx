import { useEffect, useMemo, useState } from 'react'
import { FaSearch, FaDownload } from 'react-icons/fa'
import dayjs from 'dayjs'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSupportTickets, fetchSupportTicketById, clearCurrentTicket } from '../../Redux/AdminSupport'

function Support() {
  const dispatch = useDispatch()
  const { tickets, loading, error, current, currentLoading } = useSelector((s) => s.adminSupport || {})

  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')
  const [page, setPage] = useState(1)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const pageSize = 8

  useEffect(() => {
    dispatch(fetchSupportTickets())
    return () => dispatch(clearCurrentTicket())
  }, [dispatch])

  const filtered = useMemo(() => {
    const list = tickets || []
    let list2 = list
    if (query) {
      const q = query.toLowerCase()
      list2 = list2.filter((r) => (r.dispute || '').toLowerCase().includes(q) || (r.name || '').toLowerCase().includes(q))
    }
    if (status) list2 = list2.filter((r) => r.status === status)
    if (date) list2 = list2.filter((r) => dayjs(r.date || r.start_date).format('YYYY-MM-DD') === date)
    return list2
  }, [tickets, query, status, date])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = filtered.slice((page - 1) * pageSize, page * pageSize)

  const downloadCSV = () => {
    const header = ['Dispute', 'Name', 'Status', 'Date']
    const csv = [header.join(',')]
    filtered.forEach((r) => csv.push([`"${r.dispute || ''}"`, r.name || '', r.status || '', (r.date || r.start_date) || ''].join(',')))
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'support-complaints.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

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
    <div className="p-6 bg-white text-black">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 w-1/2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search tickets"
              className="pl-10 pr-3 py-2 w-full rounded border border-gray-200 bg-white text-sm text-black"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 border border-gray-200 rounded bg-white text-sm">
            <option value="">Role</option>
            <option>Care provider</option>
            <option>Care seeker</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded bg-white text-sm">
            <option value="">Status</option>
            <option>Open</option>
            <option>In Review</option>
            <option>Resolved</option>
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 border border-gray-200 rounded bg-white text-sm" />
          <button onClick={downloadCSV} className="p-2 rounded border border-gray-200 bg-white text-blue-700">
            <FaDownload />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded border border-gray-100">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left w-12"><input type="checkbox" /></th>
              <th className="p-3 text-left">Dispute</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="p-6 text-center text-red-600">Error loading tickets</td></tr>
            ) : currentPage.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center">No tickets</td></tr>
            ) : (
              currentPage.map((r) => {
                const statusRaw = (r.status || '').toLowerCase()
                const statusLabel = statusRaw === 'open' ? 'Open' : statusRaw === 'in_review' ? 'In Review' : statusRaw === 'resolved' ? 'Resolved' : (statusRaw || '')
                const statusClass = statusRaw === 'open' ? 'bg-red-50 text-red-600' : statusRaw === 'resolved' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                const formattedDate = r.date || r.start_date ? dayjs(r.date || r.start_date).format('DD-MM-YYYY') : ''
                return (
                  <tr key={r.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => dispatch(fetchSupportTicketById(r.id))}>
                    <td className="p-3 align-top"><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                    <td className="p-3 align-top text-gray-700">{r.dispute}</td>
                    <td className="p-3 align-top text-gray-700">{r.name}</td>
                    <td className="p-3 align-top">
                      <span className={`px-3 py-1 rounded-full text-xs ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="p-3 align-top text-gray-700">{formattedDate}</td>
                  </tr>
                )
              })
            )}
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
          <button
            disabled={page === pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            className="inline-flex items-center px-3 py-2 border rounded-md bg-white text-sm disabled:opacity-50 text-black"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {(current || currentLoading) && (
        <div className={`fixed inset-0 z-40 flex items-start justify-center p-6 ${current ? '' : 'pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/30" onClick={() => dispatch(clearCurrentTicket())} />
          <div className="relative z-50 bg-white max-w-md w-full rounded shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex justify-between items-start">
              <h3 className="text-lg font-medium text-black">Details</h3>
              <button onClick={() => dispatch(clearCurrentTicket())} className="text-gray-400">✕</button>
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
                    <div className="text-gray-500 text-xs">Role</div>
                    <div className="text-gray-900">{current.role || 'N/A'}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-gray-500 text-xs">Plan</div>
                    <div className="text-gray-900">{current.plan || 'N/A'}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-gray-500 text-xs">Status</div>
                    <div className="text-gray-900">{(current.status || '').replace('_', ' ')}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-gray-500 text-xs">Start Date</div>
                    <div className="text-gray-900">{current.start_date ? dayjs(current.start_date).format('DD-MM-YYYY') : ''}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-gray-500 text-xs">Complaint</div>
                    <div className="mt-2 p-3 border border-gray-100 rounded bg-gray-50 text-gray-800">{current.complaint}</div>
                  </div>
                </>
              )}
            </div>
            <div className="p-4 border-t flex flex-col gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowNoteModal(true)
                }}
                className="w-full bg-[#0ea5d7] hover:bg-[#0c94bf] text-white py-2 rounded"
              >
                Resolve
              </button>
              <button className="w-full border border-[#0ea5d7] text-[#0ea5d7] py-2 rounded">Escalate</button>
              <button className="w-full border border-gray-200 bg-gray-100 text-gray-500 py-2 rounded">Message</button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Admin Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowNoteModal(false)} />
          <div className="relative z-50 bg-white max-w-lg w-full rounded shadow-lg overflow-hidden">
            <div className="p-5 border-b">
              <h3 className="text-lg font-medium text-black">Internal Admin Note</h3>
            </div>
            <div className="p-5">
              <textarea
                placeholder="Input Internal admin notes for future reference"
                className="w-full h-56 p-3 border border-gray-100 rounded text-sm resize-none dark:text-black bg-white"
              />
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 mr-3 border rounded bg-white text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // emulate save and show success
                  setShowNoteModal(false)
                  setSuccessMsg('Comment sent successfully')
                  setTimeout(() => setSuccessMsg(''), 3000)
                }}
                className="px-4 py-2 bg-[#0ea5d7] hover:bg-[#0c94bf] text-white rounded"
              >
                Send Comment
              </button>
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
    </div>
  )
}

export default Support
