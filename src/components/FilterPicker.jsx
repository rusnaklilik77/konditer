import Modal from './Modal.jsx';
import { useI18n } from '../i18n.jsx';

export default function FilterPicker({ filters, recipes, selected, setSelected, matchCount, onManage, onClose }) {
  const { t } = useI18n();
  const toggle = (id) => setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  const used = (id) => recipes.filter((r) => (r.filters || []).includes(id)).length;

  return (
    <Modal title={t('pickFilters')} onClose={onClose}>
      <p className="hint">{t('pickHint')}</p>
      <div className="chips">
        {filters.map((f) => (
          <button key={f.id} className={`chip ${selected.includes(f.id) ? 'on' : ''}`} onClick={() => toggle(f.id)}>
            {selected.includes(f.id) ? '✓ ' : ''}{f.name} <small>{used(f.id)}</small>
          </button>
        ))}
        {filters.length === 0 && <span className="muted">{t('noFilters')}</span>}
      </div>
      <div className="form-actions">
        <button className="btn" onClick={onManage}>{t('manage')}</button>
        <button className="btn" onClick={() => setSelected([])} disabled={selected.length === 0}>{t('clear')}</button>
        <button className="btn primary" onClick={onClose}>{t('showN', { n: matchCount })}</button>
      </div>
    </Modal>
  );
}
