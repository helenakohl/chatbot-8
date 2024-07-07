// netlify/functions/speech-to-text.ts

import { Handler } from "@netlify/functions";
import speech from "@google-cloud/speech";

const client = new speech.SpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}'),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { audio } = JSON.parse(event.body || '{}');

    const request = {
      audio: { content: audio },
      config: {
        encoding: "LINEAR16" as const,
        sampleRateHertz: 16000,
        languageCode: "en-US",
      },
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
      ?.map(result => result.alternatives?.[0].transcript)
      .join('\n');

    return {
      statusCode: 200,
      body: JSON.stringify({ transcription }),
    };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: "Error in speech recognition" }) };
  }
};