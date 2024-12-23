import { useState, useMemo, useEffect, useRef } from "react";
import { App } from "../App";
import { useChat } from "../hooks/use-chat";
import { ChatMessage } from "../components/ChatMessage";
import { appConfig } from "../../config.browser";
import { Welcome } from "../components/Welcome";

export default function Index() {
  const [message, setMessage] = useState<string>("");
  const [showBMWButton, setShowBMWButton] = useState(false);
  const { currentChat, chatHistory, sendMessage, cancel, state, clear } = useChat();
  const currentMessage = useMemo(() => ({ content: currentChat ?? "", role: "assistant" } as const), [currentChat]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat, chatHistory, state]);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    const assistantMessageCount = chatHistory.filter((msg) => msg.role === "assistant").length;
    setShowBMWButton(assistantMessageCount >= 3);
  }, [chatHistory]);

  useEffect(() => {
    focusInput();
  }, [state]);

  const focusInput = () => inputRef.current?.focus();

  return (
    <App title="BMW AI chat bot">
      <main className="bg-white md:rounded-lg md:shadow-md p-6 w-full h-full flex flex-col">
        <section className="overflow-y-auto flex-grow mb-4 pb-4">
          <div className="flex flex-col space-y-4">
            {chatHistory.length === 0 ? (
              <>
                <Welcome />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {appConfig.samplePhrases.map((phrase) => (
                    <button
                      key={phrase}
                      onClick={() => sendMessage(phrase, chatHistory)}
                      className="bg-gray-100 border-gray-300 border-2 rounded-lg p-4"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              chatHistory.map((chat, i) => <ChatMessage key={i} message={chat} />)
            )}

            {currentChat ? <ChatMessage message={currentMessage} /> : null}
          </div>
          <div ref={bottomRef} />
        </section>
        {showBMWButton && (
          <div className="mb-4 flex justify-center">
            <a
              href="https://www.bmwusa.com/all-bmws.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
              onClick={() => {
                const userId = localStorage.getItem('chatUserId'); 
                if (!userId) {
                  console.error('User ID not found');
                  return;
                }
                fetch('/.netlify/functions/logButton', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userId: userId
                  }),
                })
                  .then((response) => {
                    if (!response.ok) {
                      console.error('Failed to log button click');
                    }
                  })
                  .catch((error) => console.error('Error logging button click:', error));
              }}
            >
              Get more Information
            </a>
          </div>
        )}
        <section className="bg-gray-100 rounded-lg p-2">
          <form
            className="flex"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(message, chatHistory);
              setMessage("");
            }}
          >
            {chatHistory.length > 1 ? (
              <button
                className="bg-gray-100 text-gray-600 py-2 px-4 rounded-l-lg"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  clear();
                  setMessage("");
                }}
              >
                Clear
              </button>
            ) : null}
            <input
              type="text"
              ref={inputRef}
              className="w-full rounded-l-lg p-2 outline-none"
              placeholder={state === "idle" ? "Type your message..." : "..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={state !== "idle"}
            />
            {state === "idle" ? (
              <button
                className="bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg"
                type="submit"
              >
                Send
              </button>
            ) : null}
          </form>
        </section>
      </main>
    </App>
  );
}
