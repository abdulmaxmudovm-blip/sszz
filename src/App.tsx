import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import GameContainer from './components/GameContainer';
import { GameConfig } from './types';

export default function App() {
  const [screen, setScreen] = useState<'MENU' | 'BATTLE'>('MENU');
  
  // Custom Player Data States
  const [p1Name, setP1Name] = useState("Muhamadyusuf");
  const [p1Color, setP1Color] = useState("#10b981");
  const [p2Name, setP2Name] = useState("Bekzod");
  const [p2Color, setP2Color] = useState("#ef4444");

  const [config, setConfig] = useState<GameConfig>({
    scoreLimit: 5,
    mapType: 'klassik',
    soundVolume: 50,
    tankSpeed: 3.5,
    bulletSpeed: 6.5,
    powerupSpawnInterval: 8000
  });

  const handleStartGame = (
    p1N: string, 
    p1C: string, 
    p2N: string, 
    p2C: string, 
    gameConfig: GameConfig
  ) => {
    setP1Name(p1N);
    setP1Color(p1C);
    setP2Name(p2N);
    setP2Color(p2C);
    setConfig(gameConfig);
    setScreen('BATTLE');
  };

  const handleReturnToMenu = () => {
    setScreen('MENU');
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {screen === 'MENU' ? (
        <MainMenu onStartGame={handleStartGame} />
      ) : (
        <GameContainer
          p1Name={p1Name}
          p1Color={p1Color}
          p2Name={p2Name}
          p2Color={p2Color}
          config={config}
          onReturnToMenu={handleReturnToMenu}
        />
      )}
    </div>
  );
}
