import { configureStore } from '@reduxjs/toolkit'
import careSeekerReducer from './CareSeekerAuth'
import careProviderReducer from './CareProviderAuth'
import authReducer from './Login'
import careProviderNearYouReducer from './CareProviderNearYou'
import locationReducer from './Location'
import providersDetailsReducer from './ProvidersDetails'
import jobsFeedReducer from './JobsFeed'
import adminUsersReducer from './AdminUsers'
import adminActivitiesReducer from './AdminActivities'
import adminEarningReducer from './AdminEarning'
import adminSubscriptionReducer from './AdminSubscription'
import adminSupportReducer from './AdminSupport'

export const store = configureStore({
  reducer: {
    careSeeker: careSeekerReducer,
    careProvider: careProviderReducer,
    auth: authReducer,
    careProviderNearYou: careProviderNearYouReducer,
    location: locationReducer,
    providersDetails: providersDetailsReducer,
    jobsFeed: jobsFeedReducer,
    adminUsers: adminUsersReducer,
    adminActivities: adminActivitiesReducer,
    adminEarning: adminEarningReducer,
    adminSubscription: adminSubscriptionReducer,
    adminSupport: adminSupportReducer,
  },
})

export default store
