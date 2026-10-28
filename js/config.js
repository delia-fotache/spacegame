// Configurația Navelor
export const SHIPS = [
    { id: 'classic', name: 'Racheta Clasică', emoji: '🚀', primary: '#38bdf8', secondary: '#0284c7', glow: '#7dd3fc' },
    { id: 'fire',    name: 'Vulturul de Foc', emoji: '🔥', primary: '#f97316', secondary: '#dc2626', glow: '#fdba74', image: new URL('../assets/ships/vulturul-de-foc.svg', import.meta.url).href },
    { id: 'ufo',     name: 'OZN-ul Cosmic',   emoji: '🛸', primary: '#a855f7', secondary: '#10b981', glow: '#d8b4fe' },
    { id: 'crystal', name: 'Furia de Cristal',emoji: '💎', primary: '#ec4899', secondary: '#6366f1', glow: '#f9a8d4' }
];

// Configurația celor 10 Nivele + Modul Infinit
export const LEVELS = [
    { num: 1,  name: 'Orbita Terestră 🌍',     target: 100,  reward: 5,   bgTop: '#060919', bgBot: '#0f172a', meteorSpeed: 2.3, spawnRate: 62, blueChance: 0.14, style: 'normal' },
    { num: 2,  name: 'Centura de Asteroizi ☄️', target: 220,  reward: 10,  bgTop: '#090d16', bgBot: '#1e293b', meteorSpeed: 2.9, spawnRate: 50, blueChance: 0.16, style: 'normal' },
    { num: 3,  name: 'Nebuloasa Purpurie 🌌',  target: 360,  reward: 15,  bgTop: '#160726', bgBot: '#2e1065', meteorSpeed: 3.3, spawnRate: 45, blueChance: 0.30, style: 'nebula' },
    { num: 4,  name: 'Furtuna Solară ☀️',      target: 520,  reward: 20,  bgTop: '#270905', bgBot: '#451a03', meteorSpeed: 3.9, spawnRate: 38, blueChance: 0.20, style: 'fire' },
    { num: 5,  name: 'Gaura Neagră 🕳️',        target: 750,  reward: 30,  bgTop: '#020205', bgBot: '#1e1b4b', meteorSpeed: 4.5, spawnRate: 32, blueChance: 0.22, style: 'void' },
    { num: 6,  name: 'Cimitirul de Nave 🛸',   target: 1000, reward: 40,  bgTop: '#041a14', bgBot: '#064e3b', meteorSpeed: 5.0, spawnRate: 28, blueChance: 0.24, style: 'debris' },
    { num: 7,  name: 'Supernova Înghețată ❄️', target: 1300, reward: 55,  bgTop: '#041829', bgBot: '#0c4a6e', meteorSpeed: 5.6, spawnRate: 25, blueChance: 0.25, style: 'ice' },
    { num: 8,  name: 'Curentul de Comete 🌠',  target: 1700, reward: 70,  bgTop: '#190b28', bgBot: '#3b0764', meteorSpeed: 6.3, spawnRate: 22, blueChance: 0.26, style: 'comet' },
    { num: 9,  name: 'Dimensiunea Haosului 🌀',target: 2200, reward: 90,  bgTop: '#240515', bgBot: '#500724', meteorSpeed: 7.0, spawnRate: 19, blueChance: 0.28, style: 'chaos' },
    { num: 10, name: 'Boss: Apocalipsa Cosmică 💀🔥',target: 3000, reward: 150, bgTop: '#1f0000', bgBot: '#450a0a', meteorSpeed: 8.2, spawnRate: 14, blueChance: 0.32, style: 'apocalypse' },
    { num: 11, name: 'Modul Infinit ♾️',       target: 0,    reward: 0,   bgTop: '#030712', bgBot: '#111827', meteorSpeed: 4.8, spawnRate: 26, blueChance: 0.25, style: 'infinite', isInfinite: true }
];

// Configurația Magazinului de Gear-uri
export const SHOP_GEARS = [
    { id: 'slow', name: 'Încetinirea Timpului', icon: '⏳', cost: 50, desc: 'Încetinește cu 50% asteroizii și proiectilele inamice timp de 8 secunde. Tasta 5.' },
    { id: 'rapid', name: 'Foc Rapid', icon: '🔫', cost: 55, desc: 'Tragi de două ori mai repede timp de 10 secunde în lupta cu bossul. Tasta 6.' },
    { id: 'double', name: 'Puncte Duble', icon: '✨', cost: 40, desc: 'Primești punctaj dublu timp de 10 secunde. Nu dublează stelele din inventar. Tasta 7.' },
    { id: 'magnet', name: 'Magnet Cosmic',     icon: '🧲', cost: 38,  desc: 'Atrage automat toate stelele de pe ecran spre navă timp de 8 secunde.' },
    { id: 'shield', name: 'Scut Energetic',    icon: '🛡️', cost: 40,  desc: 'Ești invincibil timp de 8 secunde și distrugi meteoriții (+15p fiecare).' },
    { id: 'repair', name: 'Kit de Reparație',  icon: '❤️', cost: 45, desc: 'Repară nava instantaneu și îți oferă +1 Viață (maxim 3 ❤️).' },
    { id: 'nova',   name: 'Turbo & Supernova', icon: '⚡', cost: 50, desc: 'Distruge instantaneu toți meteoriții de pe ecran + super-viteză 6 secunde.' }
];
