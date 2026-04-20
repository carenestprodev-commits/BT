import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../Redux/config";
import { fetchWithAuth } from "../lib/fetchWithAuth";

const CERTIFICATE_ROUTE = "/careproviders/dashboard/certificate-upload";
const PROVIDER_DASHBOARD_PREFIX = "/careproviders/dashboard";

export default function ProviderCertificateGuard({ user, children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [hasTrainingCertificate, setHasTrainingCertificate] = useState(false);

  const isProviderDashboardPath =
    location.pathname.startsWith(PROVIDER_DASHBOARD_PREFIX);
  const isCertificateRoute = location.pathname === CERTIFICATE_ROUTE;

  useEffect(() => {
    let cancelled = false;

    async function loadProviderGate() {
      if (user?.user_type !== "provider" || !isProviderDashboardPath) {
        if (!cancelled) {
          setHasTrainingCertificate(true);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const response = await fetchWithAuth(
          `${BASE_URL}/api/provider/profile/personal-info/`,
        );
        const payload = await response.json();
        if (!cancelled) {
          setHasTrainingCertificate(
            Boolean(payload?.user_data?.has_training_certificate),
          );
        }
      } catch {
        if (!cancelled) {
          setHasTrainingCertificate(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProviderGate();
    return () => {
      cancelled = true;
    };
  }, [user?.user_type, isProviderDashboardPath]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-600 font-sfpro">
        Checking account setup...
      </div>
    );
  }

  if (!hasTrainingCertificate && isProviderDashboardPath && !isCertificateRoute) {
    return <Navigate to={CERTIFICATE_ROUTE} replace />;
  }

  if (hasTrainingCertificate && isCertificateRoute) {
    return <Navigate to="/careproviders/dashboard/home" replace />;
  }

  return children;
}
