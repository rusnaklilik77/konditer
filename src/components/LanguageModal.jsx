import Modal from './Modal.jsx';
import { useI18n } from '../i18n.jsx';

export default function LanguageModal({ onClose }) {
  const { t, lang, setLang } = useI18n();
  const choose = (l) => { setLang(l); onClose(); };
  return (
    <Modal title={t('chooseLanguage')} onClose={onClose}>
      <div className="lang-list">
        <button className={`lang-btn ${lang === 'ru' ? 'on' : ''}`} onClick={() => choose('ru')}>
          <span className="flag">🇷🇺</span> Русский
        </button>
        <button className={`lang-btn ${lang === 'ro' ? 'on' : ''}`} onClick={() => choose('ro')}>
          <span className="flag">🇷🇴</span> Română
        </button>
      </div>
    </Modal>
  );
}
