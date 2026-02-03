import { useState, useEffect } from "react";
import CareLogo from "../../../public/CareLogo.png";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../../Redux/Login";
import formatAuthError from "../../utils/formatAuthError";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));

    // Debug what we got back
    console.log("Login result:", result);

    // Small delay to ensure localStorage is written
    setTimeout(() => {
      const access = localStorage.getItem("access");
      console.log("Access in localStorage after delay:", access);
      console.log(
        "User in localStorage after delay:",
        localStorage.getItem("user"),
      );

      if (access) {
        console.log("Access token found, redirecting to /admin");
        navigate("/admin");
        return;
      }

      const raw = formatAuthError(result);
      if (/user type|wrong user|incorrect user|not authorized/i.test(raw)) {
        setError("Wrong user type — please login through the correct portal");
      } else if (/network error/i.test(raw)) {
        setError("Network error — please check your connection");
      } else if (
        /401|invalid credentials|credentials|unauthorized/i.test(raw)
      ) {
        setError("Wrong credentials — please check your email and password");
      } else {
        setError(raw);
      }
    }, 100);
  };

  useEffect(() => {
    const access = localStorage.getItem("access");
    console.log("useEffect check - Access token:", access);
    if (access) {
      console.log("Access token found on mount, redirecting to /admin");
      navigate("/admin");
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
