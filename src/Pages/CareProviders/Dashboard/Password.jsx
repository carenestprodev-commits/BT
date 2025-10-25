import { useState } from "react";
import Sidebar from "./Sidebar";
// useNavigate not needed here
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { changePassword } from "../../../Redux/PasswordChange";

function Password() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({ password: false, confirm: false });

  // Strong password: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  const isPasswordStrong = strongPasswordRegex.test(password);
  const isConfirmMatch =
    password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = isPasswordStrong && isConfirmMatch;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await dispatch(
        changePassword({ password, confirm_password: confirmPassword })
      );
      if (res && res.payload && res.payload.message) {
        alert(res.payload.message);
        setPassword("");
        setConfirmPassword("");
        setTouched({ password: false, confirm: false });
      } else if (res && res.error && res.error.message) {
        alert(res.error.message);
      } else {
        alert("Password changed");
      }
    } catch (err) {
      console.error(err);
      alert("Password change failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar active="Setting" />
      <div className="flex-1 font-sfpro px-4 md:px-8 py-8 md:ml-64">
        <div className="mb-8 flex items-center">
          <button
            className="mr-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            onClick={() => window.history.back()}
          >
            ←
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">Password</h2>
        </div>
        <div className="max-w-xl space-y-6">
          <div>
            <div className="text-gray-500 mb-2">Password</div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Input password"
                className={`w-full border rounded-lg px-4 py-3 bg-white text-gray-800 pr-10 ${
                  touched.password && !isPasswordStrong
                    ? "border-red-400"
                    : "border-gray-200"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {touched.password && !isPasswordStrong && (
              <div className="text-xs text-red-500 mt-1">
                Password must be at least 8 characters, include uppercase,
                lowercase, number, and special character.
              </div>
            )}
          </div>
          <div>
            <div className="text-gray-500 mb-2">Confirm Password</div>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Input password"
                className={`w-full border rounded-lg px-4 py-3 bg-white text-gray-800 pr-10 ${
                  touched.confirm && !isConfirmMatch
                    ? "border-red-400"
                    : "border-gray-200"
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {touched.confirm && !isConfirmMatch && (
              <div className="text-xs text-red-500 mt-1">
                Passwords do not match.
              </div>
            )}
          </div>
          <button
            className={`w-full bg-[#0d99c9] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition ${
              !canSubmit || loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!canSubmit || loading}
            onClick={handleSubmit}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Password;
