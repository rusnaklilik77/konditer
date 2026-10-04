import { SettingsIcon, GlobeIcon } from './Icons.jsx';
import { useI18n } from '../i18n.jsx';

export default function Sidebar({
  open, onClose, groups, recipes, activeGroup, setActiveGroup,
  onAddGroup, onEditGroup, onAddRecipe, onFilters, onSettings, onLanguage,
}) {
  const { t, lang } = useI18n();
  const count = (id) => recipes.filter((r) => r.groupId === id).length;
  const pick = (id) => { setActiveGroup(id); onClose(); };
  const go = (fn) => () => { fn(); onClose(); };

  return (
    <>
      <div className={`scrim ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="side-head">
          <strong>{t('menu')}</strong>
          <button className="icon-btn" onClick={onClose} aria-label={t('closeMenu')}>✕</button>
        </div>

        <div className="side-actions">
          <button className="btn primary" onClick={go(onAddRecipe)}>{t('newRecipe')}</button>
          <button className="btn" onClick={go(onAddGroup)}>{t('newGroup')}</button>
          <button className="btn" onClick={go(onFilters)}>{t('manageFilters')}</button>
        </div>

        <div className="side-title">{t('groups')}</div>
        <nav className="side-list">
          <button className={`side-item ${activeGroup === 'all' ? 'active' : ''}`} onClick={() => pick('all')}>
            <span>{t('allRecipes')}</span><em>{recipes.length}</em>
          </button>
          {groups.map((g) => (
            <div key={g.id} className={`side-item row ${activeGroup === g.id ? 'active' : ''}`}>
              <button className="grow" onClick={() => pick(g.id)}>
                <span>{g.name}</span><em>{count(g.id)}</em>
              </button>
              <button className="mini" onClick={go(() => onEditGroup(g))} aria-label={t('editGroup')}>✎</button>
            </div>
          ))}
          {groups.length === 0 && <p className="muted pad">{t('noGroups')}</p>}
        </nav>

        <div className="side-foot">
          <button className="btn wide-btn" onClick={go(onLanguage)}>
            <GlobeIcon /> {t('language')}: {lang === 'ru' ? 'Русский' : 'Română'}
          </button>
          <button className="btn wide-btn" onClick={go(onSettings)}>
            <SettingsIcon /> {t('settings')}
          </button>
        </div>
      </aside>
    </>
  );
}
