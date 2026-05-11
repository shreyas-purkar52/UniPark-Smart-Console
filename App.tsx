
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { FloorMap } from './views/FloorMap';
import { VisitorLogs } from './views/VisitorLogs';
import { AfterHoursDashboard } from './views/AfterHoursDashboard';
import { Settings } from './views/Settings';
import { Profile } from './views/Profile';
import { StatusFooter } from './components/StatusFooter';
import { NotificationToast } from './components/NotificationToast';
import { ViewType, ParkingSlot, ParkingLog, Vehicle, AuthUser } from './types';
import { STORAGE_KEYS } from './constants';
import { api } from './api';

const App: React.FC = () => {
  // --- AUTHENTICATION STATE ---
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- THEME ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('unipark_theme') !== 'light';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('unipark_theme', 'dark');
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('unipark_theme', 'light');
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => setIsDarkMode(prev => !prev);

  // Notification System
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);

  // --- APP DATA STATE ---
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [logs, setLogs] = useState<ParkingLog[]>([]);

  // --- SYSTEM HEALTH ---
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  const fetchData = async () => {
      try {
          const { slots, logs, vehicles } = await api.getDashboardState();
          setSlots(slots);
          setLogs(logs);
          setVehicles(vehicles);
      } catch (e) {
          console.error("Failed to sync data", e);
      }
  };

  // --- SYSTEM BOOTSTRAP ---
  useEffect(() => {
    // 1. Check for Active Session
    const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (savedSession) {
        try {
            setCurrentUser(JSON.parse(savedSession));
        } catch (e) {
            localStorage.removeItem(STORAGE_KEYS.SESSION);
        }
    }
    
    // 2. Initial Data Fetch
    fetchData();

    setIsAuthChecking(false);
  }, []);

  // --- DERIVED VIEWS ---
  const slotsByLevel = useMemo(() => {
    const grouped: Record<number, ParkingSlot[]> = {};
    [1, 2, 3, 4, 5].forEach(id => grouped[id] = []);
    
    slots.forEach(slot => {
      const hydratedSlot = {
        ...slot,
        occupant: slot.vehicleId ? vehicles[slot.vehicleId] : undefined
      };
      if (grouped[slot.levelId]) {
        grouped[slot.levelId].push(hydratedSlot);
      }
    });
    return grouped;
  }, [slots, vehicles]);

  // --- SYSTEM TICKER ---
  useEffect(() => {
    const timer = setInterval(() => {
        const now = new Date();
        setCurrentTime(now);
        // Refresh data every 5s for near-real-time dashboard sync
        if (now.getSeconds() % 5 === 0) {
            fetchData();
        }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleShowNotification = (message: string, type: 'success' | 'info' = 'success') => {
    if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ message, type });
    notificationTimeoutRef.current = window.setTimeout(() => {
        setNotification(null);
    }, 3000);
  };

  // --- ACTIONS ---
  const handleLogin = (user: AuthUser) => {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      fetchData(); // Refresh data on login
  };

  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem('unipark_jwt');
      setCurrentView('DASHBOARD');
  };

  const handleAllocateSlot = async (slotId: string, vehicle: Vehicle) => {
      const slot = slots.find(s => s.slotId === slotId);
      if (!slot) return;

      // Optimistic Update — mark as OCCUPIED so it's no longer treated as available
      setSlots(prev => prev.map(s => s.slotId === slotId ? { ...s, status: 'OCCUPIED', vehicleId: vehicle.vehicleId } : s));

      try {
          await api.allocateSlot(slot, vehicle);
          handleShowNotification(`Allocated Slot ${slotId}`, 'success');
          fetchData(); // Sync with DB
      } catch (e) {
          handleShowNotification("Allocation Error", 'info');
          fetchData(); // Revert
      }
  };

  const handleReleaseSlot = async (slotId: string) => {
      const slot = slots.find(s => s.slotId === slotId);
      if (!slot) return;

      try {
          await api.exitSlot(slot);
          handleShowNotification(`Slot ${slotId} Released`, 'info');
          fetchData();
      } catch (e) {
          handleShowNotification("Exit Process Error", 'info');
      }
  };

  const handleClearAllSlots = async () => {
      if (!window.confirm("CRITICAL: Are you sure you want to clear ALL allotted slots? This will process exits for all active vehicles.")) return;
      
      handleShowNotification("Purging all active slots...", 'info');
      try {
          await api.clearAllAllottedSlots();
          handleShowNotification("System Purge Complete", 'success');
          fetchData();
      } catch (e) {
          handleShowNotification("Purge Failed", 'info');
      }
  };

  // --- RENDER ---
  if (isAuthChecking) {
      return <div className="h-screen w-screen bg-[#050505] flex items-center justify-center text-primary font-mono text-xs">INITIALIZING SYSTEM...</div>;
  }

  if (!currentUser) {
      return <Login onLogin={handleLogin} onShowNotification={handleShowNotification} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard slotsByLevel={slotsByLevel} />;
      case 'GATE_SCAN':
        return (
          <FloorMap 
            showScanSidebar={true} 
            slotsByLevel={slotsByLevel} 
            onAllocate={handleAllocateSlot}
            onRelease={handleReleaseSlot}
            onShowNotification={handleShowNotification}
          />
        );
      case 'FLOOR_MAP':
        return (
          <FloorMap 
            showScanSidebar={false} 
            slotsByLevel={slotsByLevel} 
            onAllocate={handleAllocateSlot}
            onRelease={handleReleaseSlot}
            onShowNotification={handleShowNotification}
          />
        );
      case 'VISITOR_LOGS':
        return (
          <VisitorLogs 
            logs={logs} 
            onShowNotification={handleShowNotification} 
          />
        );
      case 'AFTER_HOURS':
        return <AfterHoursDashboard slotsByLevel={slotsByLevel} />;
      case 'SETTINGS':
        return <Settings onShowNotification={handleShowNotification} />;
      case 'PROFILE':
        return <Profile user={currentUser} onLogout={handleLogout} onShowNotification={handleShowNotification} />;
      default:
        return <Dashboard slotsByLevel={slotsByLevel} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-background-dark text-white overflow-hidden font-sans relative">
      <Sidebar activeView={currentView} onViewChange={setCurrentView} onClearAll={handleClearAllSlots} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentTime={currentTime} user={currentUser} onLogout={handleLogout} isDarkMode={isDarkMode} onToggleTheme={handleToggleTheme} />
        <main className="flex-1 flex overflow-hidden relative">
          {renderView()}
          {notification && (
            <div className="absolute top-6 right-8 z-[100] pointer-events-none">
              <NotificationToast message={notification.message} type={notification.type} />
            </div>
          )}
        </main>
        <StatusFooter isConnected={isBackendConnected} />
      </div>
    </div>
  );
};

export default App;
