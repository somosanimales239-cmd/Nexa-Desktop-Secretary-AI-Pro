'use strict';

function redact(value) {
  if (typeof value === 'string') {
    return value
      .replace(/sk-[A-Za-z0-9_-]+/g, '[REDACTED_API_KEY]')
      .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [REDACTED_TOKEN]')
      .replace(/\b\+?\d[\d\s().-]{7,}\d\b/g, '[REDACTED_PHONE]')
      .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[REDACTED_EMAIL]');
  }
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = /key|token|password|secret|authorization/i.test(key) ? '[REDACTED]' : redact(item);
    }
    return result;
  }
  return value;
}

module.exports = { redact };
