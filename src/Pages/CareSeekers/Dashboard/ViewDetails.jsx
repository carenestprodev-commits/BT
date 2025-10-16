import { useEffect } from 'react'
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FaStar } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import { fetchProviderDetails, clearProviderDetails } from '../../../Redux/ProvidersDetails'
import { BASE_URL } from '../../../Redux/config'

function ViewDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  // Check plan from localStorage
  const plan = typeof window !== "undefined" ? localStorage.getItem("careProviderPlan") : null;
  const dispatch = useDispatch()
  const { details, loading, error } = useSelector((s) => s.providersDetails || { details: null, loading: false, error: null })
  const resolveImage = (url) => {
    if (!url) return 'https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151&size=64'
    if (url.startsWith('http') || url.startsWith('https')) return url
    if (url.startsWith('/')) return `${BASE_URL}${url}`
    return url
  }
  useEffect(() => {
    // Try to obtain provider id from location.state or route params or fallback to 48 (example)
      const id = location?.state?.providerId || params?.id || 48
      dispatch(fetchProviderDetails(id))

    return () => {
      dispatch(clearProviderDetails())
    }
  }, [dispatch, location, params])

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
              <img src={resolveImage(details?.user?.profile_image_url)} alt="Provider" className="w-16 h-16 rounded-full mr-4 object-cover" />
              <div>
                <h4 className="font-semibold text-gray-800 text-lg">{details?.user?.full_name || details?.title}</h4>
                <p className="text-md text-gray-500 mt-1 mb-2">{[details?.city, details?.state, details?.country].filter(Boolean).join(', ')}</p>
                <p className="text-xs text-gray-500 max-w-2xl">{details?.summary}</p>
              </div>
            </div>

            {/* Experience/Rate/Rating */}
            <div className="flex gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg px-6 py-3 flex flex-col items-center">
                <span className="text-xs text-gray-500">Experience</span>
                <span className="font-semibold text-gray-800 text-lg">{details?.years_of_experience ?? 'N/A'}</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-6 py-3 flex flex-col items-left">
                <span className="text-xs text-gray-500">Rate</span>
                <span className="font-semibold text-gray-800 text-lg">{details?.hourly_rate ? `$${details.hourly_rate}` : 'N/A'}</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-6 py-3 flex flex-col items-left">
                <span className="text-xs text-gray-500">Rating</span>
                <div className='flex items-center'>
                  <div className="flex mr-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar key={i} className={i < Math.round(details?.average_rating || 0) ? 'text-[#cb9e49] mr-1' : 'text-gray-300 mr-1'} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600 font-bold">{details?.average_rating ?? 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Dedicated Childcare Provider */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">{details?.title || 'Provider'}</h3>
              <p className="text-sm text-gray-700">{details?.summary}</p>
            </div>

            {/* Testimonials */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">Testimonials</h3>
              <div className="grid grid-cols-3 gap-4">
                {Array.isArray(details?.testimonials) && details.testimonials.length > 0 ? (
                  details.testimonials.map((t) => (
                    <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
                      <p className="text-sm text-gray-700 mb-2">{t.comment}</p>
                      <div className="flex items-center mt-2">
                        <img src={resolveImage(t.reviewer?.profile_image_url)} alt={t.reviewer?.full_name} className="w-8 h-8 rounded-full mr-3 object-cover" />
                        <div>
                          <div className="text-xs font-semibold text-gray-700">{t.reviewer?.full_name || 'Anonymous'}</div>
                          <div className="text-xs text-gray-500">{t.reviewer?.id ? `User #${t.reviewer.id}` : ''}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-600">No testimonials yet.</div>
                )}
              </div>
            </div>

            {/* Skills */}
            {Array.isArray(details?.skills) && details.skills.length > 0 && (
              <div className="mb-6 dark: text-black">
                <h3 className="font-semibold text-gray-800 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {details.skills.map((s, idx) => (
                    <span key={idx} className="text-sm bg-white border border-gray-200 rounded-full px-3 py-1">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <button
              className={`w-full bg-[#0093d1] text-white py-3 rounded-md font-semibold text-lg transition ${plan !== "Free" || (location.state && location.state.messageable) ? "hover:bg-[#007bb0]" : "hover:bg-[#0093d1] opacity-50 cursor-not-allowed"}`}
              disabled={plan === "Free" && !(location.state && location.state.messageable)}
              onClick={() => {
                // Navigate to Message page and pass the provider's user id as other_user_id
                try {
                  const otherId = details?.user?.id || details?.user?.pk || details?.user?.user_id || details?.user?.uid || details?.id
                  navigate('/careseekers/dashboard/message', { state: { other_user_id: otherId } })
                } catch (err) {
                  console.error('Failed to navigate to message page', err)
                }
              }}
            >
              Message
            </button>

          </>
        )}
      </div>
    </div>
  )
}

export default ViewDetails
