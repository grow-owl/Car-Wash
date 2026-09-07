export const cleanText = (str) => {
  if (typeof str !== 'string') return str || '';
  return str
    .replace(/[\u{1F000}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|🥈|🥇|🥉|🏅|🎖️|⭐|🌟|✨|🏷️|📦|🛠️|⏱️|🟢|🔴|🚗|🚘|🚙|🏎️|🛻|✓|✔|🛠|💡|📍|🎁|💵|🔍|🧼|🔑|📝/gu, '')
    .trim();
};

export default cleanText;
