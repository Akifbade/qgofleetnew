
import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile } from './types';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DriverDashboard from './pages/DriverDashboard';
import { Layout } from './components/Layout';
import { account, databases, DATABASE_ID, COLLECTIONS } from './services/appwrite';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const checkSession = async () => {
    setIsLoading(true);
    try {
      const sessionUser = await account.get();
      if (sessionUser) {
        const profile = await databases.getDocument(
          DATABASE_ID, 
          COLLECTIONS.PROFILES, 
          sessionUser.$id
        );
        setUser(profile as unknown as UserProfile);
      }
    } catch (error) {
      console.log('Session check (expected if not logged in)');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    await account.deleteSession('current');
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest animate-pulse">CargoTrack Engine...</p>
      </div>
    );
  }

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {user.role === UserRole.ADMIN ? (
        <AdminDashboard user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
      ) : (
        <DriverDashboard user={user} activeTab={activeTab} />
      )}
    </Layout>
  );
};

export default App;
