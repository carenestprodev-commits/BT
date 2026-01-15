import { configureStore } from "@reduxjs/toolkit";
import careSeekerReducer from "./CareSeekerAuth";
import careProviderReducer from "./CareProviderAuth";
import authReducer from "./Login";
import careProviderNearYouReducer from "./CareProviderNearYou";
import locationReducer from "./Location";
import providersDetailsReducer from "./ProvidersDetails";
import jobsFeedReducer from "./JobsFeed";
import adminUsersReducer from "./AdminUsers";
import adminActivitiesReducer from "./AdminActivities";
import adminEarningReducer from "./AdminEarning";
import adminSubscriptionReducer from "./AdminSubscription";
import adminSupportReducer from "./AdminSupport";
import verificationReducer from "./Verification";
import adminMessageReducer from "./AdminMessage";
import providerWalletReducer from "./ProviderWallet";
import providerSettingsReducer from "./ProviderSettings";
import careProviderRequestsReducer from "./CareProviderRequest";
import seekerRequestsReducer from "./SeekerRequest";
import passwordChangeReducer from "./PasswordChange";
import messengerReducer from "./Messenger";
import seekerDashboardReducer from "./SeekerDashboardHome";
import providerReviewReducer from "./ProviderReview";
import startActivityReducer from "./StartActivity";
import bookaserviceReducer from "./BookaService";
import providerPaymentReducer from "./ProviderPayment";
import seekerPaymentReducer from "./SeekerPayment";

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
    adminMessage: adminMessageReducer,
    verification: verificationReducer,
    providerWallet: providerWalletReducer,
    providerSettings: providerSettingsReducer,
    seekerRequests: seekerRequestsReducer,
    seekerDashboard: seekerDashboardReducer,
    providerReview: providerReviewReducer,
    passwordChange: passwordChangeReducer,
    careProviderRequests: careProviderRequestsReducer,
    messenger: messengerReducer,
    startActivity: startActivityReducer,
    bookaservice: bookaserviceReducer,
    providerPayment: providerPaymentReducer,
    seekerPayment: seekerPaymentReducer,
  },
});

export default store;
