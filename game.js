// ─────────────────────────────────────────
// STATE
// ─────────────────────────────────────────
const DEFAULT_STATE = {
  dollars: 0, diamonds: 5, streak: 0, bestStreak: 0,
  luckyRewardLvl: 0, luckChanceLvl: 0, streakBonusLvl: 0,
  agilityLvl: 0, capacityLvl: 0, speedLvl: 0,
  boxes: { small: 0, big: 0, legendary: 0, ultra: 0, ice: 0, china: 0 },
  potions: { energy: 0, agility: 0, sleep: 0, bubblexp: 0, starr: 0 },
  pets: {}, redeemedCodes: {}, dailyLastClaim: 0,
  passXp: 0, passRank: 0, passClaims: {}, goldPassOwned: false,
  goldTitleEnabled: true, shopOffers: [], shopOffersInitialized: false,
  shopOffersDate: '', cupCooldownEnd: 0, policyAccepted: false,
  siteStartAt: 0, starterPackPurchased: false, starterPackExpired: false,
  premiumPackPurchased: false, chinaBoxPurchased: false, items: {}, water: 0,
  profileName: '', profileBio: '', profileAvatar: '', profileFavPet: '', profilePrivate: false,
  goldNameEnabled: true,
  selectedTheme: 'dark-green', ownedThemes: ['dark-green','light-green'],
};
window.DEFAULT_STATE = DEFAULT_STATE;

let S = JSON.parse(localStorage.getItem('cup_state') || 'null') || JSON.parse(JSON.stringify(DEFAULT_STATE));
S.boxes   = { small:0,big:0,legendary:0,ultra:0,ice:0,china:0,...(S.boxes||{}) };
S.potions = { energy:0,agility:0,sleep:0,bubblexp:0,starr:0,...(S.potions||{}) };
S.pets = {...(S.pets||{})}; S.redeemedCodes = {...(S.redeemedCodes||{})};
S.passClaims = {...(S.passClaims||{})}; S.shopOffers = Array.isArray(S.shopOffers)?S.shopOffers:[];
S.items = {...(S.items||{})}; S.water = typeof S.water==='number'?S.water:0;
window.S = S;

function save() {
  localStorage.setItem('cup_state', JSON.stringify(S));
  window.S = S;
  updateHeader();
  updateSettings();
  if (typeof window.syncToSupabase === 'function') window.syncToSupabase();
}

function addDollars(n) { S.dollars = Math.max(0, S.dollars + n); save(); }
function addDiamonds(n) { S.diamonds = Math.max(0, S.diamonds + n); save(); }
function addItem(id, amount) { S.items[id] = (S.items[id]||0)+amount; save(); }
function removeItem(id, amount) { S.items[id] = Math.max(0,(S.items[id]||0)-amount); save(); }
function addWater(ml) { S.water = Math.min(getWaterBarMax(),(S.water||0)+ml); save(); }
const PETS = [
  { id: 'totya',      emoji: '🧽', name: 'Тотя',       rarity: 'common',   passClicks: 1, diamondChance: 0.01,  tiredChance: 0.03 },
  { id: 'cow',        emoji: '🐮', name: 'Корова',     rarity: 'common',   passClicks: 1, diamondChance: 0.01,  tiredChance: 0.03 },
  { id: 'crabik',     emoji: '🦀', name: 'Крабик',     rarity: 'common',   passClicks: 1, diamondChance: 0.01,  tiredChance: 0.03 },
  { id: 'slonik',     emoji: '🐘', name: 'Слоник',     rarity: 'common',   passClicks: 1, diamondChance: 0.01,  tiredChance: 0.03 },
  { id: 'bob',        emoji: '🥔', name: 'Боб',        rarity: 'uncommon', passClicks: 2, diamondChance: 0.015, tiredChance: 0.03 },
  { id: 'pepe',       emoji: '🐸', name: 'Пепе',       rarity: 'uncommon', passClicks: 2, diamondChance: 0.015, tiredChance: 0.03 },
  { id: 'kakaracha',  emoji: '🪳', name: 'Какарача',   rarity: 'uncommon', passClicks: 2, diamondChance: 0.015, tiredChance: 0.03 },
  { id: 'garry',      emoji: '🐌', name: 'Гэрри',      rarity: 'uncommon', passClicks: 2, diamondChance: 0.015, tiredChance: 0.03 },
  { id: 'hamster',    emoji: '🐹', name: 'Хамстер',    rarity: 'rare',     passClicks: 3, diamondChance: 0.02,  tiredChance: 0.03 },
  { id: 'papagay',    emoji: '🦜', name: 'Папагай',    rarity: 'rare',     passClicks: 3, diamondChance: 0.02,  tiredChance: 0.03 },
  { id: 'croco',      emoji: '🐊', name: 'Крокозябра', rarity: 'epic',     passClicks: 4, diamondChance: 0.03,  tiredChance: 0.03 },
  { id: 'shibaki',    emoji: '🐕', name: 'Шибаки',     rarity: 'epic',     passClicks: 4, diamondChance: 0.03,  tiredChance: 0.03 },
  { id: 'turtle',     emoji: '🐢', name: 'Черепашка',  rarity: 'legendary',passClicks: 5, diamondChance: 0.04,  tiredChance: 0.025 },
  { id: 'hantavirus', emoji: '🐀', name: 'Хантавирус', rarity: 'legendary',passClicks: 5, diamondChance: 0.04,  tiredChance: 0.025 },
  { id: 'murzik',     emoji: '🐈‍⬛', name: 'Мурзик',    rarity: 'mythic',   passClicks: 8, diamondChance: 0.05,  tiredChance: 0.02 },
  { id: 'mukhomor',  emoji: '🍄', name: 'Мухоморчик', rarity: 'mythic',   passClicks: 8, diamondChance: 0.05,  tiredChance: 0.02 },
  { id: 'samurai',   emoji: '💠', name: 'Самурай',    rarity: 'unreal',   passClicks: 10, diamondChance: 0.07, tiredChance: 0.015 },
  { id: 'eggxd',     emoji: '🥚', name: 'ЯИЧКО XD',   rarity: 'unreal',   passClicks: 10, diamondChance: 0.07, tiredChance: 0.015 },
];
const RARITY_LABELS = { common:'Обычный', uncommon:'Необычный', rare:'Редкий', epic:'Эпический', legendary:'Легендарный', mythic:'Мифический', unreal:'虚幻' };
const RARITY_DUPE_REWARD = { common: null, uncommon: null, rare: 1, epic: 2, legendary: 6, mythic: 20, unreal: 30 };

// ─────────────────────────────────────────
// ITEMS DATA
// ─────────────────────────────────────────
const ITEMS = [
  { id: 'small_vial',  emoji: '🧪', name: 'Маленький пузырек', rarity: 'classic' },
  { id: 'green_apple', emoji: '🍏', name: 'Зеленое яблоко',    rarity: 'classic' },
  { id: 'speed',       emoji: '⏩', name: 'Скорость',           rarity: 'enhanced' },
  { id: 'star_item',   emoji: '🌟', name: 'Звезда',             rarity: 'enhanced' },
  { id: 'soap',        emoji: '🫧', name: 'Мыло',               rarity: 'enhanced' },
  { id: 'tea',         emoji: '🫖', name: 'Чай',                rarity: 'enhanced' },
  { id: 'ball_bag',    emoji: '⚫', name: 'Пакетик шариков',    rarity: 'secret' },
  { id: 'energy_item', emoji: '⚡', name: 'Энергия',            rarity: 'secret' },
  { id: 'big_vial',    emoji: '🧫', name: 'Большой пузырек',    rarity: 'secret' },
  { id: 'light',       emoji: '🔆', name: 'Свет',               rarity: 'secret' },
  { id: 'huge_vial',   emoji: '⚗️', name: 'Огромный пузырек', rarity: 'supersecret' },
  { id: 'grass',       emoji: '🌿', name: 'Трава',              rarity: 'supersecret' },
  { id: 'magic',       emoji: '✨', name: 'Магия',              rarity: 'supersecret' },
];
const ITEM_RARITIES = {
  classic:     { label: 'Классический',    color: '#888888',  price: 15 },
  enhanced:    { label: 'Усиленный',       color: '#2ecc71',  price: 30 },
  secret:      { label: 'Секретный',       color: '#333333',  price: 60 },
  supersecret: { label: 'Сверх-Секретный', color: 'rainbow',  price: 120 },
};
// Water max for display bar (5 litres + capacity upgrade)
const WATER_BAR_BASE = 5000;
function getWaterBarMax() { return WATER_BAR_BASE + (S.capacityLvl || 0) * 3000; }
const WATER_BAR_MAX = 5000; // kept for legacy references

const ITEM_CRAFT_RECIPES = [
  { potionId: 'energy',  name: 'Зелье бодрости', icon: '🧪',
    ingredients: [
      { id: 'huge_vial',   amount: 1 },
      { id: '_water',      amount: 5000 },
      { id: 'grass',       amount: 3 },
      { id: 'magic',       amount: 3 },
      { id: 'light',       amount: 3 },
      { id: 'energy_item', amount: 3 },
      { id: 'speed',       amount: 5 },
    ]},
  { potionId: 'bubblexp', name: 'Зелье Бабл XP', icon: '🧋',
    ingredients: [
      { id: 'huge_vial', amount: 1 },
      { id: '_water',    amount: 5000 },
      { id: 'ball_bag',  amount: 15 },
      { id: 'speed',     amount: 15 },
      { id: 'tea',       amount: 10 },
      { id: 'light',     amount: 5 },
    ]},
  { potionId: 'starr',   name: 'Зелье Старр', icon: '🌟',
    ingredients: [
      { id: 'big_vial',  amount: 1 },
      { id: '_water',    amount: 1000 },
      { id: 'star_item', amount: 15 },
      { id: 'magic',     amount: 3 },
      { id: 'soap',      amount: 5 },
    ]},
  { potionId: 'sleep',   name: 'Зелье Сна', icon: '🌙',
    ingredients: [
      { id: 'big_vial',  amount: 1 },
      { id: '_water',    amount: 500 },
      { id: 'magic',     amount: 1 },
      { id: 'star_item', amount: 15 },
    ]},
  { potionId: 'agility', name: 'Зелье Ловкости', icon: '🧃',
    ingredients: [
      { id: 'small_vial',  amount: 1 },
      { id: '_water',      amount: 333 },
      { id: 'green_apple', amount: 7 },
      { id: 'speed',       amount: 5 },
    ]},
];

const petTiredUntil = JSON.parse(localStorage.getItem('pet_tired_until') || '{}');  // id -> timestamp

// ─────────────────────────────────────────
// UPGRADE DATA
// ─────────────────────────────────────────
const UPGRADES = [
  { key: 'luckyRewardLvl', icon: '💵', name: 'Награда за удачу',   desc: '+1💵 за удачный клик', basePrice: 15,   mult: 1.2, maxLvl: 64 },
  { key: 'luckChanceLvl',  icon: '🏷️', name: 'Шанс на удачу',      desc: '+0.5% шанс на монетку', basePrice: 120,  mult: 1.4, maxLvl: 30 },
  { key: 'streakBonusLvl', icon: '🔥', name: 'Награда за серию',   desc: '+1💵 за каждый шаг серии', basePrice: 160, mult: 1.3, maxLvl: 64 },
  { key: 'agilityLvl',     icon: '💪', name: 'Ловкость',            desc: '-0.1% шанс упасть за уровень', basePrice: 8000, mult: 1.5, maxLvl: 10 },
  { key: 'capacityLvl',    icon: '🛢️', name: 'Вместимость',         desc: '+3 литра к макс. запасу воды', basePrice: 1000, mult: 2.0, maxLvl: 6 },
  { key: 'speedLvl',       icon: '⏩', name: 'Скорость',             desc: '-1 секунда ожидания после падения стакана', basePrice: 600, mult: 1.3, maxLvl: 20 },
];

function upgradePrice(u) {
  return Math.floor(u.basePrice * Math.pow(u.mult, S[u.key]));
}

// ─────────────────────────────────────────
// BOX DATA
// ─────────────────────────────────────────
const BOXES = [
  { id: 'small',     emoji: '📦', name: 'Маленький',   dollarPrice: 200,   diamondPrice: 20,   maxItems: 1 },
  { id: 'big',       emoji: '🧰', name: 'Большой',     dollarPrice: 600,   diamondPrice: 60,   maxItems: 2 },
  { id: 'legendary', emoji: '🏆', name: 'Легендарный', dollarPrice: 2000,  diamondPrice: 200,  maxItems: 3 },
  { id: 'ultra',     emoji: '🪎', name: 'Ультра',      dollarPrice: 10000, diamondPrice: 1000, maxItems: 4 },
  { id: 'ice',       emoji: '🧊', name: 'Ледяной',     dollarPrice: 5000,  diamondPrice: 500,  maxItems: 1 },
  { id: 'china',     emoji: '🥡', name: '中国礼品',      dollarPrice: null,  diamondPrice: null, maxItems: 1, eurPrice: 0.39 },
];

// drop table entries can be:
//   { type:'pet', rarity, chance }
//   { type:'water', minMl, maxMl, chance }
//   { type:'item', rarity, chance }
const BOX_DROPS = {
  small: [
    { type:'water', minMl:50,  maxMl:125, chance:10 },
    { type:'item',  rarity:'classic',  chance:5  },
    { type:'pet',   rarity:'common',   chance:60 },
    { type:'pet',   rarity:'uncommon', chance:20 },
    { type:'pet',   rarity:'rare',     chance:5  },
  ],
  big: [
    { type:'water', minMl:150, maxMl:250, chance:12 },
    { type:'item',  rarity:'classic',  chance:10 },
    { type:'item',  rarity:'enhanced', chance:3  },
    { type:'pet',   rarity:'common',   chance:20 },
    { type:'pet',   rarity:'uncommon', chance:35 },
    { type:'pet',   rarity:'rare',     chance:15 },
    { type:'pet',   rarity:'epic',     chance:5  },
  ],
  legendary: [
    { type:'water', minMl:300, maxMl:500, chance:15 },
    { type:'item',  rarity:'classic',  chance:10 },
    { type:'item',  rarity:'enhanced', chance:8  },
    { type:'item',  rarity:'secret',   chance:2  },
    { type:'pet',   rarity:'common',   chance:10 },
    { type:'pet',   rarity:'uncommon', chance:20 },
    { type:'pet',   rarity:'rare',     chance:20 },
    { type:'pet',   rarity:'epic',     chance:7  },
    { type:'pet',   rarity:'legendary',chance:3  },
  ],
  ultra: [
    { type:'water', minMl:400, maxMl:700, chance:10 },
    { type:'item',  rarity:'enhanced',    chance:10 },
    { type:'item',  rarity:'secret',      chance:6  },
    { type:'item',  rarity:'supersecret', chance:4  },
    { type:'pet',   rarity:'rare',        chance:10 },
    { type:'pet',   rarity:'epic',        chance:40 },
    { type:'pet',   rarity:'legendary',   chance:8  },
    { type:'pet',   rarity:'mythic',      chance:2  },
  ],
  ice: [
    { type:'water', minMl:500, maxMl:800, chance:25 },
    { type:'item',  rarity:'classic',     chance:30 },
    { type:'item',  rarity:'enhanced',    chance:25 },
    { type:'item',  rarity:'secret',      chance:17 },
    { type:'item',  rarity:'supersecret', chance:3  },
  ],
  china: [
    { type:'item',  rarity:'secret',      chance:30 },
    { type:'item',  rarity:'supersecret', chance:20 },
    { type:'pet',   rarity:'legendary',   chance:40 },
    { type:'pet',   rarity:'mythic',      chance:10 },
  ],
};
const BOX_ITEM_COUNT = { small: [1,1], big: [1,2], legendary: [2,3], ultra: [3,4], ice: [3,4], china: [2,2] };


// ─────────────────────────────────────────
// OFFER DATA
// ─────────────────────────────────────────
const OFFER_POOL = [
  { id:'o1', icon:'🏆', name:'2 Легендарных ящика + 1000💵', desc:'Разом для стартового буста.', price:300, action: () => { S.boxes.legendary = (S.boxes.legendary || 0) + 2; addDollars(1000); } },
  { id:'o2', icon:'🐢', name:'Черепашка + 2000💵', desc:'Легендарный питомец в подарок.', price:3000, action: () => { addPetFrag('turtle', 5); addDollars(2000); } },
  { id:'o3', icon:'🐈‍⬛', name:'Мурзик', desc:'Мифический питомец.', price:7500, action: () => { addPetFrag('murzik', 5); } },
  { id:'o4', icon:'🏆', name:'5 Легендарных ящиков', desc:'Хороший запас фрагментов.', price:800, action: () => { S.boxes.legendary = (S.boxes.legendary || 0) + 5; } },
  { id:'o5', icon:'🧪', name:'3 Зелья бодрости', desc:'Для будущего использования.', price:1200, action: () => { S.potions.energy = (S.potions.energy || 0) + 3; } },
];

const POTION_RECIPES = [
  { id: 'energy',   icon: '🧪', name: 'Зелье бодрости', cost: 450, desc: 'Выпей в инвентаре — все питомцы получают зелёные карточки «бодрые» на 2 минуты. Нельзя пить, если активен Бабл XP.', canDrinkInInv: true },
  { id: 'bubblexp', icon: '🧋', name: 'Бабл XP',        cost: 450, desc: '5 минут двойного опыта за клики по питомцам. Карточки питомцев становятся жёлтыми. Нельзя использовать, если питомцы бодрые.', canDrinkInInv: true },
  { id: 'starr',    icon: '🌟', name: 'Старр',          cost: 450, desc: 'Даёт всем питомцам эффект Старр на 3 минуты. Пока эффект активен, шанс на алмаз в 1,5 раза выше.', canDrinkInInv: true },
  { id: 'agility',  icon: '🧃', name: 'Зелье ловкости', cost: 95,  desc: 'Нельзя выпить сейчас. Если стакан упал — выпей его в главном меню, чтобы мгновенно восстановить стакан.', canDrinkInInv: false },
  { id: 'sleep',    icon: '🌙', name: 'Зелье сна',      cost: 300, desc: 'Все питомцы засыпают на 5 минут. После пробуждения они получают эффект «бодрые» на 3 минуты.', canDrinkInInv: true },
];

const MONEY_PACKS = [
  { amount: 200, price: 22, tag: '' },
  { amount: 1500, price: 150, tag: '' },
  { amount: 5000, price: 470, tag: 'экономно' },
  { amount: 10000, price: 950, tag: '' },
  { amount: 45000, price: 4000, tag: 'популярно' },
  { amount: 150000, price: 12000, tag: 'выгоднее всего' },
];

const PASS_THRESHOLDS = [
  200, 200, 200, 200, 200, 200, 200, 200, 200, 200,
  500, 500, 500, 500, 500, 500, 500, 500, 500, 500,
  1750, 1750, 1750, 1750, 1750, 1750, 1750, 1750, 1750, 1750, 1750,
  2800
];

const PASS_GOLD_LEVELS = [4,6,9,11,14,16,19,21,23,26,28,31];
const PASS_REWARDS = {
  1:  { type:'diamonds', amount: 50,   text:'50 алмазов' },
  2:  { type:'box', box:'big',         text:'Большой ящик' },
  3:  { type:'diamonds', amount: 75,   text:'75 алмазов' },
  4:  { type:'box', box:'ultra',       text:'Ультра ящик' },
  5:  { type:'diamonds', amount: 50,   text:'50 алмазов' },
  6:  { type:'box', box:'ultra',       text:'Ультра ящик' },
  7:  { type:'potion', potion:'sleep', amount: 1, text:'Зелье сна' },
  8:  { type:'potion', potion:'agility', amount: 1, text:'Зелье ловкости' },
  9:  { type:'potion', potion:'energy', amount: 1, text:'Зелье бодрости' },
  10: { type:'diamonds', amount: 100,  text:'100 алмазов' },
  11: { type:'box', box:'ultra',       text:'Ультра ящик' },
  12: { type:'diamonds', amount: 50,   text:'50 алмазов' },
  13: { type:'diamonds', amount: 100,  text:'100 алмазов' },
  14: { type:'box', box:'ultra',       text:'Ультра ящик' },
  15: { type:'potion', potion:'starr', amount: 1, text:'Зелье Старр' },
  16: { type:'diamonds', amount: 750,  text:'750 алмазов' },
  17: { type:'box', box:'legendary',   text:'Легендарный ящик' },
  18: { type:'diamonds', amount: 100,  text:'100 алмазов' },
  19: { type:'box', box:'ultra',       text:'Ультра ящик' },
  20: { type:'fragment', pet:'samurai', amount: 1, text:'1 фрагмент Самурая' },
  21: { type:'diamonds', amount: 1000, text:'1000 алмазов' },
  22: { type:'box', box:'big',         text:'Большой ящик' },
  23: { type:'fragment', pet:'samurai', amount: 1, text:'Фрагмент самурая' },
  24: { type:'box', box:'ultra',       text:'Ультра ящик' },
  25: { type:'box', box:'legendary',   text:'Легендарный ящик' },
  26: { type:'diamonds', amount: 500,  text:'500 алмазов' },
  27: { type:'box', box:'legendary',   text:'Легендарный ящик' },
  28: { type:'fragment', pet:'samurai', amount: 3, text:'3 фрагмента самурая' },
  29: { type:'box', box:'ultra',       text:'Ультра ящик' },
  30: { type:'diamonds', amount: 200,  text:'200 алмазов' },
  31: { type:'pet_unlock', pet:'eggxd', text:'🥚 ЯИЧКО XD' },
  32: { type:'choice', text:'Выбор награды' },
};

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
function randInt(a, b) { return Math.floor(Math.random() * (b-a+1)) + a; }

function showToast(msg, color) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderLeftColor = color || 'var(--green)';
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function spawnFloaty(txt, el) {
  const r = el ? el.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2, width:0, height:0 };
  const f = document.createElement('div');
  f.className = 'floaty';
  f.textContent = txt;
  f.style.left = (r.left + r.width/2 - 20) + 'px';
  f.style.top = (r.top + r.height/2) + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 900);
}

function applyGoldTitle() {
  const logo = document.querySelector('.logo');
  const goldOn = !!(S.goldPassOwned && S.goldTitleEnabled);
  if (logo) logo.classList.toggle('gold-title', goldOn);
  document.title = goldOn ? '黄金通行证' : '杯子';
  // Gold name in profile
  const hasGoldPass = S.starterPackPurchased || S.goldPassOwned || (typeof getStarterPackState === 'function' && getStarterPackState());
  const goldNameOn = !!(hasGoldPass && S.goldNameEnabled !== false);
  const chip = document.getElementById('authChip');
  if (chip) chip.classList.toggle('gold-name', goldNameOn);
  const profileNameEl = document.getElementById('profileDisplayName');
  if (profileNameEl) profileNameEl.classList.toggle('gold-name', goldNameOn);
}

function updateHeader() {
  document.getElementById('dollarCount').textContent = S.dollars;
  document.getElementById('diamondCount').textContent = S.diamonds;
  applyGoldTitle();
}

function updateSettings() {
  const s = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  s('setDollars', S.dollars);
  s('setDiamonds', S.diamonds);
  s('setBestStreak', S.bestStreak || 0);

  const goldWrap = document.getElementById('goldTitleSetting');
  const goldSelect = document.getElementById('goldTitleSelect');
  if (goldWrap) goldWrap.style.display = S.goldPassOwned ? '' : 'none';
  if (goldSelect) goldSelect.value = S.goldTitleEnabled ? 'on' : 'off';
}

function renderSettingsExtras() {
  updateSettings();
}

function addPetFrag(id, count=1) {
  const pet = PETS.find(p=>p.id===id);
  if (!pet) return;
  S.pets[id] = S.pets[id] || 0;
  const had = S.pets[id];
  const alreadyUnlocked = had >= 5;
  S.pets[id] = Math.min(5, had + count);
  if (alreadyUnlocked) {
    // dupe reward
    const reward = RARITY_DUPE_REWARD[pet.rarity];
    if (reward) { addDiamonds(reward); return reward; }
    return null;
  }
  return null;
}

// ─────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────
// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
function randInt(a, b) { return Math.floor(Math.random() * (b-a+1)) + a; }

function showToast(msg, color) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderLeftColor = color || 'var(--green)';
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function spawnFloaty(txt, el) {
  const r = el ? el.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2, width:0, height:0 };
  const f = document.createElement('div');
  f.className = 'floaty';
  f.textContent = txt;
  f.style.left = (r.left + r.width/2 - 20) + 'px';
  f.style.top = (r.top + r.height/2) + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 900);
}

function applyGoldTitle() {
  const logo = document.querySelector('.logo');
  const goldOn = !!(S.goldPassOwned && S.goldTitleEnabled);
  if (logo) logo.classList.toggle('gold-title', goldOn);
  document.title = goldOn ? '黄金通行证' : '杯子';
  // Gold name in profile
  const hasGoldPass = S.starterPackPurchased || S.goldPassOwned || (typeof getStarterPackState === 'function' && getStarterPackState());
  const goldNameOn = !!(hasGoldPass && S.goldNameEnabled !== false);
  const chip = document.getElementById('authChip');
  if (chip) chip.classList.toggle('gold-name', goldNameOn);
  const profileNameEl = document.getElementById('profileDisplayName');
  if (profileNameEl) profileNameEl.classList.toggle('gold-name', goldNameOn);
}

function updateHeader() {
  document.getElementById('dollarCount').textContent = S.dollars;
  document.getElementById('diamondCount').textContent = S.diamonds;
  applyGoldTitle();
}

function updateSettings() {
  const s = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  s('setDollars', S.dollars);
  s('setDiamonds', S.diamonds);
  s('setBestStreak', S.bestStreak || 0);

  const goldWrap = document.getElementById('goldTitleSetting');
  const goldSelect = document.getElementById('goldTitleSelect');
  if (goldWrap) goldWrap.style.display = S.goldPassOwned ? '' : 'none';
  if (goldSelect) goldSelect.value = S.goldTitleEnabled ? 'on' : 'off';
}

function renderSettingsExtras() {
  updateSettings();
}

function addPetFrag(id, count=1) {
  const pet = PETS.find(p=>p.id===id);
  if (!pet) return;
  S.pets[id] = S.pets[id] || 0;
  const had = S.pets[id];
  const alreadyUnlocked = had >= 5;
  S.pets[id] = Math.min(5, had + count);
  if (alreadyUnlocked) {
    // dupe reward
    const reward = RARITY_DUPE_REWARD[pet.rarity];
    if (reward) { addDiamonds(reward); return reward; }
    return null;
  }
  return null;
}

// ─────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────
function goPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const p = document.getElementById('page-'+page);
  if (p) p.classList.add('active');
  document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add('active'));

  closeSidebar();
  if (page === 'shop') renderShop();
  if (page === 'inv') renderInv();
  if (page === 'pass') renderPass();
  if (page === 'settings') updateSettings();
}

function openSidebar() {}
function closeSidebar() {}

document.querySelectorAll('.menu-item').forEach(el => {
  el.addEventListener('click', () => goPage(el.dataset.page));
});
document.querySelectorAll('.nav-btn').forEach(el => {
  el.addEventListener('click', () => goPage(el.dataset.page));
});

// ─────────────────────────────────────────
// HOME / CUP GAME
// ─────────────────────────────────────────
let cupCooldown = false;
let cupCooldownInterval = null;

function getLuckChance() { return Math.min(0.6 + S.luckChanceLvl * 0.005, 0.95); }
// Lucky reward: flat +1 per level. Base 1, each level adds 1.
function getLuckyReward() {
  const lvl = S.luckyRewardLvl || 0;
  return 1 + lvl;
}
function getStreakBonus() { return S.streakBonusLvl || 0; }

function getStreakReward(streak) {
  const base = getLuckyReward();
  const bonus = getStreakBonus();
  if (streak <= 1) return base;
  // 2 in a row = 2$, each subsequent +1 more
  return base + (streak - 1) + bonus * (streak - 1);
}

function startCupCooldown(secs) {
  cupCooldown = true;
  S.cupCooldownEnd = Date.now() + secs * 1000;
  save();
  const cup = document.getElementById('cupContainer');
  const wrap = document.getElementById('cooldownWrap');
  const bar = document.getElementById('cooldownBar');
  const txt = document.getElementById('cooldownText');
  const hint = document.getElementById('tapHint');
  cup.classList.add('disabled');
  wrap.classList.add('show');
  hint.style.display = 'none';

  if (cupCooldownInterval) clearInterval(cupCooldownInterval);
  cupCooldownInterval = setInterval(() => {
    const rem = Math.max(0, S.cupCooldownEnd - Date.now());
    const pct = (rem / (secs * 1000)) * 100;
    bar.style.width = pct + '%';
    txt.textContent = `Стакан упал! Подождите ${Math.ceil(rem/1000)}с`;
    if (rem <= 0) {
      clearInterval(cupCooldownInterval);
      cupCooldown = false;
      cup.classList.remove('disabled');
      wrap.classList.remove('show');
      txt.textContent = '';
      hint.style.display = '';
      document.getElementById('resultText').textContent = 'Попробуй снова!';
      document.getElementById('resultText').className = 'result-text';
      const aBtn = document.getElementById('agilityRestoreBtn');
      if (aBtn) aBtn.remove();
    }
  }, 200);
}

function checkCupCooldownOnLoad() {
  if (S.cupCooldownEnd && S.cupCooldownEnd > Date.now()) {
    const rem = Math.ceil((S.cupCooldownEnd - Date.now()) / 1000);
    startCupCooldown(rem);
    showCupFallOverlay();
  }
}

function showCupFallOverlay() {
  // Remove existing overlay if any
  const existing = document.getElementById('agilityRestoreBtn');
  if (existing) existing.remove();
  if ((S.potions.agility || 0) <= 0) return;
  const hint = document.getElementById('tapHint');
  const arena = document.querySelector('.cup-arena');
  const btn = document.createElement('button');
  btn.id = 'agilityRestoreBtn';
  btn.className = 'upgrade-btn';
  btn.style.cssText = 'position:absolute;bottom:-60px;left:50%;transform:translateX(-50%);width:auto;padding:10px 18px;white-space:nowrap;font-size:13px;background:linear-gradient(135deg,#1565c0,#42a5f5)';
  btn.innerHTML = `🧃 Восстановить стакан (${S.potions.agility || 0} зелья)`;
  arena.appendChild(btn);
  btn.addEventListener('click', () => {
    if ((S.potions.agility || 0) <= 0) { showToast('Нет зелья ловкости', 'var(--red)'); return; }
    S.potions.agility -= 1;
    save();
    // Cancel cooldown
    if (cupCooldownInterval) clearInterval(cupCooldownInterval);
    cupCooldown = false;
    S.cupCooldownEnd = 0;
    save();
    const cup = document.getElementById('cupContainer');
    const wrap = document.getElementById('cooldownWrap');
    const txt = document.getElementById('cooldownText');
    cup.classList.remove('disabled');
    wrap.classList.remove('show');
    txt.textContent = '';
    if (hint) hint.style.display = '';
    document.getElementById('resultText').textContent = '🧃 Стакан восстановлен!';
    document.getElementById('resultText').className = 'result-text win';
    btn.remove();
    showToast('🧃 Зелье ловкости использовано! Стакан в порядке!', 'var(--green)');
    renderInv();
  });
}

document.getElementById('cupContainer').addEventListener('click', () => {
  if (cupCooldown) return;
  const cup = document.getElementById('cupContainer');
  const cupSvg = document.getElementById('cupSvg');
  const coinReveal = document.getElementById('coinReveal');
  const resultText = document.getElementById('resultText');
  const streakNum = document.getElementById('streakNum');
  const streakFire = document.getElementById('streakFire');
  const hint = document.getElementById('tapHint');

  // Flip animation
  cupSvg.classList.remove('cup-flip-anim');
  void cupSvg.offsetWidth;
  cupSvg.classList.add('cup-flip-anim');

  const luckChance = getLuckChance();
  const won = Math.random() < luckChance;

  setTimeout(() => {
    if (won) {
      S.streak = (S.streak || 0) + 1;
      if (S.streak > (S.bestStreak || 0)) S.bestStreak = S.streak;

      const reward = getStreakReward(S.streak);
      addDollars(reward);

      // coin reveal
      coinReveal.classList.remove('show');
      void coinReveal.offsetWidth;
      coinReveal.classList.add('show');

      resultText.textContent = `+${reward}💵 ${S.streak > 1 ? `(серия ${S.streak}!)` : ''}`;
      resultText.className = 'result-text win';

      streakNum.textContent = S.streak;
      streakFire.style.display = S.streak > 1 ? '' : 'none';
      streakNum.classList.remove('pop');
      void streakNum.offsetWidth;
      streakNum.classList.add('pop');

      spawnFloaty('+' + reward + '💵', document.getElementById('cupContainer'));
    } else {
      S.streak = 0;
      streakNum.textContent = '0';
      streakFire.style.display = 'none';
      resultText.textContent = 'Пусто... 😔';
      resultText.className = 'result-text loss';

      // fall chance reduced by agility upgrade (0.1% per level, base 4%)
      const fallChance = Math.max(0, 0.04 - (S.agilityLvl || 0) * 0.001);
      if (Math.random() < fallChance) {
        cupSvg.classList.remove('cup-flip-anim');
        cupSvg.classList.add('cup-fall-anim');
        resultText.textContent = '💥 Стакан упал!';
        hint.style.display = 'none';
        showToast('😱 Стакан упал! Ожидание...', 'var(--red)');
        // Show agility potion button if player has one
        showCupFallOverlay();
        setTimeout(() => {
          cupSvg.classList.remove('cup-fall-anim');
          const cooldownSecs = Math.max(5, 45 - (S.speedLvl || 0));
          startCupCooldown(cooldownSecs);
        }, 600);
      }
    }
    save();
  }, 300);
});
function renderUpgrades() {
  const container = document.getElementById('upgradesContainer');
  container.innerHTML = '';
  UPGRADES.forEach(u => {
    const lvl = S[u.key] || 0;
    const price = upgradePrice(u);
    const atMax = lvl >= u.maxLvl;
    const pct = Math.min(100, (lvl / u.maxLvl) * 100);
    const card = document.createElement('div');
    card.className = 'upgrade-card';
    card.innerHTML = `
      <div class="upgrade-header">
        <span class="upgrade-icon">${u.icon}</span>
        <span class="upgrade-title">${u.name}</span>
        <span class="upgrade-level">Ур. ${lvl} / ${u.maxLvl}</span>
      </div>
      <div class="upgrade-desc">${u.desc}</div>
      <div class="upgrade-progress"><div class="upgrade-progress-fill" style="width:${pct}%"></div></div>
      <button class="upgrade-btn" ${atMax ? 'disabled' : ''}>
        ${atMax ? 'MAX' : `Улучшить — ${price}💵`}
      </button>
    `;
    card.querySelector('.upgrade-btn').addEventListener('click', () => {
      if (atMax) return;
      if (S.dollars < price) { showToast('Недостаточно 💵', 'var(--red)'); return; }
      addDollars(-price);
      S[u.key] = (S[u.key] || 0) + 1;
      save();
      showToast(`${u.name} улучшен до ${S[u.key]}! ✅`);
      renderUpgrades();
    });
    container.appendChild(card);
  });
}

function renderBoxShop() {
  const container = document.getElementById('boxesShopContainer');
  container.innerHTML = '';
  BOXES.filter(box => box.dollarPrice !== null).forEach(box => {
    const card = document.createElement('div');
    card.className = 'box-card';
    card.innerHTML = `
      <span class="box-icon">${box.emoji}</span>
      <div class="box-name">${box.name}</div>
      <div class="box-prices">
        <button class="box-buy-btn btn-gold">${box.dollarPrice}💵</button>
        <button class="box-buy-btn btn-diamond">${box.diamondPrice}💎</button>
      </div>
    `;
    const [btnDollar, btnDiamond] = card.querySelectorAll('.box-buy-btn');
    btnDollar.addEventListener('click', () => buyBox(box, 'dollar'));
    btnDiamond.addEventListener('click', () => buyBox(box, 'diamond'));
    container.appendChild(card);
  });
  // Special euro-priced China box
  renderChinaBoxOffer();
}

function buyBox(box, currency) {
  if (currency === 'dollar') {
    if (S.dollars < box.dollarPrice) { showToast('Недостаточно 💵', 'var(--red)'); return; }
    addDollars(-box.dollarPrice);
  } else {
    if (S.diamonds < box.diamondPrice) { showToast('Недостаточно 💎', 'var(--red)'); return; }
    addDiamonds(-box.diamondPrice);
  }
  S.boxes[box.id] = (S.boxes[box.id] || 0) + 1;
  save();
  renderInvBoxes();
  showToast(`${box.emoji} ${box.name} ящик куплен!`);
}

function renderPotionShop() {
  const container = document.getElementById('potionsShopContainer');
  if (!container) return;
  container.innerHTML = '';
  POTION_RECIPES.forEach(p => {
    const card = document.createElement('div');
    card.className = 'potion-card';
    card.innerHTML = `
      <div class="upgrade-header">
        <span class="upgrade-icon">${p.icon}</span>
        <span class="upgrade-title">${p.name}</span>
        <span class="upgrade-level">${S.potions[p.id] || 0}</span>
      </div>
      <div class="upgrade-desc">${p.desc}</div>
      <button class="craft-btn">Купить — ${p.cost}💎</button>
    `;
    card.querySelector('.craft-btn').addEventListener('click', () => {
      if (S.diamonds < p.cost) { showToast('Недостаточно алмазов 💎', 'var(--red)'); return; }
      addDiamonds(-p.cost);
      S.potions[p.id] = (S.potions[p.id] || 0) + 1;
      save();
      showToast(`${p.name} куплено! ✅`);
      renderPotionShop();
      renderInv();
    });
    container.appendChild(card);
  });
}

function renderItemsShop() {
  const container = document.getElementById('itemsShopContainer');
  if (!container) return;
  container.innerHTML = '';
  // Group by rarity
  const rarityOrder = ['classic','enhanced','secret','supersecret'];
  rarityOrder.forEach(rar => {
    const rarConf = ITEM_RARITIES[rar];
    const rarItems = ITEMS.filter(it => it.rarity === rar);
    if (!rarItems.length) return;
    const header = document.createElement('div');
    const col = rar === 'supersecret'
      ? 'linear-gradient(90deg,#ff4fd8,#7c4dff,#2ee6ff,#ffe84d)'
      : rarConf.color;
    const textStyle = rar === 'supersecret'
      ? 'background:linear-gradient(90deg,#ff4fd8,#7c4dff,#2ee6ff,#ffe84d);-webkit-background-clip:text;background-clip:text;color:transparent'
      : `color:${rarConf.color}`;
    header.innerHTML = `<div style="font-size:13px;font-weight:800;margin:10px 0 6px;${textStyle}">${rarConf.label} — ${rarConf.price}💎 за шт.</div>`;
    container.appendChild(header);
    rarItems.forEach(itm => {
      const card = document.createElement('div');
      card.className = 'shop-item-card';
      const dotStyle = rar === 'supersecret'
        ? 'background:linear-gradient(135deg,#ff4fd8,#7c4dff,#2ee6ff)'
        : `background:${rarConf.color}`;
      card.innerHTML = `
        <div class="shop-item-rarity-dot" style="${dotStyle}"></div>
        <span style="font-size:22px">${itm.emoji}</span>
        <div style="flex:1">
          <div style="font-weight:800;font-size:13px">${itm.name}</div>
          <div style="font-size:11px;color:var(--text2)">${S.items[itm.id] || 0} в инвентаре</div>
        </div>
        <div class="offer-price" style="cursor:pointer">💎 ${rarConf.price}</div>
      `;
      card.querySelector('.offer-price').addEventListener('click', () => {
        if (S.diamonds < rarConf.price) { showToast('Недостаточно алмазов 💎', 'var(--red)'); return; }
        addDiamonds(-rarConf.price);
        addItem(itm.id, 1);
        showToast(`${itm.emoji} ${itm.name} куплен! ✅`);
        renderItemsShop();
        renderInvItems();
      });
      container.appendChild(card);
    });
  });
}

function renderCraftShop() {
  const container = document.getElementById('craftShopContainer');
  if (!container) return;
  container.innerHTML = '';

  ITEM_CRAFT_RECIPES.forEach(recipe => {
    const potionInfo = POTION_RECIPES.find(p => p.id === recipe.potionId);
    const card = document.createElement('div');
    card.className = 'craft-recipe-card';

    // Check if all ingredients available
    let canCraft = true;
    const chips = recipe.ingredients.map(ing => {
      if (ing.id === '_water') {
        const have = S.water || 0;
        const ml = ing.amount;
        const displayNeed = ml >= 1000 ? (ml/1000).toFixed(2).replace(/\.?0+$/,'') + 'л' : ml + 'мл';
        const displayHave = have >= 1000 ? (have/1000).toFixed(2).replace(/\.?0+$/,'') + 'л' : have + 'мл';
        const ok = have >= ml;
        if (!ok) canCraft = false;
        return `<span class="craft-ing-chip ${ok ? 'ok' : 'lack'}">💧${displayNeed} (${displayHave})</span>`;
      } else {
        const itm = ITEMS.find(i => i.id === ing.id);
        const have = S.items[ing.id] || 0;
        const ok = have >= ing.amount;
        if (!ok) canCraft = false;
        return `<span class="craft-ing-chip ${ok ? 'ok' : 'lack'}">${itm ? itm.emoji : '?'}×${ing.amount} (${have})</span>`;
      }
    });

    card.innerHTML = `
      <div class="upgrade-header">
        <span class="upgrade-icon">${recipe.icon}</span>
        <span class="upgrade-title">${recipe.name}</span>
        <span class="upgrade-level">${S.potions[recipe.potionId] || 0}</span>
      </div>
      <div class="craft-ingredients">${chips.join('')}</div>
      <button class="craft-btn" ${canCraft ? '' : 'disabled'}>
        ${canCraft ? 'Скрафтить 🔨' : 'Не хватает ингредиентов'}
      </button>
    `;
    card.querySelector('.craft-btn').addEventListener('click', () => {
      // Re-check
      for (const ing of recipe.ingredients) {
        if (ing.id === '_water') { if ((S.water||0) < ing.amount) { showToast('Недостаточно воды 💧', 'var(--red)'); return; } }
        else { if ((S.items[ing.id]||0) < ing.amount) { showToast('Недостаточно ингредиентов', 'var(--red)'); return; } }
      }
      // Consume
      for (const ing of recipe.ingredients) {
        if (ing.id === '_water') S.water = Math.max(0, (S.water||0) - ing.amount);
        else removeItem(ing.id, ing.amount);
      }
      S.potions[recipe.potionId] = (S.potions[recipe.potionId] || 0) + 1;
      save();
      showToast(`${recipe.icon} ${recipe.name} создано! ✅`);
      renderCraftShop();
      renderInv();
    });
    container.appendChild(card);
  });
}

function renderMoneyPacks() {
  const container = document.getElementById('moneyPackContainer');
  if (!container) return;
  container.innerHTML = '';
  MONEY_PACKS.forEach(pack => {
    const card = document.createElement('div');
    card.className = 'money-pack-card';
    card.innerHTML = `
      <div class="money-pack-title">${pack.amount}💵</div>
      <div class="money-pack-row">
        <span>Цена</span>
        <strong>${pack.price}💎</strong>
      </div>
      ${pack.tag ? `<div class="money-pack-tag">${pack.tag}</div>` : `<div class="money-pack-tag">&nbsp;</div>`}
      <button class="money-pack-btn">Купить</button>
    `;
    card.querySelector('.money-pack-btn').addEventListener('click', () => buyMoneyPack(pack));
    container.appendChild(card);
  });
}

function buyMoneyPack(pack) {
  if (S.diamonds < pack.price) { showToast('Недостаточно алмазов 💎', 'var(--red)'); return; }
  addDiamonds(-pack.price);
  addDollars(pack.amount);
  showToast(`Куплено ${pack.amount}💵!`);
  renderSettingsExtras();
}

function renderPromoCodes() {
  const input = document.getElementById('promoInput');
  const btn = document.getElementById('promoBtn');
  if (!input || !btn) return;
  btn.onclick = () => {
    const code = (input.value || '').trim();
    if (!code) return;
    redeemPromoCode(code);
    input.value = '';
  };
  input.onkeydown = (e) => {
    if (e.key === 'Enter') btn.click();
  };
}

function redeemPromoCode(raw) {
  const code = raw.trim();
  const key = code.toUpperCase();
  if (S.redeemedCodes[key]) {
    showToast('Этот промокод уже использован', 'var(--red)');
    return;
  }
  const normalized = code.toLowerCase();
  const actionMap = {
    '1234': () => { addDiamonds(10000); showToast('Промокод: +10000💎 ✅'); },
    'мяу': () => {
      UPGRADES.forEach(u => { S[u.key] = 50; });
      save();
      showToast('Все улучшения прокачаны до 50! ✅');
      renderUpgrades();
    },
    'magic_freebie': () => { S.boxes.big = (S.boxes.big || 0) + 3; showToast('Получено 3 больших ящика! ✅'); },
    'pre-alpha_bonus': () => { S.boxes.small = (S.boxes.small || 0) + 8; showToast('Получено 8 маленьких ящиков! ✅'); },
  };
  const fn = actionMap[normalized];
  if (!fn) { showToast('Неверный промокод', 'var(--red)'); return; }
  fn();
  S.redeemedCodes[key] = true;
  save();
  renderInvBoxes();
}


function renderPromoCodes() {
  const input = document.getElementById('promoInput');
  const btn   = document.getElementById('promoBtn');
  if (!input || !btn) return;
  btn.onclick = async () => {
    const code = (input.value || '').trim();
    if (!code) return;
    await redeemPromoCode(code);
    input.value = '';
  };
  input.onkeydown = (e) => { if (e.key==='Enter') btn.click(); };
}

async function redeemPromoCode(raw) {
  const code = raw.trim();
  const key  = code.toUpperCase();

  if (S.redeemedCodes[key]) {
    showToast('Этот промокод уже использован', 'var(--red)'); return;
  }

  // ── Проверка в Supabase (одноразовые коды из админки) ──
  if (typeof window.checkSupabasePromo === 'function') {
    const promo = await window.checkSupabasePromo(key);
    if (promo) {
      const BOXES_MAP = { small:'📦 Маленький',big:'🧰 Большой',legendary:'🏆 Легендарный',ultra:'🪎 Ультра',ice:'🧊 Ледяной',china:'🥡 中国礼品' };
      if (promo.type === 'diamonds') {
        addDiamonds(promo.diamonds_amount || 0);
        showToast(`+${promo.diamonds_amount}💎 получено! ✅`,'var(--green)');
      } else if (promo.type === 'box') {
        const btype = promo.box_type || 'small';
        S.boxes[btype] = (S.boxes[btype]||0) + (promo.box_count||1);
        save(); renderInvBoxes();
        showToast(`${BOXES_MAP[btype]||'📦'} ×${promo.box_count||1} получено! ✅`,'var(--green)');
      } else if (promo.type === 'premium_pack') {
        addPetFrag('eggxd', 5); S.premiumPackPurchased = true; save();
        showToast('🥚 ЯИЧКО XD получено! ✨','#ff4fd8'); renderShop(); renderInv();
      } else if (promo.type === 'china_box') {
        const qty = promo.box_count || 1;
        S.boxes.china = (S.boxes.china||0) + qty; save(); renderInvBoxes();
        showToast(`🥡 中国礼品 ×${qty} получено! ✅`,'var(--gold)');
      }
      S.redeemedCodes[key] = true; save(); return;
    }
  }

  // ── Статичные промокоды ──
  const norm = code.toLowerCase();
  const actionMap = {
    'magic_freebie':   () => { S.boxes.big=(S.boxes.big||0)+3; showToast('Получено 3 больших ящика! ✅'); },
    'pre-alpha_bonus': () => { S.boxes.small=(S.boxes.small||0)+8; showToast('Получено 8 маленьких ящиков! ✅'); },
  };
  const fn = actionMap[norm];
  if (!fn) { showToast('Неверный промокод', 'var(--red)'); return; }
  fn(); S.redeemedCodes[key]=true; save(); renderInvBoxes();
}
function renderDailyGift() {
  const btn = document.getElementById('dailyBtn');
  const coolEl = document.getElementById('dailyCooldown');
  const now = Date.now();
  const last = S.dailyLastClaim || 0;
  const msLeft = (last + 24*3600*1000) - now;

  if (msLeft > 0) {
    btn.disabled = true;
    const h = Math.floor(msLeft/3600000);
    const m = Math.floor((msLeft%3600000)/60000);
    coolEl.textContent = `Следующий подарок через ${h}ч ${m}м`;
  } else {
    btn.disabled = false;
    coolEl.textContent = '';
  }

  btn.onclick = () => {
    const r = Math.random() * 100;
    let result = '';
    if (r < 40) {
      const amt = randInt(40, 120);
      addDollars(amt);
      result = `+${amt}💵`;
    } else if (r < 70) {
      S.boxes.small = (S.boxes.small||0)+1; save();
      result = '📦 Маленький ящик!';
    } else if (r < 90) {
      S.boxes.big = (S.boxes.big||0)+1; save();
      result = '🧰 Большой ящик!';
    } else if (r < 98) {
      S.boxes.legendary = (S.boxes.legendary||0)+1; save();
      result = '🏆 Легендарный ящик!';
    } else {
      S.boxes.ultra = (S.boxes.ultra||0)+1; save();
      result = '🪎 ДЖЕКПОТ — Ультра ящик!';
    }
    S.dailyLastClaim = Date.now();
    save();
    showToast('🎁 Подарок: ' + result);
    renderDailyGift();
    renderInv();
  };
}

function renderInv() {
  renderInvBoxes();
  renderInvPotions();
  renderInvItems();
  renderPetsGrid();
}

function renderInvItems() {
  // Water bar
  const waterEl = document.getElementById('invWater');
  const itemsEl = document.getElementById('invItems');
  if (!waterEl || !itemsEl) return;

  const ml = S.water || 0;
  const waterMax = getWaterBarMax();
  const pct = Math.min(100, (ml / waterMax) * 100);
  const displayMl = ml >= 1000 ? (ml / 1000).toFixed(2).replace(/\.?0+$/, '') + ' л' : ml + ' мл';
  const displayMax = waterMax >= 1000 ? (waterMax / 1000).toFixed(0) + ' л' : waterMax + ' мл';
  waterEl.innerHTML = `
    <div class="water-bar-card">
      <span style="font-size:22px">💧</span>
      <div style="flex:1">
        <div style="font-weight:800;font-size:13px;margin-bottom:4px">Вода — ${displayMl} / ${displayMax}</div>
        <div class="water-bar-fill"><div class="water-bar-inner" style="width:${pct}%"></div></div>
      </div>
    </div>
  `;

  itemsEl.innerHTML = '';
  ITEMS.forEach(itm => {
    const cnt = S.items[itm.id] || 0;
    if (cnt === 0) return;
    const card = document.createElement('div');
    card.className = `inv-item-card item-rarity-${itm.rarity}`;
    card.innerHTML = `
      <div class="item-rarity-bar"></div>
      <span class="inv-item-emoji">${itm.emoji}</span>
      <div class="inv-item-count">${cnt}</div>
      <div class="inv-item-name">${itm.name}</div>
    `;
    itemsEl.appendChild(card);
  });
  if (itemsEl.children.length === 0) {
    itemsEl.innerHTML = `<div style="color:var(--text2);font-size:13px;padding:8px 0">Нет предметов. Открывай ящики!</div>`;
  }
}

function renderInvBoxes() {
  const container = document.getElementById('invBoxes');
  container.innerHTML = '';
  const allBoxes = [...BOXES];
  allBoxes.forEach(box => {
    const count = S.boxes[box.id] || 0;
    if (!count) return;
    const item = document.createElement('div');
    item.className = 'inv-box-item';
    item.innerHTML = `
      <span class="inv-box-icon">${box.emoji}</span>
      <div>
        <div class="inv-box-count">${count}</div>
        <div class="inv-box-name">${box.name}</div>
      </div>
      ${count > 0 ? '<button class="open-btn" type="button">Открыть</button>' : ''}
    `;
    if (count > 0) {
      item.addEventListener('click', () => openBoxModal(box));
      item.querySelector('.open-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openBoxModal(box);
      });
    }
    container.appendChild(item);
  });
  // If nothing
  if (!container.children.length) {
    container.innerHTML = `<div style="color:var(--text2);font-size:13px;padding:8px 0">Нет ящиков. Купи в магазине!</div>`;
  }
}
function getPassThreshold(nextLevel) {
  return PASS_THRESHOLDS[nextLevel - 1] || 2800;
}

function addPassPoints(points) {
  // ✅ ОПЫТ ДАЮТ ВСЕ
  // Gold Pass = 1.5x множитель к опыту
  const hasGoldPass = S.starterPackPurchased || S.goldPassOwned || getStarterPackState();
  const goldMult = hasGoldPass ? 1.5 : 1.0;
  const bubbleMult = getBubbleXPMult();
  const gained = Math.max(1, Math.round(points * goldMult * bubbleMult));
  S.passXp = (S.passXp || 0) + gained;
  while ((S.passRank || 0) < 32) {
    const nextLevel = (S.passRank || 0) + 1;
    const need = getPassThreshold(nextLevel);
    if ((S.passXp || 0) < need) break;
    S.passXp -= need;
    S.passRank = nextLevel;
  }
  save();
  renderPass();
}

function givePassReward(level) {
  const reward = PASS_REWARDS[level];
  if (!reward) return;
  switch (reward.type) {
    case 'diamonds':
      addDiamonds(reward.amount);
      break;
    case 'gold':
      addDiamonds(reward.amount);
      break;
    case 'box':
      S.boxes[reward.box] = (S.boxes[reward.box] || 0) + (reward.amount || 1);
      save();
      break;
    case 'potion':
      S.potions[reward.potion] = (S.potions[reward.potion] || 0) + (reward.amount || 1);
      save();
      break;
    case 'fragment':
      addPetFrag(reward.pet, reward.amount || 1);
      break;
    case 'random_fragments': {
      const pool = PETS.filter(p => p.rarity !== 'mythic');
      for (let i = 0; i < reward.amount; i++) {
        const pet = pool[Math.floor(Math.random() * pool.length)];
        addPetFrag(pet.id, 1);
      }
      break;
    }
    case 'choice':
      break;
  }
}

function canClaimPass(level) {
  const reward = PASS_REWARDS[level];
  if (!reward) return false;
  // Gold-only levels
  if (PASS_GOLD_LEVELS.includes(level)) {
    if (!S.goldPassOwned) return false;
  }
  if (level === 32) return (S.passRank || 0) >= 32;
  return (S.passRank || 0) >= level && !S.passClaims[level];
}

function claimPassReward(level) {
  if (!canClaimPass(level)) return;
  if (level === 32) {
    openPassChoice();
    return;
  }
  const rewardText = givePassReward(level) || PASS_REWARDS[level].text;
  S.passClaims[level] = true;
  save();
  showPassRewardModal(level, rewardText);
  renderPass();
  renderInv();
}

function openPassChoice() {
  const modal = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <div class="modal-title">32 уровень — выбор награды</div>
    <div class="modal-subtitle">После выбора ты вернёшься к 31 уровню и сможешь снова копить на 32.</div>
    <button class="upgrade-btn" style="margin-bottom:8px" onclick="choosePass32('fragment')">Фрагмент самурая</button>
    <button class="upgrade-btn" style="margin-bottom:8px" onclick="choosePass32('diamonds')">150 Алмазов</button>
    <button class="upgrade-btn" onclick="choosePass32('dollars')">2000 Денег</button>
  `;
  modal.classList.add('show');
}

function choosePass32(choice) {
  if (!((S.passRank || 0) >= 32)) return;
  if (choice === 'fragment') addPetFrag('samurai', 1);
  if (choice === 'diamonds') addDiamonds(150);
  if (choice === 'dollars') addDollars(2000);
  S.passRank = 31;
  S.passXp = 0;
  save();
  closeModal();
  showToast('Награда 32 уровня выбрана! ✨');
  renderPass();
  renderInv();
}
function renderPass() {
  const summary = document.getElementById('passSummarySub');
  const line = document.getElementById('passLevelLine');
  const fill = document.getElementById('passProgressFill');
  const list = document.getElementById('passRewardsList');
  const claimsBtn = document.getElementById('passClaimsBtn');
  if (!summary || !line || !fill || !list) return;

  const rank = S.passRank || 0;
  const xp = S.passXp || 0;
  const nextLevel = Math.min(rank + 1, 32);
  const need = rank >= 32 ? PASS_THRESHOLDS[31] : getPassThreshold(nextLevel);
  const pct = need ? Math.min(100, (xp / need) * 100) : 100;
  const claimedCount = Object.keys(S.passClaims || {}).filter(k => S.passClaims[k]).length;

  summary.textContent = `Уровень ${Math.min(rank, 31)}${rank >= 32 ? '→32' : ''} • ${xp}/${need} XP`;
  line.textContent = rank >= 32
    ? '32 уровень готов к выбору награды.'
    : `До следующей награды осталось ${Math.max(0, need - xp)} XP.`;

  if (claimsBtn) {
    claimsBtn.textContent = claimedCount ? `Полученные награды (${claimedCount})` : 'Полученные награды';
    claimsBtn.onclick = openClaimedPassRewardsModal;
  }

  fill.style.width = pct + '%';
  list.innerHTML = '';

  for (let level = 1; level <= 32; level++) {
    const reward = PASS_REWARDS[level];
    const isGoldOnly = PASS_GOLD_LEVELS.includes(level);
    const claimed = !!S.passClaims[level];
    const available = level === 32 ? rank >= 32 : rank >= level;
    const locked = !available || (isGoldOnly && !S.goldPassOwned);
    if (claimed) continue;
    const card = document.createElement('div');
    card.className = `pass-reward-card${isGoldOnly ? ' gold' : ''}${locked ? ' locked' : ''}`;
    const stateText = level === 32
      ? (rank >= 32 ? 'Готово к выбору' : 'Ещё не доступно')
      : (locked ? (isGoldOnly ? 'Нужен золотой пропуск' : 'Закрыто') : 'Доступно');
    const xpMeta = level === 32 ? 'Можно выбрать одну из трёх наград.'
      : level <= 10 ? '200 XP до следующей награды.'
      : level <= 20 ? '500 XP до следующей награды.'
      : level <= 31 ? '1750 XP до следующей награды.'
      : '2800 XP до следующей награды.';
    card.innerHTML = `
      <div class="pass-reward-lvl">${level}</div>
      <div class="pass-reward-info">
        <div class="pass-reward-name">${reward.text}${isGoldOnly ? ' 🔶' : ''}</div>
        <div class="pass-reward-meta">${xpMeta}</div>
        <div class="pass-reward-state${locked ? ' locked-state' : ''}">${stateText}</div>
      </div>
      <div>
        ${level === 32
          ? `<button class="claim-btn" ${rank < 32 ? 'disabled' : ''}>Выбрать</button>`
          : `<button class="claim-btn" ${locked ? 'disabled' : ''}>Получить</button>`
        }
      </div>
    `;
    const btn = card.querySelector('button');
    btn.addEventListener('click', () => claimPassReward(level));
    list.appendChild(card);
  }
  if (!list.children.length) {
    list.innerHTML = `<div style="color:var(--text2);font-size:13px;padding:8px 0">Все доступные награды уже получены.</div>`;
  }
}
function openBoxModal(box) {
  if (!box || !BOX_DROPS[box.id]) return;
  const drops = BOX_DROPS[box.id];
  const [minItems, maxItems] = BOX_ITEM_COUNT[box.id];
  const count = randInt(minItems, maxItems);
  const items = [];

  for (let i = 0; i < count; i++) {
    const roll = Math.random() * 100;
    let cumulative = 0;
    let chosen = drops[drops.length - 1];
    for (const d of drops) {
      cumulative += d.chance;
      if (roll < cumulative) { chosen = d; break; }
    }

    if (chosen.type === 'water') {
      const ml = randInt(chosen.minMl, chosen.maxMl);
      addWater(ml);
      items.push({ type: 'water', ml });
    } else if (chosen.type === 'item') {
      const ofRarity = ITEMS.filter(it => it.rarity === chosen.rarity);
      const itm = ofRarity[Math.floor(Math.random() * ofRarity.length)];
      addItem(itm.id, 1);
      items.push({ type: 'item', item: itm });
    } else {
      // pet fragment
      const petsOfRarity = PETS.filter(p => p.rarity === chosen.rarity);
      const pet = petsOfRarity[Math.floor(Math.random() * petsOfRarity.length)];
      const alreadyUnlocked = (S.pets[pet.id] || 0) >= 5;
      const dupeReward = alreadyUnlocked ? RARITY_DUPE_REWARD[pet.rarity] : null;
      if (!alreadyUnlocked) addPetFrag(pet.id, 1);
      else if (dupeReward) addDiamonds(dupeReward);
      items.push({ type: 'pet', pet, alreadyUnlocked, dupeReward });
    }
  }

  S.boxes[box.id] = Math.max(0, (S.boxes[box.id] || 0) - 1);
  save();
  renderInvBoxes();
  renderInvItems();

  const rarityColor = r => {
    const map = { unreal:'--unreal', mythic:'--mythic', legendary:'--legendary', epic:'--epic', rare:'--rare', uncommon:'--uncommon', common:'--common' };
    return map[r] || '--common';
  };

  const modal = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <div class="modal-title">${box.emoji} ${box.name} ящик</div>
    <div class="modal-subtitle">Найдено предметов: ${items.length}</div>
    <span class="box-open-anim">${box.emoji}</span>
    <br>
    ${items.map(it => {
      if (it.type === 'water') {
        return `
          <div class="box-result-item" style="border-left:3px solid #1e90ff">
            <span class="box-result-icon">💧</span>
            <div class="box-result-info">
              <div class="box-result-name">Вода</div>
              <div class="box-result-sub">+${it.ml} мл</div>
            </div>
            <span class="box-result-bonus" style="color:#5dade2">💧${it.ml}мл</span>
          </div>`;
      } else if (it.type === 'item') {
        const rar = ITEM_RARITIES[it.item.rarity];
        const col = it.item.rarity === 'supersecret'
          ? 'linear-gradient(90deg,#ff4fd8,#7c4dff,#2ee6ff,#ffe84d)'
          : rar.color;
        const borderStyle = it.item.rarity === 'supersecret'
          ? 'border-left:3px solid #ff4fd8'
          : `border-left:3px solid ${rar.color}`;
        return `
          <div class="box-result-item" style="${borderStyle}">
            <span class="box-result-icon">${it.item.emoji}</span>
            <div class="box-result-info">
              <div class="box-result-name">${it.item.name}</div>
              <div class="box-result-sub">${rar.label}</div>
            </div>
          </div>`;
      } else {
        return `
          <div class="box-result-item${['legendary','mythic','unreal'].includes(it.pet.rarity) ? ' shimmer':''}" style="border-left:3px solid var(${rarityColor(it.pet.rarity)})">
            <span class="box-result-icon">${it.pet.emoji}</span>
            <div class="box-result-info">
              <div class="box-result-name">${it.pet.name}</div>
              <div class="box-result-sub">Фрагмент ${RARITY_LABELS[it.pet.rarity]}</div>
              ${it.alreadyUnlocked ? `<div style="font-size:11px;color:var(--text2)">Дубликат${it.dupeReward ? '' : ' (нет награды)'}</div>` : ''}
            </div>
            ${it.dupeReward ? `<span class="box-result-bonus">+${it.dupeReward}💎</span>` : ''}
          </div>`;
      }
    }).join('')}
    <br>
    <button class="upgrade-btn" onclick="closeModal()">Отлично!</button>
  `;
  modal.classList.add('show');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  renderPetsGrid();
  renderInvItems();
}

function openPolicyConsentModal(onConfirm) {
  const modal = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <div class="modal-title">📋 Подтверждение покупки</div>
    <div class="modal-subtitle">Перед покупкой необходимо принять условия.</div>
    <div style="background:var(--bg3);border-radius:12px;padding:14px;margin-bottom:16px;font-size:13px;color:var(--text2);line-height:1.6">
      Совершая покупку, ты соглашаешься с нашей
      <strong style="color:var(--diamond)">Политикой конфиденциальности</strong> и
      <strong style="color:var(--diamond)">Условиями предоставления услуг</strong>.
      Прочитать их можно в нашем
      <a href="https://t.me/+9dpgXTrhvExlMTU8" target="_blank" style="color:var(--green);font-weight:800">Telegram‑канале</a>.
    </div>
    <label style="display:flex;align-items:center;gap:10px;margin-bottom:16px;cursor:pointer;font-size:13px;font-weight:700">
      <input type="checkbox" id="policyCheckbox" style="width:18px;height:18px;accent-color:var(--green);cursor:pointer">
      Я согласен(а) с политикой конфиденциальности и условиями предоставления услуг
    </label>
    <button class="upgrade-btn" id="policyConfirmBtn" disabled style="opacity:.5">Подтвердить и купить</button>
    <button class="upgrade-btn" style="margin-top:8px;background:var(--bg3);color:var(--text2);box-shadow:none" onclick="closeModal()">Отмена</button>
  `;
  const checkbox = body.querySelector('#policyCheckbox');
  const confirmBtn = body.querySelector('#policyConfirmBtn');
  checkbox.addEventListener('change', () => {
    confirmBtn.disabled = !checkbox.checked;
    confirmBtn.style.opacity = checkbox.checked ? '1' : '.5';
  });
  confirmBtn.addEventListener('click', () => {
    if (!checkbox.checked) return;
    closeModal();
    onConfirm();
  });
  modal.classList.add('show');
}

document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});


// ─────────────────────────────────────────
// TIMERS / EFFECTS / SHOP OVERRIDES
// ─────────────────────────────────────────
const EFFECT_META = {
  energy: { key: 'energyEffectEnd', label: 'Бодрые', short: 'Бодрые', cls: 'effect-energy', badgeClass: 'pet-effect-badge' },
  bubble: { key: 'bubbleXPEnd', label: 'Бабл XP', short: 'Бабл XP', cls: 'effect-bubble', badgeClass: 'pet-effect-badge' },
  star: { key: 'starEffectEnd', label: 'Старр', short: 'Старр', cls: 'effect-star', badgeClass: 'pet-effect-badge' },
};

function ensureSiteStartAt() {
  if (!S.siteStartAt) {
    S.siteStartAt = Date.now();
    save();
  }
}

function formatTimeLeft(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function getEffectEnd(key) {
  const value = Number(window[key] || 0);
  return Number.isFinite(value) ? value : 0;
}

function isEnergyActive() { return getEffectEnd('energyEffectEnd') > Date.now(); }
function isBubbleActive() { return getEffectEnd('bubbleXPEnd') > Date.now(); }
function isStarActive() { return getEffectEnd('starEffectEnd') > Date.now(); }
function isAnyTimedEffectActive() {
  return isEnergyActive() || isBubbleActive() || isStarActive() || (window.sleepEffectEnd && window.sleepEffectEnd > Date.now()) || Object.values(petTiredUntil).some(ts => ts > Date.now());
}

function getActiveEffectsForCard() {
  const effects = [];
  const now = Date.now();
  const energyEnd = getEffectEnd('energyEffectEnd');
  const bubbleEnd = getEffectEnd('bubbleXPEnd');
  const starEnd = getEffectEnd('starEffectEnd');
  if (energyEnd > now) effects.push({ key: 'energy', label: 'Бодрые', cls: 'effect-energy', rem: energyEnd - now, icon: '⚡' });
  if (bubbleEnd > now) effects.push({ key: 'bubble', label: 'Бабл XP', cls: 'effect-bubble', rem: bubbleEnd - now, icon: '🧋' });
  if (starEnd > now) effects.push({ key: 'star', label: 'Старр', cls: 'effect-star', rem: starEnd - now, icon: '🌟' });
  return effects;
}

function updateTimedEffectsUI() {
  const changed = ensureExpiredEffectsCleared();
  if (changed || isAnyTimedEffectActive() || window.sleepPetsAwakened || document.getElementById('page-shop')?.classList.contains('active')) {
    const activePage = document.querySelector('.page.active')?.id || '';
    if (activePage === 'inv') {
      renderInvPotions();
      renderPetsGrid();
    } else if (activePage === 'shop') {
      renderShop();
    } else if (activePage === 'pass') {
      renderPass();
    } else if (activePage === 'home') {
      // no-op
    }
  }
}

function ensureExpiredEffectsCleared() {
  let changed = false;
  const now = Date.now();
  const effectMap = [
    ['energyEffectEnd', 'energy_effect_end'],
    ['bubbleXPEnd', 'bubble_xp_end'],
    ['starEffectEnd', 'starr_effect_end'],
  ];
  for (const [key, storageKey] of effectMap) {
    if (window[key] && window[key] > 0 && window[key] <= now) {
      window[key] = 0;
      localStorage.removeItem(storageKey);
      changed = true;
    }
  }
  if (window.sleepEffectEnd && window.sleepEffectEnd <= now) {
    if (!window.sleepPetsAwakened) window.sleepPetsAwakened = true;
    window.sleepEffectEnd = 0;
    localStorage.removeItem('sleep_effect_end');
    changed = true;
  }
  if (S.starterPackPurchased) {
    if (S.starterPackExpired !== true) {
      S.starterPackExpired = true;
      changed = true;
    }
  } else if (!S.starterPackExpired) {
    const expiresAt = (S.siteStartAt || 0) + 15 * 60 * 1000;
    if (now >= expiresAt) {
      S.starterPackExpired = true;
      save();
      changed = true;
    }
  }
  if (changed) save();
  return changed;
}

function getStarterPackState() {
  ensureSiteStartAt();
  const now = Date.now();
  if (S.starterPackPurchased || S.starterPackExpired) return { visible: false, remaining: 0, expired: true };
  // Shows immediately, expires after 15 minutes
  const expiresAt = S.siteStartAt + 15 * 60 * 1000;
  if (now >= expiresAt) {
    S.starterPackExpired = true;
    save();
    return { visible: false, remaining: 0, expired: true };
  }
  return { visible: true, remaining: expiresAt - now, expired: false };
}

function getPotionEffectLine(p) {
  const now = Date.now();
  const map = { energy: 'energyEffectEnd', bubblexp: 'bubbleXPEnd', starr: 'starEffectEnd', sleep: 'sleepEffectEnd' };
  const end = map[p.id] ? getEffectEnd(map[p.id]) : 0;
  if (end > now) {
    if (p.id === 'sleep' && window.sleepPetsAwakened) return 'Питомцы уже проснулись';
    return `Активно • ${formatTimeLeft(end - now)}`;
  }
  return '';
}

function buildEffectBadges() {
  const effects = getActiveEffectsForCard();
  if (!effects.length) return '';
  return `<div class="pet-effect-stack">${effects.map(e => `<div class="${e.badgeClass}">${e.icon} ${e.label} ${formatTimeLeft(e.rem)}</div>`).join('')}</div>`;
}
function renderInvPotions() {
  const container = document.getElementById('invPotions');
  if (!container) return;
  container.innerHTML = '';
  POTION_RECIPES.forEach(p => {
    const count = S.potions[p.id] || 0;
    const item = document.createElement('div');
    item.className = 'inv-box-item';
    const canUse = p.canDrinkInInv && count > 0;
    let disabledReason = '';
    if (p.id === 'bubblexp' && isEnergyActive()) disabledReason = 'Нельзя: питомцы бодрые';
    if (p.id === 'energy' && isBubbleActive()) disabledReason = 'Нельзя: Бабл XP уже активен';
    const activeLine = getPotionEffectLine(p);
    item.innerHTML = `
      <span class="inv-box-icon">${p.icon}</span>
      <div style="flex:1">
        <div class="inv-box-count">${count}</div>
        <div class="inv-box-name">${p.name}</div>
        ${activeLine ? `<div style="font-size:10px;color:var(--gold);font-weight:800">${activeLine}</div>` : ''}
        ${disabledReason ? `<div style="font-size:10px;color:var(--red)">${disabledReason}</div>` : ''}
      </div>
      ${canUse && !disabledReason ? `<button class="use-btn" style="font-family:Nunito,sans-serif;font-weight:900;font-size:12px;padding:7px 12px">Выпить</button>` : ''}
      ${p.id === 'agility' && count > 0 ? `<div style="font-size:10px;color:var(--text2);margin-left:4px">Используй в<br>главном меню</div>` : ''}
    `;
    if (canUse && !disabledReason) {
      item.querySelector('.use-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        usePotionFromInv(p.id);
      });
    }
    container.appendChild(item);
  });
}

function usePotionFromInv(id) {
  if ((S.potions[id] || 0) <= 0) { showToast('Нет зелья', 'var(--red)'); return; }
  if (id === 'energy') {
    if (isBubbleActive()) { showToast('Нельзя: Бабл XP уже активен', 'var(--red)'); return; }
    S.potions.energy -= 1;
    save();
    applyEnergyEffect(120);
    showToast('🧪 Все питомцы бодрые на 2 минуты!');
    renderInvPotions();
    renderPetsGrid();
  } else if (id === 'bubblexp') {
    if (isEnergyActive()) { showToast('Нельзя: питомцы бодрые!', 'var(--red)'); return; }
    S.potions.bubblexp -= 1;
    save();
    applyBubbleXP(300);
    showToast('🧋 Двойной опыт на 5 минут!');
    renderInvPotions();
    renderPetsGrid();
  } else if (id === 'starr') {
    S.potions.starr -= 1;
    save();
    applyStarEffect(180);
    showToast('🌟 Старр активен 3 минуты!');
    renderInvPotions();
    renderPetsGrid();
  } else if (id === 'sleep') {
    S.potions.sleep -= 1;
    save();
    applySleepEffect();
    showToast('🌙 Все питомцы отправились спать на 5 минут...');
    renderInvPotions();
    renderPetsGrid();
  }
}

function applyEnergyEffect(seconds) {
  window.energyEffectEnd = Date.now() + seconds * 1000;
  localStorage.setItem('energy_effect_end', window.energyEffectEnd);
  PETS.forEach(pet => { delete petTiredUntil[pet.id]; });
  localStorage.setItem('pet_tired_until', JSON.stringify(petTiredUntil));
  updateTimedEffectsUI();
}

function applyBubbleXP(seconds) {
  window.bubbleXPEnd = Date.now() + seconds * 1000;
  localStorage.setItem('bubble_xp_end', window.bubbleXPEnd);
  updateTimedEffectsUI();
}

function applyStarEffect(seconds) {
  window.starEffectEnd = Date.now() + seconds * 1000;
  localStorage.setItem('starr_effect_end', window.starEffectEnd);
  updateTimedEffectsUI();
}

function applySleepEffect() {
  const wakeTime = Date.now() + 5 * 60 * 1000;
  window.sleepEffectEnd = wakeTime;
  window.sleepPetsAwakened = false;
  localStorage.setItem('sleep_effect_end', wakeTime);
  PETS.forEach(pet => {
    if ((S.pets[pet.id] || 0) >= 5) {
      petTiredUntil[pet.id] = wakeTime;
    }
  });
  localStorage.setItem('pet_tired_until', JSON.stringify(petTiredUntil));
  updateTimedEffectsUI();
  setTimeout(checkSleepWakeUp, 5 * 60 * 1000 + 100);
}

function checkSleepWakeUp() {
  if (window.sleepEffectEnd && Date.now() >= window.sleepEffectEnd) {
    window.sleepPetsAwakened = true;
    window.sleepEffectEnd = 0;
    localStorage.removeItem('sleep_effect_end');
    showToast('🌅 Питомцы проснулись! Нажми "Разбудить"');
    renderPetsGrid();
    renderInvPotions();
  }
}

function renderPetsGrid() {
  const grid = document.getElementById('petsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  PETS.forEach(pet => {
    const frags = S.pets[pet.id] || 0;
    const unlocked = frags >= 5;
    const energized = isEnergyActive();
    const bubble = isBubbleActive();
    const star = isStarActive();
    const sleeping = window.sleepEffectEnd && window.sleepEffectEnd > Date.now() && !window.sleepPetsAwakened;
    const isTired = !energized && (petTiredUntil[pet.id] && petTiredUntil[pet.id] > Date.now());

    const card = document.createElement('div');
    const effectClass = bubble ? 'effect-bubble' : energized ? 'effect-energy' : star ? 'effect-star' : '';
    card.className = `pet-card rarity-${pet.rarity}${unlocked ? '' : ' locked'}${isTired ? ' tired' : ''}${effectClass ? ` ${effectClass}` : ''}`;
    const dotsHtml = Array.from({length:5}, (_,i) => `<div class="frag-dot${i<frags?' filled':''}"></div>`).join('');
    card.innerHTML = `
      <div class="pet-rarity-bar"></div>
      ${buildEffectBadges()}
      <span class="pet-emoji">${pet.emoji}</span>
      <div class="pet-name">${pet.name}</div>
      <div class="pet-status">${RARITY_LABELS[pet.rarity]}</div>
      <div class="pet-fragments">${dotsHtml}</div>
      ${unlocked ? '' : `<div style="font-size:11px;color:var(--text2);margin-top:4px">${frags}/5 фрагм.</div>`}
    `;
    if (unlocked && sleeping) {
      const overlay = document.createElement('div');
      overlay.className = 'pet-tired-overlay';
      const remSec = Math.ceil((window.sleepEffectEnd - Date.now()) / 1000);
      overlay.innerHTML = `😴 Спит<br><span style="font-size:10px">${remSec}с</span>`;
      card.appendChild(overlay);
    } else if (isTired && unlocked) {
      const overlay = document.createElement('div');
      overlay.className = 'pet-tired-overlay';
      overlay.innerHTML = `😴 Устал<br><span id="tired_${pet.id}"></span>`;
      card.appendChild(overlay);
      updateTiredTimer(pet.id);
    } else if (unlocked && energized) {
      const overlay = document.createElement('div');
      overlay.className = 'pet-tired-overlay';
      overlay.style.background = 'rgba(46,204,113,.22)';
      overlay.style.color = 'var(--green)';
      overlay.innerHTML = `⚡ Бодрый!`;
      card.appendChild(overlay);
    } else if (unlocked && bubble) {
      const overlay = document.createElement('div');
      overlay.className = 'pet-tired-overlay';
      overlay.style.background = 'rgba(241,196,15,.22)';
      overlay.style.color = 'var(--gold)';
      overlay.innerHTML = `🧋 Бабл XP!`;
      card.appendChild(overlay);
    }
    if (unlocked && !isTired && !sleeping) {
      card.style.pointerEvents = 'auto';
      card.addEventListener('click', () => clickPet(pet, card));
    }
    grid.appendChild(card);
  });
}

function updateTiredTimer(id) {
  const el = document.getElementById('tired_' + id);
  if (!el) return;
  const rem = Math.max(0, Math.ceil((petTiredUntil[id] - Date.now())/1000));
  if (rem <= 0) { renderPetsGrid(); return; }
  el.textContent = rem + 'с';
  setTimeout(() => updateTiredTimer(id), 1000);
}

function clickPet(pet, card) {
  addPassPoints(pet.passClicks || 1);

  const diamondChanceMultiplier = isStarActive() ? 1.5 : 1;
  if (Math.random() < (pet.diamondChance || 0) * diamondChanceMultiplier) {
    addDiamonds(1);
    spawnFloaty('+1💎', card);
  }

  if (Math.random() < (pet.tiredChance || 0)) {
    petTiredUntil[pet.id] = Date.now() + 60000;
    localStorage.setItem('pet_tired_until', JSON.stringify(petTiredUntil));
    renderPetsGrid();
  }

  spawnFloaty('+' + (pet.passClicks || 1) + ' XP', card);
  save();
}

function refreshPetOffers() {
  const hasTurtle = (S.pets?.turtle || 0) >= 5;
  const hasMurzik = (S.pets?.murzik || 0) >= 5;

  let pool = OFFER_POOL.filter(o => {
    if (o.id === 'o2' && hasTurtle) return false;
    if (o.id === 'o3' && hasMurzik) return false;
    return true;
  });

  const count = Math.random() < 0.5 ? 1 : 2;
  S.shopOffers = pool.sort(() => Math.random() - 0.5).slice(0, count).map(o => o.id);
  save();
}

function ensureShopOffers() {
  const today = new Date().toDateString();
  if (!Array.isArray(S.shopOffers)) S.shopOffers = [];
  if (!S.shopOffersInitialized || S.shopOffersDate !== today) {
    refreshPetOffers();
    S.shopOffersInitialized = true;
    S.shopOffersDate = today;
    save();
  }
}

function getStarterPackOffer() {
  const state = getStarterPackState();
  if (!state.visible) return null;
  return {
    id: 'starter_pack',
    icon: '🎁',
    name: 'Стартер-пак',
    desc: '10 больших ящиков, Хамстер, Папагай и Шибаки.',
    price: 499,
    timer: `До исчезновения ${formatTimeLeft(state.remaining)}`,
    action: () => {
      S.boxes.big = (S.boxes.big || 0) + 10;
      addPetFrag('hamster', 5);
      addPetFrag('papagay', 5);
      addPetFrag('shibaki', 5);
      S.starterPackPurchased = true;
      save();
    }
  };
}

function renderOffers() {
  ensureShopOffers();
  const container = document.getElementById('offersContainer');
  if (!container) return;
  container.innerHTML = '';

  const starter = getStarterPackOffer();
  if (starter) {
    const card = document.createElement('div');
    card.className = 'offer-card starter-pack';
    card.innerHTML = `
      <div class="discount-badge">Новинка</div>
      <div class="offer-icon">${starter.icon}</div>
      <div class="offer-info">
        <div class="offer-name">${starter.name}</div>
        <div class="offer-desc">${starter.desc}</div>
        <div class="offer-timer">${starter.timer}</div>
      </div>
      <div class="offer-price">💎 ${starter.price}</div>
    `;
    card.querySelector('.offer-price').addEventListener('click', () => {
      if (S.diamonds < starter.price) { showToast('Недостаточно алмазов 💎', 'var(--red)'); return; }
      addDiamonds(-starter.price);
      starter.action();
      S.starterPackPurchased = true;
      save();
      showToast('Стартер-пак куплен! ✅');
      renderShop();
      renderInv();
    });
    container.appendChild(card);
  }

  S.shopOffers.forEach(oid => {
    const offer = OFFER_POOL.find(o => o.id === oid);
    if (!offer) return;
    const card = document.createElement('div');
    card.className = 'offer-card';
    card.innerHTML = `
      ${offer.discount ? `<div class="discount-badge">${offer.discount}</div>` : ''}
      <div class="offer-icon">${offer.icon}</div>
      <div class="offer-info">
        <div class="offer-name">${offer.name}</div>
        <div class="offer-desc">${offer.desc}</div>
      </div>
      <div class="offer-price">💎 ${offer.price}</div>
    `;
    card.querySelector('.offer-price').addEventListener('click', () => {
      if (S.diamonds < offer.price) { showToast('Недостаточно алмазов 💎', 'var(--red)'); return; }
      addDiamonds(-offer.price);
      offer.action();
      S.shopOffers = S.shopOffers.filter(id => id !== offer.id);
      save();
      showToast('Покупка совершена! ✅');
      renderShop();
      renderInv();
    });
    container.appendChild(card);
  });

  if (!starter && !S.shopOffers.length) {
    const empty = document.createElement('div');
    empty.className = 'offer-card';
    empty.innerHTML = `
      <div class="offer-icon">✨</div>
      <div class="offer-info">
        <div class="offer-name">Все предложения куплены</div>
        <div class="offer-desc">Здесь больше нечего брать — в этот раз ты был слишком быстрый.</div>
      </div>
    `;
    container.appendChild(empty);
  }

  // Premium pass (permanent offer, dev code required)
  renderPremiumPackOffer();
}

function renderPremiumPackOffer() {
  const offersContainer = document.getElementById('offersContainer');
  if (!offersContainer) return;
  const card = document.createElement('div');
  card.className = 'offer-card';
  card.style.cssText = 'border:1px solid rgba(255,78,216,.5);background:linear-gradient(135deg,rgba(255,78,216,.12),rgba(124,77,255,.06))';
  const purchased = !!S.premiumPackPurchased;
  card.innerHTML = `
    <div class="offer-icon">🥚</div>
    <div class="offer-info">
      <div class="offer-name" style="color:#ff4fd8">Премиум-пак</div>
      <div class="offer-desc">Содержит 🥚 ЯИЧКО XD. Нужен код разработчика и согласие с политикой.</div>
    </div>
    <div class="offer-price" style="border-color:#ff4fd8;color:#ff4fd8;background:linear-gradient(135deg,#1a0a1e,#1e0a2e)">${purchased ? '✅' : '3.40€'}</div>
  `;
  card.querySelector('.offer-price').addEventListener('click', () => {
    if (purchased) { showToast('Уже куплено ✅'); return; }
    const code = prompt('Введите код разработчика:');
    if (code !== 'xxxss2026') { showToast('❌ Неверный код', 'var(--red)'); return; }
    openPolicyConsentModal(() => {
      addPetFrag('eggxd', 5);
      S.premiumPackPurchased = true;
      save();
      showToast('🥚 ЯИЧКО XD получено! ✨', '#ff4fd8');
      renderShop();
      renderInv();
    });
  });
  offersContainer.appendChild(card);
}

function renderChinaBoxOffer() {
  const container = document.getElementById('boxesShopContainer');
  if (!container) return;
  const card = document.createElement('div');
  card.className = 'box-card';
  card.style.cssText = 'border:1px solid rgba(255,200,0,.4);background:linear-gradient(135deg,rgba(255,200,0,.1),rgba(255,140,0,.05))';
  card.innerHTML = `
    <span class="box-icon">🥡</span>
    <div class="box-name">中国礼品</div>
    <div class="offer-desc" style="margin-bottom:8px">Стоимость зависит от количества ящиков.</div>
    <div class="box-prices">
      <button class="box-buy-btn china-price-btn" style="background:linear-gradient(135deg,#b8860b,#ffd700);color:#1a1000">0.39€ × 1</button>
      <input class="promo-input china-qty-input" type="number" min="1" value="1" placeholder="Количество ящиков" style="width:100%;text-align:center">
    </div>
  `;
  const qtyInput = card.querySelector('.china-qty-input');
  const priceBtn = card.querySelector('.china-price-btn');
  const DEV_CODE = 'xxxss2026';
  const updatePrice = () => {
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    qtyInput.value = qty;
    priceBtn.textContent = `${(0.39 * qty).toFixed(2)}€ × ${qty}`;
  };
  updatePrice();
  qtyInput.addEventListener('input', updatePrice);
  priceBtn.addEventListener('click', () => {
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    const code = prompt('Введите код разработчика:');
    if (code !== DEV_CODE) { showToast('❌ Неверный код', 'var(--red)'); return; }
    openPolicyConsentModal(() => {
      S.boxes.china = (S.boxes.china || 0) + qty;
      save();
      showToast(`🥡 中国礼品 куплен: ${qty} шт. ✅`);
      renderInvBoxes();
    });
  });
  container.appendChild(card);
}

function renderShop() {
  renderOffers();
  renderGoldPassOffer();
  renderUpgrades();
  renderBoxShop();
  renderPotionShop();
  renderItemsShop();
  renderCraftShop();
  renderDailyGift();
  renderMoneyPacks();
  renderPromoCodes();
}

function renderGoldPassOffer() {
  const container = document.getElementById('goldPassContainer');
  if (!container) return;
  const owned = !!S.goldPassOwned;
  container.innerHTML = `
    <div class="gold-pass-card">
      <div class="gold-pass-top">
        <div class="gold-pass-icon">🎫</div>
        <div>
          <div class="gold-pass-name">Cup-Pass</div>
          <div class="gold-pass-sub">золотой пропуск</div>
        </div>
        <div class="gold-pass-badge">15% скидки</div>
      </div>
      <div class="gold-pass-price">
        ${owned ? 'Куплено' : '8500💎'}
        <span class="old">10000💎</span>
      </div>
      <div class="gold-pass-benefits">
        <div class="gold-pass-benefit">• +50% XP за клики по питомцам</div>
        <div class="gold-pass-benefit">• Доступ к золотым наградам в Cup-Pass</div>
        <div class="gold-pass-benefit">• Особый золотой стиль в профиле</div>
      </div>
      ${owned ? `<button class="gold-buy-btn" disabled>Уже куплено</button>` : `<button class="gold-buy-btn">Купить золотой пропуск 1 сезона</button>`}
    </div>
  `;
  if (!owned) {
    container.querySelector('.gold-buy-btn').addEventListener('click', () => {
      openPolicyConsentModal(() => {
        if (S.diamonds < 8500) { showToast('Недостаточно алмазов 💎', 'var(--red)'); return; }
        addDiamonds(-8500);
        S.goldPassOwned = true;
        save();
        showToast('Золотой пропуск куплен! ✨');
        renderShop();
        renderPass();
        updateSettings();
      });
    });
  }
}

function givePassReward(level) {
  const reward = PASS_REWARDS[level];
  if (!reward) return null;
  
  // ✅ Проверка: есть ли Gold Pass для эксклюзивных наград?
  const hasGoldPass = S.starterPackPurchased || S.goldPassOwned || getStarterPackState();
  if (reward.goldOnly && !hasGoldPass) {
    showToast('🌟 Эта награда только для владельцев Gold Pass! Купи Gold Pass, чтобы получить её.', 'var(--purple)');
    return '🔒 Заблокировано (только Gold Pass)';
  }
  
  switch (reward.type) {
    case 'diamonds':
      addDiamonds(reward.amount);
      return `${reward.amount} алмазов${reward.goldOnly ? ' ⭐' : ''}`;
    case 'gold':
      addDiamonds(reward.amount);
      return `${reward.amount} алмазов${reward.goldOnly ? ' ⭐' : ''}`;
    case 'box':
      S.boxes[reward.box] = (S.boxes[reward.box] || 0) + (reward.amount || 1);
      save();
      return `${reward.amount || 1} ${BOXES.find(b => b.id === reward.box)?.name || 'ящик'}${reward.goldOnly ? ' ⭐' : ''}`;
    case 'potion':
      S.potions[reward.potion] = (S.potions[reward.potion] || 0) + (reward.amount || 1);
      save();
      return `${reward.amount || 1} ${POTION_RECIPES.find(p => p.id === reward.potion)?.name || 'зелье'}${reward.goldOnly ? ' ⭐' : ''}`;
    case 'fragment':
      addPetFrag(reward.pet, reward.amount || 1);
      return `${reward.amount || 1} фрагмент(а)${reward.goldOnly ? ' ⭐' : ''}`;
    case 'random_fragments': {
      const pool = PETS.filter(p => p.rarity !== 'mythic');
      for (let i = 0; i < reward.amount; i++) {
        const pet = pool[Math.floor(Math.random() * pool.length)];
        addPetFrag(pet.id, 1);
      }
      return `${reward.amount} случайных фрагментов${reward.goldOnly ? ' ⭐' : ''}`;
    }
    case 'pet_unlock':
      addPetFrag(reward.pet, 5);
      return `${PETS.find(p=>p.id===reward.pet)?.name || reward.pet} разблокирован!${reward.goldOnly ? ' ⭐' : ''}`;
    case 'choice':
      return 'Выбор награды';
  }
  return reward.text;
}

function showPassRewardModal(level, rewardText) {
  const modal = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <div class="modal-title">Cup-Pass</div>
    <div class="modal-subtitle">Награда ${level} уровня</div>
    <div class="box-result-item" style="border-left:3px solid var(--green)">
      <span class="box-result-icon">🎁</span>
      <div class="box-result-info">
        <div class="box-result-name">Ты получил</div>
        <div class="box-result-sub">${rewardText}</div>
      </div>
      <div class="box-result-bonus">✅</div>
    </div>
    <br>
    <button class="upgrade-btn" onclick="closeModal()">Отлично!</button>
  `;
  modal.classList.add('show');
}

function openClaimedPassRewardsModal() {
  const modal = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  const claimedLevels = Object.keys(S.passClaims || {})
    .map(Number)
    .filter(level => S.passClaims[level])
    .sort((a, b) => a - b);

  body.innerHTML = `
    <div class="modal-title">Полученные награды</div>
    <div class="modal-subtitle">Все уже забранные награды Cup-Pass</div>
    ${claimedLevels.length ? claimedLevels.map(level => {
      const reward = PASS_REWARDS[level];
      if (!reward) return '';
      return `
        <div class="box-result-item" style="border-left:3px solid var(--diamond)">
          <span class="box-result-icon">🎫</span>
          <div class="box-result-info">
            <div class="box-result-name">Уровень ${level}</div>
            <div class="box-result-sub">${reward.text}</div>
          </div>
          <div class="box-result-bonus">✅</div>
        </div>
      `;
    }).join('') : '<div style="color:var(--text2);font-size:13px;padding:8px 0">Пока ничего не получено.</div>'}
    <br>
    <button class="upgrade-btn" onclick="closeModal()">Отлично!</button>
  `;
  modal.classList.add('show');
}

// ─────────────────────────────────────────
// PREMIUM PACK (без кода разработчика — используй промокод из админки)
// ─────────────────────────────────────────
function renderPremiumPackOffer() {
  const container = document.getElementById('offersContainer');
  if (!container) return;
  const card = document.createElement('div');
  card.className = 'offer-card';
  card.style.cssText = 'border:1px solid rgba(255,78,216,.5);background:linear-gradient(135deg,rgba(255,78,216,.12),rgba(124,77,255,.06))';
  const purchased = !!S.premiumPackPurchased;
  card.innerHTML = `
    <div class="offer-icon">🥚</div>
    <div class="offer-info">
      <div class="offer-name" style="color:#ff4fd8">Премиум-пак</div>
      <div class="offer-desc">${purchased ? 'Уже куплено ✅' : 'Содержит 🥚 ЯИЧКО XD. Стоимость: 3.40€. После оплаты получи промокод у администратора.'}</div>
    </div>
    <div class="offer-price" style="border-color:#ff4fd8;color:#ff4fd8;background:linear-gradient(135deg,#1a0a1e,#1e0a2e)">${purchased ? '✅' : '3.40€'}</div>
  `;
  if (!purchased) {
    card.querySelector('.offer-price').addEventListener('click', () => {
      showToast('Введи промокод в разделе Промокоды после оплаты', 'var(--purple)');
      // Прокрутить вниз к блоку промокодов
      setTimeout(() => {
        const promoSection = document.getElementById('promoInput');
        if (promoSection) promoSection.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    });
  }
  container.appendChild(card);
}

// ─────────────────────────────────────────
// CHINA BOX (без кода разработчика — используй промокод из админки)
// ─────────────────────────────────────────
function renderChinaBoxOffer() {
  const container = document.getElementById('boxesShopContainer');
  if (!container) return;
  const card = document.createElement('div');
  card.className = 'box-card';
  card.style.cssText = 'border:1px solid rgba(255,200,0,.4);background:linear-gradient(135deg,rgba(255,200,0,.1),rgba(255,140,0,.05))';
  card.innerHTML = `
    <span class="box-icon">🥡</span>
    <div class="box-name">中国礼品</div>
    <div class="offer-desc" style="font-size:11px;margin-bottom:8px;color:var(--gold)">0.39€ за шт.</div>
    <div class="offer-desc" style="font-size:11px;color:var(--text2);margin-bottom:8px">После оплаты введи промокод в разделе Промокоды</div>
    <button class="box-buy-btn" style="background:linear-gradient(135deg,#b8860b,#ffd700);color:#1a1000">Как купить?</button>
  `;
  card.querySelector('button').addEventListener('click', () => {
    showToast('Оплати → получи код у администратора → введи в Промокоды','var(--gold)');
  });
  container.appendChild(card);
}

function bootstrapDynamicUi() {
  ensureSiteStartAt();
  ensureExpiredEffectsCleared();
  window.energyEffectEnd = Number(localStorage.getItem('energy_effect_end') || window.energyEffectEnd || 0);
  window.bubbleXPEnd = Number(localStorage.getItem('bubble_xp_end') || window.bubbleXPEnd || 0);
  window.starEffectEnd = Number(localStorage.getItem('starr_effect_end') || window.starEffectEnd || 0);
  window.sleepEffectEnd = Number(localStorage.getItem('sleep_effect_end') || window.sleepEffectEnd || 0);
  window.sleepPetsAwakened = !!window.sleepPetsAwakened;

  if (window.sleepEffectEnd && window.sleepEffectEnd > Date.now()) {
    const rem = window.sleepEffectEnd - Date.now();
    setTimeout(checkSleepWakeUp, rem + 100);
  }
  if (window.energyEffectEnd && window.energyEffectEnd > Date.now()) renderPetsGrid();
  if (window.bubbleXPEnd && window.bubbleXPEnd > Date.now()) renderPetsGrid();
  if (window.starEffectEnd && window.starEffectEnd > Date.now()) renderPetsGrid();

  if (!window._cupUiTicker) {
    window._cupUiTicker = setInterval(updateTimedEffectsUI, 1000);
  }
}

function clearAllTimedEffectsOnReset() {
  const keys = [
    'energyEffectEnd',
    'bubbleXPEnd',
    'starEffectEnd',
    'sleepEffectEnd'
  ];
  keys.forEach(key => {
    window[key] = 0;
  });
  localStorage.removeItem('energy_effect_end');
  localStorage.removeItem('bubble_xp_end');
  localStorage.removeItem('starr_effect_end');
  localStorage.removeItem('sleep_effect_end');
  localStorage.removeItem('pet_tired_until');
  window.sleepPetsAwakened = false;
  for (const k of Object.keys(petTiredUntil)) delete petTiredUntil[k];
}
(function spawnSakura() {
  const passPage = document.getElementById('page-pass');
  const petals = ['🌸','🌸','🌸','🌺','🌸'];
  const count = 18;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'sakura-petal';
    el.textContent = petals[i % petals.length];
    el.style.left = (Math.random() * 100) + 'vw';
    el.style.fontSize = (10 + Math.random() * 10) + 'px';
    el.style.animationDuration = (6 + Math.random() * 10) + 's';
    el.style.animationDelay = (-Math.random() * 14) + 's';
    el.style.opacity = (0.4 + Math.random() * 0.5).toFixed(2);
    passPage.appendChild(el);
  }
})();

// ─────────────────────────────────────────
// RESET (упрощённый, без кода разработчика)
// ─────────────────────────────────────────
document.getElementById('resetBtn').addEventListener('click', () => {
  const today = new Date().toDateString();
  let resetData = JSON.parse(localStorage.getItem('cup_reset_limit') || '{"day":"","count":0}');
  if (resetData.day !== today) { resetData.day = today; resetData.count = 0; }

  if (resetData.count >= 3) {
    showToast('Лимит сбросов исчерпан (3/3 сегодня)', 'var(--red)'); return;
  }
  if (!confirm('Точно сбросить весь прогресс?')) return;

  resetData.count++;
  localStorage.setItem('cup_reset_limit', JSON.stringify(resetData));
  clearAllTimedEffectsOnReset();
  S = { ...DEFAULT_STATE };
  window.S = S;
  save();
  showToast(`Прогресс сброшен 🔄 (${resetData.count}/3 сегодня)`, 'var(--red)');
  renderShop(); renderInv();
});

document.getElementById('goldTitleSelect').addEventListener('change', (e) => {
  S.goldTitleEnabled = e.target.value === 'on'; save();
});

// ─────────────────────────────────────────
// INIT GAME STATE (вызывается из auth.js после загрузки данных)
// ─────────────────────────────────────────
window.initGameState = function (cloudState) {
  if (cloudState) {
    S = cloudState;
    S.boxes   = { small:0,big:0,legendary:0,ultra:0,ice:0,china:0,...(S.boxes||{}) };
    S.potions = { energy:0,agility:0,sleep:0,bubblexp:0,starr:0,...(S.potions||{}) };
    S.pets = {...(S.pets||{})}; S.redeemedCodes = {...(S.redeemedCodes||{})};
    S.passClaims = {...(S.passClaims||{})}; S.shopOffers = Array.isArray(S.shopOffers)?S.shopOffers:[];
    S.items = {...(S.items||{})}; S.water = typeof S.water==='number'?S.water:0;
    window.S = S;
    localStorage.setItem('cup_state', JSON.stringify(S));
  }

  // Инициализация эффектов из localStorage
  window.energyEffectEnd = parseInt(localStorage.getItem('energy_effect_end')||'0');
  window.starEffectEnd   = parseInt(localStorage.getItem('starr_effect_end')||'0');
  window.bubbleXPEnd     = parseInt(localStorage.getItem('bubble_xp_end')||'0');
  window.sleepEffectEnd  = parseInt(localStorage.getItem('sleep_effect_end')||'0');
  window.sleepPetsAwakened = false;
  if (window.sleepEffectEnd && window.sleepEffectEnd <= Date.now()) {
    window.sleepPetsAwakened = true;
    window.sleepEffectEnd = 0;
    localStorage.removeItem('sleep_effect_end');
  } else if (window.sleepEffectEnd && window.sleepEffectEnd > Date.now()) {
    const rem = window.sleepEffectEnd - Date.now();
    setTimeout(() => {
      window.sleepPetsAwakened = true; window.sleepEffectEnd = 0;
      localStorage.removeItem('sleep_effect_end');
      showToast('🌅 Питомцы проснулись! Нажми "Разбудить"');
      renderPetsGrid(); renderInvPotions();
    }, rem + 100);
  }

  // Серия
  const streakEl = document.getElementById('streakNum');
  if (streakEl) streakEl.textContent = S.streak || 0;
  const fireEl = document.getElementById('streakFire');
  if (fireEl) fireEl.style.display = (S.streak||0) > 1 ? '' : 'none';

  updateHeader();
  updateSettings();
  checkCupCooldownOnLoad();
  bootstrapDynamicUi();
  renderShop();
  renderPass();
  renderInv();
};

// ─────────────────────────────────────────
// PROFILE PAGE
// ─────────────────────────────────────────

function openProfilePage() {
  const overlay = document.getElementById('profileOverlay');
  if (!overlay) return;
  overlay.style.display = 'block';
  loadProfileForm();
  switchProfileTab('myprofile');
}

function closeProfilePage() {
  const overlay = document.getElementById('profileOverlay');
  if (overlay) overlay.style.display = 'none';
}

function switchProfileTab(tab) {
  document.querySelectorAll('.profile-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  document.querySelectorAll('.profile-tab-content').forEach(c => {
    c.classList.toggle('active', c.id === 'ptab-' + tab);
  });
  if (tab === 'leaderboard') renderLeaderboard();
}

function loadProfileForm() {
  // Name
  const nameInput = document.getElementById('profileNameInput');
  if (nameInput) nameInput.value = S.profileName || '';

  // Display name preview
  const displayName = document.getElementById('profileDisplayName');
  if (displayName) {
    const hasGold = S.starterPackPurchased || S.goldPassOwned;
    const goldOn = hasGold && S.goldNameEnabled !== false;
    displayName.textContent = S.profileName || 'Игрок';
    displayName.classList.toggle('gold-name', goldOn);
  }

  // Bio
  const bioInput = document.getElementById('profileBioInput');
  if (bioInput) bioInput.value = S.profileBio || '';

  // Avatar
  const avatarPreview = document.getElementById('profileAvatarPreview');
  const avatarEmoji = document.getElementById('profileAvatarEmoji');
  if (S.profileAvatar && avatarPreview) {
    avatarPreview.src = S.profileAvatar;
    avatarPreview.style.display = 'block';
    if (avatarEmoji) avatarEmoji.style.display = 'none';
  } else {
    if (avatarPreview) avatarPreview.style.display = 'none';
    if (avatarEmoji) avatarEmoji.style.display = '';
  }

  // Fav pet select
  const favPetSelect = document.getElementById('profileFavPetSelect');
  if (favPetSelect) {
    favPetSelect.innerHTML = '<option value="">— Не выбран —</option>';
    PETS.forEach(pet => {
      const owned = (S.pets[pet.id] || 0) >= 5;
      if (!owned) return;
      const opt = document.createElement('option');
      opt.value = pet.id;
      opt.textContent = pet.emoji + ' ' + pet.name;
      if (S.profileFavPet === pet.id) opt.selected = true;
      favPetSelect.appendChild(opt);
    });
  }

  // Gold name toggle
  const hasGold = S.starterPackPurchased || S.goldPassOwned;
  const goldNameRow = document.getElementById('goldNameRow');
  if (goldNameRow) goldNameRow.style.display = hasGold ? '' : 'none';
  const goldNameSelect = document.getElementById('goldNameSelect');
  if (goldNameSelect) goldNameSelect.value = S.goldNameEnabled !== false ? 'on' : 'off';

  // Best streak stat
  const bsEl = document.getElementById('profileBestStreakVal');
  if (bsEl) bsEl.textContent = S.bestStreak || 0;

  // Private
  const privSelect = document.getElementById('profilePrivateSelect');
  if (privSelect) privSelect.value = S.profilePrivate ? 'on' : 'off';

  // Live name preview
  if (nameInput) {
    nameInput.oninput = () => {
      if (displayName) displayName.textContent = nameInput.value || 'Игрок';
    };
  }
}

function triggerAvatarUpload() {
  document.getElementById('avatarFileInput')?.click();
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showToast('Файл слишком большой (макс. 2MB)', 'var(--red)');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    // Resize to 128x128
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      const size = Math.min(img.width, img.height);
      const ox = (img.width - size) / 2;
      const oy = (img.height - size) / 2;
      ctx.drawImage(img, ox, oy, size, size, 0, 0, 128, 128);
      const resized = canvas.toDataURL('image/jpeg', 0.75);
      S.profileAvatar = resized;
      save();
      // Update preview
      const avatarPreview = document.getElementById('profileAvatarPreview');
      const avatarEmoji = document.getElementById('profileAvatarEmoji');
      if (avatarPreview) { avatarPreview.src = resized; avatarPreview.style.display = 'block'; }
      if (avatarEmoji) avatarEmoji.style.display = 'none';
      // Update header chip
      updateUserChipAvatar(resized);
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
}

function updateUserChipAvatar(src) {
  const chip = document.getElementById('authChip');
  if (!chip) return;
  const imgEl = chip.querySelector('.auth-avatar');
  if (imgEl) { imgEl.src = src; return; }
  // If no img, rebuild chip keeping name
  const nameEl = chip.querySelector('span');
  const name = nameEl ? nameEl.textContent : (S.profileName || 'Игрок');
  chip.innerHTML = `<img class="auth-avatar" src="${src}" alt=""><span>${name}</span>`;
}

function saveProfileData() {
  const nameInput = document.getElementById('profileNameInput');
  const bioInput = document.getElementById('profileBioInput');
  const favPetSelect = document.getElementById('profileFavPetSelect');
  const privSelect = document.getElementById('profilePrivateSelect');
  const goldNameSelect = document.getElementById('goldNameSelect');

  // bestStreak stat display
  const bsEl = document.getElementById('profileBestStreakVal');
  if (bsEl) bsEl.textContent = S.bestStreak || 0;

  if (nameInput) S.profileName = nameInput.value.trim().slice(0, 20);
  if (bioInput) S.profileBio = bioInput.value.trim().slice(0, 100);
  if (favPetSelect) S.profileFavPet = favPetSelect.value;
  if (privSelect) S.profilePrivate = privSelect.value === 'on';
  if (goldNameSelect) S.goldNameEnabled = goldNameSelect.value === 'on';

  save();
  applyGoldTitle();

  // Update chip name
  const chip = document.getElementById('authChip');
  if (chip) {
    const nameEl = chip.querySelector('span');
    if (nameEl) nameEl.textContent = S.profileName || 'Игрок';
    chip.classList.toggle('gold-name', !!(  (S.starterPackPurchased || S.goldPassOwned) && S.goldNameEnabled !== false));
  }

  showToast('Профиль сохранён ✅', 'var(--green)');
  loadProfileForm();
}

// ─────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────
async function renderLeaderboard() {
  const list = document.getElementById('leaderboardList');
  if (!list) return;
  list.innerHTML = '<div class="leaderboard-loading">Загрузка...</div>';

  // Build local entry
  const localEntry = {
    id: 'local',
    name: S.profileName || 'Ты',
    avatar: S.profileAvatar || '',
    bio: S.profileBio || '',
    favPet: S.profileFavPet || '',
    dollars: S.dollars || 0,
    bestStreak: S.bestStreak || 0,
    passRank: S.passRank || 0,
    isPrivate: S.profilePrivate || false,
    hasGoldName: !!(S.starterPackPurchased || S.goldPassOwned) && S.goldNameEnabled !== false,
    selectedTheme: S.selectedTheme || 'dark-green',
    isMe: true,
  };

  let entries = [];

  // Try to load from Supabase
  if (window._sb) {
    try {
      const { data } = await window._sb
        .from('user_progress')
        .select('user_id, state, updated_at')
        .order('updated_at', { ascending: false })
        .limit(50);
      if (data && data.length) {
        entries = data.map(row => {
          const st = row.state || {};
          const hasGold = st.starterPackPurchased || st.goldPassOwned;
          return {
            id: row.user_id,
            name: st.profileName || 'Игрок',
            avatar: st.profileAvatar || '',
            bio: st.profileBio || '',
            favPet: st.profileFavPet || '',
            dollars: st.dollars || 0,
            bestStreak: st.bestStreak || 0,
            passRank: st.passRank || 0,
            isPrivate: st.profilePrivate || false,
            hasGoldName: !!(hasGold) && st.goldNameEnabled !== false,
            selectedTheme: st.selectedTheme || 'dark-green',
            isMe: row.user_id === (window.supabaseUser?.id),
          };
        });
      }
    } catch (e) {
      console.warn('Leaderboard load error:', e);
    }
  }

  // Fallback: just show local player
  if (!entries.length) {
    entries = [localEntry];
  }

  // Sort by dollars desc
  entries.sort((a, b) => b.dollars - a.dollars);

  list.innerHTML = '';
  entries.forEach((entry, i) => {
    const rank = i + 1;
    const rankClass = rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '';

    const favPetData = entry.favPet ? PETS.find(p => p.id === entry.favPet) : null;
    const petEmoji = favPetData ? favPetData.emoji : '';

    const avatarHtml = entry.avatar
      ? `<div class="lb-avatar"><img src="${entry.avatar}" alt=""></div>`
      : `<div class="lb-avatar">👤</div>`;

    const nameClass = entry.hasGoldName ? 'lb-name gold-name' : 'lb-name';
    const youBadge = entry.isMe ? ' <span style="font-size:10px;background:rgba(46,204,113,.2);color:var(--green);padding:2px 6px;border-radius:8px;font-weight:700">Ты</span>' : '';

    const row = document.createElement('div');
    row.className = 'lb-row';
    row.innerHTML = `
      <span class="lb-rank ${rankClass}">${rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : rank}</span>
      ${avatarHtml}
      <div class="lb-info">
        <div class="${nameClass}">${escapeHtml(entry.name)}${youBadge}${petEmoji ? ' ' + petEmoji : ''}</div>
        <div class="lb-sub">Ранг ${entry.passRank} · Серия ${entry.bestStreak}</div>
      </div>
      <span class="lb-score">💵 ${entry.dollars.toLocaleString()}</span>
    `;
    row.onclick = () => openViewProfile(entry);
    list.appendChild(row);
  });
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function openViewProfile(entry) {
  const overlay = document.getElementById('viewProfileOverlay');
  const content = document.getElementById('viewProfileContent');
  if (!overlay || !content) return;

  const nameClass = entry.hasGoldName ? 'vp-name gold-name' : 'vp-name';
  const favPetData = entry.favPet ? PETS.find(p => p.id === entry.favPet) : null;
  const RARITY_COLORS = { common:'#888', uncommon:'#2ecc71', rare:'#3498db', epic:'#9b59b6', legendary:'#f39c12', mythic:'#e74c3c', unreal:'#00d4ff' };

  if (entry.isPrivate && !entry.isMe) {
    content.innerHTML = `
      <div class="vp-avatar">👤</div>
      <div class="vp-name">${escapeHtml(entry.name)}</div>
      <div class="vp-private">🔒 Этот профиль скрыт</div>
    `;
  } else {
    const avatarHtml = entry.avatar
      ? `<div class="vp-avatar"><img src="${entry.avatar}" alt=""></div>`
      : `<div class="vp-avatar" style="font-size:40px">👤</div>`;
    const petHtml = favPetData
      ? `<div class="vp-stat"><span>Любимый питомец</span><span>${favPetData.emoji} ${favPetData.name} <span style="font-size:11px;color:${RARITY_COLORS[favPetData.rarity]||'#888'}">${RARITY_LABELS[favPetData.rarity]||''}</span></span></div>`
      : '';
    content.innerHTML = `
      ${avatarHtml}
      <div class="${nameClass}">${escapeHtml(entry.name)}</div>
      <div class="vp-bio">${escapeHtml(entry.bio || 'Нет описания')}</div>
      ${entry.selectedTheme && entry.selectedTheme !== 'dark-green' ? (() => {
        const th = (typeof THEMES !== 'undefined' ? THEMES : []).find(t => t.id === entry.selectedTheme);
        if (!th) return '';
        const hdr = th.vars['--header-grad'].match(/#[0-9a-fA-F]{6}/)?.[0] || '#27ae60';
        return `<div class="vp-stat"><span>🎨 Тема</span><span>${th.emoji} ${th.name}</span></div>`;
      })() : ''}
      <div class="vp-stat"><span>💵 Долларов</span><span>${entry.dollars.toLocaleString()}</span></div>
      <div class="vp-stat"><span>🏆 Лучшая серия</span><span>${entry.bestStreak}</span></div>
      <div class="vp-stat"><span>🎫 Ранг пасса</span><span>${entry.passRank}</span></div>
      ${petHtml}
    `;
  }

  overlay.style.display = 'block';
}

function closeViewProfile() {
  const overlay = document.getElementById('viewProfileOverlay');
  if (overlay) overlay.style.display = 'none';
}

// Update authChip to use profile name if set (offline mode)
(function patchChipForOffline() {
  const origInit = window.initGameState;
  window.initGameState = function(cloudState) {
    origInit(cloudState);
    // If offline, show chip with profile name
    if (!window.supabaseUser) {
      const chip = document.getElementById('authChip');
      if (chip) {
        const name = S.profileName || 'Игрок';
        const avatar = S.profileAvatar;
        const hasGold = (S.starterPackPurchased || S.goldPassOwned) && S.goldNameEnabled !== false;
        chip.innerHTML = avatar
          ? `<img class="auth-avatar" src="${avatar}" alt=""><span>${name}</span>`
          : `<span>👤 ${name}</span>`;
        chip.style.display = 'flex';
        chip.classList.toggle('gold-name', hasGold);
      }
    }
  };
})();

// ─────────────────────────────────────────
// THEME SYSTEM
// ─────────────────────────────────────────

const THEMES = [
  {
    id: 'dark-green',
    name: 'Темно-Зеленая',
    desc: 'Классическая тёмная тема',
    price: 0,
    emoji: '🌲',
    vars: {
      '--bg': '#1a1a1a',
      '--bg2': '#222222',
      '--bg3': '#2a2a2a',
      '--text': '#e8e8e8',
      '--text2': '#aaaaaa',
      '--card': '#2d2d2d',
      '--card2': '#333333',
      '--border': '#3a3a3a',
      '--header-grad': 'linear-gradient(135deg,#1e8449,#27ae60,#2ecc71)',
    }
  },
  {
    id: 'light-green',
    name: 'Светло-Зеленая',
    desc: 'Светлый фон, свежий зелёный верх',
    price: 0,
    emoji: '🌿',
    vars: {
      '--bg': '#f0f7f0',
      '--bg2': '#e4f0e4',
      '--bg3': '#d8ecd8',
      '--text': '#1a2e1a',
      '--text2': '#4a7050',
      '--card': '#ffffff',
      '--card2': '#f5faf5',
      '--border': '#b8d8b8',
      '--header-grad': 'linear-gradient(135deg,#52b788,#74c69d,#95d5b2)',
    }
  },
  {
    id: 'chinese',
    name: 'Китайская',
    desc: 'Красная шапка, белый фон',
    price: 200,
    emoji: '🀄',
    vars: {
      '--bg': '#fafafa',
      '--bg2': '#f2f2f2',
      '--bg3': '#e8e8e8',
      '--text': '#1a0000',
      '--text2': '#7a2020',
      '--card': '#ffffff',
      '--card2': '#fff5f5',
      '--border': '#e8c0c0',
      '--header-grad': 'linear-gradient(135deg,#b71c1c,#c62828,#e53935)',
    }
  },
  {
    id: 'pizza',
    name: 'Пицца',
    desc: 'Оранжевый фон, жёлтая шапка',
    price: 300,
    emoji: '🍕',
    vars: {
      '--bg': '#ff8c00',
      '--bg2': '#e07800',
      '--bg3': '#c86400',
      '--text': '#fff8e8',
      '--text2': '#ffe4a0',
      '--card': '#ff9a1a',
      '--card2': '#ffaa33',
      '--border': '#ffcc55',
      '--header-grad': 'linear-gradient(135deg,#f9a825,#fbc02d,#fdd835)',
    }
  },
  {
    id: 'divine',
    name: 'Божественная',
    desc: 'Золотистый свет, белая шапка',
    price: 300,
    emoji: '✨',
    vars: {
      '--bg': '#fffde7',
      '--bg2': '#fff9c4',
      '--bg3': '#fff59d',
      '--text': '#3e2723',
      '--text2': '#795548',
      '--card': '#ffffff',
      '--card2': '#fffde7',
      '--border': '#ffe082',
      '--header-grad': 'linear-gradient(135deg,#f5f5f5,#fafafa,#ffffff)',
    }
  },
];

function applyTheme(themeId, save_) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const root = document.documentElement;
  for (const [k, v] of Object.entries(theme.vars)) {
    root.style.setProperty(k, v);
  }
  // Apply header gradient via a CSS class swap
  const header = document.querySelector('.header');
  if (header) header.style.background = theme.vars['--header-grad'];

  // Sync settings select
  const sel = document.getElementById('themeSelect');
  if (sel) sel.value = themeId;

  if (save_) {
    S.selectedTheme = themeId;
    if (typeof save === 'function') save();
    renderThemeShop();
  }
}

function initTheme() {
  const themeId = S.selectedTheme || 'dark-green';
  applyTheme(themeId, false);
  const sel = document.getElementById('themeSelect');
  if (sel) {
    // Only show owned themes as available
    Array.from(sel.options).forEach(opt => {
      const owned = (S.ownedThemes || ['dark-green','light-green']).includes(opt.value);
      opt.disabled = !owned;
      if (!owned) opt.textContent = opt.textContent.replace(' 🔒','') + ' 🔒';
    });
    sel.value = themeId;
  }
}

// ─────────────────────────────────────────
// THEME SHOP
// ─────────────────────────────────────────

function openThemeShop() {
  const overlay = document.getElementById('themeShopOverlay');
  if (overlay) overlay.style.display = 'block';
  renderThemeShop();
}

function closeThemeShop() {
  const overlay = document.getElementById('themeShopOverlay');
  if (overlay) overlay.style.display = 'none';
}

function renderThemeShop() {
  const list = document.getElementById('themeShopList');
  if (!list) return;
  const owned = S.ownedThemes || ['dark-green','light-green'];
  const selected = S.selectedTheme || 'dark-green';

  list.innerHTML = '';
  THEMES.forEach(theme => {
    const isOwned = owned.includes(theme.id);
    const isSelected = selected === theme.id;
    const isFree = theme.price === 0;

    const card = document.createElement('div');
    card.className = 'theme-card' + (isSelected ? ' theme-card--active' : '');

    // Preview swatch
    const headerColor = theme.vars['--header-grad'].match(/#[0-9a-fA-F]{6}/)?.[0] || '#27ae60';
    const bgColor = theme.vars['--bg'];
    card.innerHTML = `
      <div class="theme-preview">
        <div class="theme-preview-header" style="background:${theme.vars['--header-grad']}"></div>
        <div class="theme-preview-body" style="background:${bgColor}">
          <div class="theme-preview-card" style="background:${theme.vars['--card']};border-color:${theme.vars['--border']}"></div>
          <div class="theme-preview-card" style="background:${theme.vars['--card']};border-color:${theme.vars['--border']}"></div>
        </div>
      </div>
      <div class="theme-info">
        <div class="theme-name">${theme.emoji} ${theme.name}</div>
        <div class="theme-desc">${theme.desc}</div>
      </div>
      <div class="theme-action">
        ${isSelected
          ? '<span class="theme-badge theme-badge--active">✓ Активна</span>'
          : isOwned
            ? `<button class="theme-apply-btn" onclick="applyTheme('${theme.id}', true)">Применить</button>`
            : `<button class="theme-buy-btn" onclick="buyTheme('${theme.id}')">💎 ${theme.price}</button>`
        }
      </div>
    `;
    list.appendChild(card);
  });
}

function buyTheme(themeId) {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme) return;
  if ((S.diamonds || 0) < theme.price) {
    showToast('Недостаточно алмазов 💎', 'var(--red)');
    return;
  }
  S.diamonds -= theme.price;
  if (!S.ownedThemes) S.ownedThemes = ['dark-green','light-green'];
  if (!S.ownedThemes.includes(themeId)) S.ownedThemes.push(themeId);
  save();
  updateHeader();
  applyTheme(themeId, true);
  showToast('Тема разблокирована! 🎨', 'var(--green)');
  initTheme();
}

// ─────────────────────────────────────────
// CRAFT & ITEMS SUB-PAGE
// ─────────────────────────────────────────

function openCraftItemsPage() {
  const overlay = document.getElementById('craftItemsOverlay');
  if (overlay) overlay.style.display = 'block';
  switchCraftTab('items');
  // Re-render shop containers if needed
  if (typeof renderItemsShop === 'function') renderItemsShop();
  if (typeof renderCraftShop === 'function') renderCraftShop();
}

function closeCraftItemsPage() {
  const overlay = document.getElementById('craftItemsOverlay');
  if (overlay) overlay.style.display = 'none';
}

function switchCraftTab(tab) {
  document.querySelectorAll('#craftItemsOverlay .profile-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  document.querySelectorAll('#craftItemsOverlay .profile-tab-content').forEach(c => {
    c.classList.toggle('active', c.id === 'ctab-' + tab);
  });
}

// Hook into game init to apply theme
const _origInitGameState = window.initGameState;
window.initGameState = function(cloudState) {
  _origInitGameState(cloudState);
  initTheme();
};

// Also apply theme on page load before auth
(function() {
  const ls = (() => { try { return JSON.parse(localStorage.getItem('cupGameState') || '{}'); } catch(e) { return {}; } })();
  if (ls.selectedTheme) applyTheme(ls.selectedTheme, false);
})();
