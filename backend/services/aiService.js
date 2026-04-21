const { generateDemoChatCompletion, generateDemoTitle } = require('./demoAiService');

function clamp(value, min, max, fallback) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numericValue));
}

function sanitizeMessages(messages = []) {
  return messages
    .filter((message) => message && typeof message.content === 'string' && message.content.trim())
    .map((message) => ({
      role: ['system', 'assistant', 'user'].includes(message.role) ? message.role : 'user',
      content: message.content.trim(),
    }));
}

function normalizeBaseUrl(baseUrl, fallback) {
  const cleaned = String(baseUrl || '').trim().replace(/\/+$/, '');
  return cleaned || fallback;
}

function buildOpenRouterHeaders(apiKey) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  if (process.env.OPENROUTER_REFERER) {
    headers['HTTP-Referer'] = process.env.OPENROUTER_REFERER;
  }

  if (process.env.OPENROUTER_TITLE) {
    headers['X-Title'] = process.env.OPENROUTER_TITLE;
  }

  return headers;
}

function buildProviderConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  return {
    apiKey,
    model: process.env.OPENROUTER_MODEL || process.env.AI_MODEL || 'openai/gpt-4o',
    baseUrl: normalizeBaseUrl(
      process.env.OPENROUTER_BASE_URL,
      'https://openrouter.ai/api/v1'
    ),
    headers: buildOpenRouterHeaders(apiKey),
  };
}

function buildOpenRouterUrl(baseUrl) {
  const safeBaseUrl = normalizeBaseUrl(baseUrl, 'https://openrouter.ai/api/v1');
  return `${safeBaseUrl}/chat/completions`;
}

function extractOpenRouterText(responseData) {
  const content = responseData?.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .filter(Boolean)
      .join('')
      .trim();
  }

  return '';
}

async function generateOpenRouterContent({ messages, systemPrompt, temperature, maxTokens }) {
  const { apiKey, model, baseUrl, headers } = buildProviderConfig();

  if (!apiKey) {
    return null;
  }

  const response = await fetch(buildOpenRouterUrl(baseUrl), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt
          ? [{
              role: 'system',
              content: systemPrompt,
            }]
          : []),
        ...sanitizeMessages(messages).filter((message) => message.role !== 'system'),
      ],
      temperature,
      ...(Number.isFinite(Number(maxTokens)) ? { max_tokens: Number(maxTokens) } : {}),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || 'OpenRouter request failed');
  }

  const text = extractOpenRouterText(data);
  if (!text) {
    throw new Error('OpenRouter returned an empty response');
  }

  return {
    content: text,
    model: data.model || model,
    provider: 'openrouter',
    usage: data.usage || null,
    raw: data,
  };
}

async function generateRemoteChatCompletion({ messages, systemPrompt, temperature }) {
  const finalTemperature = clamp(temperature, 0, 2, 0.7);

  try {
    const result = await generateOpenRouterContent({
      messages,
      systemPrompt,
      temperature: finalTemperature,
    });

    if (result) {
      return {
        content: result.content,
        model: result.model,
        provider: result.provider,
        usage: result.usage,
      };
    }
  } catch (error) {
    console.warn('OpenRouter chat generation failed, falling back to demo mode:', error.message);
  }

  return generateDemoChatCompletion({ messages, systemPrompt });
}

async function generateConversationTitle({ messages }) {
  const result = await generateOpenRouterContent({
    messages: sanitizeMessages(messages).slice(-6),
    systemPrompt: 'Create a short conversation title. Return only the title, no quotes, no markdown, maximum 6 words.',
    temperature: 0.2,
    maxTokens: 24,
  }).catch(() => null);

  if (!result?.content) {
    return generateDemoTitle({ messages });
  }

  return result.content.replace(/[\r\n]+/g, ' ').trim().split(' ').slice(0, 6).join(' ');
}

async function generateChatCompletion({ messages, systemPrompt, temperature }) {
  return generateRemoteChatCompletion({
    messages,
    systemPrompt,
    temperature,
  });
}

module.exports = {
  generateChatCompletion,
  generateConversationTitle,
};
