import React from 'react';
import { Gamepad2, ArrowRight, Hammer, Brain } from 'lucide-react';

interface ArcadeHubProps {
  onSelectGame: (gameId: string) => void;
}

export const ArcadeHub: React.FC<ArcadeHubProps> = ({ onSelectGame }) => {
  const games = [
    {
      id: 'snake',
      name: 'Retro Snake',
      description: 'Classic snake. Entry: $50. Eat food to earn $15 each.',
      icon: Gamepad2,
      color: 'from-green-500 to-emerald-900',
      textColor: 'text-green-400',
      difficulty: 'Medium'
    },
    {
      id: 'molesmash',
      name: 'Mole Smash',
      description: 'Whack the moles! Entry: $50. Earn $5 per hit. 30s Timer.',
      icon: Hammer,
      color: 'from-orange-500 to-red-900',
      textColor: 'text-orange-400',
      difficulty: 'Easy'
    },
    {
      id: 'memory',
      name: 'Memory Match',
      description: 'Find pairs fast. Entry: $100. Win up to $200.',
      icon: Brain,
      color: 'from-blue-500 to-indigo-900',
      textColor: 'text-blue-400',
      difficulty: 'Hard'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="text-center mb-16 animate-in slide-in-from-top duration-500">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
          ARCADE
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Skill-based games with cash rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className={`
              relative group overflow-hidden rounded-3xl border-2 border-slate-800 hover:border-white/20 transition-all duration-300
              hover:scale-[1.02] hover:shadow-2xl text-left h-64
            `}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-40 group-hover:opacity-60 transition-opacity`}></div>
            
            {/* Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pixels.png')] opacity-10"></div>

            <div className="relative z-10 p-8 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 ${game.textColor}`}>
                  <game.icon size={40} />
                </div>
                <div className="text-right">
                   <div className="text-xs text-slate-300 uppercase tracking-wider font-bold mb-1">Difficulty</div>
                   <div className="text-2xl font-black text-white">{game.difficulty}</div>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black text-white mb-2 group-hover:translate-x-2 transition-transform flex items-center gap-2">
                    {game.name}
                </h3>
                <p className="text-slate-200 text-sm font-medium opacity-80 max-w-sm">{game.description}</p>
              </div>

              <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                <div className="bg-white text-black px-6 py-2 rounded-full font-bold flex items-center gap-2">
                  PLAY <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};