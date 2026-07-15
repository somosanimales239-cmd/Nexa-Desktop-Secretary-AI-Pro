'use strict';

class BaseConnector {
  constructor({ key, displayName, version = '1.0.0', capabilities = [] }) {
    this.key = key;
    this.displayName = displayName;
    this.version = version;
    this.capabilities = Object.freeze([...capabilities]);
    this.status = 'Needs setup';
  }

  configure() { return { status: 'Needs setup' }; }
  connect() { return { status: 'Needs setup' }; }
  disconnect() { this.status = 'Disconnected'; return { status: this.status }; }
  probe() { return { status: this.status, capabilities: this.capabilities }; }
  fetchAuthorizedContext() { throw new Error('Connector authorization is required'); }
  prepareOutbound() { throw new Error('Outbound preparation is not configured'); }
  requestApproval(preview) { return { approved: false, preview }; }
  sendApproved() { throw new Error('Explicit outbound approval is required'); }
  cancel() { return { cancelled: true }; }
  redactDiagnostics() { return { key: this.key, status: this.status, capabilities: this.capabilities }; }
  healthCheck() { return { status: this.status, verified: false }; }
}

module.exports = { BaseConnector };
