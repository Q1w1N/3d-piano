import { atom } from 'jotai';

export const midiAtom = atom(new Set<number>());

export const lowestMidiKeyAtom = atom(21);
export const highestMidiKeyAtom = atom(108);
