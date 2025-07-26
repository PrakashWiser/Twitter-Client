import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import Sidebar from "./components/common/Siderbar";
import RightPanel from "./components/common/RigntPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { ZoomLoader } from "./components/common/LoadingSpinner";
import { fetchAuthUser, fetchSuggestedUsers } from "./api/FetchauthUser";
import { messaging, getToken, onMessage } from "./firebase/config";

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  const {
    data: authUser,
    isLoading: loadingUser,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: fetchAuthUser,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: suggestedUsers } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: fetchSuggestedUsers,
    enabled: !!authUser,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!authUser) return;

    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then(async (permission) => {
        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: "BK-hZDd4XuHFv8JMDWRSsWGePCqk1H6NGR8Har_JSAbSIW6u-Bowe3BFDi9ALSweQbNXAR-HgyXdWe4Mw7lXWcw",
          });
          console.log("📱 FCM Token:", token);
        }
      });
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      const { title, body } = payload.notification;

      new Notification(title, {
        body,
        icon: "/chat-icon.png",
      });
    });
    return () => unsubscribe();
  }, [authUser]);

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ZoomLoader />
      </div>
    );
  }

  if (!authUser && !isAuthPage) return <Navigate to="/login" replace />;
  if (authUser && isAuthPage) return <Navigate to="/" replace />;

  const shouldShowSidebar = !!authUser;
  const shouldShowRightPanel = !!authUser && suggestedUsers?.length > 0;
  const layoutClass = shouldShowRightPanel ? "flex max-w-6xl mx-auto" : "flex w-full";

  return (
    <div className="min-h-screen bg-base-100">
      <div className={layoutClass}>
        {shouldShowSidebar && <Sidebar />}
        <div className="flex-1 min-h-screen overflow-y-auto mb-15 md:mb-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Routes>
        </div>
        {shouldShowRightPanel && <RightPanel suggestedUsers={suggestedUsers} />}
      </div>
      <Toaster />
    </div>
  );
}

export default App;
