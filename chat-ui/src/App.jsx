import React, { useEffect, useMemo, useRef, useState } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";

const API_BASE = "https://b08152c56e65.ngrok-free.app"; // ← your current tunnel

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const sourceRef = useRef(null);

  // Stable session id across reloads (enables backend conversational memory)
  const sessionId = useMemo(() => {
    const key = "chat_session_id";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
    localStorage.setItem(key, id);
    return id;
  }, []);

  const sendMessage = () => {
    const prompt = input.trim();
    if (!prompt || isStreaming) return;

    // Close any previous stream defensively
    if (sourceRef.current) {
      try { sourceRef.current.close(); } catch {}
      sourceRef.current = null;
    }

    // Add user + assistant placeholder
    setMessages(prev => [
      ...prev,
      { role: "user", content: prompt },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setIsStreaming(true);

    const url =
      `${API_BASE}/stream?session_id=${encodeURIComponent(sessionId)}` +
      `&prompt=${encodeURIComponent(prompt)}`;

    const src = new EventSourcePolyfill(url, {
      headers: { "ngrok-skip-browser-warning": "true" }, // required on free ngrok
      withCredentials: false,
    });
    sourceRef.current = src;

    src.onmessage = (event) => {
      const text = event.data; // don't trim; preserves tokenizer spaces/newlines
      if (text === "[DONE]") {
        try { src.close(); } catch {}
        sourceRef.current = null;
        setIsStreaming(false);
        return;
      }

      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (!last || last.role !== "assistant") {
          updated.push({ role: "assistant", content: text });
        } else {
          updated[updated.length - 1] = { ...last, content: last.content + text };
        }
        return updated;
      });
    };

    src.onerror = (err) => {
      console.error("❌ SSE error:", err);
      try { src.close(); } catch {}
      sourceRef.current = null;
      setIsStreaming(false);
    };
  };

  // Close the stream if the component unmounts
  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        try { sourceRef.current.close(); } catch {}
      }
    };
  }, []);

  const clearChat = async () => {
    try {
      await fetch(
        `${API_BASE}/clear?session_id=${encodeURIComponent(sessionId)}`,
        { method: "POST" }
      );
    } catch (e) {
      console.warn("clear failed:", e);
    }
    setMessages([]);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>💬 Chat Assistant</h1>

      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              backgroundColor: msg.role === "user" ? "#DCF8C6" : "#E6E6E6",
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <b>{msg.role === "user" ? "You" : "Assistant"}:</b> {msg.content}
          </div>
        ))}
      </div>

      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isStreaming}
        />
        <button style={styles.button} onClick={sendMessage} disabled={isStreaming}>
          {isStreaming ? "Streaming..." : "Send"}
        </button>
        <button style={styles.clearButton} onClick={clearChat} disabled={isStreaming}>
          Clear Chat
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  header: { textAlign: "center" },
  chatBox: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "10px",
    height: "300px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    backgroundColor: "#f9f9f9",
  },
  message: {
    padding: "10px",
    borderRadius: "10px",
    maxWidth: "75%",
    wordWrap: "break-word",
  },
  inputContainer: { display: "flex", marginTop: "10px", gap: "10px" },
  input: { flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  clearButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};