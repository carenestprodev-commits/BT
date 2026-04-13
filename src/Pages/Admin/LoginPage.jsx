import { useState, useEffect } from "react";
import CareLogo from "../../../public/CareLogo.png";
import { Link, useNavigate } from "react-router-dom";
import tokenService from "../../utils/tokenService";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Call the admin-specific login endpoint
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle error responses
        if (res.status === 403) {
          setError("You are not authorized to access admin login");
        } else if (res.status === 401) {
          setError("Invalid email or password");
        } else {
          setError(data.error || "Login failed. Please try again.");
        }
        return;
      }

      // Store tokens and admin user data using tokenService
      tokenService.setSession({
        access: data.access,
        refresh: data.refresh,
        user: data.admin,
      });

      console.log("Admin login successful, redirecting to /admin");
      navigate("/admin");
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error — please check your connection");
    }
  };

  useEffect(() => {
    const access = tokenService.getAccessToken();
    const user = tokenService.getUser();

    if (access && user) {
      // Check if user is admin or staff
      if (user.is_staff) {
        console.log("Admin user already logged in, redirecting to /admin");
        navigate("/admin");
      }
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white font-sfpro">
      {/* Logo + Title */}
      <div className="flex items-center mb-8 space-x-2">
        <img src={CareLogo} alt="CareNestPro Logo" className="h-14" />
        <h1 className="text-2xl font-sfpro font-semibold text-[#024a68]">
          CareNest<span className="text-[#00b3a4]">Pro</span>
        </h1>
      </div>

      {/* Login Box */}
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
        <div className="flex justify-end mb-6">
          <Link to="/">
            <button className="border border-gray-300 rounded-md py-2 px-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition">
              ←
            </button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 font-tomato">
          Log In
        </h2>
        {error && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <p className="text-gray-500 text-md mt-1 mb-6 font-sfpro">
          Welcome back, Please enter your login details
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium  mb-1 text-gray-700 font-sfpro ">
              Email Address
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Input email address"
              className="font-sfpro w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-white dark:text-gray-700"
            />
          </div>

          {/* Password with Eye Icon */}
          <div className="font-sfpro">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Input password"
                className="dark:bg-white dark:text-gray-700 w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {/* Eye Icon */}
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  // Eye-off icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.263.235-2.465.662-3.575M3.515 3.515l16.97 16.97M9.88 9.88A3 3 0 0012 15a3 3 0 002.121-5.121"
                    />
                  </svg>
                ) : (
                  // Eye icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <a
              href="#"
              className="text-xs text-[#007bb0] inline-block mt-5 mb-5"
            >
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="font-sfpro w-full bg-[#0093d1] text-white font-medium py-2 rounded-md hover:bg-[#007bb0] transition"
          >
            Log In
          </button>
        </form>

        {/* Sign Up */}
        <p className="text-center text-sm text-gray-500 mt-6 font-sfpro">
          Don&apos;t have an account yet?{" "}
          <Link to="/careseekers/signup">
            <span className="text-[#007bb0] hover:underline">Sign Up</span>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
