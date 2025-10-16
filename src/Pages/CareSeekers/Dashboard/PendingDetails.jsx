import { useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import { fetchPendingRequestById, deletePendingRequest, patchPendingRequest } from '../../../Redux/SeekerRequest'

function PendingDetails() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const dispatch = useDispatch()

  // location state (if navigated from Requests) may include details
  const locationDetails = location?.state?.details || null

  // keep a sample fallback only for local view while API integration is pending
  const sample = {
    title: 'Professional nanny to care for two kids over 10 days consecutively',
    posted: 'Posted 5 minutes ago',
    description: [
      'We are seeking an experienced, trustworthy professional nanny to provide exceptional care for two children over 10 consecutive days in Lagos. This is an excellent opportunity for a dedicated childcare professional looking for temporary, intensive placement.',
      'The ideal candidate must possess proven childcare experience with verifiable references, a clean criminal background check, and medical clearance. Reliable personal transportation is essential for school runs and activities, while first aid and CPR certification is strongly preferred. Excellent communication skills in English are mandatory for effective interaction with both children and parents.',
      'Responsibilities include full-time supervision and care of both children, meal preparation and feeding assistance, organizing educational activities and creative play sessions, maintaining established daily routines and schedules, and providing emergency response and safety management. Light housekeeping duties related to the children\'s care are also expected.',
      'The successful candidate must demonstrate exceptional patience, creativity, and problem-solving abilities. Previous experience caring for multiple children simultaneously is essential, along with the ability to handle emergencies calmly and responsibly. Flexibility regarding schedule adjustments and sleeping arrangements is required for this live-in position.',
      'We offer competitive daily compensation commensurate with experience and qualifications. A live-in arrangement is strongly preferred to ensure continuous care coverage. Immediate start is available for qualified candidates who successfully complete our verification process. Comprehensive references and thorough background verification are mandatory requirements before final placement confirmation.'
    ],
    skills: [
      'sleep-in','Non-smoker','Experience with twins','help with homework','Sign language','Special needs experience','cook basic meals','Experience with speech delay','live-in','Behavioral support','Speaks Igbo Fluently','Speaks Hausa Fluently','Speaks Yoruba Fluently','Experience with autism','Speaks French Fluently'
    ]
  }

  // redux state (currentRequest will be populated by fetchPendingRequestById)
  const { currentRequest } = useSelector(s => s.seekerRequests || { currentRequest: null })

  // source of truth: prefer location details, then redux currentRequest, then sample
  const source = locationDetails || currentRequest || sample

  // editable fields
  const [summary, setSummary] = useState('')
  const [skillsInput, setSkillsInput] = useState('')
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    // if no location details provided and there's an id param, fetch from API
    const id = params.id || params.requestId || null
    if (!locationDetails && id) {
      dispatch(fetchPendingRequestById(id))
    }
  }, [dispatch, locationDetails, params])

  useEffect(() => {
    // when source updates, populate editable inputs
    setSummary(source?.summary || source?.description?.[0] || '')
    const skillsArr = source?.skills_and_expertise || source?.skills || []
    setSkillsInput(Array.isArray(skillsArr) ? skillsArr.join(', ') : (skillsArr || ''))
  }, [source])

  const description = source?.description ?? (source?.summary ? [source.summary] : [])
  const skills = source?.skills_and_expertise ?? source?.skills ?? []
  const title = source?.title ?? source?.summary ?? ''
  const posted = source?.posted_ago || source?.posted || ''

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Home" />
      <div className="flex-1 font-sfpro px-8 py-8 ml-64 overflow-y-auto">
        <div className="flex items-center mb-8">
          <button
            className="mr-4 text-gray-400 hover:text-gray-600 text-lg"
            onClick={() => navigate(-1)}
          >
            ← 
          </button>
          <h2 className="text-lg font-normal text-gray-500">Details</h2>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-lg font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-xs text-gray-400 mb-6">{posted}</p>

          <div className="text-gray-600 leading-relaxed space-y-4 mb-8 text-sm">
            {description.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-normal text-gray-900 mb-3">Skills and expertise</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1 border border-gray-200">{s}</span>
              ))}
            </div>
          </div>

        </div>
        {/* Edit / Read-only controls */}
        <div className="mt-6 max-w-3xl">
          {!editMode ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setEditMode(true)}
                className="w-full bg-white text-[#0093d1] py-3 rounded-md font-medium text-sm border border-[#0093d1] hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  const id = source?.id || params.id
                  if (!id) return alert('Missing id')
                  if (!confirm('Are you sure you want to close/delete this pending request?')) return
                  const res = await dispatch(deletePendingRequest(id))
                  if (res.error) {
                    alert('Delete failed: ' + (res.payload?.detail || JSON.stringify(res.payload) || res.error.message))
                  } else {
                    alert('Deleted: ' + (JSON.stringify(res.payload) || 'success'))
                    navigate('/careseekers/dashboard/requests')
                  }
                }}
                className="w-full bg-[#0093d1] text-white py-3 rounded-md font-medium text-sm hover:bg-[#007bb0] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <label className="block text-sm font-medium text-gray-700">Summary</label>
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={5} className="w-full mt-2 p-3 border border-gray-200 rounded-md text-sm" />

              <label className="block text-sm font-medium text-gray-700 mt-2">Skills and expertise (comma separated)</label>
              <input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} className="w-full mt-2 p-2 border border-gray-200 rounded-md text-sm" />

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    const id = source?.id || params.id
                    if (!id) return alert('Missing id')
                    const skillsArr = skillsInput.split(',').map(s => s.trim()).filter(Boolean)
                    const res = await dispatch(patchPendingRequest({ id, summary, skills: skillsArr }))
                    if (res.error) {
                      alert('Update failed: ' + (res.payload?.detail || JSON.stringify(res.payload) || res.error.message))
                    } else {
                      alert('Updated: ' + (JSON.stringify(res.payload) || 'success'))
                      // refresh the details and leave edit mode
                      dispatch(fetchPendingRequestById(id))
                      setEditMode(false)
                    }
                  }}
                  className="flex-1 bg-white text-[#0093d1] py-3 rounded-md font-medium text-sm border border-[#0093d1] hover:bg-gray-50 transition-colors"
                >
                  Save
                </button>

                <button
                  onClick={() => {
                    // cancel edits: reset to source values
                    setSummary(source?.summary || source?.description?.[0] || '')
                    const skillsArr = source?.skills_and_expertise || source?.skills || []
                    setSkillsInput(Array.isArray(skillsArr) ? skillsArr.join(', ') : (skillsArr || ''))
                    setEditMode(false)
                  }}
                  className="flex-1 bg-[#f3f4f6] text-gray-700 py-3 rounded-md font-medium text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PendingDetails

