import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { appConfig } from "../../config.browser";

const API_PATH = "/api/chat";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function streamAsyncIterator(stream: ReadableStream) {
  const reader = stream.getReader();
  return {
    next() {
      return reader.read();
    },
    return() {
      reader.releaseLock();
      return {
        value: {},
      };
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}

export function useChat() {
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [state, setState] = useState<"idle" | "waiting" | "loading">("idle");
  const [assitantSpeaking, setAssitantSpeaking] = useState(false);

  const recognizeSpeech = useCallback(async (audioBlob: Blob): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        if (base64Audio) {
          try {
            const response = await fetch('/.netlify/functions/stt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioContent: base64Audio }),
            });
            
            if (response.ok) {
              const { transcription } = await response.json();
              resolve(transcription);
            } else {
              reject(new Error('Failed to transcribe speech'));
            }
          } catch (error) {
            console.error('Error calling STT function:', error);
            reject(error);
          }
        } else {
          reject(new Error('Failed to read audio file'));
        }
      };
      reader.readAsDataURL(audioBlob);
    });
  }, []);

  // Lets us cancel the stream
  const abortController = useMemo(() => new AbortController(), []);

  const speechQueue = useRef<SpeechSynthesisUtterance[]>([]);
  const isSpeaking = useRef<boolean>(false);

  //Cancels the current chat and adds the current chat to the history
  function cancel() {
    setState("idle");
    abortController.abort();
    if (currentChat) {
      const newHistory = [
        ...chatHistory,
        { role: "user", content: currentChat } as const,
      ];

      setChatHistory(newHistory);
      setCurrentChat("");
    }
  }

  // Clears the chat history
  function clear() {
    console.log("clear");
    setChatHistory([]);
  }

  //Converts text to speech and plays it
  async function speak(text: string) {
    try {
      setAssitantSpeaking(true);
      const response = await fetch('/.netlify/functions/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (response.ok) {
        const audioData = await response.arrayBuffer();
        const audioBlob = new Blob([audioData], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          setAssitantSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        }

        await audio.play();

      } else {
        throw new Error('Failed to generate speech');
      }
    } catch (error) {
      console.error('Error calling TTS function:', error);
      setAssitantSpeaking(false);
    } 
  }
    
  // Sends a new message to the AI function and streams the response
  const sendMessage = async (
    message: string,
    chatHistory: Array<ChatMessage>,
  ) => {
    if (assitantSpeaking) {
      console.log("Cannot send message while assistant is speaking");
      return;
    }
    setState("waiting");
    let chatContent = "";
    const newHistory = [
      ...chatHistory,
      { role: "user", content: message } as const,
    ];
    setChatHistory(newHistory);
    const body = JSON.stringify({
      messages: newHistory.slice(-appConfig.historyLength),
    });

    const decoder = new TextDecoder();

    const res = await fetch(API_PATH, {
      body,
      method: "POST",
      signal: abortController.signal,
    });

    setCurrentChat("");

    if (!res.ok || !res.body) {
      setState("idle");
      return;
    }

    let fullResponse = "";

    for await (const event of streamAsyncIterator(res.body)) {
      setState("loading");
      const data = decoder.decode(event).split("\n");
      for (const chunk of data) {
        if (!chunk) continue;
        const message = JSON.parse(chunk);
        const content = message?.choices?.[0]?.delta?.content;
        if (content) {
          fullResponse += content;
        }
      }
    }

    setChatHistory((curr) => [
      ...curr,
      { role: "assistant", content: fullResponse } as const,
    ]);

    setCurrentChat(null);

    // Play the assistant's response as speech
    await speak(fullResponse);
    setState("idle"); 
  };

  return { sendMessage, currentChat, chatHistory, cancel, clear, state, speak, assitantSpeaking };
}
