import { SettingsIcon } from './Icons.jsx';

export default function Sidebar({
  open, onClose, groups, recipes, activeGroup, setActiveGroup,
  onAddGroup, onEditGroup, onAddRecipe, onFilters, onSettings,
}) {
  const count = (id) => recipes.filter((r) => r.groupId === id).length;
  const pick = (id) => { setActiveGroup(id); onClose(); };

  return (
    <>
      <div className={`scrim ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="side-head">
          <strong>Меню</strong>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть меню">✕</button>
        </div>

        <div className="side-actions">
          <button className="btn primary" onClick={() => { onAddRecipe(); onClose(); }}>+ Новый рецепт</button>
          <button className="btn" onClick={() => { onAddGroup(); onClose(); }}>+ Новая группа</button>
          <button className="btn" onClick={() => { onFilters(); onClose(); }}>Фильтры</button>
        </div>

        <div className="side-title">Группы</div>
        <nav className="side-list">
          <button className={`side-item ${activeGroup === 'all' ? 'active' : ''}`} onClick={() => pick('all')}>
            <span>Все рецепты</span><em>{recipes.length}</em>
          </button>
          {groups.map((g) => (
            <div key={g.id} className={`side-item row ${activeGroup === g.id ? 'active' : ''}`}>
              <button className="grow" onClick={() => pick(g.id)}>
                <span>{g.name}</span><em>{count(g.id)}</em>
              </button>
              <button className="mini" onClick={() => { onEditGroup(g); onClose(); }} aria-label="Изменить группу">✎</button>
            </div>
          ))}
          {groups.length === 0 && <p className="muted pad">Групп пока нет. Создайте первую, например «Осень».</p>}
        </nav>

        <div className="side-foot">
          <button className="btn wide-btn" onClick={() => { onSettings(); onClose(); }}>
            <SettingsIcon /> Настройки
          </button>
        </div>
      </aside>
    </>
  );
}
