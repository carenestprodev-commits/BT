import { useMemo, useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { FaSearch } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVerifications, fetchVerificationById, postVerificationAction, clearCurrentVerification, uploadVerificationId } from '../../Redux/Verification'

function ProfileVerificationProvider() {
  const dispatch = useDispatch()
  const { items } = useSelector((s) => s.verification || {})
  useEffect(() => { dispatch(fetchVerifications()) }, [dispatch])

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [showDetailId, setShowDetailId] = useState(null)
  const { current, currentLoading, actionLoading, actionError, actionSuccess } = useSelector((s) => s.verification || {})

  const pageSize = 8

  const providerRows = (items || []).filter((x) => x.user_type === 'provider')

  const filtered = useMemo(() => {
    if (!query) return providerRows
    const q = query.toLowerCase()
    return providerRows.filter(r => (r.name || '').toLowerCase().includes(q))
  }, [providerRows, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)
  // ensure the table shows space for 10 rows even when there are fewer items
  const minVisibleRows = 10
  const displayRows = [
    ...pageRows,
    ...Array(Math.max(0, minVisibleRows - pageRows.length)).fill(null),
  ]

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
    <>
    <div className="bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-1/3">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search care provider" className="pl-10 pr-3 py-2 w-full rounded border border-gray-200 bg-white text-sm text-black" />
        </div>
      </div>

      <div className="flex flex-col min-h-[60vh]">
        <div className="overflow-hidden rounded border border-gray-100 text-black flex-1">
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left w-12"><input type="checkbox" /></th>
              <th className="p-3 text-left">Care Provider Name</th>
              <th className="p-3 text-left">Verification Type</th>
              <th className="p-3 text-left">Payment Option</th>
              <th className="p-3 text-left">Payment Status</th>
              <th className="p-3 text-left">Verification Status</th>
              <th className="p-3 text-left">Vetting Feedback</th>
              <th className="p-3 text-left">Last Updated</th>
              <th className="p-3 text-left w-12">...</th>
            </tr>
          </thead>
            <tbody>
            {displayRows.map((r, idx) => (
              r ? (
                <tr key={r.id} className={`border-b hover:bg-gray-50`}>
                <td className="p-3 align-top"><input type="checkbox" /></td>
                <td className="p-3 align-top font-medium text-black">{r.name}</td>
                <td className="p-3 align-top text-black">{r.verification_type}</td>
                <td className="p-3 align-top text-black">{r.payment_option}</td>
                <td className="p-3 align-top text-black">{r.payment_status}</td>
                <td className="p-3 align-top text-black">{r.status || r.feedback}</td>
                <td className="p-3 align-top text-black">{r.last_updated ? dayjs(r.last_updated).format('DD-MM-YYYY') : ''}</td>
                <td className="p-3 align-top">
                  <div className="relative inline-block">
                    <button onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)} className="px-2 py-1 rounded hover:bg-gray-100 text-black">•••</button>
                    {openMenuId === r.id && (
                      <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow z-10 text-sm">
                        <ul>
                          <li onClick={() => { setShowDetailId(r.id); setOpenMenuId(null); dispatch(fetchVerificationById(r.id)) }} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-black">View</li>
                          <li onClick={() => { dispatch(postVerificationAction({ id: r.id, action: 'approve' })) }} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-black">Approve</li>
                          <li onClick={() => { dispatch(postVerificationAction({ id: r.id, action: 'reject', feedback: 'Rejected by admin' })) }} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-black">Reject</li>
                          <li onClick={() => { dispatch(postVerificationAction({ id: r.id, action: 'message' })); setOpenMenuId(null) }} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-black">Message</li>
                          <li onClick={() => { dispatch(postVerificationAction({ id: r.id, action: 're_upload' })); setOpenMenuId(null) }} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-black">Re Upload</li>
                          <li onClick={() => { dispatch(postVerificationAction({ id: r.id, action: 'send_prompt' })); setOpenMenuId(null) }} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-black">Send Prompt</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </td>
                </tr>
              ) : (
                <tr key={`empty-${idx}`} className="border-b">
                  <td className="p-3 align-top h-12"><input type="checkbox" disabled className="opacity-0" /></td>
                  <td className="p-3 align-top h-12">&nbsp;</td>
                  <td className="p-3 align-top h-12">&nbsp;</td>
                  <td className="p-3 align-top h-12">&nbsp;</td>
                  <td className="p-3 align-top h-12">&nbsp;</td>
                  <td className="p-3 align-top h-12">&nbsp;</td>
                  <td className="p-3 align-top h-12">&nbsp;</td>
                  <td className="p-3 align-top h-12">&nbsp;</td>
                </tr>
              )
            ))}
          </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
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
              onClick={() => setPage(p => Math.min(pageCount, p + 1))}
              className="inline-flex items-center px-3 py-2 border rounded-md bg-white text-sm disabled:opacity-50 text-black"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Detail modal */}
    {showDetailId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg max-w-3xl w-full p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Verification Detail</h3>
            <button className="text-gray-500" onClick={() => { setShowDetailId(null); dispatch(clearCurrentVerification()) }}>&times;</button>
          </div>
          <div className="mt-4">
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
                    <div className="text-sm text-gray-500">Verification Type</div>
                    <div className="font-medium">{current?.verification_type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Payment Option</div>
                    <div className="font-medium">{current?.payment_option}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Payment Status</div>
                    <div className="font-medium">{current?.payment_status}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="font-medium">{current?.status}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Last Updated</div>
                    <div className="font-medium">{current?.last_updated ? dayjs(current.last_updated).format('DD-MM-YYYY') : ''}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-500">Feedback</div>
                  <div className="font-medium">{current?.feedback}</div>
                </div>
                {current?.government_id_url && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">Government ID</div>
                    <img src={current.government_id_url} alt="gov" className="mt-2 max-h-48" />
                  </div>
                )}
                <div className="mt-4">
                  <div className="text-sm text-gray-500">Upload Government ID</div>
                  <div className="flex items-center gap-3 mt-2">
                    <input type="file" id="gov-upload" className="text-sm" />
                    <button
                      className="px-4 py-2 bg-[#0d99c9] text-white rounded"
                      onClick={async () => {
                        const inp = document.getElementById('gov-upload')
                        if (!inp || !inp.files || inp.files.length === 0) {
                          alert('Please select a file to upload')
                          return
                        }
                        const file = inp.files[0]
                        try {
                          const res = await dispatch(uploadVerificationId(file))
                          // thunk returns fulfilled action or rejected action object
                          if (res && res.payload && res.payload.message) {
                            alert(res.payload.message)
                          } else if (res && res.payload && typeof res.payload === 'string') {
                            alert(res.payload)
                          } else if (res && res.error && res.error.message) {
                            alert(res.error.message)
                          } else {
                            alert('Upload completed')
                          }
                        } catch (err) {
                          console.error(err)
                          alert('Upload failed')
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

          <div className="mt-6 flex justify-end gap-2">
            {actionError && <div className="text-red-600 mr-auto">{actionError}</div>}
            {actionSuccess && <div className="text-green-600 mr-auto">{actionSuccess}</div>}
            <button className="btn btn-ghost" onClick={() => { setShowDetailId(null); dispatch(clearCurrentVerification()) }}>Close</button>
            <button className="btn btn-error" onClick={() => dispatch(postVerificationAction({ id: showDetailId, action: 'reject', feedback: 'Rejected by admin' }))} disabled={actionLoading}>{actionLoading ? 'Rejecting...' : 'Reject'}</button>
            <button className="btn btn-primary" onClick={() => dispatch(postVerificationAction({ id: showDetailId, action: 'approve' }))} disabled={actionLoading}>{actionLoading ? 'Approving...' : 'Approve'}</button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default ProfileVerificationProvider
