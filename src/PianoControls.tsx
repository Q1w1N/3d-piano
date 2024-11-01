import { useAtom } from 'jotai';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { midiAtom } from './atoms/MidiAtom';
import {
  changeKeyboardOctave,
  keyboardMidiMapAtom,
} from './atoms/KeyboardMidiMapAtom';

export const PianoControls = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState('Keyboard');
  const [, setMidiAtom] = useAtom(midiAtom);
  const [, changeOctave] = useAtom(changeKeyboardOctave);
  const [keyboardMidiMap] = useAtom(keyboardMidiMapAtom);

  const handleDeviceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(event.target.value);
    console.log('Selected MIDI Device ID:', event.target.value);
  };

  const onKeyboardKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const note = keyboardMidiMap[e.key];
      if (note) {
        setMidiAtom((prev) =>
          prev.has(note) ? prev : new Set(prev.add(note)),
        );
        return;
      }

      if (e.key === 'z') {
        changeOctave(-1);
      }

      if (e.key === 'x') {
        changeOctave(1);
      }
    },
    [setMidiAtom, changeOctave, keyboardMidiMap],
  );

  const onKeyboardKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const noteOff = keyboardMidiMap[e.key];
      if (noteOff) {
        setMidiAtom((prev) => {
          const newState = new Set(prev);
          newState.delete(noteOff);
          return newState;
        });
      }
    },
    [setMidiAtom, keyboardMidiMap],
  );

  useEffect(() => {
    if (selectedDeviceId === 'Keyboard') {
      window.addEventListener('keydown', onKeyboardKeyDown);
      window.addEventListener('keyup', onKeyboardKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', onKeyboardKeyDown);
      window.removeEventListener('keydown', onKeyboardKeyUp);
    };
  }, [onKeyboardKeyDown, onKeyboardKeyUp, selectedDeviceId]);

  return (
    <div>
      <label htmlFor="midi-device-select">Select MIDI Device: </label>
      <select
        id="midi-device-select"
        value={selectedDeviceId}
        onChange={handleDeviceChange}
      >
        <option key={''} value={'input.id'}>
          {'Keyboard'}
        </option>
      </select>
    </div>
  );
};
