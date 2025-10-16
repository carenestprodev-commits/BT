import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux'
import { fetchSeekerRequestDetails, submitReview, clearCurrentRequest } from '../../../Redux/SeekerRequest'
import { BASE_URL } from '../../../Redux/config'

function RequestDetails() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const dispatch = useDispatch()
  const { currentRequest, submit } = useSelector(s => s.seekerRequests || { currentRequest: null, submit: {} })
  const params = useParams()
  const routeId = params?.id || params?.requestId || params?.bookingId

  useEffect(() => {
    const id = routeId || 11
    dispatch(fetchSeekerRequestDetails(id))
    return () => dispatch(clearCurrentRequest())
    // intentionally only run on mount/unmount; routeId included so it re-fetches if URL param changes
  }, [dispatch, routeId])

  useEffect(() => {
    if (submit && submit.response) {
      alert(`Review submitted: ${JSON.stringify(submit.response)}`)
      // navigate back after successful submit
      navigate('/careseekers/dashboard/requests')
    } else if (submit && submit.error) {
      alert(`Failed to submit review: ${typeof submit.error === 'string' ? submit.error : (submit.error?.error || submit.error?.message || JSON.stringify(submit.error))}`)
    }
  }, [submit, navigate])

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar active="Requests" />
      <div className="flex-1 font-sfpro px-8 py-8 ml-64">
        <button className="mb-8 text-gray-500 hover:text-gray-700 text-2xl font-bold" onClick={() => navigate(-1)}>
          ←
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">Details</h2>
        <div className="flex items-center mb-6">
          <img src={currentRequest?.provider?.user?.profile_image_url ? (currentRequest.provider.user.profile_image_url.startsWith('/') ? `${BASE_URL}${currentRequest.provider.user.profile_image_url}` : currentRequest.provider.user.profile_image_url) : 'https://ui-avatars.com/api/?name=Provider&background=E5E7EB&color=374151&size=64'} alt={currentRequest?.provider?.user?.full_name || 'Provider'} className="w-16 h-16 rounded-full object-cover mr-6" />
          <div>
            <div className="text-xl font-semibold text-gray-800">{currentRequest?.provider?.user?.full_name || currentRequest?.job_title || 'Provider'}</div>
            <div className="text-gray-500 text-sm mt-1">{currentRequest?.hired_at ? `${new Date(currentRequest.hired_at).toLocaleDateString()} - ${currentRequest?.completed_at ? new Date(currentRequest.completed_at).toLocaleDateString() : 'Ongoing'}` : ''}</div>
          </div>
        </div>
        <div className="flex gap-6 mb-8">
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start min-w-[120px]">
            <span className="text-gray-500 text-xs mb-1">Experience</span>
            <span className="text-gray-800 font-semibold text-lg">{currentRequest?.provider?.years_of_experience ?? 'N/A'}</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start min-w-[120px]">
            <span className="text-gray-500 text-xs mb-1">Rate</span>
            <span className="text-gray-800 font-semibold text-lg">{currentRequest?.provider?.hourly_rate ? `$${currentRequest.provider.hourly_rate}` : 'N/A'}</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 flex flex-col items-start min-w-[120px]">
            <span className="text-gray-500 text-xs mb-1">Rating</span>
            <span className="text-gray-800 font-semibold text-lg flex items-center gap-2">{currentRequest?.provider?.average_rating ?? 'N/A'} {Array.from({ length: 5 }).map((_, i) => <FaStar key={i} className={i < (Math.round(currentRequest?.provider?.average_rating ?? 0)) ? "text-[#cb9e49] text-base" : "text-gray-300 text-base"} />)}</span>
          </div>
        </div>
        <div className="mb-6">
          <div className="text-gray-700 font-medium mb-2">Provider Details</div>
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 text-gray-700 text-base">
            <div><strong>Profile Title:</strong> {currentRequest?.provider?.profile_title}</div>
            <div><strong>City:</strong> {currentRequest?.provider?.city}</div>
            <div><strong>Country:</strong> {currentRequest?.provider?.country}</div>
            <div><strong>Service Category:</strong> {currentRequest?.provider?.service_category_name}</div>
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
          <div className="flex gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className="focus:outline-none -mt-20 ml-5"
              >
                <FaStar className={i < rating ? "text-[#cb9e49] text-xl" : "text-gray-300 text-xl"} />
              </button>
            ))}
          </div>
        </div>
        <div className="mb-8">
          <div className="text-gray-700 font-medium mb-2">Testimonials</div>
          <div className="bg-white border border-gray-100 rounded-lg px-6 py-4 text-gray-700 text-base">
            I had a wonderful experience caring for Mr. and Mrs. Johnson over the past 8 months. They are such a sweet couple who treated me like family from day one. Mrs. Johnson always had interesting stories to share, and Mr. Johnson kept me entertained with his sense of humor during our daily walks.
          </div>
        </div>
        <button
          className="w-full bg-[#0d99c9] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition"
            onClick={() => {
            // send review
            const booking_id = currentRequest?.id || routeId || 11
            dispatch(submitReview({ booking_id, rating, comment: feedback }))
          }}
        >
          {submit?.loading ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </div>
  );
}

export default RequestDetails;
