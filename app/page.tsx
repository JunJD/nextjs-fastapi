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
  player_a_score: number;
  player_b_score: number;
  game_over: boolean;
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    player_a_cards: [],
    player_b_cards: [],
    result: '',
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
      result: roundResult.result,
      player_a_cards: prev.player_a_cards.filter(card => card.insect !== selectedCardA.insect),
      player_b_cards: prev.player_b_cards.filter(card => card.insect !== selectedCardB.insect),
      player_a_score: roundResult.winner === 'A' 
        ? prev.player_a_score + 1 
        : roundResult.winner === 'draw' 
          ? prev.player_a_score + 1 
          : prev.player_a_score,
      player_b_score: roundResult.winner === 'B' 
        ? prev.player_b_score + 1 
        : roundResult.winner === 'draw' 
          ? prev.player_b_score + 1 
          : prev.player_b_score,
    }));
    
    setSelectedCardA(null);
    setSelectedCardB(null);
  };

  const calculateFinalResult = () => {
    const finalResult = gameState.player_a_score > gameState.player_b_score 
      ? '玩家A获胜！' 
      : gameState.player_b_score > gameState.player_a_score 
        ? '玩家B获胜！' 
        : '平局！';
    
    setGameState(prev => ({
      ...prev,
      result: finalResult,
      game_over: true
    }));
  };

  useEffect(() => {
    startNewGame();
  }, []);

  return (
    <main className="flex min-h-screen flex-col p-4">
      {/* 玩家 A 区域 - 上半部分 */}
      <div className="flex-1 mb-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg min-h-[45vh]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">玩家 A ({gameState.player_a_cards.length}张剩余)</h2>
            <div className="text-lg font-bold">得分: {gameState.player_a_score}</div>
          </div>
          <div className="overflow-visible">
            <div className="flex flex-wrap gap-4">
              {gameState.player_a_cards.map((card, index) => (
                <button
                  key={index}
                  className={`p-2 rounded-lg transition-all relative ${
                    selectedCardA === card 
                      ? 'ring-4 ring-blue-600 ring-offset-2 -translate-y-2' 
                      : 'hover:-translate-y-1 hover:ring-2 hover:ring-blue-400 hover:ring-offset-1'
                  }`}
                  onClick={() => setSelectedCardA(card)}
                  disabled={gameState.game_over}
                >
                  <div className="relative w-24 h-24 mb-1 bg-white rounded-lg overflow-hidden">
                    <Image
                      src={`/${card.image}`}
                      alt={`昆虫 ${card.insect}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 中间控制区域 */}
      <div className="flex flex-col items-center gap-4 my-2">
        <div className="text-2xl font-bold">
          {gameState.player_a_score} : {gameState.player_b_score}
        </div>
        
        <div className="flex gap-4">
          {!gameState.game_over && gameState.player_a_cards.length > 0 && (
            <button
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              onClick={compareCards}
              disabled={!selectedCardA || !selectedCardB}
            >
              对比卡片
            </button>
          )}
          {!gameState.game_over && gameState.player_a_cards.length === 0 && (
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={calculateFinalResult}
            >
              结算游戏
            </button>
          )}
          <button
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            onClick={startNewGame}
          >
            开始新游戏
          </button>
        </div>

        {gameState.result && (
          <div className="text-center text-xl font-bold p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            {gameState.result}
          </div>
        )}
      </div>

      {/* 玩家 B 区域 - 下半部分 */}
      <div className="flex-1 mt-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg min-h-[45vh]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">玩家 B ({gameState.player_b_cards.length}张剩余)</h2>
            <div className="text-lg font-bold">得分: {gameState.player_b_score}</div>
          </div>
          <div className="overflow-visible">
            <div className="flex flex-wrap gap-4">
              {gameState.player_b_cards.map((card, index) => (
                <button
                  key={index}
                  className={`p-2 rounded-lg transition-all relative ${
                    selectedCardB === card 
                      ? 'ring-4 ring-blue-600 ring-offset-2 -translate-y-2' 
                      : 'hover:-translate-y-1 hover:ring-2 hover:ring-blue-400 hover:ring-offset-1'
                  }`}
                  onClick={() => setSelectedCardB(card)}
                  disabled={gameState.game_over}
                >
                  <div className="relative w-24 h-24 mb-1 bg-white rounded-lg overflow-hidden">
                    <Image
                      src={`/${card.image}`}
                      alt={`昆虫 ${card.insect}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-center text-sm">
                    分数: {card.score}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
