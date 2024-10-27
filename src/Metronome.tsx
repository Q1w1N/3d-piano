import { useState, useEffect, useMemo, useCallback } from 'react';
import * as Tone from 'tone';
import './metronome.css';
import { useAtom } from 'jotai';
import { bpmAtom } from './atoms/BpmAtom';
import { noteColorsAtom } from './atoms/NoteColorsAtom';
import { noteSpeedAtom } from './atoms/NoteSpeedAtom';

const Metronome = () => {
  const [metronome, setMetronome] = useState<number | null>(null);

  const [bpm, setBpm] = useAtom(bpmAtom); // BPM control, adjust to your preferred tempo
  const [noteColor, setNoteColor] = useAtom(noteColorsAtom);
  const [noteSpeed, setNoteSpeed] = useAtom(noteSpeedAtom);

  const toneTransport = useMemo(() => Tone.getTransport(), []);

  useEffect(() => {
    toneTransport.bpm.value = bpm;
  }, [toneTransport, bpm]);

  // Toggle the metronome on or off
  const metronomeOn = useCallback(() => {
    toneTransport.start();

    // Schedule a sound on each beat
    const metronomeSound = new Tone.Synth({
      oscillator: { type: 'square' },
      //   oscillator: { type: 'square' },
      // context: {os}
      envelope: {
        attack: 0.001,
        decay: 0.02,
        sustain: 0.0,
        release: 0.02,
      },
    }).toDestination();
    const metronome = toneTransport.scheduleRepeat(() => {
      console.log('Boom');
      metronomeSound.triggerAttackRelease('C6', '8n'); // Metronome tick sound
    }, '4n');

    setMetronome(metronome);
  }, [toneTransport]);

  // Toggle the metronome on or off
  const metronomeOff = useCallback(() => {
    if (metronome !== null) {
      //   clearInterval(metronome);

      toneTransport.stop();
      toneTransport.clear(metronome);
      setMetronome(null);
    }
  }, [metronome, toneTransport]);

  return (
    <div id="metronome">
      <button onClick={metronome !== null ? metronomeOff : metronomeOn}>
        {metronome !== null ? 'Stop Metronome' : 'Start Metronome'}
      </button>
      <div>
        <label>
          BPM:
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            min="40"
            max="240"
          />
        </label>
        <label>
          Black Note:
          <input
            type="text"
            value={noteColor.black}
            onChange={(e) =>
              setNoteColor((curr) => ({ ...curr, black: e.target.value }))
            }
          />
        </label>
        <label>
          White Note:
          <input
            type="text"
            value={noteColor.white}
            onChange={(e) =>
              setNoteColor((curr) => ({ ...curr, white: e.target.value }))
            }
          />
        </label>
        <label>
          Notes Speed:
          <input
            type="range"
            min={0.01}
            max={1}
            step={0.01}
            value={noteSpeed}
            onChange={(e) => setNoteSpeed(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
};

export default Metronome;
