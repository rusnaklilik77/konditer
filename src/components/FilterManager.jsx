import { useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, query, where, updateDoc, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import Modal from './Modal.jsx';
import { useI18n } from '../i18n.jsx';

export default function FilterManager({ filters, recipes, onClose }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const add = async (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    if (filters.some((f) => f.name.toLowerCase() === n.toLowerCase())) return setError(t('filterExists'));
    try {
      await addDoc(collection(db, 'filters'), { name: n, createdAt: serverTimestamp() });
      setName(''); setError('');
    } catch (err) { setError(err.message); }
  };

  const remove = async (f) => {
    if (!confirm(t('confirmDeleteFilter', { name: f.name }))) return;
    try {
      const snap = await getDocs(query(collection(db, 'recipes'), where('filters', 'array-contains', f.id)));
      await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { filters: arrayRemove(f.id) })));
      await deleteDoc(doc(db, 'filters', f.id));
    } catch (err) { setError(err.message); }
  };

  const used = (id) => recipes.filter((r) => (r.filters || []).includes(id)).length;

  return (
    <Modal title={t('filters')} onClose={onClose}>
      <form onSubmit={add} className="inline-form">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('newFilterPh')} />
        <button className="btn primary">{t('add')}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul className="plain-list">
        {filters.map((f) => (
          <li key={f.id}>
            <span>{f.name} <em className="muted">· {used(f.id)}</em></span>
            <button className="btn danger small" onClick={() => remove(f)}>{t('delete')}</button>
          </li>
        ))}
        {filters.length === 0 && <li className="muted">{t('noFilters')}</li>}
      </ul>
    </Modal>
  );
}
