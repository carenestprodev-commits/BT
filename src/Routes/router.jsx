import { createBrowserRouter } from "react-router-dom";
import Home from "../Pages/Home/Home";

import CareSeekerLoginPage from "../Pages/CareSeekers/LoginPage";
import CareSeekerSignupPage from "../Pages/CareSeekers/Signup/Signup";
import CareProviderLoginPage from "../Pages/CareProviders/LoginPage";
import CareProviderSignupPage from "../Pages/CareProviders/Signup/Signup";
import CareProvidersNearYouDashboard from "../Pages/CareSeekers/Dashboard/CareProvidersNearYou";
import ViewDetails from "../Pages/CareSeekers/Dashboard/ViewDetails";
import Requests from "../Pages/CareSeekers/Dashboard/Requests";
import Message from "../Pages/CareSeekers/Dashboard/Message";
import Settings from "../Pages/CareSeekers/Dashboard/Settings";
import VerifyIdentity from "../Pages/CareSeekers/Dashboard/VerifyIdentity";
import PersonalInformation from "../Pages/CareSeekers/Dashboard/PersonalInformation";
import Password from "../Pages/CareSeekers/Dashboard/Password";
import MessageDetails from "../Pages/CareSeekers/Dashboard/MessageDetails";
import RequestDetails from "../Pages/CareSeekers/Dashboard/RequestDetails";
import PersonalInformationProvider from "../Pages/CareProviders/Dashboard/PersonalInformation";
import DashboardHome from "../Pages/CareSeekers/Dashboard/Home";

import HomePage from "../Pages/CareProviders/Dashboard/HomePage";
import JobDetails from "../Pages/CareProviders/Dashboard/JobDetails";
import MessageProvider from "../Pages/CareProviders/Dashboard/Message";
import RequestsProvider from "../Pages/CareProviders/Dashboard/Requests";
import RequestDetailsProvider from "../Pages/CareProviders/Dashboard/RequestDetails";
import SettingsProvider from "../Pages/CareProviders/Dashboard/Settings";
import VerifyIdentityProvider from "../Pages/CareProviders/Dashboard/VerifyIdentity";
import PasswordProvider from "../Pages/CareProviders/Dashboard/Password";
import WalletProvider from "../Pages/CareProviders/Dashboard/Wallet";
import Summary from "../Pages/CareSeekers/Dashboard/Summary";
import AdminLayout from "../Pages/Admin/AdminLayout";
import AdminLoginPage from "../Pages/Admin/LoginPage";
import Users from "../Pages/Admin/Users";
import Activities from "../Pages/Admin/Activities";
import Earnings from "../Pages/Admin/Earnings";
import Subscription from "../Pages/Admin/Subscription";
import Support from "../Pages/Admin/Support";
import ProfileVerificationSeeker from "../Pages/Admin/ProfileVerificationSeeker";
import ProfileVerificationProvider from "../Pages/Admin/ProfileVerificationProvider";
import MessageAdmin from "../Pages/Admin/Message";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/careseekers/dashboard/settings",
    element: <Settings />,
  },
  {
    path: "/careseekers/dashboard/verify-identity",
    element: <VerifyIdentity />,
  },
  {
    path: "/careseekers/dashboard/personal-information",
    element: <PersonalInformation />,
  },
  {
    path: "/careseekers/dashboard/password",
    element: <Password />,
  },
  {
    path: "/careseekers/dashboard/home",
    element: <DashboardHome />,
  },

  {
    path: "/careseekers/login",
    element: <CareSeekerLoginPage />,
  },
  {
    path: "/careseekers",
    element: <CareSeekerLoginPage />,
  },

  {
    path: "/careseekers/signup",
    element: <CareSeekerSignupPage />,
  },
  {
    path: "/careproviders/login",
    element: <CareProviderLoginPage />,
  },
  {
    path: "/careproviders/signup",
    element: <CareProviderSignupPage />,
  },
  {
    path: "/careseekers/dashboard/careproviders",
    element: <CareProvidersNearYouDashboard />,
  },
  {
    path: "/careseekers/dashboard/details",
    element: <ViewDetails />,
  },
  {
    path: "/careseekers/dashboard/requests",
    element: <Requests />,
  },
  {
    path: "/careseekers/dashboard/message",
    element: <Message />,
  },
  {
    path: "/careseekers/dashboard/setting",
    element: <Settings />,
  },
  {
    path: "/careseekers/dashboard/message_provider",
    element: <MessageDetails />,
  },
  {
    path: "/careseekers/dashboard/request_details",
    element: <RequestDetails />,
  },

  {
    path: "/careproviders/dashboard",
    element: <HomePage />,
  },
  {
    path: "/careproviders/dashboard/job_details",
    element: <JobDetails />,
  },
  {
    path: "/careproviders/dashboard/requests",
    element: <RequestsProvider />,
  },
  {
    path: "/careproviders/dashboard/request_details",
    element: <RequestDetailsProvider />,
  },
  {
    path: "/careproviders/dashboard/message",
    element: <MessageProvider />,
  },
  {
    path: "/careproviders/dashboard/setting",
    element: <SettingsProvider />,
  },
  {
    path: "/careproviders/dashboard/verify_identity",
    element: <VerifyIdentityProvider />,
  },
  {
    path: "/careproviders/dashboard/personal_information",
    element: <PersonalInformationProvider />,
  },
  {
    path: "/careproviders/dashboard/password",
    element: <PasswordProvider />,
  },
  {
    path: "/careproviders/dashboard/wallet",
    element: <WalletProvider />,
  },
  {
    path: "/careseekers/dashboard/summary",
    element: <Summary />,
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  // Admin routes
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Users /> },
      { path: "users", element: <Users /> },
      { path: "activities", element: <Activities /> },
      { path: "earnings", element: <Earnings /> },
      { path: "subscription", element: <Subscription /> },
  { path: "support", element: <Support /> },
  { path: "profile-verification", element: <ProfileVerificationSeeker /> },
  { path: "profile-verification/care-seekers", element: <ProfileVerificationSeeker /> },
  { path: "profile-verification/care-providers", element: <ProfileVerificationProvider /> },
  { path: "messages", element: <MessageAdmin /> },
    ],
  },
]);
