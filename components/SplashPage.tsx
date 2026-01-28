import React from 'react';
import { ShieldAlert, Check, Scale, AlertTriangle } from 'lucide-react';

interface SplashPageProps {
  onAccept: () => void;
}

export const SplashPage: React.FC<SplashPageProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-4">
      {/* Darken backdrop further */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

      <div className="max-w-lg w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
        {/* Background FX */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-orange-600 to-red-600"></div>
        
        <div className="text-center mb-8 relative z-10">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-700 shadow-inner relative">
                <span className="text-4xl font-black text-red-500">18+</span>
                <div className="absolute -bottom-2 -right-2 bg-red-600 rounded-full p-2 border-4 border-slate-900">
                    <ShieldAlert size={20} className="text-white" />
                </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Age Restricted</h1>
            <p className="text-slate-400 text-lg">
                This application contains simulated gambling mechanics.
            </p>
        </div>

        <div className="bg-slate-950/80 rounded-xl p-6 mb-8 border border-slate-800 space-y-4 relative z-10 max-h-60 overflow-y-auto custom-scrollbar">
             <div className="flex gap-4 items-start">
                <div className="mt-1 bg-red-900/30 p-1.5 rounded text-red-400">
                    <AlertTriangle size={18} />
                </div>
                <div>
                    <h4 className="font-bold text-white text-sm">Age Requirement</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        You confirm that you are at least 18 years of age or the legal age of majority in your jurisdiction to access this content.
                    </p>
                </div>
             </div>
             
             <div className="flex gap-4 items-start">
                <div className="mt-1 bg-blue-900/30 p-1.5 rounded text-blue-400">
                    <Scale size={18} />
                </div>
                <div>
                    <h4 className="font-bold text-white text-sm">Rules & Terms</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        1. <strong>No Real Money Trading:</strong> Items in this game have no real-world cash value.<br/>
                        2. <strong>Fair Play:</strong> Exploiting bugs or using automation software is strictly prohibited.<br/>
                        3. <strong>Respect:</strong> Harassment or toxic behavior is not tolerated.<br/>
                        By entering, you agree to these rules and our Terms of Service.
                    </p>
                </div>
             </div>
        </div>

        <button 
            onClick={onAccept}
            className="w-full py-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-black rounded-xl text-lg tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 relative z-10 group"
        >
            <Check size={24} className="group-hover:scale-125 transition-transform" /> 
            I ACCEPT & ENTER
        </button>
        
        <div className="mt-6 text-center relative z-10">
            <a href="https://google.com" className="text-xs font-bold text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-wider">
                I am under 18 (Leave Site)
            </a>
        </div>
      </div>
    </div>
  );
};