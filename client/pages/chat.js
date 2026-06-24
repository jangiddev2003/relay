import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import apiFetch from '../lib/api';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

export default function Chat() {
  const [activeBot, setActiveBot] = useState('routed');
  const [customBots, setCustomBots] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then(data => setUserEmail(data.email))
      .catch(() => router.replace('/login'))
      .finally(() => setChecking(false));
  }, [router]);

  useEffect(() => {
    if (userEmail) {
      apiFetch('/api/custom-bot')
        .then(data => setCustomBots(data.bots || []))
        .catch(err => console.error("Failed to load custom bots", err));
    }
  }, [userEmail]);

  useEffect(() => {
    if (router.query.selectBot) {
      setActiveBot(router.query.selectBot);
      router.replace('/chat', undefined, { shallow: true });
    }
  }, [router.query.selectBot]);

  async function handleLogout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (checking) {
    return <div className="min-h-screen bg-bg flex items-center justify-center text-muted">Loading…</div>;
  }

  if (!userEmail) return null;

  return (
    <div className="flex bg-bg min-h-screen relative overflow-hidden">
      {/* Sidebar Drawer (Responsive) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          activeBot={activeBot} 
          customBots={customBots}
          onSelect={(botId) => {
            setActiveBot(botId);
            setSidebarOpen(false);
          }} 
          userEmail={userEmail} 
          onLogout={handleLogout}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
        />
      )}

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <ChatWindow 
          botId={activeBot} 
          customBots={customBots}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
    </div>
  );
}
