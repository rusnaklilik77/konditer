import { useState } from 'react';
import { addDoc, collection, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { driveUrl } from '../utils.js';
import Modal from './Modal.jsx';

export default function RecipeForm({ recipe, groups, filters, defaultGroup, currency, onClose }) {
  const [title, setTitle] = useState(recipe?.title || '');
  const [groupId, setGroupId] = useState(recipe?.groupId || (defaultGroup !== 'all' ? defaultGroup : groups[0]?.id || ''));
  const [imageUrl, setImageUrl] = useState(recipe?.imageUrl || '');
  const [price, setPrice] = useState(recipe?.price || '');
  const [content, setContent] = useState(recipe?.content || '');
  const [selected, setSelected] = useState(recipe?.filters || []);
  const [newFilter, setNewFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const createFilter = async () => {
    const n = newFilter.trim();
    if (!n) return;
    const exists = filters.find((f) => f.name.toLowerCase() === n.toLowerCase());
    if (exists) { if (!selected.includes(exists.id)) toggle(exists.id); setNewFilter(''); return; }
    try {
      const ref = await addDoc(collection(db, 'filters'), { name: n, createdAt: serverTimestamp() });
      setSelected((s) => [...s, ref.id]);
      setNewFilter('');
    } catch (err) { setError('Не удалось создать фильтр: ' + err.message); }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError('Введите название');
    if (!groupId) return setError('Выберите группу (сначала создайте её в меню)');
    setBusy(true);
    const data = {
      title: title.trim(), groupId, imageUrl: imageUrl.trim(),
      price: String(price).trim(), content: content.trim(), filters: selected,
    };
    try {
      if (recipe) await updateDoc(doc(db, 'recipes', recipe.id), data);
      else await addDoc(collection(db, 'recipes'), { ...data, createdAt: serverTimestamp() });
      onClose();
    } catch (err) {
      setError('Не удалось сохранить: ' + err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={recipe ? 'Изменить рецепт' : 'Новый рецепт'} onClose={onClose} wide>
      <form onSubmit={save} className="form">
        <label>Название
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Тыквенный пирог" autoFocus />
        </label>

        <label>Группа
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            {groups.length === 0 && <option value="">— нет групп —</option>}
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </label>

        <label>Ссылка на фото (Google Диск)
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://drive.google.com/file/d/…/view" />
        </label>
        {imageUrl && <img className="preview" src={driveUrl(imageUrl)} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />}

        <label>Цена ({currency})
          <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="350" />
        </label>

        <label>Рецепт и состав
          <textarea rows="7" value={content} onChange={(e) => setContent(e.target.value)} placeholder={'Ингредиенты:\n- тыква 500 г\n\nШаги:\n1. …'} />
        </label>

        <div className="field">
          <span className="label">Фильтры</span>
          <div className="chips">
            {filters.map((f) => (
              <button type="button" key={f.id} className={`chip ${selected.includes(f.id) ? 'on' : ''}`} onClick={() => toggle(f.id)}>{f.name}</button>
            ))}
            {filters.length === 0 && <span className="muted">Создайте первый фильтр ниже</span>}
          </div>
          <div className="inline-form">
            <input value={newFilter} onChange={(e) => setNewFilter(e.target.value)} placeholder="Новый фильтр"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); createFilter(); } }} />
            <button type="button" className="btn" onClick={createFilter}>Создать</button>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>Отмена</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Сохранение…' : 'Сохранить рецепт'}</button>
        </div>
      </form>
    </Modal>
  );
}
