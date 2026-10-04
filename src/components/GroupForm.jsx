import { useState } from 'react';
import { addDoc, collection, doc, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import Modal from './Modal.jsx';
import { useI18n } from '../i18n.jsx';

export default function GroupForm({ group, recipes, onClose, onSaved }) {
  const { t } = useI18n();
  const [name, setName] = useState(group?.name || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError(t('groupNameReq'));
    setBusy(true);
    try {
      if (group) await updateDoc(doc(db, 'groups', group.id), { name: name.trim() });
      else {
        const ref = await addDoc(collection(db, 'groups'), { name: name.trim(), createdAt: serverTimestamp() });
        onSaved?.(ref.id);
      }
      onClose();
    } catch (err) {
      setError(t('saveFail') + ': ' + err.message);
      setBusy(false);
    }
  };

  const remove = async () => {
    const mine = recipes.filter((r) => r.groupId === group.id);
    if (!confirm(t('confirmDeleteGroup', { name: group.name, n: mine.length }))) return;
    setBusy(true);
    try {
      const batch = writeBatch(db);
      mine.forEach((r) => batch.delete(doc(db, 'recipes', r.id)));
      batch.delete(doc(db, 'groups', group.id));
      await batch.commit();
      onSaved?.('all');
      onClose();
    } catch (err) {
      setError(t('deleteFail') + ': ' + err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={group ? t('editGroup') : t('newGroupTitle')} onClose={onClose}>
      <form onSubmit={save} className="form">
        <label>{t('groupName')}
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('groupPh')} autoFocus />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          {group && <button type="button" className="btn danger" onClick={remove} disabled={busy}>{t('delete')}</button>}
          <button className="btn primary" disabled={busy}>{busy ? t('saving') : t('saveGroup')}</button>
        </div>
      </form>
    </Modal>
  );
}
