import { useEffect } from 'react';
import Sidebar from "./Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { fetchJobById, clearSelectedJob, submitBooking } from '../../../Redux/JobsFeed'

function JobDetails() {
  const navigate = useNavigate();
  const location = useLocation()
  const dispatch = useDispatch()
  const { selectedJob: job, loading, error, bookingLoading, bookingError } = useSelector(s => s.jobsFeed || { selectedJob: null, loading: false, error: null, bookingLoading: false, bookingError: null })

  useEffect(() => {
    const jobFromState = location?.state?.job
    const jobId = location?.state?.jobId || jobFromState?.id
    if (jobFromState) {
      // if job object was provided in navigation state, use it by setting selectedJob via the store thunk is optional
      // we still clear previous selection
      dispatch(clearSelectedJob())
      // set via fetchJobById to keep a single source (lightweight)
      dispatch(fetchJobById(jobFromState.id))
    } else if (jobId) {
      dispatch(fetchJobById(jobId))
    }

    return () => { dispatch(clearSelectedJob()) }
  }, [dispatch, location])

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar active="Home" />
      <div className="flex-1 font-sfpro px-8 py-8 ml-64">
        <button className="mb-8 text-gray-500 hover:text-gray-700 text-2xl font-bold" onClick={() => window.history.back()}>
          ←
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">Details</h2>

        {loading && <div className="text-gray-500">Loading job details…</div>}
        {error && <div className="text-red-600">Failed to load job: {error.error || error?.message || 'Unknown'}</div>}

        {job && (
          <>
            <div className="font-semibold text-lg text-gray-800 mb-1">{job.title}</div>
            <div className="text-gray-400 text-xs mb-4">{job.posted_ago}</div>
            <div className="text-gray-700 text-base mb-6">{job.summary}</div>

            <div className="mb-6">
              <div className="text-gray-700 font-medium mb-2">Location</div>
              <div className="text-sm text-gray-600">{job.details?.location_information?.city || ''} {job.details?.location_information?.state ? `, ${job.details.location_information.state}` : ''} {job.details?.location_information?.country ? `, ${job.details.location_information.country}` : ''}</div>
            </div>

            <div className="mb-6">
              <div className="text-gray-700 font-medium mb-2">Service category</div>
              <div className="text-sm text-gray-600">{job.service_category}</div>
            </div>

            <div className="mb-6">
              <div className="text-gray-700 font-medium mb-2">Job type</div>
              <div className="text-sm text-gray-600">{job.job_type} {job.start_date ? `· starts ${job.start_date}` : ''}</div>
            </div>

            <div className="mb-6">
              <div className="text-gray-700 font-medium mb-2">Languages</div>
              <div className="text-sm text-gray-600">{Array.isArray(job.details?.provider_experience?.languages) ? job.details.provider_experience.languages.join(', ') : 'Not specified'}</div>
            </div>

            <button
              className={`w-full bg-[#0093d1] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition ${bookingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={async () => {
                if (!job?.id) return
                try {
                  const resAction = await dispatch(submitBooking(job.id))
                  if (submitBooking.fulfilled.match(resAction)) {
                    // show response message then navigate
                    const payload = resAction.payload || {}
                    alert(payload.message || 'Application submitted')
                    navigate('/careproviders/dashboard/requests', { state: { tab: 2 } })
                  } else {
                    const payload = resAction.payload || resAction.error
                    alert((payload && (payload.error || payload.message)) || 'Failed to submit application')
                  }
                } catch {
                  alert('Failed to submit application')
                }
              }}
              disabled={bookingLoading}
            >
              {bookingLoading ? 'Applying…' : 'Apply Now'}
            </button>
            {bookingError && <div className="text-red-600 mt-2">{bookingError.error || bookingError?.message || 'Failed to submit application'}</div>}
          </>
        )}
      </div>
    </div>
  );
}

export default JobDetails;
