import { Bot, MessageCircle, Send, User, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

const FAQ: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["scholarship", "apply", "application", "how"],
    answer:
      'To apply for a scholarship, go to the Scholarships page, find one that matches your profile, and click "Apply". Make sure your profile and documents are complete first.',
  },
  {
    keywords: ["document", "upload", "file", "certificate"],
    answer:
      "You can upload documents on the Documents page. Supported types include marksheets, income certificates, caste certificates, and Aadhaar. Accepted formats: PDF, JPG, PNG.",
  },
  {
    keywords: ["profile", "complete", "update", "edit"],
    answer:
      "Update your profile on the Profile page. A complete profile (name, email, DOB, academics, documents) increases your eligibility for more scholarships.",
  },
  {
    keywords: ["eligibility", "eligible", "qualify", "criteria"],
    answer:
      "Eligibility is checked automatically based on your profile data — percentage, category, and required documents. Open a scholarship to see your eligibility status.",
  },
  {
    keywords: ["resume", "builder", "academic", "career"],
    answer:
      "Use the Resume Builder to add academic records and career achievements. This data is used to auto-fill scholarship applications.",
  },
  {
    keywords: ["status", "track", "application", "submitted"],
    answer:
      "Track your applications on the My Applications page. Statuses include Draft, Submitted, Under Review, Approved, and Rejected.",
  },
  {
    keywords: ["help", "support", "contact", "faq"],
    answer:
      "Visit the Help page for a full FAQ. For further support, contact your institution's scholarship coordinator.",
  },
];

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const entry of FAQ) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.answer;
    }
  }
  return "I'm not sure about that. Try asking about scholarships, documents, eligibility, or your profile. You can also visit the Help page for more information.";
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "bot",
      text: "Hi! I'm your ScholarPath assistant. Ask me about scholarships, documents, eligibility, or anything else!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: new Date(),
    };

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "bot",
      text: getBotResponse(text),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="
          fixed bottom-5 right-5 z-50
          w-13 h-13 rounded-full shadow-lg
          bg-primary text-primary-foreground
          flex items-center justify-center
          hover:bg-primary/90 hover:shadow-xl
          transition-all duration-200 ease-out
          cursor-pointer
          active:scale-95
        "
        style={{ width: 52, height: 52 }}
        aria-label={open ? "Close chatbot" : "Open chatbot"}
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-20 right-5 z-50 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "480px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">ScholarPath Assistant</p>
              <p className="text-xs opacity-75">Always here to help</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer text-white/80 hover:text-white transition-colors duration-150 p-1 rounded-md hover:bg-white/10"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-3 space-y-3"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`
                  w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5
                  ${msg.role === "user" ? "bg-primary/15" : "bg-saffron-100"}
                `}
                >
                  {msg.role === "user" ? (
                    <User className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-saffron-600" />
                  )}
                </div>
                <div
                  className={`
                  max-w-[75%] px-3 py-2 rounded-xl text-sm leading-relaxed
                  ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }
                `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-border p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="
                flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                transition-colors duration-150 cursor-text
                placeholder:text-muted-foreground
              "
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim()}
              className="
                w-9 h-9 rounded-lg bg-primary text-primary-foreground
                flex items-center justify-center shrink-0
                hover:bg-primary/90 transition-all duration-150
                disabled:opacity-40 disabled:cursor-not-allowed
                cursor-pointer active:scale-95
              "
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
