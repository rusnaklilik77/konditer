import { useEffect, useRef, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { DEFAULT_SETTINGS, DEFAULT_LOGO, driveUrl } from '../utils.js';
import { SunIcon, MoonIcon } from './Icons.jsx';
import Modal from './Modal.jsx';

const PALETTES = [
  { name: 'Осень', primary: '#b5541f', accent: '#7a1f2b' },
  { name: 'Малина', primary: '#d6336c', accent: '#862e9c' },
  { name: 'Мята', primary: '#2f9e77', accent: '#1b5e4b' },
  { name: 'Небо', primary: '#2f7de1', accent: '#1c3f94' },
  { name: 'Карамель', primary: '#c68a2d', accent: '#6b3e1b' },
  { name: 'Шоколад', primary: '#6b4226', accent: '#2b1a10' },
];

export default function SettingsModal({ settings, theme, setTheme, onClose }) {
  const [form, setForm] = useState({ ...DEFAULT_SETTINGS, ...settings });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const saved = useRef(settings);
  saved.current = settings;

  // Живой предпросмотр цветов; при закрытии без сохранения возвращаем сохранённые
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--primary', form.primary);
    r.setProperty('--accent', form.accent);
  }, [form.primary, form.accent]);
  useEffect(() => () => {
    const r = document.documentElement.style;
    r.setProperty('--primary', saved.current.primary || DEFAULT_SETTINGS.primary);
    r.setProperty('--accent', saved.current.accent || DEFAULT_SETTINGS.accent);
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await setDoc(doc(db, 'settings', 'site'), {
        siteName: form.siteName.trim() || DEFAULT_SETTINGS.siteName,
        logoUrl: form.logoUrl.trim(),
        primary: form.primary, accent: form.accent,
        currency: form.currency.trim() || DEFAULT_SETTINGS.currency,
      }, { merge: true });
      onClose();
    } catch (err) {
      setError('Не удалось сохранить: ' + err.message);
      setBusy(false);
    }
  };

  const reset = () => setForm({ ...DEFAULT_SETTINGS });

  return (
    <Modal title="Настройки" onClose={onClose} wide>
      <div className="field">
        <span className="label">Тема сайта (хранится на этом устройстве)</span>
        <div className="theme-switch">
          <button type="button" className={`theme-btn ${theme === 'light' ? 'on' : ''}`} onClick={() => setTheme('light')} aria-label="Светлая тема"><SunIcon /> Светлая</button>
          <button type="button" className={`theme-btn ${theme === 'dark' ? 'on' : ''}`} onClick={() => setTheme('dark')} aria-label="Тёмная тема"><MoonIcon /> Тёмная</button>
        </div>
      </div>

      <form onSubmit={save} className="form">
        <label>Название сайта
          <input value={form.siteName} onChange={set('siteName')} />
        </label>

        <label>Ссылка на логотип (Google Диск)
          <input value={form.logoUrl} onChange={set('logoUrl')} placeholder="https://drive.google.com/file/d/…/view" />
        </label>
        <img className="logo-preview" src={driveUrl(form.logoUrl) || DEFAULT_LOGO} alt="Логотип" onError={(e) => (e.currentTarget.src = DEFAULT_LOGO)} />
        <p className="hint">Файл на Диске: «Поделиться» → «Все, у кого есть ссылка». Пустое поле — логотип по умолчанию.</p>

        <div className="field">
          <span className="label">Готовые палитры</span>
          <div className="palettes">
            {PALETTES.map((p) => (
              <button type="button" key={p.name} className="palette" title={p.name}
                onClick={() => setForm((f) => ({ ...f, primary: p.primary, accent: p.accent }))}>
                <i style={{ background: p.primary }} /><i style={{ background: p.accent }} />
              </button>
            ))}
          </div>
        </div>

        <div className="two">
          <label>Основной цвет
            <input type="color" value={form.primary} onChange={set('primary')} />
          </label>
          <label>Дополнительный цвет
            <input type="color" value={form.accent} onChange={set('accent')} />
          </label>
        </div>

        <label>Валюта
          <input value={form.currency} onChange={set('currency')} maxLength={4} />
        </label>

        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn" onClick={reset}>Сбросить</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Сохранение…' : 'Сохранить настройки'}</button>
        </div>
      </form>
    </Modal>
  );
}
