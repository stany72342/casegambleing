import React, { useState } from 'react';
import { Gamepad2, ArrowRight, Lock, User as UserIcon } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string, rememberMe: boolean) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
        setError('Username and password are required.');
        return;
    }
    onLogin(username, password, rememberMe);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-500 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 animate-bounce">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Case<span className="text-yellow-400">Clicker</span></h1>
          <p className="text-slate-400">Secure Trading Network</p>
        </div>

        <form onSubmit={handleCredentialsSubmit} className="space-y-4 animate-in slide-in-from-right duration-300">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                <div className="relative">
                    <UserIcon className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                    <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all placeholder-slate-600"
                    placeholder="StashyM"
                    autoFocus
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all placeholder-slate-600"
                    placeholder="••••••••"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
                />
                <label htmlFor="remember" className="text-sm text-slate-400 select-none cursor-pointer">Remember Me</label>
            </div>

            {error && <div className="text-red-500 text-sm font-bold text-center">{error}</div>}

            <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                Enter World <ArrowRight size={20} />
            </button>
        </form>

        <div className="mt-8 border-t border-slate-800 pt-4 text-center space-y-6">
            <p className="text-xs text-slate-600 flex items-center justify-center gap-1">
                <Lock size={10} /> 256-bit Secured Connection
            </p>
            <div className="space-y-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Made By Prosoft Network</div>
                <div className="text-[10px] text-red-900/60 font-bold uppercase">You must be over 18 to play</div>
            </div>
        </div>
      </div>
    </div>
  );
};