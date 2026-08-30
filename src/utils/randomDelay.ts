export const randomDelay = (min = 400, max = 1200) => {
  const duration = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(res => setTimeout(res, duration));
};
