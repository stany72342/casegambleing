import React from 'react';
import { Dice5, CircleDot, Bomb, Coins, ArrowRight, CircleDollarSign, ArrowUp } from 'lucide-react';

interface CasinoHubProps {
  onSelectGame: (gameId: string) => void;
}

export const CasinoHub: React.FC<CasinoHubProps> = ({ onSelectGame }) => {
  const games = [
    {
      id: 'coinflip',
      name: 'Coin Flip',
      description: 'Heads or Tails. Double your money instantly.',
      icon: CircleDollarSign,
      color: 'from-blue-600 to-blue-900',
      textColor: 'text-blue-400',
      minBet: '$1',
      maxWin: '2x'
    },
    {
      id: 'highlow',
      name: 'High Low',
      description: 'Guess if the next card is higher or lower. Build your streak.',
      icon: ArrowUp,
      color: 'from-indigo-600 to-violet-900',
      textColor: 'text-indigo-400',
      minBet: '$100',
      maxWin: 'Unlimited'
    },
    {
      id: 'blackjack',
      name: 'Blackjack',
      description: 'Classic 21. Beat the dealer to double your money.',
      icon: Dice5,
      color: 'from-green-600 to-emerald-900',
      textColor: 'text-green-400',
      minBet: '$100',
      maxWin: '2.5x'
    },
    {
      id: 'roulette',
      name: 'Roulette',
      description: 'Spin the wheel. Red, Black, or the elusive Green Zero.',
      icon: CircleDot,
      color: 'from-red-600 to-rose-900',
      textColor: 'text-red-400',
      minBet: '$10',
      maxWin: '14x'
    },
    {
      id: 'mines',
      name: 'Mines',
      description: 'Uncover gems, avoid bombs. Cash out before you explode.',
      icon: Bomb,
      color: 'from-purple-600 to-indigo-900',
      textColor: 'text-purple-400',
      minBet: '$100',
      maxWin: 'Variable'
    },
    {
      id: 'slots',
      name: 'Slots',
      description: 'Test your luck on the Golden Machine. Hit the jackpot!',
      icon: Coins,
      color: 'from-yellow-500 to-amber-800',
      textColor: 'text-yellow-400',
      minBet: '$10',
      maxWin: 'JACKPOT'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="text-center mb-16 animate-in slide-in-from-top duration-500">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-800 mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
          CASINO ROYALE
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          High stakes, massive rewards. Choose your game and test your fortune against the house.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game, index) => (
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
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

            <div className="relative z-10 p-8 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 ${game.textColor}`}>
                  <game.icon size={40} />
                </div>
                <div className="text-right">
                   <div className="text-xs text-slate-300 uppercase tracking-wider font-bold mb-1">Max Win</div>
                   <div className="text-2xl font-black text-white">{game.maxWin}</div>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black text-white mb-2 group-hover:translate-x-2 transition-transform">{game.name}</h3>
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