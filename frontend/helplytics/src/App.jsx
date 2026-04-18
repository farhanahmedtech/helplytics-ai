import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { Landing } from "./pages/Landing.jsx";
import { Auth } from "./pages/Auth.jsx";
import { Onboarding } from "./pages/Onboarding.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Explore } from "./pages/Explore.jsx";
import { CreateRequest } from "./pages/CreateRequest.jsx";
import { RequestDetail } from "./pages/RequestDetail.jsx";
import { Messages } from "./pages/Messages.jsx";
import { Leaderboard } from "./pages/Leaderboard.jsx";
import { AICenter } from "./pages/AICenter.jsx";
import { Notifications } from "./pages/Notifications.jsx";
import { Profile } from "./pages/Profile.jsx";
import { Admin } from "./pages/Admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute requireOnboarding={false}>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/requests/new" element={<CreateRequest />} />
        <Route path="/requests/:id" element={<RequestDetail />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:userId" element={<Messages />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/ai-center" element={<AICenter />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
