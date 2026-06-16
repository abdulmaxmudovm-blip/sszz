import React, { useState } from 'react';
import { Swords, Trophy, Shield, Zap, Heart, Bomb, Volume2, VolumeX, HelpCircle, LayoutGrid } from 'lucide-react';
import { GameConfig, MapType } from '../types';
import { soundManager } from './SoundManager';

interface MainMenuProps {
  onStartGame: (p1Name: string, p1Color: string, p2Name: string, p2Color: string, config: GameConfig) => void;
}

const TANK_COLORS = [
  { name: 'Yashil', value: '#10b981', hover: 'hover:bg-emerald-600', ring: 'ring-emerald-400' },
  { name: 'Moviy', value: '#3b82f6', hover: 'hover:bg-blue-600', ring: 'ring-blue-400' },
  { name: 'Qizil', value: '#ef4444', hover: 'hover:bg-red-600', ring: 'ring-red-400' },
  { name: 'Tilla', value: '#eab308', hover: 'hover:bg-yellow-600', ring: 'ring-yellow-400' },
  { name: 'Pushti', value: '#ec4899', hover: 'hover:bg-pink-600', ring: 'ring-pink-400' },
  { name: 'Olovrang', value: '#f97316', hover: 'hover:bg-orange-600', ring: 'ring-orange-400' },
];

export default function MainMenu({ onStartGame }: MainMenuProps) {
  const [p1Name, setP1Name] = useState("Muhamadyusuf");
  const [p1Color, setP1Color] = useState("#10b981"); // Green

  const [p2Name, setP2Name] = useState("Bekzod");
  const [p2Color, setP2Color] = useState("#ef4444"); // Red

  // Game config state
  const [scoreLimit, setScoreLimit] = useState(5);
  const [mapType, setMapType] = useState<MapType>('klassik');
  const [soundVolume, setSoundVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [tankSpeed, setTankSpeed] = useState(3.5);
  const [bulletSpeed, setBulletSpeed] = useState(6.5);

  const handleToggleMute = () => {
    soundManager.toggleMute();
    setIsMuted(soundManager.getMute());
    soundManager.playClick();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSoundVolume(val);
    soundManager.setVolume(val / 100);
  };

  const playClick = () => {
    soundManager.playClick();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playPowerup();
    onStartGame(p1Name, p1Color, p2Name, p2Color, {
      scoreLimit,
      mapType,
      soundVolume,
      tankSpeed,
      bulletSpeed,
      powerupSpawnInterval: 8000, // Spawn every 8 seconds
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-x-hidden font-sans">
      {/* Immersive Background Grid and Glow Enhancements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-50"></div>
      
      {/* High-Tech Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-y-1/2 translate-x-1/2 w-96 h-96 rounded-full bg-rose-500/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-[150px] pointer-events-none"></div>

      {/* Cyber tactical scanning line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent scanning-line opacity-40"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10 space-y-6">
        {/* Game Title Area */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-sky-400/30 bg-sky-950/60 shadow-[0_0_15px_rgba(56,189,248,0.1)] text-sky-400 text-xs font-bold uppercase tracking-[0.25em] font-display">
            <Swords className="w-3.5 h-3.5 animate-pulse text-sky-400" /> LOCAL MULTIPLAYER BATTLE ARENA
          </div>
          <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-300 to-amber-300 drop-shadow-[0_0_30px_rgba(14,165,233,0.25)]">
            TANK JANGLARI
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto font-medium">
            Sinergetik daryolar, harakatlanuvchi butazorlar va raqamli minalar bilan o'ralgan maxsus 2 kishilik shiddatli jangovar simulyator.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Config Terminal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative">
            
            {/* Holographic Border Corner Ornaments */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-slate-700 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-slate-700 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-slate-700 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-slate-700 rounded-br-lg"></div>

            {/* Player 1 Configuration Terminal */}
            <div className="space-y-4 p-5 border border-emerald-500/20 rounded-xl bg-slate-950/40 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-ping"></span>
                    <h3 className="font-display font-bold text-xs tracking-wider text-emerald-400 uppercase">TELEMETRY - PLAYER 1</h3>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">PORT: CHAP_P1</span>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">ISMI (MAX 16 HURF)</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={p1Name}
                    onChange={(e) => setP1Name(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 focus:neon-shadow transition-all text-sm font-sans"
                    placeholder="P1 Ism..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">TANK RANGI</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {TANK_COLORS.map((color) => (
                      <button
                        key={`p1-col-${color.value}`}
                        type="button"
                        onClick={() => { setP1Color(color.value); playClick(); }}
                        className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                          p1Color === color.value
                            ? 'bg-slate-900 text-white shadow-lg ring-1'
                            : 'border-slate-800 text-slate-400 bg-slate-950/80 hover:border-slate-700'
                        }`}
                        style={{
                          borderColor: p1Color === color.value ? color.value : '',
                          boxShadow: p1Color === color.value ? `0 0 10px ${color.value}33` : ''
                        }}
                      >
                        <span className="w-3 h-3 rounded-full mr-1.5 shadow" style={{ backgroundColor: color.value }}></span>
                        <span className="scale-90">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Player 1 HUD Keys Panel */}
              <div className="bg-slate-950/90 border border-slate-800/80 rounded-lg p-3.5 space-y-2 text-xs text-slate-400 mt-4">
                <div className="text-emerald-400 font-display font-bold text-[11px] tracking-wider border-b border-emerald-500/10 pb-1.5">MASHINA BOSHQARUVI:</div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Harakat:</span> 
                  <span className="bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/60 text-emerald-300 font-bold">
                    {p1Name.toLowerCase().includes('muhamadyusuf') ? 'C, B, F, V' : 'W, A, S, D'}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span>O'q Otish:</span> 
                  <span className="bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/60 text-emerald-300 font-bold">PROBEL (SPACE)</span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Mina o'rnatish:</span> 
                  <span className="bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/60 text-emerald-300 font-bold">Q TUGMASI</span>
                </div>
              </div>
            </div>

            {/* Player 2 Configuration Terminal */}
            <div className="space-y-4 p-5 border border-rose-500/20 rounded-xl bg-slate-950/40 backdrop-blur-md relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300 flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_10px_#fb7185] animate-ping"></span>
                    <h3 className="font-display font-bold text-xs tracking-wider text-rose-400 uppercase">TELEMETRY - PLAYER 2</h3>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">PORT: ONG_P2</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">ISMI (MAX 16 HURF)</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={p2Name}
                    onChange={(e) => setP2Name(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 focus:neon-shadow transition-all text-sm font-sans"
                    placeholder="P2 Ism..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">TANK RANGI</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {TANK_COLORS.map((color) => (
                      <button
                        key={`p2-col-${color.value}`}
                        type="button"
                        onClick={() => { setP2Color(color.value); playClick(); }}
                        className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                          p2Color === color.value
                            ? 'bg-slate-900 text-white shadow-lg ring-1'
                            : 'border-slate-800 text-slate-400 bg-slate-950/80 hover:border-slate-700'
                        }`}
                        style={{
                          borderColor: p2Color === color.value ? color.value : '',
                          boxShadow: p2Color === color.value ? `0 0 10px ${color.value}33` : ''
                        }}
                      >
                        <span className="w-3 h-3 rounded-full mr-1.5 shadow" style={{ backgroundColor: color.value }}></span>
                        <span className="scale-90">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Player 2 HUD Keys Panel */}
              <div className="bg-slate-950/90 border border-slate-800/80 rounded-lg p-3.5 space-y-2 text-xs text-slate-400 mt-4">
                <div className="text-rose-400 font-display font-bold text-[11px] tracking-wider border-b border-rose-500/10 pb-1.5">MASHINA BOSHQARUVI:</div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Harakat:</span> 
                  <span className="bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-800/60 text-rose-300 font-bold">
                    {p2Name.toLowerCase().includes('muhamadyusuf') ? 'C, B, F, V' : 'Strelkalar (↑, ↓, ←, →)'}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span>O'q Otish:</span> 
                  <span className="bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-800/60 text-rose-300 font-bold">
                    {p2Name.toLowerCase().includes('muhamadyusuf') ? 'PROBEL (SPACE)' : 'SAVOL BELGISI ( / )'}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Mina o'rnatish:</span> 
                  <span className="bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-800/60 text-rose-300 font-bold">
                    {p2Name.toLowerCase().includes('muhamadyusuf') ? 'Q TUGMASI' : 'NUQTA (.) TUGMASI'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Tactical Map selection panel */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative space-y-6">
            <div className="absolute top-0 right-12 w-32 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            
            <h3 className="font-display font-black text-xs text-slate-200 tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <LayoutGrid className="w-4 h-4 text-sky-400" />
              TACTICAL ARENA DIRECTORY & BATTLE SETTINGS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Maps Buttons */}
              <button
                type="button"
                onClick={() => { setMapType('klassik'); playClick(); }}
                className={`text-left p-4.5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-36 relative overflow-hidden group ${
                  mapType === 'klassik'
                    ? 'border-sky-500 bg-sky-950/40 shadow-[0_0_20px_rgba(14,165,233,0.15)] text-sky-200'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/40 text-slate-400'
                }`}
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-sky-500/5 rounded-full blur-md group-hover:scale-150 transition-transform"></div>
                <div>
                  <div className="font-display font-bold text-xs tracking-wider text-sky-300 uppercase">Klassik Maydon</div>
                  <div className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">Simmetrik tosh devorlar va mustahkam burchakli klassik beton qal'a.</div>
                </div>
                <div className="text-[10px] font-mono text-cyan-400/80 font-bold">STANDARD COMBAT</div>
              </button>

              <button
                type="button"
                onClick={() => { setMapType('labirint'); playClick(); }}
                className={`text-left p-4.5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-36 relative overflow-hidden group ${
                  mapType === 'labirint'
                    ? 'border-pink-500 bg-pink-950/40 shadow-[0_0_20px_rgba(236,72,153,0.15)] text-pink-200'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/40 text-slate-400'
                }`}
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-pink-500/5 rounded-full blur-md group-hover:scale-150 transition-transform"></div>
                <div>
                  <div className="font-display font-bold text-xs tracking-wider text-pink-300 uppercase">Tor Labirint</div>
                  <div className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">Murakkab burilish burchaklari va kutilmagan taktik to'qnashuvlar.</div>
                </div>
                <div className="text-[10px] font-mono text-pink-400/80 font-bold">LABYRINTH RUN</div>
              </button>

              <button
                type="button"
                onClick={() => { setMapType('xarobalar'); playClick(); }}
                className={`text-left p-4.5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-36 relative overflow-hidden group ${
                  mapType === 'xarobalar'
                    ? 'border-yellow-500 bg-yellow-950/40 shadow-[0_0_20px_rgba(234,179,8,0.15)] text-yellow-200'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/40 text-slate-400'
                }`}
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-yellow-500/5 rounded-full blur-md group-hover:scale-150 transition-transform"></div>
                <div>
                  <div className="font-display font-bold text-xs tracking-wider text-amber-300 uppercase">Xarobalar</div>
                  <div className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">Vayron qilinadigan yog'och qutilardan iborat dushman mudofaa maydoni.</div>
                </div>
                <div className="text-[10px] font-mono text-amber-400/80 font-bold">DESTRUCTIBLE</div>
              </button>

              <button
                type="button"
                onClick={() => { setMapType('ochiq_maydon'); playClick(); }}
                className={`text-left p-4.5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-36 relative overflow-hidden group ${
                  mapType === 'ochiq_maydon'
                    ? 'border-emerald-500 bg-emerald-950/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] text-emerald-200'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/40 text-slate-400'
                }`}
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full blur-md group-hover:scale-150 transition-transform"></div>
                <div>
                  <div className="font-display font-bold text-xs tracking-wider text-emerald-300 uppercase">Yashil Butazor</div>
                  <div className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">Keng ko'llar va tanklarni berkituvchi chakalakzor chakalaklari.</div>
                </div>
                <div className="text-[10px] font-mono text-emerald-400/80 font-bold">TACTICAL CAMOUFLAGE</div>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 border-t border-slate-850">
              {/* Victory Limit Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-display font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> RAUND CHEGARASI (LIMITI)
                </label>
                <div className="flex gap-2">
                  {[3, 5, 10, 15].map((points) => (
                    <button
                      key={`pts-${points}`}
                      type="button"
                      onClick={() => { setScoreLimit(points); playClick(); }}
                      className={`flex-1 py-2 rounded-lg font-mono text-xs border font-bold cursor-pointer transition-all duration-200 ${
                        scoreLimit === points
                          ? 'bg-sky-500 border-sky-400 text-slate-950 font-black shadow-[0_0_12px_rgba(14,165,233,0.3)]'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {points} RAUND
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Speed Parameters */}
              <div className="space-y-2">
                <label className="text-[11px] font-display font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-orange-400" /> TANK SHIDDAT PRESENI
                </label>
                <div className="flex gap-2">
                  {[
                    { label: 'Sokin', speed: 2.5, bSpeed: 5.5 },
                    { label: 'Normal', speed: 3.5, bSpeed: 6.5 },
                    { label: 'Tezkor', speed: 4.8, bSpeed: 8.5 },
                  ].map((preset) => (
                    <button
                      key={`speed-${preset.label}`}
                      type="button"
                      onClick={() => { setTankSpeed(preset.speed); setBulletSpeed(preset.bSpeed); playClick(); }}
                      className={`flex-1 py-2 rounded-lg text-xs border font-bold cursor-pointer transition-all duration-200 ${
                        tankSpeed === preset.speed
                          ? 'bg-orange-500 border-orange-400 text-slate-950 font-black shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ambient Volume Settings */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-display font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
                    OVOZ KUCHLANISHI
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="text-[10px] font-sans font-bold text-slate-400 hover:text-white underline cursor-pointer transition-colors"
                  >
                    {isMuted ? "OVOZNI YOQISH" : "OVOZNI O'CHIRISH"}
                  </button>
                </div>
                <div className="flex items-center gap-3 h-9">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : soundVolume}
                    onChange={handleVolumeChange}
                    disabled={isMuted}
                    className="w-full h-1 bg-slate-950 border border-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-450 disabled:opacity-40"
                  />
                  <span className="text-xs font-mono w-8 text-right text-slate-400 font-bold">
                    {isMuted ? '0%' : `${soundVolume}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Launcher Button */}
          <div className="flex flex-col items-center gap-3.5 pt-4">
            <button
              type="submit"
              className="group relative w-full md:w-80 h-16 rounded-xl overflow-hidden cursor-pointer shadow-[0_0_30px_rgba(14,165,233,0.25)] hover:shadow-[0_0_45px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-[1.03]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 group-hover:scale-105 transition-transform duration-300"></div>
              <div className="absolute inset-[1.5px] bg-slate-950 rounded-[10px] group-hover:bg-opacity-90 transition-all duration-350 flex items-center justify-center">
                <span className="text-base font-display font-black tracking-widest text-sky-400 group-hover:text-white transition-colors duration-300 flex items-center gap-2">
                  <Swords className="w-5 h-5 animate-bounce group-hover:rotate-12 transition-transform duration-300" /> JANG MAYDONIGA KIRISH !
                </span>
              </div>
            </button>
            
            <div className="text-[11px] text-slate-500 font-mono text-center flex flex-wrap justify-center items-center gap-2 max-w-xl leading-relaxed">
              <span>BATTLEFIELD AMMUNITION:</span>
              <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-red-400 font-bold text-[10px]"><Heart className="w-2.5 h-2.5" /> SOG'LIK</span>
              <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-sky-400 font-bold text-[10px]"><Shield className="w-2.5 h-2.5" /> QALQON</span>
              <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-yellow-400 font-bold text-[10px]"><Zap className="w-2.5 h-2.5" /> TEZLIK</span>
              <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-red-500 font-bold text-[10px]"><Bomb className="w-2.5 h-2.5" /> TACTICAL MINA</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
