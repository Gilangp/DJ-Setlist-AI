"use client";

type MidiCallback = (command: 'PLAY_PAUSE' | 'NEXT_TRACK' | 'PREV_TRACK' | 'CUE_NEXT') => void;

class MidiManager {
  private midiAccess: any = null;
  private activeControllerName: string | null = null;
  private listeners: Set<MidiCallback> = new Set();
  private statusListeners: Set<(name: string | null) => void> = new Set();

  public async init(): Promise<string | null> {
    if (typeof window === 'undefined' || !navigator.requestMIDIAccess) {
      return null;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.setupInputs();

      this.midiAccess.onstatechange = () => {
        this.setupInputs();
      };

      return this.activeControllerName;
    } catch (e) {
      console.warn('MIDI Access denied or unavailable:', e);
      return null;
    }
  }

  private setupInputs() {
    if (!this.midiAccess) return;

    const inputs = Array.from(this.midiAccess.inputs.values());
    if (inputs.length > 0) {
      const input = (inputs[0] as any);
      this.activeControllerName = input.name || 'Generic MIDI DJ Controller';
      input.onmidimessage = this.handleMidiMessage.bind(this);
    } else {
      this.activeControllerName = null;
    }

    this.notifyStatus();
  }

  private handleMidiMessage(event: any) {
    const [status, noteOrControl] = event.data;
    const commandType = status & 0xf0; // 144 (0x90) = Note On, 176 (0xb0) = CC

    // Trigger on Note On (pad hit) or CC toggle
    if (commandType === 144 || commandType === 176) {
      if (noteOrControl === 0 || noteOrControl === 36 || noteOrControl === 64) {
        this.emit('PLAY_PAUSE');
      } else if (noteOrControl === 1 || noteOrControl === 37 || noteOrControl === 65) {
        this.emit('NEXT_TRACK');
      } else if (noteOrControl === 2 || noteOrControl === 38 || noteOrControl === 66) {
        this.emit('PREV_TRACK');
      } else if (noteOrControl === 3 || noteOrControl === 39 || noteOrControl === 67) {
        this.emit('CUE_NEXT');
      }
    }
  }

  public addListener(cb: MidiCallback) {
    this.listeners.add(cb);
  }

  public removeListener(cb: MidiCallback) {
    this.listeners.delete(cb);
  }

  public addStatusListener(cb: (name: string | null) => void) {
    this.statusListeners.add(cb);
    cb(this.activeControllerName);
  }

  public removeStatusListener(cb: (name: string | null) => void) {
    this.statusListeners.delete(cb);
  }

  private emit(cmd: 'PLAY_PAUSE' | 'NEXT_TRACK' | 'PREV_TRACK' | 'CUE_NEXT') {
    this.listeners.forEach(cb => cb(cmd));
  }

  private notifyStatus() {
    this.statusListeners.forEach(cb => cb(this.activeControllerName));
  }
}

export const midiController = new MidiManager();
