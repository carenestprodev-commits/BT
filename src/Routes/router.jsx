/* eslint-disable no-unused-vars */
import { createBrowserRouter } from "react-router-dom";
import Home from "../Pages/Home/Home";
import CareSeekerLoginPage from "../Pages/CareSeekers/LoginPage";
import CareSeekerSignupPage from "../Pages/CareSeekers/Signup/Signup";
import ForgotPasswordPage from "../Pages/ForgotPasswordPage";
import OTPVerificationPage from "../Pages/OTPVerificationPage";
import ResetPasswordPage from "../Pages/ResetPasswordPage";
import PasswordResetSuccessPage from "../Pages/PasswordResetSuccessPage";
import CareProviderLoginPage from "../Pages/CareProviders/LoginPage";
import CareProviderSignupPage from "../Pages/CareProviders/Signup/Signup";
import CareProvidersNearYouDashboard from "../Pages/CareSeekers/Dashboard/CareProvidersNearYou";
import ViewDetails from "../Pages/CareSeekers/Dashboard/ViewDetails";
import Requests from "../Pages/CareSeekers/Dashboard/Requests";
import Message from "../Pages/CareSeekers/Dashboard/Message";
import PaymentSuccessRedirect from "../Pages/PaymentSuccessRedirect";
import Settings from "../Pages/CareSeekers/Dashboard/Settings.jsx";
import VerifyIdentity from "../Pages/CareSeekers/Dashboard/VerifyIdentity";
import PersonalInformation from "../Pages/CareSeekers/Dashboard/PersonalInformation";
import Password from "../Pages/CareSeekers/Dashboard/Password";
import MessageDetails from "../Pages/CareSeekers/Dashboard/MessageDetails";
import RequestDetails from "../Pages/CareSeekers/Dashboard/RequestDetails";
import PersonalInformationProvider from "../Pages/CareProviders/Dashboard/PersonalInformation";
import DashboardHome from "../Pages/CareSeekers/Dashboard/Home";
import PendingDetails from "../Pages/CareSeekers/Dashboard/PendingDetails";

import HomePage from "../Pages/CareProviders/Dashboard/HomePage";
import JobDetails from "../Pages/CareProviders/Dashboard/JobDetails";
import MessageProvider from "../Pages/CareProviders/Dashboard/Message";
import RequestsProvider from "../Pages/CareProviders/Dashboard/Requests";
import RequestDetailsProvider from "../Pages/CareProviders/Dashboard/RequestDetails";
import SettingsProvider from "../Pages/CareProviders/Dashboard/Settings";
import VerifyIdentityProvider from "../Pages/CareProviders/Dashboard/VerifyIdentity";
import PasswordProvider from "../Pages/CareProviders/Dashboard/Password";
import WalletProvider from "../Pages/CareProviders/Dashboard/Wallet";
import Payment from "../Pages/CareProviders/Dashboard/Payment";

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

import BookingService from "../Pages/CareSeekers/BookingaService/Signup";

// Import role protection components
import RoleProtectedRoute from "../Components/RoleProtectedRoute";
import PreventOtherLogin from "../Components/PreventOtherLogin";
import AlreadyLoggedIn from "../Pages/AlreadyLoggedIn";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/verify-otp",
    element: <OTPVerificationPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/password-reset-success",
    element: <PasswordResetSuccessPage />,
  },
  {
    path: "/unauthorized",
    element: <AlreadyLoggedIn />,
  },
  {
    path: "/already-logged-in",
    element: <AlreadyLoggedIn />,
  },
  {
    path: "/careseekers/dashboard/settings",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <Settings />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careseekers/dashboard/verify-identity",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <VerifyIdentity />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careseekers/dashboard/personal-information",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <PersonalInformation />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careseekers/dashboard/password",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <Password />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careseekers/dashboard/home",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <DashboardHome />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careseekers/dashboard",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <DashboardHome />
      </RoleProtectedRoute>
    ),
  },

  {
    path: "/careseekers/login",
    element: (
      <PreventOtherLogin role="seeker">
        <CareSeekerLoginPage />
      </PreventOtherLogin>
    ),
  },
  {
    path: "/careseekers",
    element: (
      <PreventOtherLogin role="seeker">
        <CareSeekerLoginPage />
      </PreventOtherLogin>
    ),
  },

  {
    path: "/careseekers/signup",
    element: (
      <PreventOtherLogin role="seeker">
        <CareSeekerSignupPage />
      </PreventOtherLogin>
    ),
  },
  {
    path: "/careproviders/login",
    element: (
      <PreventOtherLogin role="provider">
        <CareProviderLoginPage />
      </PreventOtherLogin>
    ),
  },
  {
    path: "/careproviders/signup",
    element: (
      <PreventOtherLogin role="provider">
        <CareProviderSignupPage />
      </PreventOtherLogin>
    ),
  },
  {
    path: "/careseekers/dashboard/careproviders",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <CareProvidersNearYouDashboard />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careseekers/dashboard/details/:id",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <ViewDetails />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careseekers/dashboard/requests",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <Requests />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careseekers/dashboard/pending_details",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <PendingDetails />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careseekers/dashboard/pending_details/:id",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <PendingDetails />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careseekers/dashboard/message",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <Message />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/payment-success",
    element: <PaymentSuccessRedirect />,
  },
  {
    path: "/careseekers/dashboard/setting",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <Settings />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careseekers/dashboard/message_provider/:id",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <MessageDetails />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careseekers/dashboard/request_details/:id",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <RequestDetails />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careseekers/bookservice",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <BookingService />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careseekers/dashboard/summary",
    element: (
      <RoleProtectedRoute allowedRole="seeker">
        <Summary />
      </RoleProtectedRoute>
    ),
  },

  {
    path: "/careproviders/dashboard",
    element: (
      <RoleProtectedRoute allowedRole="provider">
        <HomePage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careproviders/dashboard/home",
    element: (
      <RoleProtectedRoute allowedRole="provider">
        <HomePage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careproviders/dashboard/job_details",
    element: (
      <RoleProtectedRoute allowedRole="provider">
        <JobDetails />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careproviders/dashboard/requests",
    element: (
      <RoleProtectedRoute allowedRole="provider">
        <RequestsProvider />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careproviders/dashboard/request_details",
    element: (
      <RoleProtectedRoute allowedRole="provider">
        <RequestDetailsProvider />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careproviders/dashboard/request_details/:id",
    element: (
      <RoleProtectedRoute allowedRole="provider">
        <RequestDetailsProvider />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careproviders/dashboard/message",
    element: (
      <RoleProtectedRoute allowedRole="provider">
        <MessageProvider />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careproviders/dashboard/setting",
    element: (
      <RoleProtectedRoute allowedRole="provider">
        <SettingsProvider />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careproviders/dashboard/settings",
    element: (
      <RoleProtectedRoute allowedRole="provider">
        <SettingsProvider />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careproviders/dashboard/verify_identity",
    element: (
      <RoleProtectedRoute allowedRole="provider">
        <VerifyIdentityProvider />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careproviders/dashboard/personal_information",
    element: (
      <RoleProtectedRoute allowedRole="provider">
        <PersonalInformationProvider />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careproviders/dashboard/password",
    element: (
      <RoleProtectedRoute allowedRole="provider">
        <PasswordProvider />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careproviders/dashboard/wallet",
    element: (
      <RoleProtectedRoute allowedRole="provider">
        <WalletProvider />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/careproviders/dashboard/payment",
    element: (
      <RoleProtectedRoute allowedRole="provider">
        <Payment />
      </RoleProtectedRoute>
    ),
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
      {
        path: "profile-verification/care-seekers",
        element: <ProfileVerificationSeeker />,
      },
      {
        path: "profile-verification/care-providers",
        element: <ProfileVerificationProvider />,
      },
      { path: "messages", element: <MessageAdmin /> },
    ],
  },
]);
