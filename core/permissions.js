'use strict';

const PERMISSIONS = Object.freeze([
  'detectWhatsAppStatus',
  'detectActiveConversation',
  'readVisibleConversation',
  'monitorVisibleMessages',
  'storeConversationContext',
  'useOpenAI',
  'insertApprovedDrafts',
  'showNotifications'
]);

const DEFAULTS = Object.freeze({
  detectWhatsAppStatus: true,
  detectActiveConversation: false,
  readVisibleConversation: false,
  monitorVisibleMessages: false,
  storeConversationContext: false,
  useOpenAI: false,
  insertApprovedDrafts: false,
  showNotifications: false
});

function normalizePermissions(value = {}) {
  const result = { ...DEFAULTS };
  for (const key of PERMISSIONS) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      result[key] = value[key] === true;
    }
  }
  return result;
}

function can(permission, value) {
  return normalizePermissions(value)[permission] === true;
}

module.exports = { PERMISSIONS, DEFAULTS, normalizePermissions, can };
