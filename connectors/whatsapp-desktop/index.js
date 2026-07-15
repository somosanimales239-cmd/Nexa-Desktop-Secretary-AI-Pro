'use strict';

const { BaseConnector } = require('../base-connector');

const STATES = Object.freeze(['Not installed', 'Installed', 'Closed', 'Permission required', 'Limited', 'Degraded', 'Error', 'Emergency stopped']);

class WhatsAppDesktopConnector extends BaseConnector {
  constructor({ bridge, emergencyStop } = {}) {
    super({
      key: 'whatsapp-desktop',
      displayName: 'WhatsApp Desktop',
      capabilities: ['detect-status', 'read-visible-authorized', 'copy-draft'],
      version: '1.0.0'
    });
    this.bridge = bridge;
    this.emergencyStop = emergencyStop;
    this.status = 'Not tested';
  }

  async probe() {
    if (this.emergencyStop?.active) {
      this.status = 'Emergency stopped';
      return { status: this.status, verified: false, reason: 'Emergency Stop is active' };
    }
    if (!this.bridge || typeof this.bridge.probe !== 'function') {
      this.status = 'Needs setup';
      return { status: this.status, verified: false, reason: 'Windows Accessibility Bridge is unavailable' };
    }
    const result = await this.bridge.probe();
    this.status = STATES.includes(result.status) ? result.status : 'Degraded';
    return { ...result, status: this.status, verified: Boolean(result.verified) };
  }

  async captureAuthorizedContext() {
    if (this.emergencyStop?.active) throw new Error('Emergency Stop is active');
    if (!['Connected', 'Limited'].includes(this.status)) throw new Error('WhatsApp capability is not verified');
    if (!this.bridge?.readVisible) throw new Error('Visible conversation reading is unavailable');
    return this.bridge.readVisible();
  }

  async insertDraft({ conversationId, text, approved }) {
    if (!approved) throw new Error('Explicit draft approval is required');
    if (this.emergencyStop?.active) throw new Error('Emergency Stop is active');
    if (typeof text !== 'string' || !text.trim()) throw new Error('Draft text is required');
    if (!this.bridge?.insertDraft) return { status: 'Copy only', message: 'Paste manually in WhatsApp', sent: false };
    const result = await this.bridge.insertDraft({ conversationId, text });
    return { ...result, sent: false, message: 'Draft inserted — review it in WhatsApp before sending' };
  }
}

module.exports = { WhatsAppDesktopConnector, STATES };
