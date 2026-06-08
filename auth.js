// ─────────────────────────────────────────
// SUPABASE CONFIG — замени на свои данные!
// ─────────────────────────────────────────
const SUPABASE_URL      = 'https://btocrtujvjpobmwvsuys.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0b2NydHVqdmpwb2Jtd3ZzdXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4Mjg4ODgsImV4cCI6MjA5NjQwNDg4OH0.V-nd7qke4e83pjqVWRJy10goZ-WRoYw88Jrr8DwShLA';

// Если оба поля не заполнены — игра работает в офлайн-режиме (localStorage)
const SUPABASE_READY = !SUPABASE_URL.includes('YOUR_PROJECT') && !SUPABASE_ANON_KEY.includes('YOUR_ANON');

let _sb = null;
let supabaseUser = null;

if (SUPABASE_READY) {
  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Сделать клиент доступным глобально для game.js
window._sb = _sb;
window.supabaseUser = null;

// ─────────────────────────────────────────
// SYNC
// ─────────────────────────────────────────
window.syncToSupabase = function () {
  if (!_sb || !window.supabaseUser) return;
  clearTimeout(window._syncTimer);
  window._syncTimer = setTimeout(async () => {
    try {
      const userId = window.supabaseUser.id;
      const state = window.S || {};
      await _sb.from('user_progress').upsert(
        { user_id: userId, state, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    } catch (e) {
      console.warn('Supabase sync error:', e.message);
    }
  }, 2500);
};

async function loadFromSupabase(userId) {
  if (!_sb) return null;
  try {
    const { data, error } = await _sb
      .from('user_progress')
      .select('state')
      .eq('user_id', userId)
      .maybeSingle();
    if (data && data.state) return data.state;
  } catch (e) {
    console.warn('Load error:', e.message);
  }
  return null;
}

// ─────────────────────────────────────────
// AUTH UI
// ─────────────────────────────────────────
function showAuthOverlay() {
  const el = document.getElementById('authOverlay');
  if (el) el.style.display = 'flex';
}
function hideAuthOverlay() {
  const el = document.getElementById('authOverlay');
  if (el) el.style.display = 'none';
}

function updateUserChip(user) {
  const chip = document.getElementById('authChip');
  if (!chip || !user) return;
  const img = user.user_metadata?.avatar_url
    ? `<img class="auth-avatar" src="${user.user_metadata.avatar_url}" alt="">`
    : '👤';
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Игрок';
  chip.innerHTML = `${img}<span>${name}</span>`;
  chip.style.display = 'flex';
  // Settings page user info
  const nameEl = document.getElementById('settingsUserName');
  const emailEl = document.getElementById('settingsUserEmail');
  if (nameEl) nameEl.textContent = name;
  if (emailEl) emailEl.textContent = user.email || '';
  const userItem = document.getElementById('settingsUserItem');
  if (userItem) userItem.style.display = '';
  const signOutItem = document.getElementById('settingsSignOut');
  if (signOutItem) signOutItem.style.display = '';
}

async function onAuthSuccess(user) {
  window.supabaseUser = user;
  supabaseUser = user;
  hideAuthOverlay();
  updateUserChip(user);

  // Load cloud save
  const cloudState = await loadFromSupabase(user.id);
  if (typeof window.initGameState === 'function') {
    window.initGameState(cloudState);
  }
}

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────
async function initAuth() {
  if (!SUPABASE_READY) {
    // Офлайн-режим — сразу инициализируем игру из localStorage
    hideAuthOverlay();
    if (typeof window.initGameState === 'function') window.initGameState(null);
    return;
  }

  // Проверяем существующую сессию
  const { data: { session } } = await _sb.auth.getSession();
  if (session?.user) {
    await onAuthSuccess(session.user);
  } else {
    showAuthOverlay();
    // На случай если initGameState ещё не вызван (офлайн не нужен вход)
  }

  // Слушаем изменения сессии
  _sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      await onAuthSuccess(session.user);
    } else if (event === 'SIGNED_OUT') {
      window.supabaseUser = null;
      supabaseUser = null;
      const chip = document.getElementById('authChip');
      if (chip) { chip.innerHTML = ''; chip.style.display = 'none'; }
      showAuthOverlay();
    }
  });
}

// ─────────────────────────────────────────
// КНОПКИ
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Войти через Google
  document.getElementById('googleSignInBtn')?.addEventListener('click', async () => {
    if (!_sb) return;
    await _sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname }
    });
  });

  // Офлайн-режим (без сохранения в облако)
  document.getElementById('offlineModeBtn')?.addEventListener('click', () => {
    hideAuthOverlay();
    if (typeof window.initGameState === 'function') window.initGameState(null);
  });

  // Выйти из аккаунта
  document.getElementById('settingsSignOut')?.addEventListener('click', async () => {
    if (!confirm('Выйти из аккаунта?')) return;
    if (_sb) await _sb.auth.signOut();
    else { window.supabaseUser = null; showAuthOverlay(); }
  });

  // Чип с именем в хедере — показать настройки
  document.getElementById('authChip')?.addEventListener('click', () => {
    if (typeof goPage === 'function') goPage('settings');
  });

  initAuth();
});

// ─────────────────────────────────────────
// ФУНКЦИЯ ПРОВЕРКИ ПРОМОКОДА В SUPABASE
// ─────────────────────────────────────────
window.checkSupabasePromo = async function (code) {
  if (!_sb || !window.supabaseUser) return null;
  try {
    const { data } = await _sb
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('used', false)
      .maybeSingle();
    if (!data) return null;

    // Помечаем как использованный
    await _sb.from('promo_codes').update({
      used: true,
      used_by: window.supabaseUser.id,
      used_at: new Date().toISOString()
    }).eq('code', code.toUpperCase());

    return data;
  } catch (e) {
    console.warn('Promo check error:', e.message);
    return null;
  }
};
