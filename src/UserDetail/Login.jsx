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
  const [loading, setLoading] = useState(false); // ✅ This is your state
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // ✅ Starts loader

    try {
      const response = await api.login({
        email: form.email,
        password: form.password,
      });

      console.log("✅ Login successful");
      const user = response.user;

      const hasRole = user.role && user.role !== '';
      const hasInterests = Array.isArray(user.interests) && user.interests.length > 0;
 
      if (!hasRole || !hasInterests) {
        setShowModal(true);
      } else {
        navigate("/dreamboard");
      }

    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      console.error("❌ Login error:", err);
    } finally {
      setLoading(false); // ✅ Stops loader
    }
  };

  const handleModalClose = () => {
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

          {/* ✅ FIXED: Pass the 'loading' state here */}
          <AuthButton 
            label="Sign In" 
            loading={loading} 
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
      </AuthCard>

      <OnboardingModal
        isOpen={showModal}
        onClose={handleModalClose}
        existingData={null}
      />
    </AuthLayout>
  );
};

export default Login;