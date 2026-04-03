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

async function generateRemoteChatCompletion({ messages, systemPrompt, temperature }) {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');

  if (!apiKey) {
    return generateDemoChatCompletion({ messages, systemPrompt });
  }

  const finalTemperature = clamp(temperature, 0, 2, 0.7);
  const payloadMessages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...sanitizeMessages(messages),
  ];

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: finalTemperature,
      messages: payloadMessages,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && baseUrl.includes('api.openai.com')) {
      throw new Error('AI authentication failed. If this is not an OpenAI API key, set the correct AI_BASE_URL and provider-compatible model in backend/.env.');
    }

    throw new Error(data?.error?.message || data?.message || 'Remote AI request failed');
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI provider returned an empty response');
  }

  return {
    content,
    model: data.model || model,
    provider: baseUrl,
    usage: data.usage || null,
  };
}

async function generateConversationTitle({ messages }) {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const sanitizedMessages = sanitizeMessages(messages).slice(-6);

  if (!apiKey) {
    return generateDemoTitle({ messages });
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: 'Create a short conversation title. Return only the title, no quotes, no markdown, maximum 6 words.',
        },
        ...sanitizedMessages,
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return generateDemoTitle({ messages });
  }

  const content = data?.choices?.[0]?.message?.content?.replace(/[\r\n]+/g, ' ').trim();
  if (!content) {
    return generateDemoTitle({ messages });
  }

  return content.split(' ').slice(0, 6).join(' ');
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
