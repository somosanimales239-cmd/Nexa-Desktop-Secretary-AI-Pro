'use strict';

class EmergencyStop {
  constructor() {
    this.active = false;
    this.reason = null;
    this.controllers = new Set();
  }

  register(controller) {
    if (!controller || typeof controller.abort !== 'function') {
      throw new TypeError('Emergency Stop controllers must expose abort()');
    }
    this.controllers.add(controller);
    if (this.active) controller.abort();
    return () => this.controllers.delete(controller);
  }

  activate(reason = 'manual') {
    this.active = true;
    this.reason = String(reason).slice(0, 200);
    for (const controller of this.controllers) {
      try { controller.abort(); } catch { /* stopping is best effort */ }
    }
    return this.state();
  }

  reset() {
    this.active = false;
    this.reason = null;
    return this.state();
  }

  assertRunning() {
    if (this.active) throw new Error('Emergency Stop is active');
  }

  state() {
    return { active: this.active, reason: this.reason };
  }
}

module.exports = { EmergencyStop };
