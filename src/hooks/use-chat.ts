import { useMemo, useState, useRef, useEffect } from "react";
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
  function speak(text: string) {
    window.speechSynthesis.cancel(); 
    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = 'en-US'; // Set the language
    speech.volume = 1; // 0 to 1
    speech.rate = 1; // 0.1 to 10
    speech.pitch = 1; // 0 to 2

    // Chrome workaround
    if (window.chrome) {
      const intervalId = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(intervalId);
        } else {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 200);
    }

    return new Promise((resolve) => {
      speech.onend = resolve;
      window.speechSynthesis.speak(speech);
    });

  };

  // Sends a new message to the AI function and streams the response
  const sendMessage = async (
    message: string,
    chatHistory: Array<ChatMessage>,
  ) => {
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

    setCurrentChat("Typing ...");

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
    setState("idle");

    // Play the assistant's response as speech
    await speak(fullResponse);
  };

  return { sendMessage, currentChat, chatHistory, cancel, clear, state, speak };
}
