import React, { useRef, useEffect, useState } from 'react';
import GenerateButton from './GenerateButton';
import FileUpload from '@/components/ui/file-upload';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Paperclip, Search, Folder, Check, Bot, ChevronDown, Image as ImageIcon, File, Mic } from 'lucide-react';
import AI_Voice from './AI_Voice';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const OPENAI_SVG = (
  <svg
    height="14"
    viewBox="0 0 256 260"
    width="14"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" fill="currentColor"/>
  </svg>
);

const MODEL_ICONS: Record<string, React.ReactNode> = {
  "GPT-5-mini": OPENAI_SVG,
  "Gemini 3": (
    <svg height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gemini-fill" x1="0%" x2="68.73%" y1="100%" y2="30.395%">
          <stop offset="0%" stopColor="#1C7DFF" />
          <stop offset="52.021%" stopColor="#1C69FF" />
          <stop offset="100%" stopColor="#F0DCD6" />
        </linearGradient>
      </defs>
      <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" fill="url(#gemini-fill)" />
    </svg>
  ),
  "Claude 4.5 Sonnet": (
    <svg fill="currentColor" fillRule="evenodd" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
    </svg>
  ),
  "GPT-5-1 Mini": OPENAI_SVG,
  "GPT-5-1": OPENAI_SVG,
  "gpt-oss-120b": OPENAI_SVG,
};

const AI_MODELS = [
  "Llama 4 Maverick",
  "DeepSeek V3.1",
  "DeepSeek V3.2",
  "Qwen3 235B",
  "gpt-oss-120b",
  "Claude 4.5 Sonnet",
  "GPT-5-mini",
  "Whisper-Large-v3",
];
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message?: string, previews?: any[]) => void;
  isGenerating: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
  hasMessages: boolean;
  apiKey?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  onSend, 
  isGenerating, 
  selectedModel, 
  onModelChange, 
  hasMessages,
  apiKey
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showAppendix, setShowAppendix] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<any[]>([]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && (value.trim() || pendingFiles.length > 0)) {
        handleSendClick();
      }
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const marqueeItems = [
    "Create an image",
    "Give me ideas",
    "Write a text",
    "Create a chart",
    "Plan a trip",
    "Help me pick",
    "Write a Python script"
  ];

  const handleMarqueeClick = (item: string) => {
    onChange(item);
  };

  const handleSendClick = () => {
    onSend(value, pendingFiles);
    setPendingFiles([]);
  };

  const removeFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center w-full relative z-10 select-none">
      <AnimatePresence>
        {pendingFiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-wrap gap-2 mb-4 w-full"
          >
            {pendingFiles.map((file, idx) => (
              <div key={idx} className="relative group bg-[#161C2C] border border-white/10 rounded-xl p-2 pr-8 flex items-center gap-2 max-w-[200px]">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  {file.type === 'image' ? <ImageIcon size={14} /> : <File size={14} />}
                </div>
                <span className="text-[10px] text-slate-300 truncate font-medium">{file.name}</span>
                <button 
                  onClick={() => removeFile(idx)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
        
        {showVoice && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-[#161C2C]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-4 mb-4"
          >
            <AI_Voice 
              apiKey={apiKey} 
              onTranscription={(text) => {
                onChange(value + (value ? " " : "") + text);
                setShowVoice(false);
              }} 
            />
            <button 
              onClick={() => setShowVoice(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}

        {showFileUpload && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-[110%] z-[1000] w-full max-w-sm"
          >
            <div className="relative">
              <button 
                onClick={() => setShowFileUpload(false)}
                className="absolute -top-2 -right-2 z-10 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg"
              >
                <X size={14} />
              </button>
                <FileUpload 
                  onUploadSuccess={(file) => {
                    const fileType = file.type.startsWith('image/') ? 'image' : 
                               file.type.includes('pdf') ? 'pdf' : 'text';
                    
                    const fileUrl = fileType === 'image' ? URL.createObjectURL(file) : undefined;
                    
                    setPendingFiles(prev => [...prev, {
                      type: fileType,
                      name: file.name,
                      size: formatBytes(file.size),
                      desc: `Uploaded via FileUpload`,
                      url: fileUrl
                    }]);
                    setShowFileUpload(false);
                  }}
                  className="shadow-2xl"
                />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasMessages && (
        <div className="flex gap-4 mb-4 w-full overflow-hidden mask-marquee">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-4 shrink-0"
          >
              {marqueeItems.concat(marqueeItems).map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleMarqueeClick(item)}
                  className="px-4 py-2 bg-[#161C2C] border border-white/5 rounded-xl text-[#94a3b8] text-xs font-semibold whitespace-nowrap hover:bg-white/5 hover:text-white hover:border-blue-500/30 transition-all active:scale-95"
                >
                  {item}
                </button>
              ))}

          </motion.div>
        </div>
      )}

      <div className="relative w-full bg-[#101624] border border-white/10 rounded-[24px] overflow-hidden shadow-2xl transition-all group focus-within:border-blue-500/50">
        <div className="absolute -top-[9rem] -left-[6rem] w-[15rem] h-[15rem] bg-blue-500/10 blur-[40px] rounded-full pointer-events-none group-focus-within:left-1/2 group-focus-within:-translate-x-1/2 transition-all duration-700" />
        
        <div className="relative flex flex-col p-3 z-10">
          <textarea 
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            rows={1}
            className="w-full min-h-[40px] max-h-[300px] bg-transparent border-none outline-none text-white text-sm leading-relaxed resize-none placeholder:text-slate-600 scrollbar-thin scrollbar-thumb-white/10"
          />

          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-2 relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all text-xs font-medium"
                      )}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedModel}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1.5"
                        >
                          {MODEL_ICONS[selectedModel]}
                          {selectedModel}
                          <ChevronDown size={12} className="opacity-50" />
                        </motion.div>
                      </AnimatePresence>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className={cn(
                      "min-w-[12rem] z-[2000]",
                      "border-white/10 bg-[#0a0f1a] text-slate-200"
                    )}
                  >
                      {AI_MODELS.map((model) => (
                        <DropdownMenuItem
                          className="flex items-center justify-between gap-2 focus:bg-white/5 focus:text-white cursor-pointer"
                          key={model}
                          onSelect={() => onModelChange(model)}
                        >

                        <div className="flex items-center gap-2">
                          {MODEL_ICONS[model] || <Bot size={14} className="opacity-50" />}
                          <span className="text-xs">{model}</span>
                        </div>
                        {selectedModel === model && (
                          <Check size={14} className="text-blue-500" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="mx-1 h-4 w-px bg-white/10 self-center" />

                <button 
                  onClick={() => setShowAppendix(!showAppendix)}
                  className={cn(
                    "p-2 rounded-full border border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all",
                    showAppendix && "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  )}
                >
                  <Paperclip size={18} />
                </button>

                <button 
                  onClick={() => setShowVoice(!showVoice)}
                  className={cn(
                    "p-2 rounded-full border border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all",
                    showVoice && "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  )}
                >
                  <Mic size={18} />
                </button>

                <AnimatePresence>
                  {showAppendix && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="absolute left-full ml-2 flex gap-2 items-center bg-[#0a0f1a]/90 backdrop-blur-md p-1 rounded-full border border-white/10 z-50"
                    >
                      <button 
                        onClick={() => { setShowFileUpload(true); setShowAppendix(false); }}
                        className="p-2 rounded-full bg-slate-800 border border-white/10 text-blue-400 hover:bg-slate-700 transition-all"
                      >
                        <Folder size={18} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>


              <button className="p-2 rounded-full border border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
                <Search size={18} />
              </button>
            </div>

                <div className="flex items-center gap-3">
                  <div className="scale-90 origin-right">
                    <GenerateButton 
                      onClick={handleSendClick}
                      disabled={(!value.trim() && pendingFiles.length === 0) || isGenerating}
                      isGenerating={isGenerating}
                    />
                  </div>
                </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mask-marquee {
          mask-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 0),
            rgba(0, 0, 0, 1) 15%,
            rgba(0, 0, 0, 1) 85%,
            rgba(0, 0, 0, 0)
          );
        }
      `}</style>
    </div>
  );
};

export default ChatInput;
