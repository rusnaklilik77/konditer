import { createContext, useContext, useEffect, useState } from 'react';

const dict = {
  ru: {
    menu: 'Меню', openMenu: 'Открыть меню', closeMenu: 'Закрыть меню', close: 'Закрыть',
    toggleTheme: 'Сменить тему', addRecipe: 'Добавить рецепт',
    newRecipe: '+ Новый рецепт', newGroup: '+ Новая группа',
    filters: 'Фильтры', manageFilters: 'Управление фильтрами',
    groups: 'Группы', allRecipes: 'Все рецепты',
    noGroups: 'Групп пока нет. Создайте первую, например «Осень».',
    settings: 'Настройки', language: 'Язык', chooseLanguage: 'Выберите язык',
    search: 'Поиск по названию', pcs: 'шт.', reset: 'Сбросить', loading: 'Загрузка…',
    emptyNone: 'Здесь пока пусто. Добавьте первый рецепт.',
    emptyNotFound: 'Ничего не найдено по этим условиям.',
    fbError: 'Ошибка Firebase', fbErrorHint: 'Проверьте ключи и правила Firestore.',
    save: 'Сохранить', saving: 'Сохранение…', cancel: 'Отмена', delete: 'Удалить', edit: 'Изменить',
    saveFail: 'Не удалось сохранить', deleteFail: 'Не удалось удалить',
    editGroup: 'Изменить группу', newGroupTitle: 'Новая группа', groupName: 'Название группы',
    groupPh: 'Например: Осень', groupNameReq: 'Введите название группы', saveGroup: 'Сохранить группу',
    confirmDeleteGroup: 'Удалить группу «{name}» и рецептов в ней: {n}?',
    newFilterPh: 'Новый фильтр, например: Без сахара', add: 'Добавить',
    filterExists: 'Такой фильтр уже есть', noFilters: 'Фильтров пока нет.',
    confirmDeleteFilter: 'Удалить фильтр «{name}»? Он пропадёт и из рецептов.',
    pickFilters: 'Выберите фильтры', pickHint: 'Можно выбрать один или несколько. Покажутся рецепты, у которых есть все выбранные.',
    showN: 'Показать ({n})', clear: 'Очистить', manage: 'Управлять',
    editRecipe: 'Изменить рецепт', newRecipeTitle: 'Новый рецепт', title: 'Название', titlePh: 'Тыквенный пирог',
    group: 'Группа', noGroupsOpt: '— нет групп —',
    photos: 'Фото (ссылки Google Диска)', photoLink: 'Ссылка на фото', addPhoto: '+ Добавить ещё фото', removePhoto: 'Убрать фото',
    price: 'Цена', recipeText: 'Рецепт и состав', contentPh: 'Ингредиенты:\n- тыква 500 г\n\nШаги:\n1. …',
    filtersLabel: 'Фильтры', createFirstFilter: 'Создайте первый фильтр ниже', newFilterShort: 'Новый фильтр', create: 'Создать',
    saveRecipe: 'Сохранить рецепт', titleReq: 'Введите название',
    groupReq: 'Выберите группу (сначала создайте её в меню)', filterCreateFail: 'Не удалось создать фильтр',
    confirmDeleteRecipe: 'Удалить рецепт «{name}»?', noDescription: 'Описание не добавлено.',
    theme: 'Тема сайта (хранится на этом устройстве)', light: 'Светлая', dark: 'Тёмная',
    siteName: 'Название сайта', logoLink: 'Ссылка на логотип (Google Диск)',
    logoHint: 'Файл на Диске: «Поделиться» → «Все, у кого есть ссылка». Пустое поле — логотип по умолчанию.',
    palettes: 'Готовые палитры', primary: 'Основной цвет', accent: 'Дополнительный цвет', currency: 'Валюта',
    saveSettings: 'Сохранить настройки',
  },
  ro: {
    menu: 'Meniu', openMenu: 'Deschide meniul', closeMenu: 'Închide meniul', close: 'Închide',
    toggleTheme: 'Schimbă tema', addRecipe: 'Adaugă rețetă',
    newRecipe: '+ Rețetă nouă', newGroup: '+ Grupă nouă',
    filters: 'Filtre', manageFilters: 'Gestionează filtrele',
    groups: 'Grupe', allRecipes: 'Toate rețetele',
    noGroups: 'Încă nu există grupe. Creează prima, de exemplu „Toamna”.',
    settings: 'Setări', language: 'Limba', chooseLanguage: 'Alege limba',
    search: 'Caută după nume', pcs: 'buc.', reset: 'Resetează', loading: 'Se încarcă…',
    emptyNone: 'Încă nu este nimic aici. Adaugă prima rețetă.',
    emptyNotFound: 'Nu s-a găsit nimic pentru aceste condiții.',
    fbError: 'Eroare Firebase', fbErrorHint: 'Verifică cheile și regulile Firestore.',
    save: 'Salvează', saving: 'Se salvează…', cancel: 'Anulează', delete: 'Șterge', edit: 'Modifică',
    saveFail: 'Nu s-a putut salva', deleteFail: 'Nu s-a putut șterge',
    editGroup: 'Modifică grupa', newGroupTitle: 'Grupă nouă', groupName: 'Numele grupei',
    groupPh: 'De exemplu: Toamna', groupNameReq: 'Introdu numele grupei', saveGroup: 'Salvează grupa',
    confirmDeleteGroup: 'Ștergi grupa „{name}” și rețetele din ea: {n}?',
    newFilterPh: 'Filtru nou, de exemplu: Fără zahăr', add: 'Adaugă',
    filterExists: 'Acest filtru există deja', noFilters: 'Încă nu există filtre.',
    confirmDeleteFilter: 'Ștergi filtrul „{name}”? Va dispărea și din rețete.',
    pickFilters: 'Alege filtrele', pickHint: 'Poți alege unul sau mai multe. Se vor afișa rețetele care le au pe toate cele alese.',
    showN: 'Arată ({n})', clear: 'Șterge', manage: 'Gestionează',
    editRecipe: 'Modifică rețeta', newRecipeTitle: 'Rețetă nouă', title: 'Titlu', titlePh: 'Plăcintă cu dovleac',
    group: 'Grupă', noGroupsOpt: '— nu există grupe —',
    photos: 'Poze (linkuri Google Drive)', photoLink: 'Link către poză', addPhoto: '+ Adaugă încă o poză', removePhoto: 'Elimină poza',
    price: 'Preț', recipeText: 'Rețetă și ingrediente', contentPh: 'Ingrediente:\n- dovleac 500 g\n\nPași:\n1. …',
    filtersLabel: 'Filtre', createFirstFilter: 'Creează primul filtru mai jos', newFilterShort: 'Filtru nou', create: 'Creează',
    saveRecipe: 'Salvează rețeta', titleReq: 'Introdu titlul',
    groupReq: 'Alege o grupă (creeaz-o mai întâi din meniu)', filterCreateFail: 'Nu s-a putut crea filtrul',
    confirmDeleteRecipe: 'Ștergi rețeta „{name}”?', noDescription: 'Nu există descriere.',
    theme: 'Tema site-ului (se păstrează pe acest dispozitiv)', light: 'Luminoasă', dark: 'Întunecată',
    siteName: 'Numele site-ului', logoLink: 'Link către logo (Google Drive)',
    logoHint: 'Fișier pe Drive: „Partajează” → „Oricine are linkul”. Câmp gol — logo implicit.',
    palettes: 'Palete gata făcute', primary: 'Culoare principală', accent: 'Culoare secundară', currency: 'Monedă',
    saveSettings: 'Salvează setările',
  },
};

const Ctx = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { const l = localStorage.getItem('lang'); return l === 'ro' || l === 'ru' ? l : 'ru'; } catch { return 'ru'; }
  });
  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('lang', lang); } catch { /* ignore */ }
  }, [lang]);

  const t = (key, vars) => {
    let s = dict[lang][key] ?? dict.ru[key] ?? key;
    if (vars) for (const k of Object.keys(vars)) s = s.replace(`{${k}}`, vars[k]);
    return s;
  };
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
