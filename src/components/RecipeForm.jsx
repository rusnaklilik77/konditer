import { useState } from 'react';
import { addDoc, collection, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { driveUrl, getImages } from '../utils.js';
import Modal from './Modal.jsx';
import { useI18n } from '../i18n.jsx';

export default function RecipeForm({ recipe, groups, filters, defaultGroup, currency, onClose }) {
  const { t } = useI18n();
  const [title, setTitle] = useState(recipe?.title || '');
  const [groupId, setGroupId] = useState(recipe?.groupId || (defaultGroup !== 'all' ? defaultGroup : groups[0]?.id || ''));
  const [images, setImages] = useState(() => { const i = getImages(recipe); return i.length ? i : ['']; });
  const [price, setPrice] = useState(recipe?.price || '');
  const [content, setContent] = useState(recipe?.content || '');
  const [selected, setSelected] = useState(recipe?.filters || []);
  const [newFilter, setNewFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const setImg = (i, v) => setImages((arr) => arr.map((x, idx) => (idx === i ? v : x)));
  const addImg = () => setImages((arr) => [...arr, '']);
  const removeImg = (i) => setImages((arr) => (arr.length === 1 ? [''] : arr.filter((_, idx) => idx !== i)));

  const createFilter = async () => {
    const n = newFilter.trim();
    if (!n) return;
    const exists = filters.find((f) => f.name.toLowerCase() === n.toLowerCase());
    if (exists) { if (!selected.includes(exists.id)) toggle(exists.id); setNewFilter(''); return; }
    try {
      const ref = await addDoc(collection(db, 'filters'), { name: n, createdAt: serverTimestamp() });
      setSelected((s) => [...s, ref.id]);
      setNewFilter('');
    } catch (err) { setError(t('filterCreateFail') + ': ' + err.message); }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError(t('titleReq'));
    if (!groupId) return setError(t('groupReq'));
    setBusy(true);
    const imgs = images.map((x) => x.trim()).filter(Boolean);
    const data = {
      title: title.trim(), groupId, images: imgs, imageUrl: imgs[0] || '',
      price: String(price).trim(), content: content.trim(), filters: selected,
    };
    try {
      if (recipe) await updateDoc(doc(db, 'recipes', recipe.id), data);
      else await addDoc(collection(db, 'recipes'), { ...data, createdAt: serverTimestamp() });
      onClose();
    } catch (err) {
      setError(t('saveFail') + ': ' + err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={recipe ? t('editRecipe') : t('newRecipeTitle')} onClose={onClose} wide>
      <form onSubmit={save} className="form">
        <label>{t('title')}
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('titlePh')} autoFocus />
        </label>

        <label>{t('group')}
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            {groups.length === 0 && <option value="">{t('noGroupsOpt')}</option>}
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </label>

        <div className="field">
          <span className="label">{t('photos')}</span>
          {images.map((url, i) => (
            <div className="photo-row" key={i}>
              <div className="photo-input">
                <input value={url} onChange={(e) => setImg(i, e.target.value)} placeholder="https://drive.google.com/file/d/…/view" />
                <button type="button" className="icon-btn" onClick={() => removeImg(i)} aria-label={t('removePhoto')}>✕</button>
              </div>
              {url.trim() && (
                <img className="preview" src={driveUrl(url)} alt=""
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  onLoad={(e) => (e.currentTarget.style.display = 'block')} />
              )}
            </div>
          ))}
          <button type="button" className="btn" onClick={addImg}>{t('addPhoto')}</button>
        </div>

        <label>{t('price')} ({currency})
          <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="350" />
        </label>

        <label>{t('recipeText')}
          <textarea rows="7" value={content} onChange={(e) => setContent(e.target.value)} placeholder={t('contentPh')} />
        </label>

        <div className="field">
          <span className="label">{t('filtersLabel')}</span>
          <div className="chips">
            {filters.map((f) => (
              <button type="button" key={f.id} className={`chip ${selected.includes(f.id) ? 'on' : ''}`} onClick={() => toggle(f.id)}>{f.name}</button>
            ))}
            {filters.length === 0 && <span className="muted">{t('createFirstFilter')}</span>}
          </div>
          <div className="inline-form">
            <input value={newFilter} onChange={(e) => setNewFilter(e.target.value)} placeholder={t('newFilterShort')}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); createFilter(); } }} />
            <button type="button" className="btn" onClick={createFilter}>{t('create')}</button>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>{t('cancel')}</button>
          <button className="btn primary" disabled={busy}>{busy ? t('saving') : t('saveRecipe')}</button>
        </div>
      </form>
    </Modal>
  );
}
