import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setActivityStarted } from '../Redux/StartActivity'

export default function PaymentSuccessRedirect() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search)
      const bookingId = params.get('booking_id')
      if (bookingId) {
        dispatch(setActivityStarted(bookingId))
      }
    } catch {
      // ignore
    }

    // Navigate to the messages page for careseekers
    navigate('/careseekers/dashboard/message', { replace: true })
  }, [location.search, dispatch, navigate])

  return null
}
