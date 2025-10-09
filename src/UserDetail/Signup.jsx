import React, { useState } from "react";
import AuthLayout from "./AuthComponents/AuthLayout"
import AuthCard from "./AuthComponents/AuthCard"
import AuthLink from "./AuthComponents/AuthLink"
import AuthButton from "./AuthComponents/AuthButton"
import InputField from "./AuthComponents/InputField";
import OnboardingModal from "./UserOnboarding";
import { FcGoogle } from "react-icons/fc";

const Signup = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Open the modal after signup
    setShowModal(true);
    // You can also add your signup API call here
    // After successful signup, then open modal
  };

  const handleModalClose = () => {
  setShowModal(false);
  // Modal closes, user stays on the current page
};

  return (
    <>
      <AuthLayout image="/assets/Signup.png">
        <AuthCard>
          <h2 className="text-xl font-semibold text-center mt-4 text-white">Create an Account</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-6">
            <div className="grid grid-cols-2 gap-x-3">
              <InputField id="First" label="First Name" type="text" placeholder="First Name"
                value={form.First} onChange={handleChange} />
              <InputField id="Last" label="Last Name" type="text" placeholder="Last Name"
                value={form.Last} onChange={handleChange} />
            </div>
            <InputField id="email" label="Email" type="email" placeholder="email"
              value={form.email} onChange={handleChange} />
            <InputField id="password" label="Password" type="password" placeholder="Password"
              value={form.password} onChange={handleChange} />
            <div className="flex justify-between items-center mb-4">
              <AuthLink to="/forgot-password">Forgot Password?</AuthLink>
            </div>
            <AuthButton type="submit" label="Sign Up" />
          </form>
          <button
            type="button"
            className="flex items-center justify-center mt-3 gap-2 border border-gray-300 rounded-lg px-4 py-2 w-full hover:bg-gray-100 transition"
          >
            <FcGoogle className="text-2xl" /><span className="font-semibold">Continue with Google</span>
          </button>
        </AuthCard>
      </AuthLayout>

      {/* Onboarding Modal */}
      <OnboardingModal isOpen={showModal} onClose={handleModalClose} />
    </>
  );
};

export default Signup;