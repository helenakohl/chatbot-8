import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { App } from "../App";
import { useChat } from "../hooks/use-chat";
import { useSpeechRecognition } from "../hooks/use-speech-recognition";
import { ChatMessage } from "../components/ChatMessage";
import { appConfig } from "../../config.browser";
import WelcomeVideo from "../assets/WelcomeVideo.mp4";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Index() {
  const [message, setMessage] = useState<string>("");
  const { currentChat, chatHistory, sendMessage, cancel, state, clear, speak } = useChat();
  
  const handleSpeechResult = useCallback((transcript: string) => {
    setMessage(transcript.trim());
    sendMessage(transcript.trim(), chatHistory);
  }, [chatHistory, sendMessage]);

  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: (error) => console.error('Speech recognition error:', error),
  });
  
  const currentMessage = useMemo(() => {
    return { content: currentChat ?? "", role: "assistant" } as const;
  }, [currentChat]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat, chatHistory, state]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    focusInput();
  }, [state]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) {
      stopListening();
    }
    await sendMessage(message, chatHistory);
    setMessage("");
  };

  return (
    <App title="BMW AI chat bot">
      <main className="bg-white md:rounded-lg md:shadow-md p-6 w-full h-full flex flex-col">
        <section className="overflow-y-auto flex-grow mb-4 pb-8">
          <div className="flex flex-col space-y-4">
            {chatHistory.length === 0 ? (
              <>
                <div className="flex justify-center items-center h-full">
                  <div className="w-64 h-64 rounded-lg overflow-hidden">
                    <video className="w-full h-full object-cover" autoPlay controls>
                      <source src={WelcomeVideo} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {appConfig.samplePhrases.map((phrase) => (
                    <button
                      key={phrase}
                      onClick={() => {
                        speak(""); // Speak with empty input on button click
                        sendMessage(phrase, chatHistory).then(() => setMessage(""));
                      }}
                      className="bg-gray-100 border-gray-300 border-2 rounded-lg p-4"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <p className="text-sm text-gray-500 mt-5">
                    Built with {" "}
                    <a
                      className="underline"
                      href="https://github.com/ascorbic/daneel"
                    >
                      Daneel
                    </a>
                  </p>
                </div>
              </>
            ) : (
              chatHistory.map((chat, i) => (
                <ChatMessage key={i} message={chat} />
              ))
            )}

            {currentChat ? <ChatMessage message={currentMessage} /> : null}
          </div>

          <div ref={bottomRef} />
        </section>

        <section className="bg-gray-100 rounded-lg p-2">
          <form className="flex" onSubmit={handleSendMessage}>
            <input
              type="text"
              ref={inputRef}
              className="w-full rounded-l-lg p-2 outline-none"
              placeholder={isListening ? "Listening..." : "Type your message..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isListening || state !== "idle"}
            />
            <button
              className={`${isListening ? 'bg-red-500' : 'bg-blue-500'} text-white font-bold py-2 px-4`}
              type="button"
              onClick={() => isListening ? stopListening() : startListening()}
            >
              {isListening ? 'Stop' : 'Speak'}
            </button>
            <button
              className="bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg"
              type="submit"
              disabled={isListening || state !== "idle"}
            >
              Send
            </button>
          </form>
        </section>
      </main>
    </App>
  );
}