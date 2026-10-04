import { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { driveUrl, getImages } from '../utils.js';
import Modal from './Modal.jsx';
import { useI18n } from '../i18n.jsx';

export default function RecipeView({ recipe, groups, filters, currency, onClose, onEdit }) {
  const { t } = useI18n();
  const [idx, setIdx] = useState(0);
  const images = getImages(recipe);
  const current = images[Math.min(idx, images.length - 1)];
  const group = groups.find((g) => g.id === recipe.groupId);
  const tags = (recipe.filters || []).map((id) => filters.find((f) => f.id === id)).filter(Boolean);

  const remove = async () => {
    if (!confirm(t('confirmDeleteRecipe', { name: recipe.title }))) return;
    await deleteDoc(doc(db, 'recipes', recipe.id));
    onClose();
  };

  return (
    <Modal title={recipe.title} onClose={onClose} wide>
      {current && (
        <img key={current} className="hero-img" src={driveUrl(current)} alt={recipe.title}
          onError={(e) => (e.currentTarget.style.display = 'none')} />
      )}
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((u, i) => (
            <button key={u + i} className={`thumb ${i === idx ? 'on' : ''}`} onClick={() => setIdx(i)}>
              <img src={driveUrl(u)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <div className="meta">
        {group && <span className="badge">{group.name}</span>}
        {recipe.price && <span className="price">{recipe.price} {currency}</span>}
      </div>
      {tags.length > 0 && (
        <div className="chips">{tags.map((x) => <span key={x.id} className="chip on static">{x.name}</span>)}</div>
      )}
      <div className="recipe-text">{recipe.content || <span className="muted">{t('noDescription')}</span>}</div>
      <div className="form-actions">
        <button className="btn danger" onClick={remove}>{t('delete')}</button>
        <button className="btn primary" onClick={() => onEdit(recipe)}>{t('edit')}</button>
      </div>
    </Modal>
  );
}
