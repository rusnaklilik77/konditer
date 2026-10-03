import { useState } from 'react';
import { addDoc, collection, deleteDoc, doc, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import Modal from './Modal.jsx';

export default function GroupForm({ group, recipes, onClose, onSaved }) {
  const [name, setName] = useState(group?.name || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Введите название группы');
    setBusy(true);
    try {
      if (group) await updateDoc(doc(db, 'groups', group.id), { name: name.trim() });
      else {
        const ref = await addDoc(collection(db, 'groups'), { name: name.trim(), createdAt: serverTimestamp() });
        onSaved?.(ref.id);
      }
      onClose();
    } catch (err) {
      setError('Не удалось сохранить: ' + err.message);
      setBusy(false);
    }
  };

  const remove = async () => {
    const mine = recipes.filter((r) => r.groupId === group.id);
    if (!confirm(`Удалить группу «${group.name}» и ${mine.length} рецепт(ов) в ней?`)) return;
    setBusy(true);
    try {
      const batch = writeBatch(db);
      mine.forEach((r) => batch.delete(doc(db, 'recipes', r.id)));
      batch.delete(doc(db, 'groups', group.id));
      await batch.commit();
      onSaved?.('all');
      onClose();
    } catch (err) {
      setError('Не удалось удалить: ' + err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={group ? 'Изменить группу' : 'Новая группа'} onClose={onClose}>
      <form onSubmit={save} className="form">
        <label>Название группы
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Осень" autoFocus />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          {group && <button type="button" className="btn danger" onClick={remove} disabled={busy}>Удалить</button>}
          <button className="btn primary" disabled={busy}>{busy ? 'Сохранение…' : 'Сохранить группу'}</button>
        </div>
      </form>
    </Modal>
  );
}
