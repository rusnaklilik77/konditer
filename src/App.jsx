import { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db, configured } from './firebase.js';
import { DEFAULT_LOGO, DEFAULT_SETTINGS, driveUrl } from './utils.js';
import { MenuIcon, SunIcon, MoonIcon } from './components/Icons.jsx';
import Sidebar from './components/Sidebar.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import GroupForm from './components/GroupForm.jsx';
import RecipeForm from './components/RecipeForm.jsx';
import RecipeView from './components/RecipeView.jsx';
import FilterManager from './components/FilterManager.jsx';

const byDate = (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
const byDateAsc = (a, b) => -byDate(a, b);

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
    catch { return 'light'; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch { /* ignore */ }
  }, [theme]);
  return [theme, setTheme];
}

export default function App() {
  const [theme, setTheme] = useTheme();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [groups, setGroups] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(configured);
  const [fbError, setFbError] = useState('');

  const [menu, setMenu] = useState(false);
  const [activeGroup, setActiveGroup] = useState('all');
  const [activeFilters, setActiveFilters] = useState([]);
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState(null); // {type, data}
  const close = () => setModal(null);

  useEffect(() => {
    if (!configured) return;
    const onErr = (e) => { setFbError(e.message); setLoading(false); };
    const unsubs = [
      onSnapshot(doc(db, 'settings', 'site'), (s) => setSettings({ ...DEFAULT_SETTINGS, ...(s.data() || {}) }), onErr),
      onSnapshot(collection(db, 'groups'), (s) => setGroups(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byDateAsc)), onErr),
      onSnapshot(collection(db, 'filters'), (s) => setFilters(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byDateAsc)), onErr),
      onSnapshot(collection(db, 'recipes'), (s) => { setRecipes(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byDate)); setLoading(false); }, onErr),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  // Цвета, название и иконка вкладки из настроек
  const logo = driveUrl(settings.logoUrl) || DEFAULT_LOGO;
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--primary', settings.primary);
    r.setProperty('--accent', settings.accent);
    document.title = settings.siteName;
    const fav = document.getElementById('favicon');
    if (fav) fav.href = logo;
  }, [settings, logo]);

  // Если активная группа удалена
  useEffect(() => {
    if (activeGroup !== 'all' && groups.length && !groups.find((g) => g.id === activeGroup)) setActiveGroup('all');
  }, [groups, activeGroup]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return recipes.filter((r) =>
      (activeGroup === 'all' || r.groupId === activeGroup) &&
      activeFilters.every((f) => (r.filters || []).includes(f)) &&
      (!q || r.title.toLowerCase().includes(q))
    );
  }, [recipes, activeGroup, activeFilters, search]);

  const toggleFilter = (id) => setActiveFilters((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const groupName = activeGroup === 'all' ? 'Все рецепты' : groups.find((g) => g.id === activeGroup)?.name || '';

  if (!configured) {
    return (
      <div className="setup">
        <h1>KANDITER</h1>
        <p>Firebase ещё не подключён. Скопируйте <code>.env.example</code> в <code>.env</code>, заполните ключи из консоли Firebase и перезапустите сайт. На Vercel те же переменные добавьте в Settings → Environment Variables.</p>
      </div>
    );
  }

  const withFB = (type, data) => setModal({ type, data });

  return (
    <div className="app">
      <header className="topbar">
        <button className="icon-btn big" onClick={() => setMenu(true)} aria-label="Открыть меню"><MenuIcon /></button>
        <div className="brand">
          <img src={logo} alt="" className="logo" onError={(e) => (e.currentTarget.src = DEFAULT_LOGO)} />
          <span className="brand-name">{settings.siteName}</span>
        </div>
        <button className="icon-btn big" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Сменить тему">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <Sidebar
        open={menu} onClose={() => setMenu(false)} groups={groups} recipes={recipes}
        activeGroup={activeGroup} setActiveGroup={setActiveGroup}
        onAddGroup={() => withFB('group')} onEditGroup={(g) => withFB('group', g)}
        onAddRecipe={() => withFB('recipe')} onFilters={() => withFB('filters')} onSettings={() => withFB('settings')}
      />

      <main className="content">
        <div className="page-head">
          <h1>{groupName}</h1>
          <span className="muted">{visible.length} шт.</span>
        </div>

        <input className="search" type="search" placeholder="Поиск по названию" value={search} onChange={(e) => setSearch(e.target.value)} />

        {filters.length > 0 && (
          <div className="chips scroll">
            {activeFilters.length > 0 && <button className="chip clear" onClick={() => setActiveFilters([])}>Сбросить</button>}
            {filters.map((f) => (
              <button key={f.id} className={`chip ${activeFilters.includes(f.id) ? 'on' : ''}`} onClick={() => toggleFilter(f.id)}>{f.name}</button>
            ))}
          </div>
        )}

        {fbError && <p className="error box">Ошибка Firebase: {fbError}. Проверьте ключи в .env и правила Firestore.</p>}
        {loading && <p className="muted center">Загрузка…</p>}

        {!loading && visible.length === 0 && (
          <div className="empty">
            <p>{recipes.length === 0 ? 'Здесь пока пусто. Добавьте первый рецепт.' : 'Ничего не найдено по этим условиям.'}</p>
            <button className="btn primary" onClick={() => withFB('recipe')}>+ Новый рецепт</button>
          </div>
        )}

        <div className="grid">
          {visible.map((r) => (
            <button key={r.id} className="card" onClick={() => withFB('view', r)}>
              <div className="card-img">
                {r.imageUrl
                  ? <img src={driveUrl(r.imageUrl)} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  : <span className="no-img">🍰</span>}
              </div>
              <div className="card-body">
                <h3>{r.title}</h3>
                {r.price && <span className="price">{r.price} {settings.currency}</span>}
              </div>
            </button>
          ))}
        </div>
      </main>

      <button className="fab" onClick={() => withFB('recipe')} aria-label="Добавить рецепт">+</button>

      {modal?.type === 'view' && (
        <RecipeView recipe={recipes.find((r) => r.id === modal.data.id) || modal.data} groups={groups} filters={filters}
          currency={settings.currency} onClose={close} onEdit={(r) => withFB('recipe', r)} />
      )}
      {modal?.type === 'recipe' && (
        <RecipeForm recipe={modal.data} groups={groups} filters={filters} defaultGroup={activeGroup} currency={settings.currency} onClose={close} />
      )}
      {modal?.type === 'group' && (
        <GroupForm group={modal.data} recipes={recipes} onClose={close} onSaved={(id) => id && setActiveGroup(id)} />
      )}
      {modal?.type === 'filters' && <FilterManager filters={filters} recipes={recipes} onClose={close} />}
      {modal?.type === 'settings' && <SettingsModal settings={settings} theme={theme} setTheme={setTheme} onClose={close} />}
    </div>
  );
}
