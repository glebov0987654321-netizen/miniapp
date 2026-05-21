// Localization module — Russian and English strings for Yandex Games review
// Lang is auto-detected via Yandex Games SDK (ysdk.environment.i18n.lang)
// Falls back to browser language, then to Russian.
(function (global) {
  'use strict';

  const STRINGS = {
    ru: {
      loading: 'ЗАГРУЗКА',
      menu_subtitle: 'Отряд пингвинов против кубических шахтёров',
      menu_play: 'ИГРАТЬ',
      menu_shop: 'МАГАЗИН',
      menu_hint: 'Стрелки или A/D — движение, Space — удар, W — прыжок',
      level_label: 'Уровень',
      level_intro_format: 'Уровень {n}',
      level_boss: 'БОСС',
      victory: 'ПОБЕДА',
      victory_reward_format: '+{n} монет',
      defeat: 'ПОРАЖЕНИЕ',
      defeat_text: 'Шахтёры победили...',
      next: 'ДАЛЬШЕ',
      double_coins: '×2 МОНЕТЫ (реклама)',
      revive: 'ПРОДОЛЖИТЬ (реклама)',
      menu_button: 'В МЕНЮ',
      go_fight: 'В БОЙ',
      finale_title: 'ИГРА ПРОЙДЕНА!',
      finale_text: 'Босс повержен. Отряд пингвинов спас антарктическую базу.',
      shop: 'МАГАЗИН',
      back: 'НАЗАД',
      buy: 'КУПИТЬ',
      equip: 'НАДЕТЬ',
      equipped: 'ЭКИПИРОВАНО',
      owned: 'КУПЛЕНО',
      not_enough_coins: 'Не хватает монет',
      skin_default_name: 'Базовый',
      skin_default_desc: 'Стандартный пингвин-спецназ',
      skin_arctic_name: 'Полярник',
      skin_arctic_desc: 'Белый камуфляж, +5 к здоровью',
      skin_fire_name: 'Огнемёт',
      skin_fire_desc: 'Огненная экипировка, +10% урона',
      skin_ninja_name: 'Ниндзя',
      skin_ninja_desc: 'Чёрный костюм, +15% скорости',
      skin_golden_name: 'Золотой',
      skin_golden_desc: '+20% монет за бой',
      upgrade_dmg_name: 'Усиленный клюв',
      upgrade_dmg_desc: '+5 к урону за уровень',
      upgrade_hp_name: 'Крепкий жилет',
      upgrade_hp_desc: '+20 к здоровью за уровень',
      upgrade_speed_name: 'Лёгкие ласты',
      upgrade_speed_desc: '+10% к скорости за уровень',
      level: 'Ур.',
    },
    en: {
      loading: 'LOADING',
      menu_subtitle: 'Penguin commando squad vs cubical miners',
      menu_play: 'PLAY',
      menu_shop: 'SHOP',
      menu_hint: 'Arrows or A/D — move, Space — attack, W — jump',
      level_label: 'Level',
      level_intro_format: 'Level {n}',
      level_boss: 'BOSS',
      victory: 'VICTORY',
      victory_reward_format: '+{n} coins',
      defeat: 'DEFEAT',
      defeat_text: 'The miners won this round...',
      next: 'NEXT',
      double_coins: '×2 COINS (ad)',
      revive: 'CONTINUE (ad)',
      menu_button: 'TO MENU',
      go_fight: 'FIGHT',
      finale_title: 'GAME COMPLETE!',
      finale_text: 'The boss is defeated. The penguin squad saved the Antarctic base.',
      shop: 'SHOP',
      back: 'BACK',
      buy: 'BUY',
      equip: 'EQUIP',
      equipped: 'EQUIPPED',
      owned: 'OWNED',
      not_enough_coins: 'Not enough coins',
      skin_default_name: 'Standard',
      skin_default_desc: 'Default penguin commando',
      skin_arctic_name: 'Arctic',
      skin_arctic_desc: 'White camo, +5 HP',
      skin_fire_name: 'Flamethrower',
      skin_fire_desc: 'Fire gear, +10% damage',
      skin_ninja_name: 'Ninja',
      skin_ninja_desc: 'Black suit, +15% speed',
      skin_golden_name: 'Golden',
      skin_golden_desc: '+20% coins per battle',
      upgrade_dmg_name: 'Sharp Beak',
      upgrade_dmg_desc: '+5 damage per level',
      upgrade_hp_name: 'Combat Vest',
      upgrade_hp_desc: '+20 HP per level',
      upgrade_speed_name: 'Light Flippers',
      upgrade_speed_desc: '+10% speed per level',
      level: 'Lv.',
    },
  };

  let currentLang = 'ru';

  function detectLang() {
    // Yandex SDK lang takes priority; set by sdk.js when ready.
    if (global.YGSDK && global.YGSDK.lang) {
      return global.YGSDK.lang in STRINGS ? global.YGSDK.lang : 'en';
    }
    const browserLang = (navigator.language || 'ru').slice(0, 2).toLowerCase();
    return browserLang === 'ru' ? 'ru' : 'en';
  }

  function setLang(lang) {
    if (!(lang in STRINGS)) lang = 'en';
    currentLang = lang;
  }

  function getLang() {
    return currentLang;
  }

  function t(key, params) {
    const dict = STRINGS[currentLang] || STRINGS.ru;
    let str = dict[key];
    if (str === undefined) {
      // Fallback to other language if missing.
      const fallback = currentLang === 'ru' ? STRINGS.en : STRINGS.ru;
      str = fallback[key] || key;
    }
    if (params) {
      Object.keys(params).forEach((p) => {
        str = str.replace('{' + p + '}', params[p]);
      });
    }
    return str;
  }

  function toggleLang() {
    setLang(currentLang === 'ru' ? 'en' : 'ru');
  }

  global.I18N = {
    detectLang,
    setLang,
    getLang,
    t,
    toggleLang,
  };
})(window);
