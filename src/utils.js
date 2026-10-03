// Превращает ссылку Google Диска в прямую ссылку на картинку.
// Файл на Диске должен быть открыт: "Все, у кого есть ссылка".
export function driveUrl(url) {
  if (!url) return '';
  const u = url.trim();
  const m = u.match(/\/d\/([a-zA-Z0-9_-]+)/) || u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (u.includes('drive.google.com') && m) {
    return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1200`;
  }
  return u;
}

export const DEFAULT_LOGO = '/default-logo.jpg';

export const DEFAULT_SETTINGS = {
  siteName: 'KANDITER',
  logoUrl: '',
  primary: '#b5541f',
  accent: '#7a1f2b',
  currency: '₽',
};
