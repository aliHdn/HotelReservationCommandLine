import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/StoreContext';
import { BedDouble, Lock, Mail, User as UserIcon, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';
import type { Role } from '@/types';

const heroImage = 'https://images.pexels.com/photos/14011664/pexels-photo-14011664.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200';

export default function AuthPage() {
  const { login, signup, xtoken } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<Role>('Customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    // setLoadingSubmit(true);
    try {
      const response = await fetch("http://localhost:7105/api/Auth/Login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      const result = await response.json();
      if (response.ok) {
        setRole(result.role);
        login(email, result.role);
        console.log("Logged in successfully");

        // Fetch CSRF token after successful login
        const responsee = await fetch("http://localhost:7105/xsrf-token", {
          method: "Get",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          }
        });
        const resultt = await responsee.json();
        // Try to get token from different possible response formats
        const token = resultt.token;
        if (token) {
          xtoken(token);
        } else {
          console.log("No token found in response");
        }

        // Navigate to appropriate dashboard based on role
        if (result.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/customer');
        }
      }
      else {
        setError(result.error ?? 'Something went wrong.');
      }
    } catch (e) {
      console.log(e);
    } finally {
      // setLoadingSubmit(false);
    }
  }

  const handleSignup = async (name: string, email: string, password: string) => {
    console.log(email);
    const response = await fetch("http://localhost:7105/api/Auth/SignIn", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }
      ),
    });
    const result = await response.json();
    if (response.ok) {
      window.location.reload();
      setMode('login');

    } else {
      setError('Something went wrong.');
    }

  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const result = mode === 'login' ? await handleLogin(email, password) : await handleSignup(name, email, password);
    setBusy(false);
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden lg:block">
        <img src={heroImage} alt="Aurelia hotel lobby" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/40 to-ink-950/80" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <BedDouble className="h-5 w-5" />
            </div>
            <div>
              <p className="font-serif text-2xl leading-none">Aurelia</p>
              <p className="text-xs tracking-[0.2em] text-white/70">HOTELS & RESORTS</p>
            </div>
          </div>

          <div className="max-w-md">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs tracking-wide backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand-300" /> AI CONCIERGE
            </p>
            <h1 className="font-serif text-5xl leading-tight text-balance">
              Your next escape, arranged by conversation.
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Chat with our concierge to discover rooms, compare stays, and book — all in one place.
            </p>
          </div>

          <div className="flex gap-8 text-sm">
            <div>
              <p className="font-serif text-3xl">3</p>
              <p className="text-white/60">Iconic properties</p>
            </div>
            <div>
              <p className="font-serif text-3xl">4.9★</p>
              <p className="text-white/60">Average rating</p>
            </div>
            <div>
              <p className="font-serif text-3xl">24/7</p>
              <p className="text-white/60">Concierge</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12 lg:min-h-0">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white">
              <BedDouble className="h-5 w-5" />
            </div>
            <div>
              <p className="font-serif text-2xl leading-none text-ink-900">Aurelia</p>
              <p className="text-xs tracking-[0.2em] text-ink-400">HOTELS & RESORTS</p>
            </div>
          </div>

          <h2 className="font-serif text-3xl text-ink-900">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="mt-2 text-ink-500">
            {mode === 'login' ? 'Sign in to chat with your concierge.' : 'Join to start booking through chat.'}
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <Field
                label="Full name"
                icon={<UserIcon className="h-4 w-4" />}
                value={name}
                onChange={setName}
                placeholder="Marco Bianchi"
                autoComplete="name"
              />
            )}
            <Field
              label="Email"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-10 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in">{error}</div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-ink-900 py-3 text-sm font-semibold text-white transition hover:bg-ink-800 focus:ring-2 focus:ring-ink-300 disabled:opacity-60"
            >
              {busy ? 'Please wait…' : mode === 'login' ? 'Login in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setMode((m) => (m === 'login' ? 'signup' : 'login'));
                setError(null);
              }}
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          required
        />
      </div>
    </div>
  );
}
