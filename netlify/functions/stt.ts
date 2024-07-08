import { Handler } from "@netlify/functions";
import { SpeechClient } from '@google-cloud/speech';

const client = new SpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
});

interface RequestBody {
  audioContent: string; // Base64 encoded audio
}

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { audioContent } = JSON.parse(event.body || '{}') as RequestBody;

    const audio = {
      content: audioContent,
    };

    const config = {
      encoding: 'LINEAR16' as const,
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };

    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .join('\n');

    return {
      statusCode: 200,
      body: JSON.stringify({ transcription }),
    };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: "Error transcribing speech" };
  }
};