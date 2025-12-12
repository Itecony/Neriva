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

// Import your user pages
// import Home from "./Pages/User/Home/Home.jsx";
import Dreamboard from "./Pages/User/Dreamboard/Dreamboard.jsx";
// import ResourceLibrary from "./Pages/User/ResourceLibrary";
// import MentorshipHub from "./Pages/User/MentorshipHub";
// import Challenges from "./Pages/User/Challenges";
// import Funding from "./Pages/User/Funding";
// import Jobs from "./Pages/User/Jobs";
import Networking from "./Pages/User/Networking/Networking.jsx";
// import Settings from "./Pages/User/Settings";

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

        {/* Protected routes */}
      <Route path="/dreamboard" element={
        <ProtectedRoute>
          <UserLayout />
        </ProtectedRoute>
      }>
          <Route index element={<Dreamboard />} />
          {/* <Route path="dreamboard" element={<Dreamboard />} /> */}
          {/* <Route path="resources" element={<ResourceLibrary />} />
          <Route path="mentorship" element={<MentorshipHub />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="funding" element={<Funding />} />
          <Route path="jobs" element={<Jobs />} /> */}
          <Route path="networking" element={<Networking />} />
          {/* <Route path="settings" element={<Settings />} /> */}
        </Route>
        {/* Personal Profile */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Profile isPersonal={true} />} />
          </Route>

          {/* Other User's Profile */}
          <Route path="/profile/:userId" element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ProfileWithParams />} />
          </Route>
      </Routes>
  );
}
// Helper component to extract userId from URL params
function ProfileWithParams() {
  const { userId } = useParams();
  return <Profile userId={userId} isPersonal={false} />;
}

export default App;
