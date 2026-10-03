import { useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, query, where, updateDoc, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import Modal from './Modal.jsx';

export default function FilterManager({ filters, recipes, onClose }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const add = async (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    if (filters.some((f) => f.name.toLowerCase() === n.toLowerCase())) return setError('Такой фильтр уже есть');
    try {
      await addDoc(collection(db, 'filters'), { name: n, createdAt: serverTimestamp() });
      setName(''); setError('');
    } catch (err) { setError(err.message); }
  };

  const remove = async (f) => {
    if (!confirm(`Удалить фильтр «${f.name}»? Он пропадёт и из рецептов.`)) return;
    try {
      const snap = await getDocs(query(collection(db, 'recipes'), where('filters', 'array-contains', f.id)));
      await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { filters: arrayRemove(f.id) })));
      await deleteDoc(doc(db, 'filters', f.id));
    } catch (err) { setError(err.message); }
  };

  const used = (id) => recipes.filter((r) => (r.filters || []).includes(id)).length;

  return (
    <Modal title="Фильтры" onClose={onClose}>
      <form onSubmit={add} className="inline-form">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Новый фильтр, например: Без сахара" />
        <button className="btn primary">Добавить</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul className="plain-list">
        {filters.map((f) => (
          <li key={f.id}>
            <span>{f.name} <em className="muted">· {used(f.id)}</em></span>
            <button className="btn danger small" onClick={() => remove(f)}>Удалить</button>
          </li>
        ))}
        {filters.length === 0 && <li className="muted">Фильтров пока нет.</li>}
      </ul>
    </Modal>
  );
}
