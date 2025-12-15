import { Routes, Route, useParams } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./ProtectedRoute.jsx";

import Login from "./UserDetail/Login";
import Signup from "./UserDetail/Signup";
import Register from "./UserDetail/Register";
import MFA from "./UserDetail/MFA";
import ForgotPassword from "./UserDetail/ForgotPassword";
import UserLayout from "./Pages/User/ReUsable/UserLayout.jsx";
import Profile from "../src/UserDetail/profile.jsx";
import ResourceDetail from "./Pages/User/Resource/ResourceDetail.jsx";
import MentorProfileView from "./Pages/User/Mentorship/MentorProfileView.jsx";
import MentorProfilePersonal from "./Pages/User/Mentorship/MentorProfilePersonal.jsx";
import MentorRegistrationForm from "./Pages/User/Mentorship/MentorRegistrationForm.jsx";

// Import your user pages
import Dreamboard from "./Pages/User/Dreamboard/Dreamboard.jsx";
import ResourceHub from "./Pages/User/Resource/ResourceHub.jsx";
import Networking from "./Pages/User/Networking/Networking.jsx";
import MentorshipHub from "./Pages/User/Mentorship/MentorshipHub.jsx";
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

      {/* Protected routes with UserLayout */}
      <Route
        path="/dreamboard"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dreamboard />} />
        <Route path="resources" element={<ResourceHub />} />
        <Route path="networking" element={<Networking />} />
        <Route path="mentorship" element={<MentorshipHub />} />
      </Route>

      {/* Personal User Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Profile isPersonal={true} />} />
      </Route>

      {/* Other User's Profile */}
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProfileWithParams />} />
      </Route>

      {/* Personal Mentor Profile */}
      <Route
        path="/mentor/profile"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MentorProfilePersonal />} />
      </Route>

      {/* Other Mentor's Profile */}
      <Route
        path="/mentor/:mentorId"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MentorProfileViewWithParams />} />
      </Route>

      {/* Mentor Registration */}
      <Route
        path="/become-mentor"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MentorRegistrationForm />} />
      </Route>

      {/* Resource Detail */}
      <Route
        path="/resource/:resourceId"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ResourceDetailWithParams />} />
      </Route>

      {/* Resource Hub */}
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ResourceHub />} />
      </Route>
    </Routes>
  );
}

// Helper component to extract mentorId from URL params
function MentorProfileViewWithParams() {
  const { mentorId } = useParams();
  return <MentorProfileView mentorId={mentorId} />;
}

// Helper component to extract userId from URL params
function ProfileWithParams() {
  const { userId } = useParams();
  return <Profile userId={userId} isPersonal={false} />;
}

// Helper component to extract resourceId from URL params
function ResourceDetailWithParams() {
  const { resourceId } = useParams();
  return <ResourceDetail resourceId={resourceId} />;
}

export default App;