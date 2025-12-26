import React, { useState, useEffect, useRef } from 'react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  Phone, 
  Code2, 
  Cloud, 
  Database, 
  Terminal, 
  Cpu, 
  ChevronRight,
  Menu,
  X,
  Briefcase,
  User,
  Layout,
  Globe,
  Server,
  Zap,
  ShieldCheck,
  Search,
  MessageSquare,
  Send,
  Sparkles,
  ArrowRight,
  Loader2,
  Volume2,
  VolumeX,
  FileText,
  PenTool
} from 'lucide-react';

const apiKey = "";

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: "Hi! I'm Bala's AI assistant. Ask me anything about his 10+ years of experience in MERN, Cloud, or AI." }
  ]);
  const [consultationQuery, setConsultationQuery] = useState("");
  const [consultationResult, setConsultationResult] = useState(null);
  
  // Contact AI State
  const [inquiryCompany, setInquiryCompany] = useState("");
  const [inquiryRole, setInquiryRole] = useState("");
  const [draftedInquiry, setDraftedInquiry] = useState("");

  const chatEndRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = ['home', 'experience', 'skills', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 200 && rect.bottom >= 200;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  // Generic Gemini API caller with backoff
  const callGemini = async (prompt, systemInstruction, model = "gemini-2.5-flash-preview-09-2025", extraConfig = {}) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      ...extraConfig
    };

    let delay = 1000;
    for (let i = 0; i < 5; i++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('API Error');
        return await response.json();
      } catch (err) {
        if (i === 4) throw err;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  // PCM to WAV converter for TTS
  const pcmToWav = (pcmBase64, sampleRate = 24000) => {
    const binaryString = atob(pcmBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 32 + len, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, len, true);

    const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };

  const handleSpeak = async (text) => {
    if (isSpeaking) {
      audioRef.current?.pause();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      const result = await callGemini(
        `Say in a professional, confident tone: ${text}`,
        "You are Bala Shiva Teja Kandimalla. Speak clearly and helpfully.",
        "gemini-2.5-flash-preview-tts",
        {
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }
            }
          }
        }
      );

      const audioData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        const audioUrl = pcmToWav(audioData);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      }
    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || aiLoading) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiLoading(true);

    const systemPrompt = `You are an AI assistant for Bala Shiva Teja Kandimalla, a Sr. MERN/Cloud Developer.
    Context: 10+ years experience. Worked at Charles Schwab, Centene, Target, Boeing, Autodesk.
    Expertise: React 18, Node.js, Next.js, AWS (Bedrock, SageMaker), Microservices (Strangler Pattern), Kubernetes, Kafka.
    Answer questions concisely and professionally.`;

    try {
      const data = await callGemini(userMsg, systemPrompt);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setChatHistory(prev => [...prev, { role: 'ai', text: text }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting. Try again later!" }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleConsultancy = async () => {
    if (!consultationQuery.trim() || aiLoading) return;
    setAiLoading(true);
    setConsultationResult(null);

    const systemPrompt = `You are a Senior Solutions Architect. Suggest a modern, scalable architecture for the user's project idea using Bala's stack (React, Node, AWS). 
    Use markdown formatting and include Frontend, Backend, Database, and Infrastructure sections.`;

    try {
      const data = await callGemini(`Project Idea: ${consultationQuery}`, systemPrompt);
      setConsultationResult(data.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (err) {
      setConsultationResult("Failed to generate architecture.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleDraftInquiry = async () => {
    if (!inquiryCompany || !inquiryRole || aiLoading) return;
    setAiLoading(true);

    const prompt = `Write a formal, engineering-focused inquiry email from a recruiter at ${inquiryCompany} seeking to hire Bala Shiva Teja for a ${inquiryRole} position. 
    Mention his specific expertise in MERN stack and Strangler Pattern. Make it professional and compelling.`;

    try {
      const data = await callGemini(prompt, "You are a professional technical recruiter.");
      setDraftedInquiry(data.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (err) {
      setDraftedInquiry("Error drafting message.");
    } finally {
      setAiLoading(false);
    }
  };

  const experience = [
    {
      company: "Charles Schwab",
      role: "Sr. React/Node.JS Developer",
      period: "2024 – PRESENT",
      location: "Westlake, TX",
      highlights: [
        "Migrating monoliths to Node.js microservices using Strangler Pattern",
        "Generative AI integration with AWS Bedrock & SageMaker",
        "Optimizing React 18 performance with concurrent rendering"
      ],
      tech: ["React 18", "NestJS", "AWS Bedrock", "TypeScript"]
    },
    {
      company: "Centene Corporation",
      role: "Sr. Developer",
      period: "2022 – 2024",
      location: "Saint Louis, MO",
      highlights: [
        "HIPAA-compliant microservices for healthcare data",
        "Event-driven architecture using Kafka & AWS SQS",
        "Modernized legacy Class components to Functional Hooks"
      ],
      tech: ["Next.js", "Kafka", "PostgreSQL", "Azure"]
    },
    {
      company: "Target",
      role: "MERN Stack Developer",
      period: "2019 – 2022",
      location: "Minneapolis, MN",
      highlights: [
        "Kubernetes orchestration for high-traffic retail APIs",
        "Real-time data pipelines with Kafka & Spark Streaming",
        "Server-side rendering (SSR) for SEO optimization"
      ],
      tech: ["MongoDB", "Express", "React", "Node", "K8s"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/40 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              B
            </div>
            <span className="text-lg font-bold tracking-tight text-white hidden sm:block">Bala Shiva Teja</span>
          </div>

          <div className="hidden md:flex items-center space-x-1 bg-white/5 p-1 rounded-full border border-white/10">
            {['home', 'experience', 'skills', 'contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeSection === item ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => setIsChatOpen(true)} className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>Ask AI ✨</span>
            </button>
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 px-6 z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-8">
              Available in Westlake, Texas
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] mb-8 tracking-tighter">
              SR. FULLSTACK <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400">ARCHITECT.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl font-light">
              Designing distributed systems and high-performance UIs. 
              Specializing in <span className="text-white font-medium">MERN Stack</span>, 
              <span className="text-white font-medium"> Cloud Infrastructure</span>, and 
              <span className="text-white font-medium"> AI Integrations</span>.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => scrollTo('experience')} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center shadow-xl shadow-indigo-500/20 group">
                View Experience
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center space-x-3">
                <a href="https://linkedin.com/in/balashivateja-kandimalla" target="_blank" className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all text-white">
                  <Linkedin size={20} />
                </a>
                <a href="mailto:balashivakandimalla@gmail.com" className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all text-white">
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative">
              <div className="bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden shadow-2xl scale-110 -rotate-2">
                <div className="bg-white/5 px-4 py-2 flex items-center space-x-2 border-b border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                  <div className="text-[10px] text-slate-500 font-mono ml-4 uppercase tracking-widest">developer-profile.ts</div>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed">
                  <div className="flex space-x-4">
                    <span className="text-indigo-500">const</span>
                    <span className="text-blue-400">profile</span>
                    <span className="text-white">=</span>
                    <span className="text-white">{"{"}</span>
                  </div>
                  <div className="pl-6 flex space-x-4">
                    <span className="text-slate-500">yearsExp:</span>
                    <span className="text-emerald-400">10,</span>
                  </div>
                  <div className="pl-6 flex space-x-4">
                    <span className="text-slate-500">role:</span>
                    <span className="text-emerald-400">'Sr. Developer',</span>
                  </div>
                  <div className="pl-6 flex space-x-4">
                    <span className="text-slate-500">stacks:</span>
                    <span className="text-white">["MERN", "AWS", "K8s"],</span>
                  </div>
                  <div className="pl-6 flex space-x-4">
                    <span className="text-slate-500">focus:</span>
                    <span className="text-emerald-400">'Scalability',</span>
                  </div>
                  <div className="text-white">{"}"}</div>
                  <div className="mt-4 text-slate-600 italic">// Initializing AI model...</div>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-indigo-500">➜</span>
                    <span className="text-white animate-pulse">_</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Skills Section */}
      <section id="skills" className="py-24 px-6 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-[0.2em]">The Stack</h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4">
            {/* AI Technical Consultant Card */}
            <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                <Sparkles size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-2">Architect AI ✨</h3>
                <p className="text-indigo-100 text-sm mb-6">Input your project idea to see how I would build it.</p>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={consultationQuery}
                      onChange={(e) => setConsultationQuery(e.target.value)}
                      placeholder="e.g. Real-time trading app..."
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all placeholder:text-white/40"
                    />
                    <button 
                      onClick={handleConsultancy}
                      disabled={aiLoading}
                      className="absolute right-2 top-2 p-1.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
                    >
                      {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>

                  {consultationResult && (
                    <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-xs font-mono leading-relaxed max-h-48 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                      {consultationResult}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.05] transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <Cloud size={32} />
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-white mb-1">Cloud & Infrastructure</h3>
                  <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Architecture</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform"].map(t => (
                  <span key={t} className="text-xs font-bold text-slate-400 px-3 py-1 bg-white/5 rounded-full border border-white/5">{t}</span>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.05] transition-all group">
              <Zap className="text-amber-400 mb-4 group-hover:animate-bounce" />
              <h3 className="text-lg font-bold text-white mb-2">Gen AI</h3>
              <p className="text-xs text-slate-500">SageMaker, Bedrock, and LLM integrations.</p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.05] transition-all group">
              <Database className="text-emerald-400 mb-4 group-hover:rotate-12 transition-transform" />
              <h3 className="text-lg font-bold text-white mb-2">Data Mastery</h3>
              <p className="text-xs text-slate-500">PostgreSQL, Redis, MongoDB, and BigQuery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Experience Timeline */}
      <section id="experience" className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">THE JOURNEY</h2>
            <div className="flex items-center space-x-2 text-indigo-400 font-mono text-sm">
              <span className="w-12 h-px bg-indigo-500"></span>
              <span>10+ YEARS IN TECH</span>
            </div>
          </div>

          <div className="space-y-24">
            {experience.map((exp, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute -left-12 top-0 bottom-0 w-px bg-white/10 hidden md:block"></div>
                <div className="absolute -left-14 top-2 w-4 h-4 rounded-full bg-indigo-600 border-4 border-[#030303] z-10 hidden md:block group-hover:scale-150 transition-transform"></div>
                
                <div className="grid md:grid-cols-4 gap-8">
                  <div className="md:col-span-1">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{exp.period}</span>
                    <div className="mt-2 text-white font-bold">{exp.company}</div>
                    <div className="text-xs text-indigo-400/70">{exp.location}</div>
                  </div>
                  <div className="md:col-span-3">
                    <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-indigo-400 transition-colors">{exp.role}</h3>
                    <ul className="space-y-4 mb-8">
                      {exp.highlights.map((h, i) => (
                        <li key={i} className="flex items-start text-slate-400 text-sm leading-relaxed">
                          <span className="text-indigo-500 mr-3 mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"></span>
                          {h}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      {exp.tech.map(t => (
                        <span key={t} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Contact with AI Inquiry Drafter */}
      <section id="contact" className="py-24 px-6 z-10 relative">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-900/40 to-black/40 border border-white/10 rounded-[3rem] p-12 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 blur-[100px] pointer-events-none"></div>
            
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase leading-tight">Let's build the <br />next big thing.</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg font-light mb-8">
                Currently open to leadership roles, senior architectural positions, or innovative contract projects.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="mailto:balashivakandimalla@gmail.com" className="w-full sm:w-auto px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center">
                  <Mail className="mr-3" size={20} /> SEND EMAIL
                </a>
                <a href="tel:+16016212296" className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center">
                  <Phone className="mr-3" size={20} /> (601) 621-2296
                </a>
              </div>
            </div>

            {/* AI Inquiry Drafter Feature ✨ */}
            <div className="max-w-2xl mx-auto pt-12 border-t border-white/10 mt-12">
              <div className="flex items-center space-x-2 mb-6">
                <PenTool className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">AI Inquiry Draftsman ✨</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <input 
                  type="text" 
                  value={inquiryCompany}
                  onChange={(e) => setInquiryCompany(e.target.value)}
                  placeholder="Company Name"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-white"
                />
                <input 
                  type="text" 
                  value={inquiryRole}
                  onChange={(e) => setInquiryRole(e.target.value)}
                  placeholder="Target Role (e.g. Lead Engineer)"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-white"
                />
              </div>
              <button 
                onClick={handleDraftInquiry}
                disabled={aiLoading}
                className="w-full py-3 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold rounded-xl hover:bg-indigo-600/30 transition-all flex items-center justify-center text-xs uppercase tracking-widest disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Draft Personalized Inquiry
              </button>

              {draftedInquiry && (
                <div className="mt-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 relative group">
                  <div className="text-xs text-slate-400 font-serif leading-relaxed italic whitespace-pre-wrap">
                    {draftedInquiry}
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(draftedInquiry)}
                    className="absolute top-4 right-4 text-[10px] font-bold text-indigo-400 hover:text-white uppercase tracking-tighter"
                  >
                    Copy Draft
                  </button>
                </div>
              )}
            </div>

            <div className="mt-16 pt-16 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-black mb-2">Location</div>
                <div className="text-white font-bold text-sm">Westlake, TX</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-black mb-2">Experience</div>
                <div className="text-white font-bold text-sm">10+ Years</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-black mb-2">LinkedIn</div>
                <a href="https://linkedin.com/in/balashivateja-kandimalla" target="_blank" className="text-white font-bold hover:text-indigo-400 text-sm">@balashivateja</a>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-black mb-2">Status</div>
                <div className="text-emerald-400 font-bold text-sm flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                  Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat Drawer with ✨ Voice Support */}
      <div className={`fixed bottom-0 right-0 z-[60] p-6 transition-all duration-500 ${isChatOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="bg-[#0f0f13] border border-white/10 rounded-3xl w-80 md:w-96 shadow-2xl flex flex-col h-[520px] overflow-hidden">
          <div className="bg-indigo-600 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-white">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Digital Twin AI ✨</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/5 border border-white/10 text-slate-300'}`}>
                  {msg.text}
                </div>
                {msg.role === 'ai' && (
                  <button 
                    onClick={() => handleSpeak(msg.text)}
                    className="mt-2 text-[10px] flex items-center space-x-1 text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    <span>{isSpeaking ? "Stop" : "Speak AI Answer ✨"}</span>
                  </button>
                )}
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleChat} className="p-4 border-t border-white/5 bg-black/40">
            <div className="relative">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about my cloud experience..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-white pr-12"
              />
              <button type="submit" disabled={aiLoading} className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors">
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Floating Chat Trigger */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-8 right-8 z-[55] w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group ${isChatOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#030303] rounded-full animate-pulse"></div>
      </button>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center relative z-10">
        <p className="text-slate-600 text-xs font-mono tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Bala Shiva Teja Kandimalla // Engineered for scale.
        </p>
      </footer>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default App;
