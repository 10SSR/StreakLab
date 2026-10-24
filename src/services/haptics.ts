class HapticsEngine {
  public enabled = true;

  trigger(pattern: number | number[]) {
    if (!this.enabled) return;
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Silently handle devices where vibration is disabled or unsupported
      }
    }
  }

  light() {
    this.trigger(10);
  }

  medium() {
    this.trigger(25);
  }

  heavy() {
    this.trigger(45);
  }

  success() {
    this.trigger([30, 40, 40]);
  }

  celebration() {
    this.trigger([50, 50, 70, 50, 100]);
  }

  warning() {
    this.trigger([60, 60, 60]);
  }
}

export const haptics = new HapticsEngine();
