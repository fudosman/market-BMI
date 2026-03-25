import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signInAnonymously, User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import { Layout } from './components/Layout';
import { DeviceSim } from './components/DeviceSim';
import { Dashboard } from './components/Dashboard';
import { Profile } from './components/Profile';
import { Landing } from './components/Landing';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <Router>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={<Landing user={user} />} />
          <Route path="/device" element={<DeviceSim user={user} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>
      </Layout>
    </Router>
  );
}
