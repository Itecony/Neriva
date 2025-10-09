import { Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./UserDetail/Login";
import Signup from "./UserDetail/Signup";
import Register from "./UserDetail/Register";
import MFA from "./UserDetail/MFA";
import ForgotPassword from "./UserDetail/ForgotPassword";

// import Dashboard from "./Pages/Dashboard";
import LandingPage from "./Pages/LandingPage/LandingPage";

function App() {
  return (
      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mfa" element={<MFA />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        {/* Dashboard route */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* Admin routes */}
      </Routes>
  );
}

export default App;
