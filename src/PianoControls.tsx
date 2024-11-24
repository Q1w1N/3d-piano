import { useAtom } from 'jotai';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import {
  highestMidiKeyAtom,
  lowestMidiKeyAtom,
  midiAtom,
} from './atoms/MidiAtom';
import {
  changeKeyboardOctave,
  keyboardMidiMapAtom,
} from './atoms/KeyboardMidiMapAtom';

export const PianoControls = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState('Keyboard');
  const [, setMidiAtom] = useAtom(midiAtom);
  const [, changeOctave] = useAtom(changeKeyboardOctave);
  const [keyboardMidiMap] = useAtom(keyboardMidiMapAtom);

  const [lowestMidiKey, setLowestMidiKey] = useAtom(lowestMidiKeyAtom);
  const [highestMidiKey, setHighestMidiKey] = useAtom(highestMidiKeyAtom);

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

  const onMidiMessage = useCallback(
    (event: MIDIMessageEvent) => {
      if (!event.data) return;
      const [status, note, velocity] = event.data;
      if (status === 0xf8) return;
      console.log('Status: ', status, status == 0x90);
      console.log('Note: ', note);
      console.log('Velocity: ', velocity);
      if ((status & 0xf0) === 0x90 && velocity > 0) {
        setMidiAtom((prev) =>
          prev.has(note) ? prev : new Set(prev.add(note)),
        );
        console.log(`Note On: ${note}, Velocity: ${velocity}`);
        // Note on (key press)
      } else if (
        (status & 0xf0) === 0x80 ||
        ((status & 0xf0) === 0x90 && velocity === 0)
      ) {
        console.log(`Note Off: ${note}`);
        setMidiAtom((prev) => {
          const newState = new Set(prev);
          newState.delete(note);
          return newState;
        });
        // Note off (key release)
      }
    },
    [setMidiAtom],
  );

  useEffect(() => {
    const requesto = async () => {
      const midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      if (midiAccess) {
        // setMidiAccess(midiAccess);
        let isSet = null;
        for (const input of midiAccess.inputs.values()) {
          console.log(input);
          // Listen for incoming MIDI messages
          if (isSet === null) {
            console.log('LOL', input);
            input.onmidimessage = onMidiMessage;

            isSet = input;
          }
        }

        if (isSet) {
          for (const x of midiAccess.outputs.values()) {
            console.log('SENDING');
            x.send([0x90, 30, 1]);
            x.send([0x90, 30, 1]);
            x.send([0x90, 30, 1]);
            x.send([0x90, 30, 1]);
            x.send([0x90, 30, 1]);
            x.send([0x90, 30, 1]);
          }
        }
      }
    };

    setTimeout(requesto, 100);
  }, [onMidiMessage]);

  // useEffect(() => {
  //   if (midiAccess) {
  //     for (const input of midiAccess.inputs.values()) {
  //       console.log('Yes');
  //       // Listen for incoming MIDI messages
  //       input.onmidimessage = onMidiMessage;
  //     }
  //   }
  // }, [midiAccess, onMidiMessage]);

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
    <>
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
      <div>
        <label htmlFor="midi-device-select">Range: </label>
        <input
          type="range"
          min={0}
          max={127}
          id="min-midi-note"
          value={lowestMidiKey}
          onChange={(e) => {
            setLowestMidiKey(Number(e.currentTarget.value));
          }}
        />
        <input
          type="number"
          id="max-midi-note"
          value={highestMidiKey}
          onChange={(e) => {
            setHighestMidiKey(Number(e.currentTarget.value));
          }}
        />
      </div>
    </>
  );
};
