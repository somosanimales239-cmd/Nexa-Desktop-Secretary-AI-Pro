'use strict';

const MAX_STRING = 20000;
const CHANNELS = Object.freeze([
  'app:get-state',
  'nexa:emergency-stop',
  'nexa:resume',
  'nexa:clipboard-write',
  'settings:set-api-key',
  'settings:clear-api-key',
  'settings:set',
  'ai:create-response',
  'ai:cancel-response',
  'whatsapp:probe'
]);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function boundedString(value, field, max = MAX_STRING) {
  if (typeof value !== 'string' || value.length > max) throw new TypeError(`${field} is invalid`);
  return value;
}

function validateChannel(channel) {
  if (!CHANNELS.includes(channel)) throw new Error('IPC channel is not allowlisted');
  return channel;
}

function validateSettings(patch) {
  if (!isPlainObject(patch)) throw new TypeError('Settings must be an object');
  const allowed = new Set(['mode', 'onboardingComplete', 'notifications']);
  return Object.fromEntries(Object.entries(patch).filter(([key]) => allowed.has(key)));
}

function validatePrompt(input) {
  if (!isPlainObject(input)) throw new TypeError('AI request must be an object');
  return {
    prompt: boundedString(input.prompt, 'prompt', 12000),
    model: typeof input.model === 'string' ? boundedString(input.model, 'model', 100) : 'gpt-4o-mini',
    reasoning: input.reasoning === 'medium' || input.reasoning === 'high' ? input.reasoning : 'low'
  };
}

module.exports = { CHANNELS, isPlainObject, boundedString, validateChannel, validateSettings, validatePrompt };
