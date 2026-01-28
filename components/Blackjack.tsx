import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import * as Icons from 'lucide-react';

interface BlackjackProps {
  gameState: GameState;
  onGameEnd: (winAmount: number) => void;
  removeBalance: (amount: number) => void;
}

type Card = {
    suit: 'H' | 'D' | 'C' | 'S';
    value: string;
    score: number;
}

export const Blackjack: React.FC<BlackjackProps> = ({ gameState, onGameEnd, removeBalance }) => {
  const [bet, setBet] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [deck, setDeck] = useState<Card[]>([]);

  // Create Deck
  const createDeck = () => {
      const suits: ('H'|'D'|'C'|'S')[] = ['H', 'D', 'C', 'S'];
      const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      let newDeck: Card[] = [];
      for (let s of suits) {
          for (let v of values) {
              let score = parseInt(v);
              if (['J', 'Q', 'K'].includes(v)) score = 10;
              if (v === 'A') score = 11;
              newDeck.push({ suit: s, value: v, score });
          }
      }
      return newDeck.sort(() => Math.random() - 0.5);
  };

  const calculateScore = (hand: Card[]) => {
      let score = hand.reduce((a, b) => a + b.score, 0);
      let aces = hand.filter(c => c.value === 'A').length;
      while (score > 21 && aces > 0) {
          score -= 10;
          aces--;
      }
      return score;
  };

  const deal = () => {
      if (gameState.balance < bet) return;
      removeBalance(bet);
      const newDeck = createDeck();
      const pHand = [newDeck.pop()!, newDeck.pop()!];
      const dHand = [newDeck.pop()!, newDeck.pop()!];
      setDeck(newDeck);
      setPlayerHand(pHand);
      setDealerHand(dHand);
      setIsPlaying(true);
      setGameResult(null);

      // Instant Blackjack Check
      const pScore = calculateScore(pHand);
      if (pScore === 21) {
          endGame(pHand, dHand, 'blackjack');
      }
  };

  const hit = () => {
      const newDeck = [...deck];
      const card = newDeck.pop()!;
      const newHand = [...playerHand, card];
      setPlayerHand(newHand);
      setDeck(newDeck);
      
      if (calculateScore(newHand) > 21) {
          endGame(newHand, dealerHand, 'bust');
      }
  };

  const stand = () => {
      let dHand = [...dealerHand];
      let currentDeck = [...deck];
      while (calculateScore(dHand) < 17) {
          dHand.push(currentDeck.pop()!);
      }
      setDealerHand(dHand);
      endGame(playerHand, dHand, 'compare');
  };

  const endGame = (pHand: Card[], dHand: Card[], reason: string) => {
      setIsPlaying(false);
      const pScore = calculateScore(pHand);
      const dScore = calculateScore(dHand);
      
      if (reason === 'bust') {
          setGameResult('BUST! You lost.');
          // No win
      } else if (reason === 'blackjack') {
          // Check if dealer also has blackjack (rare)
          if (dScore === 21) {
               setGameResult('PUSH (Both BJ)');
               onGameEnd(bet);
          } else {
               setGameResult('BLACKJACK! 2.5x Payout');
               onGameEnd(bet * 2.5);
          }
      } else {
          // Compare
          if (dScore > 21) {
              setGameResult('Dealer Busted! You Win!');
              onGameEnd(bet * 2);
          } else if (pScore > dScore) {
              setGameResult('You Win!');
              onGameEnd(bet * 2);
          } else if (pScore === dScore) {
              setGameResult('Push');
              onGameEnd(bet);
          } else {
              setGameResult('Dealer Wins');
          }
      }
  };

  const renderCard = (card: Card, hidden = false) => {
      if (hidden) {
          return (
              <div className="w-20 h-28 bg-red-900 border-2 border-white rounded-lg flex items-center justify-center shadow-lg transform translate-y-2">
                  <div className="w-16 h-24 bg-red-800 border border-red-700 pattern-grid-lg"></div>
              </div>
          );
      }
      const isRed = card.suit === 'H' || card.suit === 'D';
      return (
          <div className="w-20 h-28 bg-white rounded-lg shadow-xl flex flex-col items-center justify-between p-2 transform hover:-translate-y-2 transition-transform">
              <div className={`text-lg font-bold self-start ${isRed ? 'text-red-600' : 'text-black'}`}>{card.value}</div>
              <div className={`text-4xl ${isRed ? 'text-red-600' : 'text-black'}`}>
                  {card.suit === 'H' && '♥'}
                  {card.suit === 'D' && '♦'}
                  {card.suit === 'C' && '♣'}
                  {card.suit === 'S' && '♠'}
              </div>
              <div className={`text-lg font-bold self-end ${isRed ? 'text-red-600' : 'text-black'}`}>{card.value}</div>
          </div>
      );
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-600 mb-8">
            HIGH STAKES BLACKJACK
        </h2>

        <div className="w-full bg-green-900/50 border-8 border-green-900 rounded-[50px] p-8 relative shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] min-h-[500px] flex flex-col justify-between">
            {/* Dealer Area */}
            <div className="flex flex-col items-center mb-8">
                <div className="flex gap-4 mb-2 justify-center">
                    {dealerHand.map((card, i) => (
                        <div key={i} className="relative">
                            {renderCard(card, isPlaying && i === 0)}
                        </div>
                    ))}
                    {dealerHand.length === 0 && !isPlaying && (
                        <div className="w-20 h-28 border-2 border-dashed border-green-700 rounded-lg flex items-center justify-center opacity-50">
                            Dealer
                        </div>
                    )}
                </div>
                {dealerHand.length > 0 && !isPlaying && (
                    <div className="bg-black/50 px-3 py-1 rounded-full text-white font-bold text-sm">
                        Dealer: {calculateScore(dealerHand)}
                    </div>
                )}
            </div>

            {/* Center Message */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                {gameResult && (
                    <div className="bg-black/80 text-white px-8 py-4 rounded-2xl font-black text-2xl border-2 border-yellow-500 animate-in zoom-in shadow-2xl whitespace-nowrap">
                        {gameResult}
                    </div>
                )}
            </div>

            {/* Player Area */}
            <div className="flex flex-col items-center">
                {playerHand.length > 0 && (
                    <div className="mb-4 bg-black/50 px-3 py-1 rounded-full text-white font-bold text-sm">
                        You: {calculateScore(playerHand)}
                    </div>
                )}
                <div className="flex gap-4 mb-8 justify-center">
                    {playerHand.map((card, i) => renderCard(card))}
                    {playerHand.length === 0 && !isPlaying && (
                        <div className="w-20 h-28 border-2 border-dashed border-green-700 rounded-lg flex items-center justify-center opacity-50">
                            You
                        </div>
                    )}
                </div>

                {/* Controls */}
                {!isPlaying ? (
                    <div className="flex gap-4 bg-black/40 p-4 rounded-2xl backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setBet(Math.max(100, bet - 100))} className="w-8 h-8 bg-slate-700 rounded-full text-white font-bold">-</button>
                            <span className="font-mono font-bold text-yellow-400 w-24 text-center">${bet}</span>
                            <button onClick={() => setBet(bet + 100)} disabled={gameState.balance < bet + 100} className="w-8 h-8 bg-slate-700 rounded-full text-white font-bold">+</button>
                        </div>
                        <button 
                            onClick={deal}
                            disabled={gameState.balance < bet}
                            className={`px-8 py-2 rounded-lg font-bold ${gameState.balance < bet ? 'bg-slate-700 text-slate-500' : 'bg-green-600 text-white hover:bg-green-500 shadow-lg'}`}
                        >
                            DEAL
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <button onClick={hit} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-500 active:scale-95 transition-all">HIT</button>
                        <button onClick={stand} className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-500 active:scale-95 transition-all">STAND</button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};