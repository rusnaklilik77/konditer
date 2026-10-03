import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { driveUrl } from '../utils.js';
import Modal from './Modal.jsx';

export default function RecipeView({ recipe, groups, filters, currency, onClose, onEdit }) {
  const group = groups.find((g) => g.id === recipe.groupId);
  const tags = (recipe.filters || []).map((id) => filters.find((f) => f.id === id)).filter(Boolean);

  const remove = async () => {
    if (!confirm(`Удалить рецепт «${recipe.title}»?`)) return;
    await deleteDoc(doc(db, 'recipes', recipe.id));
    onClose();
  };

  return (
    <Modal title={recipe.title} onClose={onClose} wide>
      {recipe.imageUrl && (
        <img className="hero-img" src={driveUrl(recipe.imageUrl)} alt={recipe.title} onError={(e) => (e.currentTarget.style.display = 'none')} />
      )}
      <div className="meta">
        {group && <span className="badge">{group.name}</span>}
        {recipe.price && <span className="price">{recipe.price} {currency}</span>}
      </div>
      {tags.length > 0 && (
        <div className="chips">{tags.map((t) => <span key={t.id} className="chip on static">{t.name}</span>)}</div>
      )}
      <div className="recipe-text">{recipe.content || <span className="muted">Описание не добавлено.</span>}</div>
      <div className="form-actions">
        <button className="btn danger" onClick={remove}>Удалить</button>
        <button className="btn primary" onClick={() => onEdit(recipe)}>Изменить</button>
      </div>
    </Modal>
  );
}
