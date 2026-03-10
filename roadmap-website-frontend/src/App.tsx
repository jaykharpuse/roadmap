import { Route, Routes } from "react-router-dom"
import ProtectedRoute from "@/components/ProtectedRoute";
import Signup from "./pages/authpages/register-user"
import Verify from "./pages/authpages/otp-verify"
import Login from "./pages/authpages/login"
import ForgotPassword from "./pages/authpages/forgot-password"
import ResetPassword from "./pages/authpages/reset-password"
import Navbar from "./pages/main-pages/navbar"
import Roadmaps from "./pages/roadmap/roadmaps"
import Home from "./pages/main-pages/home-page"
import Resources from "./pages/resources"
import { useEffect } from "react"
import { socket } from "./helper/useSocket"
import { useAuth } from "./contexts/authContext"
import GenerateRoadmap from "./pages/roadmap-generation/generate-roadmap"
import RoadmapDetailsPage from "./pages/roadmap/getroadmapdetails-page"
import Dashboard from "./pages/Analytics/main"
import ResourceDetails from "@/pages/resource-details";
import UserProfile from "./pages/profile/user-profile";


function App() {
  const { user } = useAuth()
  useEffect(() => {
    if (user) socket.emit("registerUser", user?._id);

  }, [user])
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/roadmap" element={<Roadmaps />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify/:email" element={<Verify />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/roadmaps" element={<Roadmaps />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/details/:roadmapId" element={<RoadmapDetailsPage />} />
        <Route path="/generate-roadmap" element={<GenerateRoadmap />} />
        <Route path="/progress" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/resources/:id" element={<ResourceDetails />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

export default App
