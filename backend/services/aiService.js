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

function buildProviderConfig() {
  return {
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || 'gemini-2.5-flash',
    baseUrl: normalizeGeminiBaseUrl(process.env.AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'),
  };
}

function normalizeGeminiBaseUrl(baseUrl) {
  const cleaned = String(baseUrl || '').replace(/\/$/, '');
  if (cleaned.endsWith('/openai')) {
    return cleaned.replace(/\/openai$/, '');
  }

  return cleaned || 'https://generativelanguage.googleapis.com/v1beta';
}

function buildGeminiUrl(baseUrl, model) {
  const safeBaseUrl = normalizeGeminiBaseUrl(baseUrl);
  return `${safeBaseUrl}/models/${encodeURIComponent(model)}:generateContent`;
}

function extractGeminiText(responseData) {
  const parts = responseData?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .filter(Boolean)
    .join('')
    .trim();
}

async function generateGeminiContent({ systemPrompt, userText, temperature, model, baseUrl, apiKey }) {
  const response = await fetch(buildGeminiUrl(baseUrl, model), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userText }],
        },
      ],
      generationConfig: {
        temperature,
        responseMimeType: 'application/json',
      },
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || 'Gemini request failed');
  }

  const text = extractGeminiText(data);
  if (!text) {
    throw new Error('Gemini returned an empty response');
  }

  return {
    content: text,
    model: data.modelVersion || model,
    provider: 'gemini',
    usage: data.usageMetadata || null,
    raw: data,
  };
}

function extractJson(content) {
  if (typeof content !== 'string') {
    return null;
  }

  const trimmed = content.trim();
  const candidates = [trimmed];
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(trimmed.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // continue
    }
  }

  return null;
}

function normalizeScore(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  if (numeric > 10 && numeric <= 100) {
    return Math.max(0, Math.min(10, numeric / 10));
  }

  return Math.max(0, Math.min(10, numeric));
}

function normalizeProjection(value) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value && typeof value === 'object') {
    return Object.values(value)
      .map((entry) => (entry == null ? '' : String(entry).trim()))
      .filter(Boolean)
      .join(' ');
  }

  return String(value || '').trim();
}

async function generateRemoteChatCompletion({ messages, systemPrompt, temperature }) {
  const { apiKey, model, baseUrl } = buildProviderConfig();

  if (!apiKey) {
    return generateDemoChatCompletion({ messages, systemPrompt });
  }

  const finalTemperature = clamp(temperature, 0, 2, 0.7);
  const payloadText = sanitizeMessages(messages)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join('\n\n');

  const geminiResponse = await generateGeminiContent({
    systemPrompt,
    userText: payloadText,
    temperature: finalTemperature,
    model,
    baseUrl,
    apiKey,
  });

  return {
    content: geminiResponse.content,
    model: geminiResponse.model,
    provider: geminiResponse.provider,
    usage: geminiResponse.usage,
  };
}

async function generateConversationTitle({ messages }) {
  const { apiKey, model, baseUrl } = buildProviderConfig();
  const sanitizedMessages = sanitizeMessages(messages).slice(-6);

  if (!apiKey) {
    return generateDemoTitle({ messages });
  }

  let content;
  try {
    const result = await generateGeminiContent({
      systemPrompt: 'Create a short conversation title. Return only the title, no quotes, no markdown, maximum 6 words.',
      userText: sanitizedMessages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join('\n\n'),
      temperature: 0.2,
      model,
      baseUrl,
      apiKey,
    });
    content = result.content.replace(/[\r\n]+/g, ' ').trim();
  } catch {
    return generateDemoTitle({ messages });
  }

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

function buildFallbackInsights(data) {
  const riskLevel = data?.riskLevel?.level || 'moderate';
  const score = Math.max(
    0,
    Math.min(
      10,
      Math.round((data?.diversificationScore || 0) / 10 + (riskLevel === 'low' ? 2 : riskLevel === 'moderate' ? 1 : 0))
    )
  );

  const risks = Array.isArray(data?.warnings) && data.warnings.length
    ? data.warnings.slice(0, 3)
    : ['No major structural issues detected in the current portfolio.'];

  const suggestions = [
    'Rebalance oversized positions to reduce concentration risk.',
    'Add ETFs or broad market funds to improve diversification.',
    'Review each holding for a clear role in the portfolio.',
  ];

  const projection = riskLevel === 'low'
    ? 'Over five years, the portfolio should compound steadily if rebalancing discipline is maintained.'
    : riskLevel === 'conservative'
      ? 'Five-year upside should be reasonable, though gains may be more moderate than a growth-heavy mix.'
      : riskLevel === 'high'
        ? 'Five-year returns are more dependent on the largest holdings, so concentration control is important.'
        : 'Five-year results are sensitive to concentration and market swings; better diversification can improve stability.';

  return {
    score,
    risks,
    suggestions,
    projection,
    keyMistakes: risks,
    improvementSuggestions: suggestions,
    fiveYearOutlook: projection,
    provider: 'fallback',
    aiSource: 'fallback',
  };
}

async function generatePortfolioInsights(data) {
  const { apiKey, model, baseUrl } = buildProviderConfig();
  const structuredData = {
    totalValue: data.totalValue,
    diversificationScore: data.diversificationScore,
    riskLevel: data.riskLevel,
    allocation: data.allocation,
    normalizedHoldings: data.normalizedHoldings,
    marketData: data.marketData,
    warnings: data.warnings,
    futureValueProjection: data.futureValueProjection,
  };

  if (!apiKey) {
    return buildFallbackInsights(structuredData);
  }

  let geminiContent;
  try {
    const result = await generateGeminiContent({
      systemPrompt: [
        'You are Gemini, an AI financial analyst.',
        'Use only the structured portfolio data provided.',
        'Return valid JSON with keys: score, risks, suggestions, projection.',
        'score must be a number from 0 to 10.',
        'risks and suggestions must be arrays of short strings.',
        'projection must be a single concise paragraph string describing a 5-year outlook.',
        'Do not include profit/loss data in your analysis.',
      ].join(' '),
      userText: JSON.stringify({
        portfolioSummary: structuredData,
      }),
      temperature: 0.3,
      model,
      baseUrl,
      apiKey,
    });
    geminiContent = result.content;
  } catch {
    return buildFallbackInsights(structuredData);
  }

  const parsed = extractJson(geminiContent);
  if (!parsed) {
    return buildFallbackInsights(structuredData);
  }

  const risks = Array.isArray(parsed.risks) ? parsed.risks.map(String).filter(Boolean) : [];
  const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String).filter(Boolean) : [];
  const projection = normalizeProjection(parsed.projection);

  return {
    score: normalizeScore(parsed.score),
    risks,
    suggestions,
    projection,
    keyMistakes: risks,
    improvementSuggestions: suggestions,
    fiveYearOutlook: projection,
    provider: model,
    aiSource: 'gemini',
  };
}

module.exports = {
  generateChatCompletion,
  generateConversationTitle,
  generatePortfolioInsights,
};
