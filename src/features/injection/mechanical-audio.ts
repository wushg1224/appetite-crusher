export interface MechanicalAudio {
  setMuted: (muted: boolean) => void;
  stop: () => void;
}

export function startMechanicalAudio(muted: boolean): MechanicalAudio | null {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;

  try {
    const context = new AudioContext();
    const master = context.createGain();
    const motor = context.createOscillator();
    const motorGain = context.createGain();
    const pulse = context.createOscillator();
    const pulseGain = context.createGain();

    master.gain.value = muted ? 0 : 0.075;
    master.connect(context.destination);

    motor.type = "sawtooth";
    motor.frequency.value = 68;
    motorGain.gain.value = 0.38;
    motor.connect(motorGain).connect(master);

    pulse.type = "square";
    pulse.frequency.value = 7;
    pulseGain.gain.value = 0.16;
    pulse.connect(pulseGain).connect(master);

    motor.start();
    pulse.start();
    void context.resume().catch(() => undefined);

    let stopped = false;

    return {
      setMuted(nextMuted) {
        if (stopped) return;
        master.gain.setTargetAtTime(nextMuted ? 0 : 0.075, context.currentTime, 0.025);
      },
      stop() {
        if (stopped) return;
        stopped = true;
        master.gain.setTargetAtTime(0, context.currentTime, 0.018);
        window.setTimeout(() => {
          try {
            motor.stop();
            pulse.stop();
          } catch {
            // The audio context may already have been closed by the browser.
          }
          void context.close().catch(() => undefined);
        }, 80);
      },
    };
  } catch {
    return null;
  }
}
