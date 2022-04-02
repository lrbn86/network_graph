export function calculateExpectedTime(tp, to, tl) {
  const result = (Number(tp) + (4 * Number(tl)) + Number(to)) / 6;
  return Math.round(result * 100) / 100;
}