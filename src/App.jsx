import { Routes, Route, useParams } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./ProtectedRoute.jsx";

// Auth Components
import Login from "./UserDetail/Login";
import Signup from "./UserDetail/Signup";
import Register from "./UserDetail/Register";
import MFA from "./UserDetail/MFA";
import ForgotPassword from "./UserDetail/ForgotPassword";

// Layouts & Main Pages
import UserLayout from "./Pages/User/ReUsable/UserLayout.jsx";
import LandingPage from "./Pages/LandingPage/LandingPage";
import Dreamboard from "./Pages/User/Dreamboard/Dreamboard.jsx";

// Profile Components
import Profile from "./UserDetail/profile.jsx";

// Resource Components
import ResourceHub from "./Pages/User/Resource/ResourceHub.jsx";
import ResourceDetail from "./Pages/User/Resource/ResourceDetail.jsx";

// Networking Components
import Networking from "./Pages/User/Networking/Networking.jsx";

// Mentorship Components
import MentorshipHub from "./Pages/User/Mentorship/MentorshipHub.jsx";
import MentorProfileView from "./Pages/User/Mentorship/MentorProfileView.jsx";
import MentorProfilePersonal from "./Pages/User/Mentorship/MentorProfilePersonal.jsx";
import MentorApplicationReview from "./Pages/User/Mentorship/MentorApplicationReview.jsx";
// ---------------------------------------------------------
// ✅ Main App Component with Routing
// ---------------------------------------------------------

function App() {
  return (
    <Routes>
      {/* ------------------------------------------------ */}
      {/* 🔓 PUBLIC ROUTES (No Sidebar/Layout)             */}
      {/* ------------------------------------------------ */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/mfa" element={<MFA />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ------------------------------------------------ */}
      {/* 🔒 PROTECTED ROUTES (Shared Sidebar Layout)      */}
      {/* ------------------------------------------------ */}
      {/* This single wrapper keeps the Sidebar mounted 
          when navigating between any of the child routes below.
      */}
      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        {/* --- Dreamboard Section --- */}
        <Route path="/dreamboard" element={<Dreamboard />} />

        {/* Networking (Main & Specific Chat) */}
        <Route path="/dreamboard/networking" element={<Networking />} />
        <Route path="/dreamboard/networking/messages/:conversationId" element={<Networking />} />

        {/* Mentorship Hub */}
        <Route path="/dreamboard/mentorship" element={<MentorshipHub />} />

        {/* --- Global Resources --- */}
        <Route path="/resources" element={<ResourceHub />} />
        <Route path="/resource/:resourceId" element={<ResourceDetailWithParams />} />

        {/* --- Profile Section --- */}
        {/* My Personal Profile */}
        <Route path="/profile" element={<Profile isPersonal={true} />} />
        {/* Viewing Others */}
        <Route path="/profile/:userId" element={<ProfileWithParams />} />

        {/* --- Mentorship Section --- */}
        {/* My Mentor Dashboard */}
        <Route path="/mentor/profile" element={<MentorProfilePersonal />} />
        {/* Viewing a Mentor */}
        <Route path="/mentor/:mentorId" element={<MentorProfileViewWithParams />} />
        {/* Admin: Mentor Application Reviews */}
        <Route path="/admin/mentor-applications" element={<MentorApplicationReview />} />

        {/* User Application Flow */}
        <Route path="/become-mentor" element={<MentorApplicationReview />} />
      </Route>

    </Routes>
  );
}

// ---------------------------------------------------------
// ✅ Helper Components to extract Params
// ---------------------------------------------------------

function ProfileWithParams() {
  const { userId } = useParams();
  return <Profile userId={userId} isPersonal={false} />;
}

function MentorProfileViewWithParams() {
  const { mentorId } = useParams();
  return <MentorProfileView mentorId={mentorId} />;
}

function ResourceDetailWithParams() {
  const { resourceId } = useParams();
  return <ResourceDetail resourceId={resourceId} />;
}

export default App;