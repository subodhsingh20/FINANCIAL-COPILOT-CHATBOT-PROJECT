function getLastUserMessage(messages = []) {
  return [...messages].reverse().find((message) => message.role === 'user')?.content?.trim() || '';
}

function getDemoReply(userMessage, systemPrompt) {
  const normalized = userMessage.toLowerCase();

  if (!userMessage) {
    return 'I did not receive a message. Ask me anything and I will do my best to help.';
  }

  if (normalized.includes('code') || normalized.includes('bug') || normalized.includes('error')) {
    return [
      'Here is a practical way to tackle that problem:',
      '1. Share the failing code path or exact error.',
      '2. Reproduce the issue with the smallest possible example.',
      '3. Check inputs, network calls, and state transitions around the failure.',
      '4. Add logging around the suspicious branch before changing behavior.',
      '',
      'If you want, paste the code and I can help debug it step by step.',
    ].join('\n');
  }

  if (normalized.includes('plan') || normalized.includes('roadmap')) {
    return [
      'Here is a clean roadmap you can follow:',
      '1. Clarify the user outcome.',
      '2. Build the smallest working version.',
      '3. Add reliability and polish.',
      '4. Measure usage and improve the weak spots.',
      '',
      'Tell me the product area and I can turn this into a concrete implementation plan.',
    ].join('\n');
  }

  return [
    `Demo mode is active, so this reply is generated locally instead of by a remote AI model.`,
    '',
    `Your message: "${userMessage}"`,
    '',
    `System prompt in use: "${systemPrompt}"`,
    '',
    'Add `AI_API_KEY` and `AI_MODEL` to `backend/.env` to enable real AI responses through the backend chat route.',
  ].join('\n');
}

async function generateDemoChatCompletion({ messages, systemPrompt }) {
  const userMessage = getLastUserMessage(messages);

  return {
    content: getDemoReply(userMessage, systemPrompt),
    model: 'demo-assistant',
    provider: 'demo',
    usage: null,
  };
}

async function generateDemoTitle({ messages }) {
  const userMessage = getLastUserMessage(messages);
  if (!userMessage) {
    return 'New chat';
  }

  return userMessage
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 5)
    .join(' ');
}

module.exports = {
  generateDemoChatCompletion,
  generateDemoTitle,
};
