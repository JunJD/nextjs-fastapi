'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Card {
  insect: string;
  score: number;
  image: string;
}

interface RoundResult {
  card_a: Card;
  card_b: Card;
  winner: string;
  result: string;
}

interface GameState {
  player_a_cards: Card[];
  player_b_cards: Card[];
  result: string;
  round_results: RoundResult[];
  player_a_score: number;
  player_b_score: number;
  game_over: boolean;
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    player_a_cards: [],
    player_b_cards: [],
    result: '',
    round_results: [],
    player_a_score: 0,
    player_b_score: 0,
    game_over: false
  });
  const [selectedCardA, setSelectedCardA] = useState<Card | null>(null);
  const [selectedCardB, setSelectedCardB] = useState<Card | null>(null);

  const startNewGame = async () => {
    const response = await fetch('/api/py/new_game');
    const data = await response.json();
    setGameState({
      ...data,
      result: ''
    });
    setSelectedCardA(null);
    setSelectedCardB(null);
  };

  const compareCards = async () => {
    if (!selectedCardA || !selectedCardB) return;

    const response = await fetch('/api/py/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        card_a: selectedCardA,
        card_b: selectedCardB
      }),
    });
    const roundResult = await response.json();
    
    setGameState(prev => ({
      ...prev,
      round_results: [...prev.round_results, roundResult],
      result: roundResult.result,
      player_a_cards: prev.player_a_cards.filter(card => card.insect !== selectedCardA.insect),
      player_b_cards: prev.player_b_cards.filter(card => card.insect !== selectedCardB.insect),
    }));
    
    setSelectedCardA(null);
    setSelectedCardB(null);
  };

  const calculateFinalResult = async () => {
    const response = await fetch('/api/py/calculate_final_result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameState.round_results),
    });
    const result = await response.json();
    
    setGameState(prev => ({
      ...prev,
      result: result.final_result,
      player_a_score: result.player_a_score,
      player_b_score: result.player_b_score,
      game_over: true
    }));
  };

  useEffect(() => {
    startNewGame();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-center">昆虫对战游戏</h1>
        
        <div className="mb-4 text-center">
          <span className="text-xl font-bold">当前比分: </span>
          <span className="text-xl">玩家A {gameState.player_a_score} : {gameState.player_b_score} 玩家B</span>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl mb-4">玩家 A 的卡片: ({gameState.player_a_cards.length}张剩余)</h2>
          <div className="flex flex-wrap gap-4">
            {gameState.player_a_cards.map((card, index) => (
              <button
                key={index}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  selectedCardA === card 
                    ? 'border-4 border-blue-600 scale-105' 
                    : 'border-gray-300 hover:border-blue-400'
                }`}
                onClick={() => setSelectedCardA(card)}
                disabled={gameState.game_over}
              >
                <div className="relative w-32 h-32 mb-2">
                  <Image
                    src={`/${card.image}`}
                    alt={`昆虫 ${card.insect}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="text-center">
                  分数: {card.score}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl mb-4">玩家 B 的卡片: ({gameState.player_b_cards.length}张剩余)</h2>
          <div className="flex flex-wrap gap-4">
            {gameState.player_b_cards.map((card, index) => (
              <button
                key={index}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  selectedCardB === card 
                    ? 'border-4 border-blue-600 scale-105' 
                    : 'border-gray-300 hover:border-blue-400'
                }`}
                onClick={() => setSelectedCardB(card)}
                disabled={gameState.game_over}
              >
                <div className="relative w-32 h-32 mb-2">
                  <Image
                    src={`/${card.image}`}
                    alt={`昆虫 ${card.insect}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="text-center">
                  分数: {card.score}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-center mb-8">
          {!gameState.game_over && gameState.player_a_cards.length > 0 && (
            <button
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              onClick={compareCards}
              disabled={!selectedCardA || !selectedCardB}
            >
              对比卡片
            </button>
          )}
          {!gameState.game_over && gameState.player_a_cards.length === 0 && (
            <button
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={calculateFinalResult}
            >
              结算游戏
            </button>
          )}
          <button
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            onClick={startNewGame}
          >
            开始新游戏
          </button>
        </div>

        {gameState.result && (
          <div className="text-center text-2xl font-bold p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
            {gameState.result}
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-xl mb-4">对战记录:</h3>
          {gameState.round_results.map((round, index) => (
            <div key={index} className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
              第{index + 1}回合: {round.result}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
