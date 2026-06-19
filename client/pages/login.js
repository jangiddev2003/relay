import { useState } from 'react';
import { useRouter } from 'next/router';
import apiFetch from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      router.push('/chat');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <form onSubmit={handleSubmit} className="bg-panel border border-border rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-muted text-sm mb-6">Log in to continue chatting with Relay.</p>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <label className="text-xs text-muted block mb-1">Email</label>
        <input
          className="w-full mb-4 bg-panel2 border border-border rounded-lg px-3 py-2 text-text"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <label className="text-xs text-muted block mb-1">Password</label>
        <input
          className="w-full mb-6 bg-panel2 border border-border rounded-lg px-3 py-2 text-text"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button
          className="w-full bg-accent text-bg font-semibold rounded-lg py-2 disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        <p className="text-muted text-sm mt-4">
          No account yet? <a className="text-signal" href="/signup">Sign up</a>
        </p>
      </form>
    </div>
  );
}
