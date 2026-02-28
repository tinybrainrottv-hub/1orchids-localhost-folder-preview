"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Plus, 
  Settings, 
  Image as ImageIcon, 
  FileText, 
  File, 
  Trash2,
  Sparkles,
  ArrowUpRight,
  Zap,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LightRays from "@/components/LightRays";
import ChatInput from "@/components/ChatInput";
import FormattedMessage from "@/components/FormattedMessage";
import AnimatedBadge from "@/components/ui/animated-badge";
import { EyeCatchingButton_v1 } from "@/components/ui/eye-catching-button";
import ThemeToggle from "@/components/ui/theme-toggle";

interface FilePreview {
  type: "image" | "text" | "pdf";
  name: string;
  size: string;
  desc: string;
  url?: string;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  previews?: FilePreview[];
}

interface ChatSession {
  id: number;
  title: string;
  messages: Message[];
}

export default function AnmixDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Llama 4 Maverick");
  const scrollRef = useRef<HTMLDivElement>(null);

  const SAMBANOVA_API_KEY = "bb81ac20-c159-4341-b8d5-12a9fe069bce";

  const SAMBANOVA_MODELS: Record<string, string> = {
    "Llama 4 Maverick": "Llama-4-Maverick-17B-128E-Instruct",
    "DeepSeek V3.1": "DeepSeek-V3.1",
    "DeepSeek V3.2": "DeepSeek-V3.2",
    "Qwen3 235B": "Qwen3-235B",
    "gpt-oss-120b": "gpt-oss-120b",
    "Whisper-Large-v3": "Whisper-Large-v3",
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = (instant = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: instant ? "auto" : "smooth" });
    }
  };

  useEffect(() => {
    // Scroll twice to ensure it catches layout updates
    scrollToBottom();
    const timeout = setTimeout(() => scrollToBottom(), 100);
    return () => clearTimeout(timeout);
  }, [messages, isTyping]);

  const handleSendMessage = async (customMsg?: string, previews?: FilePreview[]) => {
    if (isTyping) return;
    const messageToSend = customMsg || input;
    if (!messageToSend.trim() && !previews) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: messageToSend,
      previews: previews,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    
    setIsTyping(true);

    // Initial scroll when sending
    setTimeout(() => scrollToBottom(true), 0);

    // If using a SambaNova model, call the API
    const sambaModelId = SAMBANOVA_MODELS[selectedModel];
    if (sambaModelId) {
      try {
        const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SAMBANOVA_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: sambaModelId,
            messages: [
              ...messages.map(m => ({ role: m.role, content: m.content })),
              { role: "user", content: messageToSend }
            ],
            stream: true
          })
        });

        if (!response.ok) throw new Error("API call failed");

        const assistantMsgId = Date.now() + 1;
        setMessages(prev => [...prev, {
          id: assistantMsgId,
          role: "assistant",
          content: "",
        }]);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";
        let buffer = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const cleanedLine = line.trim();
              if (cleanedLine.startsWith("data: ") && cleanedLine !== "data: [DONE]") {
                try {
                  const data = JSON.parse(cleanedLine.slice(6));
                  const content = data.choices[0].delta?.content || "";
                  fullContent += content;
                  
                  setMessages(prev => prev.map(m => 
                    m.id === assistantMsgId ? { ...m, content: fullContent } : m
                  ));
                } catch (e) {
                  // Ignore parse errors for incomplete chunks
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("SambaNova API Error:", error);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: "assistant",
          content: "Error: Failed to get response from SambaNova. Please try again later."
        }]);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    // Simulate AI Response for other models
    setTimeout(() => {
      const responses = [
        "I've analyzed your request and I'm ready to help. What specific details would you like to explore first?",
        "That's an interesting perspective. Based on current trends, we could approach this from several angles.",
        "Understood. I'm processing that information now. Would you like me to generate a summary or dive deeper into the technical aspects?",
        "I can certainly help with that. Here's what I've found so far...",
      ];
      
      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
      };

      if (Math.random() > 0.7) {
        assistantMsg.previews = [
          { type: "image", name: "generated-asset.png", size: "1.2 MB", desc: "AI generated visual." },
          { type: "text", name: "notes.md", size: "2 KB", desc: "Extracted insights." }
        ];
      }

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const clearChat = () => {
    setIsTyping(false);
    if (messages.length > 0) {
      const newSession: ChatSession = {
        id: Date.now(),
        title: messages[0].role === "user" ? messages[0].content.slice(0, 30) : "New Chat",
        messages: [...messages]
      };
      setChatHistory(prev => [newSession, ...prev]);
    }
    setMessages([]);
  };

  const loadChat = (session: ChatSession) => {
    setMessages(session.messages);
  };

  return (
    <div className="flex h-screen text-foreground bg-background font-sans selection:bg-blue-500/30 overflow-hidden relative transition-colors duration-500">
      
      {/* BACKGROUND LIGHT RAYS */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor="#4f46e5"
          raysSpeed={1.5}
          lightSpread={2.5}
          rayLength={3.5}
          followMouse={true}
          mouseInfluence={0.05}
          noiseAmount={0.02}
          distortion={0.1}
          pulsating={true}
          fadeDistance={1.2}
          saturation={0.6}
        />
      </div>

      {/* FIXED GRADIENT OVERLAYS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      {/* LEFT SIDEBAR */}
      <aside className="w-72 flex flex-col z-20 bg-black/40 border-r border-white/5 backdrop-blur-3xl m-3 rounded-3xl">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <img src="/anmix-logo.png" alt="ANMIX Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white">ANMIX</h1>
            <p className="text-[10px] text-blue-400/80 font-bold tracking-[0.2em] uppercase">Neural OS</p>
          </div>
        </div>

        <div className="px-6 mb-6">
          <button 
            onClick={clearChat}
            className="w-full bg-blue-600 hover:bg-blue-500 transition-all p-3.5 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Plus size={18} />
            <span>New Neural Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1 scrollbar-hide">
          <div className="flex items-center justify-between px-4 mb-4 mt-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Workspace</p>
            <Sparkles size={12} className="text-blue-500" />
          </div>
          {chatHistory.length > 0 ? (
            chatHistory.map((chat) => (
              <button 
                key={chat.id} 
                onClick={() => loadChat(chat)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all text-left group"
              >
                <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-blue-400 transition-colors shrink-0" />
                <span className="truncate text-xs text-slate-400 group-hover:text-slate-100 font-medium">{chat.title}</span>
              </button>
            ))
          ) : (
            <p className="text-[10px] text-slate-600 italic px-4">No past chats yet</p>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20">
            <p className="text-xs font-bold text-slate-200 mb-1">Upgrade to Pro</p>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-3">Access GPT-5 & Claude 4 models instantly.</p>
            <button className="w-full py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 transition-colors">
              Upgrade Now
            </button>
          </div>

            <div 
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 cursor-pointer transition-all hover:border-white/20 group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden relative shadow-lg">
                <img src="/anmix-logo.png" alt="User" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#161C2C] rounded-full" />
              </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">Alex Rivera</p>
                  <p className="text-[10px] text-slate-500 font-medium">Neural Explorer</p>
                </div>
              </div>

        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden bg-transparent">
        <header className="h-20 flex items-center justify-center px-10 relative">
          <div className="absolute left-10 flex items-center gap-4 group cursor-pointer opacity-0 pointer-events-none">
            {/* Kept structure but hidden to maintain layout balance or for future use if needed, but user said REMOVE */}
          </div>
          
          <div className="flex justify-center items-center w-full">
            <AnimatedBadge
              text="Introducing ANMIX AI"
              color="#22d3ee"
              href="/docs/components/animated-badge"
            />
          </div>
          
          <div className="absolute right-10 flex items-center gap-4">
            <button className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:border-white/10 transition-all">
              <Sparkles size={18} />
            </button>
            <button 
              onClick={clearChat}
              className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Clear current chat"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </header>

          <div ref={scrollRef} className={`flex-1 ${messages.length === 0 ? 'overflow-hidden' : 'overflow-y-auto scrollbar-hide scroll-smooth'}`}>
            <div className={`max-w-4xl mx-auto px-4 py-2 space-y-1.5 ${messages.length === 0 ? 'h-full flex flex-col justify-center' : ''}`}>

            <AnimatePresence mode="wait">
              {messages.length === 0 ? (
                <motion.div 
                  key="welcome-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                  className="flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="relative group">
                    <div className="absolute -inset-8 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700 animate-pulse" />
                    <img 
                      src="/anmix-logo.png" 
                      alt="Anmix" 
                      className="w-24 h-24 md:w-28 md:h-28 relative z-10 drop-shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-transform duration-500 group-hover:scale-105 object-contain"
                    />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight">
                      Good morning, <span className="relative inline-block">
                        Saify
                        <svg className="absolute -bottom-1 left-0 w-full opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                          <path d="M0 5 Q 50 12 100 5" stroke="#3b82f6" strokeWidth="2" fill="transparent" strokeLinecap="round" />
                        </svg>
                      </span>
                    </h2>
                    <p className="text-blue-400/60 font-medium tracking-[0.2em] uppercase text-xs">ANMIX AI</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="message-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {messages.map((msg) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      key={msg.id} 
                      className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center border ${
                        msg.role === "assistant" 
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 border-white/20 text-white shadow-[0_0_8px_rgba(59,130,246,0.3)]" 
                        : "bg-white/5 border-white/10 text-slate-400 backdrop-blur-xl"
                      }`}>
                        {msg.role === "assistant" ? <Zap size={10} /> : <User size={10} />}
                      </div>
                      
                      <div className={`flex-1 space-y-1 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                        {msg.content && (
                          <div className={`inline-block text-[11px] leading-relaxed max-w-[90%] selection:bg-blue-500/50 ${
                            msg.role === "user" 
                            ? "text-slate-100 bg-blue-600/20 border border-blue-500/30 px-2.5 py-1.5 rounded-lg rounded-tr-none shadow-md backdrop-blur-md" 
                            : "text-slate-200 bg-white/[0.04] border border-white/10 px-4 py-3 rounded-lg rounded-tl-none shadow-sm backdrop-blur-md w-full"
                          }`}>
                            <FormattedMessage content={msg.content} role={msg.role} />
                          </div>
                        )}

                        {msg.previews && (
                          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 ${msg.role === "user" ? "justify-items-end" : ""}`}>
                            {msg.previews.map((file, fIdx) => (
                              <div 
                                key={fIdx} 
                                className="bg-white/5 rounded-xl p-2.5 flex flex-col gap-2.5 border border-white/10 hover:border-blue-500/40 transition-all cursor-pointer group backdrop-blur-xl shadow-md max-w-xs"
                              >
                                {file.type === "image" && file.url ? (
                                  <div className="w-full h-32 rounded-lg overflow-hidden bg-white/5 border border-white/10 mb-1">
                                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                      file.type === "image" ? "bg-blue-500/20 text-blue-400" :
                                      file.type === "text" ? "bg-emerald-500/20 text-emerald-400" :
                                      "bg-amber-500/20 text-amber-400"
                                    }`}>
                                      {file.type === "image" && <ImageIcon size={18} />}
                                      {file.type === "text" && <FileText size={18} />}
                                      {file.type === "pdf" && <File size={18} />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[10px] font-black truncate text-slate-200 uppercase tracking-tighter">{file.name}</p>
                                      <p className="text-[8px] text-slate-500 font-bold">{file.size}</p>
                                    </div>
                                    <ArrowUpRight size={12} className="text-slate-600 group-hover:text-blue-400 transition-all" />
                                  </div>
                                )}
                                {file.type === "image" && file.url && (
                                  <div className="flex items-center justify-between px-1">
                                    <p className="text-[9px] font-bold text-slate-300 truncate tracking-tighter uppercase">{file.name}</p>
                                    <ArrowUpRight size={10} className="text-slate-500" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div 
                      key="typing-indicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center border bg-blue-600/20 border-blue-500/30 text-blue-400">
                        <Zap size={14} className="animate-pulse" />
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1 h-1 bg-fuchsia-500 rounded-full animate-bounce" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-4" />

          </div>
        </div>

        <div className="pb-10 px-10">
          <div className="max-w-4xl mx-auto relative group">
            <ChatInput 
              value={input}
              onChange={setInput}
              onSend={handleSendMessage}
              isGenerating={isTyping}
              selectedModel={selectedModel}
              onModelChange={(model) => {
                setSelectedModel(model);
              }}
              hasMessages={messages.length > 0}
              apiKey={SAMBANOVA_API_KEY}
            />
            
            <p className="text-[10px] text-center text-slate-600 mt-6 uppercase tracking-[0.3em] font-black opacity-50">
              anmix ai can makes mistake so double check it.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
