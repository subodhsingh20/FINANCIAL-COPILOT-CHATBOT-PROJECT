const express = require('express');

const router = express.Router();

const WATSON_STT_APIKEY = process.env.WATSON_STT_APIKEY;
const WATSON_STT_URL = process.env.WATSON_STT_URL;
const WATSON_STT_MODEL = process.env.WATSON_STT_MODEL || 'en-US_BroadbandModel';

function isWatsonConfigured() {
  return Boolean(WATSON_STT_APIKEY && WATSON_STT_URL);
}

function extractTranscript(payload) {
  const segments = Array.isArray(payload?.results) ? payload.results : [];
  return segments
    .map((segment) => {
      const alternatives = Array.isArray(segment?.alternatives) ? segment.alternatives : [];
      const bestAlternative = alternatives.reduce((best, current) => {
        if (!best) {
          return current;
        }

        const bestConfidence = typeof best.confidence === 'number' ? best.confidence : -1;
        const currentConfidence = typeof current.confidence === 'number' ? current.confidence : -1;
        return currentConfidence > bestConfidence ? current : best;
      }, alternatives[0] || null);

      return bestAlternative?.transcript || '';
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

router.post(
  '/transcribe',
  express.raw({
    type: ['audio/webm', 'audio/webm;codecs=opus', 'audio/ogg', 'audio/wav', 'application/octet-stream'],
    limit: '10mb',
  }),
  async (req, res) => {
    try {
      if (!isWatsonConfigured()) {
        return res.status(503).json({
          code: 'WATSON_NOT_CONFIGURED',
          message: 'IBM Watson Speech to Text is not configured on the backend',
        });
      }

      if (!req.body || !Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({ message: 'No audio data received' });
      }

      const authHeader = `Basic ${Buffer.from(`apikey:${WATSON_STT_APIKEY}`).toString('base64')}`;
      const query = new URLSearchParams({
        model: WATSON_STT_MODEL,
        smart_formatting: 'true',
        timestamps: 'true',
        max_alternatives: '3',
      });

      const watsonResponse = await fetch(
        `${WATSON_STT_URL.replace(/\/$/, '')}/v1/recognize?${query.toString()}`,
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': req.headers['content-type'] || 'application/octet-stream',
            Accept: 'application/json',
          },
          body: req.body,
        }
      );

      const rawBody = await watsonResponse.text().catch(() => '');
      let data = {};
      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        data = { raw: rawBody };
      }
      if (!watsonResponse.ok) {
        const message = data.error || data.message || data.reason || data.raw || 'Watson transcription failed';
        return res.status(watsonResponse.status).json({
          code: 'WATSON_TRANSCRIBE_FAILED',
          message,
          details: data,
        });
      }

      const transcript = extractTranscript(data);
      const alternatives = Array.isArray(data?.results)
        ? data.results.flatMap((result) => Array.isArray(result?.alternatives) ? result.alternatives : [])
        : [];
      return res.json({
        transcript,
        alternatives,
        raw: data,
      });
    } catch (error) {
      console.error('Voice transcription failed:', error);
      return res.status(error.status || 500).json({
        message: error.message || 'Unable to transcribe audio',
      });
    }
  }
);

module.exports = router;
