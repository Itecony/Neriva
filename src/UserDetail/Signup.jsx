import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthComponents/AuthLayout";
import AuthCard from "./AuthComponents/AuthCard";
import AuthLink from "./AuthComponents/AuthLink";
import AuthButton from "./AuthComponents/AuthButton";
import InputField from "./AuthComponents/InputField";
import { FcGoogle } from "react-icons/fc";
import api from "../api";

const Signup = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
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
      const userData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      };

      const response = await api.signup(userData);
      console.log("Signup successful:", response);
      
      navigate("/login");
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false); // ✅ Stops loader
    }
  };

  return (
    <AuthLayout image="/assets/Signup.png">
      <AuthCard>
        <h2 className="text-xl font-semibold text-center mt-4 text-white">
          Create an Account
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-6">
          <div className="grid grid-cols-2 gap-x-3">
            <InputField
              id="firstName"
              label="First Name"
              type="text"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <InputField
              id="lastName"
              label="Last Name"
              type="text"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
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
          
          {/* ✅ FIXED: Pass the 'loading' state and correct label */}
          <AuthButton 
            label="Sign Up" 
            loading={loading} 
          />
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default Signup;