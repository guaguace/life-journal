/* ===== 生活手账 · SVG 图标组件库 ===== */
/* 所有图标来源于 icons/ 目录，颜色匹配新版 design-tokens.json */

/* ── 底部导航图标 ── */
export const IconTabHome = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 11.5 12 4l9 7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.5 10v9.5h13V10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 19.5v-5h4v5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconTabHeart = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 20s-7-4.6-7-9.4A4.1 4.1 0 0 1 12 7.2 4.1 4.1 0 0 1 19 10.6C19 15.4 12 20 12 20Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconTabCalendar = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3.5" y="4.5" width="17" height="16" rx="3" stroke={color} strokeWidth="1.8"/>
    <path d="M3.5 9h17" stroke={color} strokeWidth="1.8"/>
    <path d="M8 3v3M16 3v3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const IconTabActivity = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3.5 13.5h4l2.5-6 4 12 2.5-6h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconTabBulb = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 17h6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M10 20h4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.4.6 1 .6 1.7v.5h6v-.5c0-.7 0-1.3.6-1.7A6 6 0 0 0 12 3Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
);

/* ── 功能图标 ── */
export const IconImage = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <rect x="2" y="3" width="14" height="12" rx="2.5" stroke="#7B4F2C" strokeWidth="1.4"/>
    <circle cx="6" cy="7" r="1.5" fill="#7B4F2C"/>
    <path d="M2.5 13l4-4 3 2.5 3-2.5 4 4" stroke="#7B4F2C" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);

export const IconMic = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <rect x="6" y="2.5" width="6" height="8" rx="3" fill="#7B4F2C"/>
    <path d="M4 9.5c0 2.8 1.8 4.5 5 4.5s5-1.7 5-4.5" stroke="#7B4F2C" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="9" y1="14" x2="9" y2="16.5" stroke="#7B4F2C" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

export const IconCheck = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" fill="#7B4F2C"/>
    <path d="M6 10.2l2.6 2.6L14 7.4" stroke="#FFFCF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconPlus = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M10 4v12M4 10h12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const IconTrash = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <path d="M3.5 4.5h11" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M6 4.5V3h6v1.5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M5 4.5l.8 10a1 1 0 0 0 1 .9h4.4a1 1 0 0 0 1-.9l.8-10" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconClose = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M5 5l10 10M15 5L5 15" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const IconChevronDown = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M3 5l4 4 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── 身体记卡片头部图标 (26×26 圆角方块) ── */
export const IconExercise = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
    <rect width="26" height="26" rx="8" fill="#7B4F2C"/>
    <path d="M7 13h2l1.5-3 5 6 1.5-3H19" stroke="#FFFCF8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconPeriod = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
    <rect width="26" height="26" rx="8" fill="#D4A03E"/>
    <path d="M13 7v4M8 13.5c0 3 2 5 5 5s5-2 5-5" stroke="#FFFCF8" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="13" cy="16" r="1.5" fill="#FFFCF8"/>
  </svg>
);

export const IconDiet = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
    <rect width="26" height="26" rx="8" fill="#D4A03E"/>
    <path d="M9 9h8M9 13h8M9 17h5" stroke="#FFFCF8" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

/* ── 睡眠打卡图标 ── */
export const IconMoon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
    <rect width="26" height="26" rx="8" fill="#6E93C0"/>
    <path d="M18.5 15.5A7.5 7.5 0 0 1 10.5 7.5 7.5 7.5 0 1 0 18.5 15.5Z" stroke="#FFFCF8" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);

export const IconMoonSmall = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M13 10.5A6.5 6.5 0 0 1 5.5 3a6.5 6.5 0 1 0 7.5 7.5Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);

export const IconSun = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="2.8" stroke={color} strokeWidth="1.4"/>
    <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

/* ── 设置/我的 ── */
export const IconSettings = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8"/>
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

/* ── 心情表情图标 (颜色匹配新版 design-tokens.json moodCard.options.faceColor) ── */
/* excited / 兴奋 — faceColor: #E05656 */
export const MoodHappy = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <circle cx="22" cy="22" r="22" fill="#E05656"/>
    <circle cx="15" cy="18.5" r="2.2" fill="#FFFCF8"/>
    <circle cx="29" cy="18.5" r="2.2" fill="#FFFCF8"/>
    <path d="M14 26c2.4 4 13.6 4 16 0" stroke="#FFFCF8" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
  </svg>
);

/* happy / 开心 — faceColor: #ED8A7D */
export const MoodCalm = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <circle cx="22" cy="22" r="22" fill="#ED8A7D"/>
    <circle cx="15" cy="18.5" r="2.2" fill="#FFFCF8"/>
    <circle cx="29" cy="18.5" r="2.2" fill="#FFFCF8"/>
    <path d="M16 27h12" stroke="#FFFCF8" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
);

/* calm / 平静 (默认选中) — faceColor: #F0D78A, border: false */
export const MoodNeutral = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" fill="#F0D78A"/>
    <circle cx="16" cy="20" r="2.4" fill="#7B4F2C"/>
    <circle cx="32" cy="20" r="2.4" fill="#7B4F2C"/>
    <path d="M17 30h14" stroke="#7B4F2C" strokeWidth="2.4" strokeLinecap="round"/>
  </svg>
);

/* low / 低落 — faceColor: #8FB3D9 */
export const MoodTired = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <circle cx="22" cy="22" r="22" fill="#8FB3D9"/>
    <circle cx="15" cy="18.5" r="2.2" fill="#FFFCF8"/>
    <circle cx="29" cy="18.5" r="2.2" fill="#FFFCF8"/>
    <path d="M14 28c2.2-3 13.8-3 16 0" stroke="#FFFCF8" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
  </svg>
);

/* sad / 难过 — faceColor: #6E93C0 */
export const MoodSad = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <circle cx="22" cy="22" r="22" fill="#6E93C0"/>
    <circle cx="15" cy="18.5" r="2.2" fill="#FFFCF8"/>
    <circle cx="29" cy="18.5" r="2.2" fill="#FFFCF8"/>
    <path d="M14 30c2.4-4 13.6-4 16 0" stroke="#FFFCF8" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
  </svg>
);

/* ── 心情图标映射 ── */
export const moodIcons = {
  excited: MoodHappy,
  happy: MoodCalm,
  calm: MoodNeutral,
  low: MoodTired,
  sad: MoodSad,
};

/* ── 心情颜色映射 ── */
export const moodColors = {
  excited: '#E05656',
  happy: '#ED8A7D',
  calm: '#F0D78A',
  low: '#8FB3D9',
  sad: '#6E93C0',
};

/* ── Tab 图标映射 ── */
export const tabIcons = {
  today: IconTabHome,
  mood: IconTabHeart,
  calendar: IconTabCalendar,
  body: IconTabActivity,
  inspiration: IconTabBulb,
  settings: IconSettings,
};
