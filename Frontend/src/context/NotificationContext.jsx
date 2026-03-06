import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import socketService from '../utils/socketService';
import { API_BASE_URL } from '../config';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [alerts, setAlerts] = useState({
    mentorship: 0,
    resources: 0,
    networking: 0,
    dreamboard: 0
  });

  const [profile, setProfile] = useState(null);
  const location = useLocation();


  useEffect(() => {
    fetchProfile();
    fetchUnreadMessages(); // ✅ Fetch unread messages on mount
  }, []);

  // 2. Connect specific User Room when profile loads
  useEffect(() => {
    if (profile?.id) {

      socketService.connect();
      socketService.joinUser(profile.id);
    }
  }, [profile]);

  // 3. Socket Listener for Global Events
  useEffect(() => {
    const handleNewMessage = (data) => {
      console.log("🔔 [NotificationContext] new_message:", data);
      console.log("   Current path:", location.pathname);

      // Only increment if we are NOT on the networking page
      if (!location.pathname.includes('/networking')) {
        console.log("   -> Incrementing 'networking' alert");
        setAlerts(prev => ({
          ...prev,
          networking: (prev.networking || 0) + 1
        }));
      } else {
        console.log("   -> Ignored (user is on networking page)");
      }
    };

    socketService.on('new_message', handleNewMessage);

    return () => {
      socketService.off('new_message', handleNewMessage);
    };
  }, [location.pathname]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const userProfile = data.data || data;
        setProfile(userProfile);

        // ✅ FIX: Reset specific alerts based on role to prevent stale data
        if (userProfile.role === 'admin') {
          fetchAdminAlerts();
        } else {
          // If NOT admin, ensure mentorship count is 0 (even if stale state existed)
          setAlerts(prev => ({ ...prev, mentorship: 0 }));
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchAdminAlerts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}` };
      const mentorRes = await fetch(`${API_BASE_URL}/api/admin/mentor-applications?status=pending&limit=1`, { headers });
      if (mentorRes.ok) {
        const data = await mentorRes.json();
        const count = data.pagination?.total || 0;
        setAlerts(prev => ({ ...prev, mentorship: count }));
      }
    } catch (e) { console.error("Admin alert fetch error", e); }
  };

  // ✅ New function to fetch unread messages
  const fetchUnreadMessages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/messages/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setAlerts(prev => ({
          ...prev,
          networking: data.count || 0
        }));
      }
    } catch (error) {
      console.error("Failed to fetch unread messages:", error);
    }
  };

  // ✅ Exposed action to clear alerts
  const clearAlert = (section) => {
    setAlerts(prev => ({ ...prev, [section]: 0 }));
  };

  // ✅ Logout Action (Clears State & Socket)
  const logout = () => {

    setProfile(null);
    // Force reset all alerts
    // Force reset all alerts
    setAlerts({ mentorship: 0, resources: 0, networking: 0, dreamboard: 0 });
    socketService.disconnect();
    localStorage.clear();
  };

  return (
    <NotificationContext.Provider value={{ alerts, clearAlert, profile, refreshProfile: fetchProfile, logout }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
