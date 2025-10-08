import { useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import { fetchProviderDetails, clearProviderDetails } from '../../../Redux/ProvidersDetails'

function ViewDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  // Check plan from localStorage
  const plan = typeof window !== "undefined" ? localStorage.getItem("careProviderPlan") : null;
  const dispatch = useDispatch()
  const { details, loading, error } = useSelector((s) => s.providersDetails || { details: null, loading: false, error: null })
  useEffect(() => {
    // Try to obtain provider id from location.state or fallback to 15 for demo
    const id = location?.state?.providerId || 15
    dispatch(fetchProviderDetails(id))

    return () => {
      dispatch(clearProviderDetails())
    }
  }, [dispatch, location])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Home" />
      <div className="flex-1 font-sfpro px-8 py-8 ml-64 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            className="mr-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">Details</h2>
        </div>

        {loading && <div className="py-8">Loading provider details…</div>}
        {error && <div className="text-red-500 py-4">Failed to load provider: {typeof error === 'string' ? error : (error?.error || error?.message || 'Unknown')}</div>}

        {details && (
          <>
            {/* Profile */}
            <div className="flex items-center mb-4">
              <img src={details?.user?.profile_picture || 'https://randomuser.me/api/portraits/women/1.jpg'} alt="Provider" className="w-16 h-16 rounded-full mr-4 object-cover" />
              <div>
                <h4 className="font-semibold text-gray-800 text-lg">{details?.user?.full_name || details?.profile_title}</h4>
                <p className="text-md text-gray-500 mt-1 mb-2">{[details?.city, details?.state, details?.country].filter(Boolean).join(', ')}</p>
                <p className="text-xs text-gray-500 max-w-2xl">{details?.about_me}</p>
              </div>
            </div>

            {/* Experience/Rate/Rating */}
            <div className="flex gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg px-6 py-3 flex flex-col items-center">
                <span className="text-xs text-gray-500">Experience</span>
                <span className="font-semibold text-gray-800 text-lg">{details?.experience || 'N/A'}</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-6 py-3 flex flex-col items-left">
                <span className="text-xs text-gray-500">Rate</span>
                <span className="font-semibold text-gray-800 text-lg">{details?.rate || 'N/A'}</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-6 py-3 flex flex-col items-left">
                <span className="text-xs text-gray-500">Rating</span>
                <div className='flex items-center'>
                  <span className="text-[#cb9e49] text-base mr-2">{'★★★★★'.repeat(1).slice(0, Math.round(details?.rating || 0))}</span>
                  <span className="text-xs text-gray-600 font-bold">{details?.rating ?? 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Dedicated Childcare Provider */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">{details?.profile_title || 'Provider'}</h3>
              <p className="text-sm text-gray-700">{details?.about_me}</p>
            </div>

            {/* Testimonials */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">Testimonials</h3>
              <div className="grid grid-cols-3 gap-4">
                {Array.isArray(details?.testimonials) && details.testimonials.length > 0 ? (
                  details.testimonials.map((t) => (
                    <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
                      <p className="text-sm text-gray-700 mb-2">{t.comment}</p>
                      <span className="text-xs text-gray-500 font-semibold">{t.reviewer?.full_name || t.job_title || 'Anonymous'}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-600">No testimonials yet.</div>
                )}
              </div>
            </div>

            <button
              className={`w-full bg-[#0093d1] text-white py-3 rounded-md font-semibold text-lg transition ${plan !== "Free" || (location.state && location.state.messageable) ? "hover:bg-[#007bb0]" : "hover:bg-[#0093d1] opacity-50 cursor-not-allowed"}`}
              disabled={plan === "Free" && !(location.state && location.state.messageable)}
            >
              Message
            </button>
            <p className="text-sm text-red-500 mt-2">
              when it is clicked it will go to message page and open a chat for this person
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default ViewDetails
