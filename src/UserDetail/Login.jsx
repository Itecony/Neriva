import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import AuthLink from "./AuthComponents/AuthLink";
import AuthButton from "./AuthComponents/AuthButton";
import InputField from "./AuthComponents/InputField";
import { FcGoogle } from "react-icons/fc";
import OnboardingModal from "./UserOnboarding";
import api from "../api";

const Login = () => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Login returns { token, user }
      const response = await api.login({
        email: form.email,
        password: form.password,
      });

      console.log("✅ Login successful");
      console.log("User from login:", response.user);

      // According to docs, login response includes everything in user object
      const user = response.user;

      // Check if user has completed onboarding
      // According to docs: user has role and interests fields
      const hasRole = user.role && user.role !== '';
      const hasInterests = Array.isArray(user.interests) && user.interests.length > 0;

      console.log("Role:", user.role);
      console.log("Interests:", user.interests);
      console.log("Has role?", hasRole);
      console.log("Has interests?", hasInterests);
 
      if (!hasRole || !hasInterests) {
        console.log("⚠️ User needs onboarding - showing modal");
        setShowModal(true);
      } else {
        console.log("✅ User completed onboarding - navigating to dashboard");
        navigate("/dreamboard");
      }

    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      console.error("❌ Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // Redirect to Google OAuth
    window.location.href = 'https://itecony-neriva-backend.onrender.com/api/auth/google';
  };

  const handleModalClose = () => {
    // Simply close modal and navigate to dashboard
    // No need to save anything - backend already has the data
    setShowModal(false);
    navigate("/dashboard");
  };

  return (
    <AuthLayout image="/assets/Login.png">
      <AuthCard>
        <h2 className="text-xl font-semibold text-center mt-4 text-white">
          Welcome Back
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
          <InputField
            id="email"
            label="Email"
            type="email"
            placeholder="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <div className="flex justify-between items-center mb-4">
            <AuthLink to="/forgot-password">Forgot Password?</AuthLink>
          </div>

          <AuthButton
            type="submit"
            label={loading ? "Loading..." : "Login"}
            disabled={loading}
          />

          <div className="flex justify-between items-center">
            <span className="text-white">
              Don't have an account?{" "}
              <AuthLink to="/Signup" design="underline">
                SignUp
              </AuthLink>
            </span>
          </div>
        </form>

        <div className="flex items-center w-full mt-5">
          <div className="flex-grow border-t border-white"></div>
          <span className="mx-4 text-white text-sm">Or Continue with</span>
          <div className="flex-grow border-t border-white"></div>
        </div>

        <div className="flex w-full mt-2 justify-center">
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="flex items-center justify-start gap-2 border border-gray-300 rounded-full px-2 py-2 w-10 hover:bg-gray-100 transition"
          >
            <FcGoogle className="text-2xl" />
          </button>
        </div>
      </AuthCard>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showModal}
        onClose={handleModalClose}
        existingData={null} // First time, no existing data
      />
    </AuthLayout>
  );
};

export default Login;