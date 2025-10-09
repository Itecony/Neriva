import React, { useState } from "react";
import AuthLayout from "./AuthComponents/AuthLayout"
import AuthCard from "./AuthComponents/AuthCard"
import AuthLink from "./AuthComponents/AuthLink"
import AuthButton from "./AuthComponents/AuthButton"
// import Logo from "./AuthComponents/Logo"
import OnboardingModal from "./UserOnboarding";
import InputField from "./AuthComponents/InputField";
import { FcGoogle } from "react-icons/fc";


const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = "/Admin";
    // 🔌 Call POST /api/auth/login
  };

  return (
    <AuthLayout image="/assets/Login.png">
      <AuthCard>
        {/* <Logo /> */}
        <h2 className="text-xl font-semibold text-center mt-4 text-white">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
          <InputField id="email" label="Email" type="email" placeholder="email"
            value={form.email} onChange={handleChange} />
          <InputField id="password" label="Password" type="password" placeholder="Password"
            value={form.password} onChange={handleChange} />
            <div className="flex justify-between items-center mb-4">
              <AuthLink to="/forgot-password">Forgot Password?</AuthLink>
            </div>
          <AuthButton type="submit" label="Continue" />
          <div className="flex justify-between items-center">
              <span className="text-white">Don't have an account? <AuthLink to="/Signup" design="underline">SignUp</AuthLink></span>
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
            className="flex items-center justify-start gap-2 border border-gray-300 rounded-full px-2 py-2 w-10 hover:bg-gray-100 transition"
          >
            <FcGoogle className="text-2xl" />
          </button>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;
