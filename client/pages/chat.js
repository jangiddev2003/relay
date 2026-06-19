import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import apiFetch from '../lib/api';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

export default function Chat() {
  const [activeBot, setActiveBot] = useState('knowledge');
  const [userEmail, setUserEmail] = useState(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then(data => setUserEmail(data.email))
      .catch(() => router.replace('/login'))
      .finally(() => setChecking(false));
  }, [router]);

  async function handleLogout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  if (checking) {
    return <div className="min-h-screen bg-bg flex items-center justify-center text-muted">Loading…</div>;
  }

  if (!userEmail) return null;

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar activeBot={activeBot} onSelect={setActiveBot} userEmail={userEmail} onLogout={handleLogout} />
      <ChatWindow botId={activeBot} />
    </div>
  );
}
