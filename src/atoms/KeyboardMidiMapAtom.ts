import { atom } from 'jotai';

export const keyboardMidiMapAtom = atom<Record<string, number>>({
  a: 60,
  w: 61,
  s: 62,
  e: 63,
  d: 64,
  f: 65,
  t: 66,
  g: 67,
  y: 68,
  h: 69,
  u: 70,
  j: 71,
  //   'k': 72,
  //   'o': 73,
  //   'l': 74,
  //   'p': 75,
  //   ';': 76,
  //   "'": 77,
  //   ']': 78,
  //   '\\': 79,
});

export const changeKeyboardOctave = atom(null, (get, set, update: 1 | -1) => {
  const current = get(keyboardMidiMapAtom);
  const changeValue = update === 1 ? 12 : -12;

  if (current['a'] + changeValue <= 0 || current['a'] + changeValue >= 108) {
    return;
  }

  (Object.keys(current) as Array<keyof typeof current>).forEach(function (key) {
    current[key] += changeValue;
  });
  console.log(current);
  set(keyboardMidiMapAtom, { ...current });
});
