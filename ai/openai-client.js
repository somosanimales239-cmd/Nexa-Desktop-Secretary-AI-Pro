'use strict';

const { validatePrompt } = require('../core/validation');

class OpenAIClient {
  constructor({ getApiKey, emergencyStop, fetchImpl = fetch, timeoutMs = 45000 } = {}) {
    this.getApiKey = getApiKey;
    this.emergencyStop = emergencyStop;
    this.fetch = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  async createResponse(input) {
    const request = validatePrompt(input);
    if (this.emergencyStop?.active) throw new Error('Emergency Stop is active');
    const apiKey = await this.getApiKey?.();
    if (!apiKey) throw new Error('OpenAI is not configured');
    const controller = new AbortController();
    const unregister = this.emergencyStop?.register(controller);
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: request.model,
          input: request.prompt,
          reasoning: { effort: request.reasoning },
          background: false
        })
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error('OpenAI API key is invalid');
        if (response.status === 429) throw new Error('OpenAI rate limit reached');
        throw new Error(`OpenAI request failed with status ${response.status}`);
      }
      const data = await response.json();
      return {
        id: data.id || null,
        status: data.status || 'completed',
        text: typeof data.output_text === 'string' ? data.output_text : '',
        usage: data.usage || null
      };
    } finally {
      clearTimeout(timer);
      unregister?.();
    }
  }
}

module.exports = { OpenAIClient };
