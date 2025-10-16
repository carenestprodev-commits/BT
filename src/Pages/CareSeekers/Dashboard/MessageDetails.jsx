import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux'
import { postProviderReview } from '../../../Redux/ProviderReview'
import { fetchProviderDetails, clearProviderDetails } from '../../../Redux/ProvidersDetails'
import { BASE_URL } from '../../../Redux/config'

function MessageDetails() {
  const navigate = useNavigate();
  const params = useParams()
  const dispatch = useDispatch()
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const { details, loading, error } = useSelector(s => s.providersDetails || { details: null, loading: false, error: null })

  const resolveImage = (url) => {
    if (!url) return 'https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151&size=64'
    if (url.startsWith('http') || url.startsWith('https')) return url
    if (url.startsWith('/')) return `${BASE_URL}${url}`
    return url
  }

  // fetch provider details by param providerId or fallback to params.id
  useEffect(() => {
    const providerId = params?.providerId || params?.id || null
    if (providerId) dispatch(fetchProviderDetails(providerId))
    return () => dispatch(clearProviderDetails())
  }, [dispatch, params])

  return (
    <div className="flex min-h-screen bg-white font-sfpro">
      <Sidebar active="Message" />
      <div className="flex-1 font-sfpro px-8 py-8 ml-64">
        <button className="mb-8 text-gray-500 hover:text-gray-700 text-2xl font-bold" onClick={() => navigate(-1)}>
          ←
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">Details</h2>
        <div className="flex items-center mb-6">
          <img src={resolveImage(details?.user?.profile_image_url)} alt={details?.user?.full_name} className="w-16 h-16 rounded-full object-cover mr-6" />
          <div>
            <div className="text-xl font-semibold text-gray-800">{details?.user?.full_name || 'Provider'}</div>
            <div className="text-gray-500 text-sm mt-1">{[details?.city, details?.country].filter(Boolean).join(' - ')}</div>
          </div>
        </div>
        <div className="flex gap-6 mb-8">
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start min-w-[120px]">
            <span className="text-gray-500 text-xs mb-1">Experience</span>
            <span className="text-gray-800 font-semibold text-lg">{details?.years_of_experience ?? 'N/A'}</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start min-w-[120px]">
            <span className="text-gray-500 text-xs mb-1">Rate</span>
            <span className="text-gray-800 font-semibold text-lg">{details?.hourly_rate ? `$${details.hourly_rate}/hr` : 'N/A'}</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start min-w-[120px]">
            <span className="text-gray-500 text-xs mb-1">Rating</span>
            <span className="text-gray-800 font-semibold text-lg flex items-center gap-2">{details?.average_rating ?? 'N/A'}
              <span className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} className={i < Math.round(details?.average_rating || 0) ? 'text-[#cb9e49] mr-1' : 'text-gray-300 mr-1'} />
                ))}
              </span>
            </span>
          </div>
        </div>
        <div className="mb-8">
          <div className="text-gray-700 font-medium mb-2">Message to Care Provider</div>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white text-gray-800 min-h-[100px] resize-none mb-2"
            placeholder="Input feedback of your time with care provider"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
          />
          <div className="flex gap-1 mb-2 -mt-10 ml-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className="focus:outline-none"
              >
                <FaStar className={i < rating ? "text-[#cb9e49] text-xl" : "text-gray-300 text-xl"} />
              </button>
            ))}
          </div>
        </div>
        <div className="mb-8">
          <div className="text-gray-700 font-medium mb-2">Testimonials</div>
          {Array.isArray(details?.testimonials) && details.testimonials.length > 0 ? (
            details.testimonials.map(t => (
              <div key={t.id} className="bg-white border border-gray-100 rounded-lg px-6 py-4 text-gray-700 text-base mb-3">
                <div className="mb-2">{t.comment}</div>
                <div className="text-sm text-gray-500">— {t.reviewer?.full_name || 'Anonymous'}</div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 text-gray-700 text-base">No testimonials yet.</div>
          )}
        </div>
        <button
          className="w-full bg-[#0d99c9] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition"
          onClick={async () => {
            // booking_id: try to use param or fallback to 11 for demo
            const booking_id = params?.id ? Number(params.id) : 11
            const res = await dispatch(postProviderReview({ booking_id, rating, comment: feedback }))
            if (res.error) {
              alert('Failed: ' + (res.payload?.detail || JSON.stringify(res.payload) || res.error.message))
            } else {
              alert('Success: ' + JSON.stringify(res.payload))
            }
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default MessageDetails;
