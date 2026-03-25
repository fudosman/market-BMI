import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Profile as UserProfile } from '../types';
import { User as UserIcon, Mail, Phone, Calendar, MapPin, Loader2, Save } from 'lucide-react';

interface ProfileProps {
  user: FirebaseUser | null;
}

export function Profile({ user }: ProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setAgeRange(data.ageRange || '');
          setGender(data.gender || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'profiles', user.uid), {
        userId: user.uid,
        ageRange,
        gender,
        updatedAt: new Date().toISOString()
      });
      setProfile({ userId: user.uid, ageRange, gender, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-24">
        <p className="text-neutral-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-neutral-500">Manage your health identity and preferences</p>
      </header>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden">
        <div className="p-8 space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-neutral-100 rounded-[32px] flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-neutral-300" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{user.phoneNumber || 'Health User'}</h2>
              <p className="text-sm text-neutral-400 font-medium uppercase tracking-widest">ID: {user.uid.slice(0, 8)}...</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-neutral-400">Age Range</label>
              <select
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
              >
                <option value="">Select Age Range</option>
                <option value="<18">Under 18</option>
                <option value="18-25">18 - 25</option>
                <option value="26-35">26 - 35</option>
                <option value="36-45">36 - 45</option>
                <option value="46-55">46 - 55</option>
                <option value="56-65">56 - 65</option>
                <option value="65+">65 or older</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-neutral-400">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Calendar className="w-4 h-4" />
              Joined: {new Date(user.metadata.creationTime || '').toLocaleDateString()}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 text-white rounded-[32px] p-8 space-y-4">
        <h3 className="text-lg font-bold">Privacy & Security</h3>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Your health data is encrypted and only accessible by you. We use your phone number as a secure key to link your measurements across all marketplace stations.
        </p>
        <div className="flex gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <Shield className="w-4 h-4" />
            GDPR Compliant
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <Smartphone className="w-4 h-4" />
            Secure Access
          </div>
        </div>
      </div>
    </div>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
  )
}

function Smartphone({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
  )
}
