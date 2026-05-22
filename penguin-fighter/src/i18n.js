// Localization module.
(function (global) {
  'use strict';

  const STRINGS = {
    ru: {
      loading: 'ЗАГРУЗКА',
      rotate_phone: 'Поверни телефон в горизонтальный режим',
      menu_subtitle: 'Ночь. Школа. Третья смена. 10 уровней мемов.',
      menu_play: 'ИГРАТЬ',
      menu_shop: 'ГЕРОИ И ПРОКАЧКА',
      menu_settings: 'НАСТРОЙКИ',
      menu_hint: 'Стрелки или A/D — движение, Space — атака, W — прыжок',
      level_label: 'Уровень',
      level_intro_format: 'Уровень {n}',
      level_boss: 'ГЛАВНЫЙ БОСС',
      level_select_title: 'ВЫБЕРИ УРОВЕНЬ',
      level_select_sub: 'Открывай уровни один за другим',
      victory: 'ПОБЕДА',
      victory_reward_format: '+{n} монет',
      defeat: 'ПОРАЖЕНИЕ',
      defeat_text: 'Попробуй ещё раз',
      next: 'ДАЛЬШЕ',
      double_coins: '×2 МОНЕТЫ (реклама)',
      revive: 'ПРОДОЛЖИТЬ (реклама)',
      menu_button: 'В МЕНЮ',
      go_fight: 'В БОЙ',
      finale_title: 'ИГРА ПРОЙДЕНА!',
      finale_text: 'Финальный босс повержен. Весь отряд открыт.',
      shop: 'ГЕРОИ И ПРОКАЧКА',
      settings: 'НАСТРОЙКИ',
      back: 'НАЗАД',
      buy: 'КУПИТЬ',
      equip: 'ВЫБРАТЬ',
      equipped: 'ВЫБРАН',
      owned: 'КУПЛЕНО',
      locked: 'ЗАКРЫТО',
      not_enough_coins: 'НЕ ХВАТАЕТ МОНЕТ',
      unlock_after_level: 'После уровня {n}',
      sound_on: 'ЗВУК: ON',
      sound_off: 'ЗВУК: OFF',
      vibration_on: 'ВИБРАЦИЯ: ON',
      vibration_off: 'ВИБРАЦИЯ: OFF',
      language_toggle: 'ЯЗЫК: RU / EN',
      reset_progress: 'СБРОСИТЬ ПРОГРЕСС',
      level: 'Ур.',
      hero_h1_name: 'Котик',
      hero_h1_desc: 'Когтистая атака в ближнем бою',
      hero_h2_name: 'Кроль',
      hero_h2_desc: 'Меткий выстрел',
      hero_h3_name: 'Утка',
      hero_h3_desc: 'Перьевая атака',
      hero_h4_name: 'Робот',
      hero_h4_desc: 'Лазерный выстрел',
      hero_h5_name: 'Спрей',
      hero_h5_desc: 'Ядовитое облако',
      hero_h6_name: 'Неко-чан',
      hero_h6_desc: 'Быстрый бросок пера',
      hero_h7_name: 'Пёс-босс',
      hero_h7_desc: 'Мощный лазерный залп',
      weapon_claws: 'Оружие: когти',
      weapon_pistol: 'Оружие: пистолет',
      weapon_feather: 'Оружие: перо',
      weapon_laser: 'Оружие: лазер',
      weapon_spray: 'Оружие: спрей',
      weapon_ice: 'Оружие: лёд',
      weapon_cash: 'Оружие: деньги',
      enemy_zombie: 'Носач',
      enemy_worm: 'Дутый',
      enemy_miner: 'Совок',
      enemy_bat: 'Пышка',
      enemy_skeleton: 'Брдыщ',
      enemy_slime: 'Стопонос',
      enemy_spider: 'Костюм',
      enemy_robot: 'Кефтеме',
      enemy_ghost: 'Кепка',
      enemy_boss: 'Директор',
      upgrade_damage_name: 'Урон',
      upgrade_damage_desc: '+5 урона за уровень',
      upgrade_hp_name: 'Здоровье',
      upgrade_hp_desc: '+20 HP за уровень',
      upgrade_speed_name: 'Скорость',
      upgrade_speed_desc: '+10% скорости за уровень',
    },
    en: {
      loading: 'LOADING',
      rotate_phone: 'Rotate your phone to landscape',
      menu_subtitle: 'Third shift. Survive the school. 10 levels of memes.',
      menu_play: 'PLAY',
      menu_shop: 'HEROES & UPGRADES',
      menu_settings: 'SETTINGS',
      menu_hint: 'Arrows or A/D — move, Space — attack, W — jump',
      level_label: 'Level',
      level_intro_format: 'Level {n}',
      level_boss: 'FINAL BOSS',
      level_select_title: 'CHOOSE LEVEL',
      level_select_sub: 'Unlock levels one by one',
      victory: 'VICTORY',
      victory_reward_format: '+{n} coins',
      defeat: 'DEFEAT',
      defeat_text: 'Try again',
      next: 'NEXT',
      double_coins: '×2 COINS (ad)',
      revive: 'CONTINUE (ad)',
      menu_button: 'MENU',
      go_fight: 'FIGHT',
      finale_title: 'GAME COMPLETE!',
      finale_text: 'The final boss is down. The whole squad is unlocked.',
      shop: 'HEROES & UPGRADES',
      settings: 'SETTINGS',
      back: 'BACK',
      buy: 'BUY',
      equip: 'EQUIP',
      equipped: 'EQUIPPED',
      owned: 'OWNED',
      locked: 'LOCKED',
      not_enough_coins: 'NOT ENOUGH COINS',
      unlock_after_level: 'After level {n}',
      sound_on: 'SOUND: ON',
      sound_off: 'SOUND: OFF',
      vibration_on: 'VIBRATION: ON',
      vibration_off: 'VIBRATION: OFF',
      language_toggle: 'LANGUAGE: RU / EN',
      reset_progress: 'RESET PROGRESS',
      level: 'Lv.',
      hero_h1_name: 'Kitty',
      hero_h1_desc: 'Close-range claws',
      hero_h2_name: 'Bunny',
      hero_h2_desc: 'Accurate shot',
      hero_h3_name: 'Duck',
      hero_h3_desc: 'Feather attack',
      hero_h4_name: 'Robot',
      hero_h4_desc: 'Laser blast',
      hero_h5_name: 'Spray',
      hero_h5_desc: 'Poison cloud',
      hero_h6_name: 'Neko-chan',
      hero_h6_desc: 'Fast feather throw',
      hero_h7_name: 'Big Doggo',
      hero_h7_desc: 'Powerful laser blast',
      weapon_claws: 'Weapon: claws',
      weapon_pistol: 'Weapon: pistol',
      weapon_feather: 'Weapon: feather',
      weapon_laser: 'Weapon: laser',
      weapon_spray: 'Weapon: spray',
      weapon_ice: 'Weapon: ice',
      weapon_cash: 'Weapon: cash',
      enemy_zombie: 'Big Nose',
      enemy_worm: 'Puffy',
      enemy_miner: 'Comrade',
      enemy_bat: 'Plumpy',
      enemy_skeleton: 'Brdysh',
      enemy_slime: 'Foot-Ear',
      enemy_spider: 'Suit',
      enemy_robot: 'Keftme',
      enemy_ghost: 'Cap',
      enemy_boss: 'Headmaster',

      upgrade_damage_name: 'Damage',
      upgrade_damage_desc: '+5 damage per level',
      upgrade_hp_name: 'Health',
      upgrade_hp_desc: '+20 HP per level',
      upgrade_speed_name: 'Speed',
      upgrade_speed_desc: '+10% speed per level',
    },
  };

  let currentLang = 'ru';

  function detectLang() {
    if (global.YGSDK && global.YGSDK.lang) {
      return global.YGSDK.lang in STRINGS ? global.YGSDK.lang : 'en';
    }
    const browserLang = (navigator.language || 'ru').slice(0, 2).toLowerCase();
    return browserLang === 'ru' ? 'ru' : 'en';
  }

  function setLang(lang) {
    currentLang = lang in STRINGS ? lang : 'en';
  }

  function getLang() {
    return currentLang;
  }

  function t(key, params) {
    const dict = STRINGS[currentLang] || STRINGS.ru;
    let str = dict[key];
    if (str === undefined) {
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

  global.I18N = { detectLang, setLang, getLang, t, toggleLang };
})(window);
