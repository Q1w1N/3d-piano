import { atom } from 'jotai';

const noteNames = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

export function midiNoteToName(noteNumber: number) {
  const octave = Math.floor(noteNumber / 12) - 1;
  const note = noteNames[noteNumber % 12];
  return { base: note, pitch: octave, full: `${note}${octave}` };
}

export function noteToMIDINumber(note: string) {
  // Extract the note and octave from the input
  const match = note.match(/^([A-G]#?)(-?\d)$/);
  if (!match) throw Error(); // Invalid note format

  const [, noteName, octave] = match;
  const midiNumber = (parseInt(octave) + 1) * 12 + noteNames.indexOf(noteName);
  return midiNumber;
}

export const midiAtom = atom(new Set<number>());
