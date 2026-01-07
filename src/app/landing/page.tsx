"use client";

import Link from 'next/link';
import { Button } from '@heroui/button';
import PromptCard from '@/components/PromptCard';
import { GeminiPrompt } from '@/schema/prompt';
import Logo from '@/components/Logo';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';
import { FaSearch, FaCode, FaPalette, FaBrain, FaUserFriends, FaRocket, FaCheckCircle, FaChevronRight, FaPlay, FaRobot } from "react-icons/fa";
import { SiGoogle } from "react-icons/si";

// Using REAL prompts from the dataset to ensure links work
const FEATURED_PROMPTS: GeminiPrompt[] = [
  {
    id: "hub-coding-pattern-v1",
    title: "Expert Software Architect",
    description: "Transforms messy descriptions into clean, production-ready TypeScript architectures with SOLID principles.",
    modality: ["text"],
    tags: ["coding", "architecture", "typescript"],
    compatibleModels: ["gemini-2.5-flash", "gemini-2.5-pro"],
    stats: { views: 2400, copies: 1200, likes: 342 },
    author: { name: "neverbiasu", platform: "GitHub" },
    contents: [{ role: "user", parts: [{ text: "Act as an expert software architect. Given this requirements document..." }] }]
  },
  {
    id: "b57114c3-c084-4652-82c2-206942ec4c29",
    title: "Hyper-Realistic Studio Photography",
    description: "A specialized prompt for generating professional laboratory-grade fruit and object photography with Nano Banana.",
    modality: ["image"],
    tags: ["image", "photography", "nano"],
    compatibleModels: ["nano-banana-pro-preview"],
    stats: { views: 3200, copies: 1560, likes: 521 },
    author: { name: "NanoBanana", platform: "Twitter" },
    contents: [{ role: "user", parts: [{ text: "{ \"style\": \"studio-macro\", \"lighting\": \"rembrandt\", \"object\": \"organic\" }" }] }]
  },
  {
     id: "2e42e6f0-9d5e-40af-802c-81c3b2587acd",
     title: "Fantasy MUD Dungeon Master",
     description: "Comprehensive prompt defining a DM for a fantasy-themed MUD, including rules, NPC interaction, and lore.",
     modality: ["text"],
     tags: ["roleplay", "game", "mud", "creative"],
     compatibleModels: ["gemini-2.5-pro", "gemini-3-pro-preview"],
     stats: { views: 1500, copies: 320, likes: 89 },
     author: { name: "Google", platform: "Google" },
     contents: [{ role: "user", parts: [{ text: "Act as an interactive AI Dungeon Master for a fantasy MUD..." }] }]
  }
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/hub?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/hub');
    }
  };

  return (
    <div className="bg-black text-white flex flex-col relative overflow-hidden selection:bg-blue-500/30 min-h-screen">
      {/* Minimalist Background */}
      <div className="absolute inset-0 bg-black">
        {/* Subtle Grid - barely visible */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="container mx-auto px-6 z-10 relative min-h-[calc(100vh-64px)] flex flex-col justify-center pt-20">
        
        {/* 1. Hero Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full py-8 lg:py-0">
          
          {/* Left Content: Focus & Search */}
          <div className="flex flex-col justify-center space-y-6 lg:space-y-8 text-left">
            <div className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
               1,819 verified prompts • Ingested from GitHub & Reddit
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-[1.05] text-zinc-100">
                The Open Source Hub for<br />
                <span className="text-white">Gemini & Nano Banana</span>
              </h1>
              
              <p className="text-sm lg:text-base text-zinc-400 max-w-lg leading-relaxed">
                Don't waste tokens. Use our 100% LLM-verified library optimized for <span className="text-zinc-200 font-semibold">Gemini 2.5/3.0</span> and <span className="text-zinc-200 font-semibold">Nano Banana Pro</span>.
              </p>
            </div>

            {/* Direct Utility: Hero Search */}
            <div className="flex flex-col space-y-3 max-w-lg">
              <form onSubmit={handleSearch} className="relative group z-20">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-15 group-hover:opacity-30 transition duration-500 blur-xl"></div>
                <div className="relative flex items-center bg-zinc-900/90 border border-white/10 rounded-full p-1 shadow-2xl backdrop-blur-md">
                  <div className="pl-5 text-zinc-500">
                    <FaSearch className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search image prompts, coding agents..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-200 px-3 py-2.5 placeholder:text-zinc-600 text-sm"
                  />
                  <Button type="submit" className="bg-white text-black font-bold h-10 px-6 rounded-full text-xs hover:bg-zinc-200 transition-colors">
                    Search Hub
                  </Button>
                </div>
              </form>
              
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Coding', link: '/hub?tags=coding' },
                  { name: 'Image Gen', link: '/hub?tags=image' },
                  { name: 'Roleplay', link: '/hub?tags=roleplay' },
                  { name: 'Reasoning', link: '/hub?tags=reasoning' }
                ].map((tag) => (
                  <Link key={tag.name} href={tag.link}>
                    <button className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all text-[9px] text-zinc-400 hover:text-white uppercase font-bold tracking-widest">
                      {tag.name}
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right: POKER STACK */}
          <div className="relative hidden lg:flex items-center justify-center min-h-[450px]">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 to-purple-600/10 blur-[80px] rounded-full"></div>
            
            {/* INTERACTIVE POKER STACK */}
            <motion.div 
               className="relative w-[340px] h-[440px] perspective-1000"
               initial="rest"
               whileHover="hover"
               animate="rest"
            >
               {/* Card 1: Left - Focus on Hover */}
               <motion.div 
                 variants={{
                   rest: { rotate: -12, x: -25, y: 15, scale: 0.82, zIndex: 10, opacity: 0.9, filter: 'blur(0px)' },
                   hover: { rotate: -20, x: -110, y: 30, scale: 0.86, zIndex: 30, opacity: 1, filter: 'blur(0px)' }
                 }}
                 whileHover={{ scale: 0.95, zIndex: 100, rotate: -5, y: -20, transition: { duration: 0.1 } }}
                 transition={{ type: "spring", stiffness: 280, damping: 22 }}
                 className="absolute inset-0 origin-bottom cursor-pointer hover:shadow-2xl hover:shadow-blue-500/20"
               >
                  <PromptCard prompt={FEATURED_PROMPTS[0]} />
               </motion.div>

               {/* Card 2: Center - Focus on Hover */}
               <motion.div 
                 variants={{
                   rest: { rotate: 0, x: 0, y: 0, scale: 0.88, zIndex: 30, opacity: 1 },
                   hover: { rotate: 0, x: 0, y: -25, scale: 0.92, zIndex: 40, opacity: 1 }
                 }}
                 whileHover={{ scale: 0.95, zIndex: 100, y: -50, transition: { duration: 0.1 } }}
                 transition={{ type: "spring", stiffness: 280, damping: 22 }}
                 className="absolute inset-0 origin-bottom cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20"
               >
                  <PromptCard prompt={FEATURED_PROMPTS[1]} />
               </motion.div>

               {/* Card 3: Right - Focus on Hover */}
               <motion.div 
                 variants={{
                   rest: { rotate: 12, x: 25, y: 15, scale: 0.82, zIndex: 10, opacity: 0.9, filter: 'blur(0px)' },
                   hover: { rotate: 20, x: 110, y: 30, scale: 0.86, zIndex: 30, opacity: 1, filter: 'blur(0px)' }
                 }}
                 whileHover={{ scale: 0.95, zIndex: 100, rotate: 5, y: -20, transition: { duration: 0.1 } }}
                 transition={{ type: "spring", stiffness: 280, damping: 22 }}
                 className="absolute inset-0 origin-bottom cursor-pointer hover:shadow-2xl hover:shadow-pink-500/20"
               >
                  <PromptCard prompt={FEATURED_PROMPTS[2]} />
               </motion.div>
            </motion.div>
          </div>

        </div>

        {/* Mobile Display: Horizontal Scroll Recommendation (Outside the 2-col grid) */}
        <div className="lg:hidden flex flex-col space-y-6 py-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold">Recommended</h3>
            <Link href="/hub" className="text-blue-400 text-xs">View All</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
            {FEATURED_PROMPTS.map((p) => (
              <div key={p.id} className="min-w-[280px]">
                <PromptCard prompt={p} />
              </div>
            ))}
          </div>
        </div>

        {/* 2. Model Support Showcase - Highlighting Purpose */}
        <div className="w-full max-w-6xl mx-auto mt-20 mb-32 text-center">
           <p className="text-zinc-500 uppercase text-[10px] font-bold tracking-[0.2em] mb-8">Optimized for Leading Models</p>
           <div className="flex flex-wrap justify-center items-center gap-12 transition-opacity duration-700">
              {/* Gemini 2.5 */}
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-2 shadow-lg shadow-blue-500/20">
                    <svg viewBox="0 0 24 24" className="w-full h-full text-blue-500" fill="currentColor">
                       <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z"></path>
                    </svg>
                 </div>
                 <div className="text-left">
                    <div className="text-sm font-bold text-white leading-none mb-1">Gemini 2.5</div>
                    <div className="text-[10px] text-zinc-500 font-medium">Flash & Pro</div>
                 </div>
              </div>

              <div className="w-px h-8 bg-white/10 hidden md:block" />

              {/* Gemini 3.0 */}
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-2 shadow-lg shadow-purple-500/20">
                    <svg viewBox="0 0 24 24" className="w-full h-full text-purple-500" fill="currentColor">
                       <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z"></path>
                    </svg>
                 </div>
                 <div className="text-left">
                    <div className="text-sm font-bold text-white leading-none mb-1">Gemini 3.0</div>
                    <div className="text-[10px] text-zinc-500 font-medium">Flash & Pro</div>
                 </div>
              </div>

              <div className="w-px h-8 bg-white/10 hidden md:block" />
              
              {/* Nano Banana */}
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/nano-banana.jpeg" alt="Nano Banana" className="w-full h-full object-cover" />
                 </div>
                 <div className="text-left">
                    <div className="text-sm font-bold text-white leading-none mb-1">Nano Banana</div>
                    <div className="text-[10px] text-zinc-500 font-medium">Pro (V3) Ingested</div>
                 </div>
              </div>
           </div>
        </div>
        </div>

      {/* New Container for Below-the-Fold Content */}
      <div className="container mx-auto px-6 z-10 relative pb-20">

        {/* 2.5 Categories Discovery - Visual Grid */}
        <div className="w-full max-w-6xl mx-auto mb-32">
           <div className="flex items-center justify-between mb-10 px-2 text-left">
             <h2 className="text-3xl font-bold text-white tracking-tight">Browse by Intent</h2>
             <Link href="/hub" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
               Open Hub <span aria-hidden="true">&rarr;</span>
             </Link>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Coding Agents', icon: FaCode, count: '450+', color: 'from-blue-500/20', link: '/hub?category=coding' },
                { name: 'Creative Arts', icon: FaPalette, count: '320+', color: 'from-purple-500/20', link: '/hub?category=image' },
                { name: 'Logic & Reasoning', icon: FaBrain, count: '180+', color: 'from-amber-500/20', link: '/hub?category=reasoning' },
                { name: 'Persona/Roleplay', icon: FaUserFriends, count: '240+', color: 'from-emerald-500/20', link: '/hub?category=roleplay' }
              ].map((cat) => (
                <Link key={cat.name} href={cat.link} className="group relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
                  <div className="relative p-8 rounded-3xl bg-zinc-900/40 border border-white/5 group-hover:border-white/20 transition-all">
                    <div className="text-3xl mb-4 transform group-hover:scale-110 transition-transform duration-300 text-zinc-300 group-hover:text-white">
                      <cat.icon />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">{cat.name}</h4>
                    <p className="text-xs text-zinc-500">{cat.count} verified patterns</p>
                  </div>
                </Link>
              ))}
           </div>
        </div>

        {/* 3. Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-32">
           <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Automated Discovery</h3>
              <p className="text-sm text-zinc-400">Scrapers run daily on Reddit & GitHub to find the latest trending prompts.</p>
           </div>
           
           <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">LLM Validated</h3>
              <p className="text-sm text-zinc-400">Every prompt is tested and cleaned by Gemini 2.5 to ensure stability.</p>
           </div>

           <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Instant Run</h3>
              <p className="text-sm text-zinc-400">One-click export to Google AI Studio with all parameters pre-configured.</p>
           </div>
        </div>

        {/* 3.5 The Process - Highlighting "Aggregator" Functionality */}
        <div className="max-w-6xl mx-auto mb-32 relative">
           <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 hidden md:block"></div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="relative z-10 space-y-4">
                 <div className="w-12 h-12 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center mx-auto text-sm font-bold shadow-xl shadow-blue-500/20">01</div>
                 <h4 className="text-sm font-bold text-white uppercase tracking-widest">Aggregate</h4>
                 <p className="text-xs text-zinc-500 leading-relaxed max-w-[240px] mx-auto">Connecting to GitHub, Reddit, and Twitter to scrape raw prompt candidates daily.</p>
              </div>
              <div className="relative z-10 space-y-4">
                 <div className="w-12 h-12 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center mx-auto text-sm font-bold shadow-xl shadow-purple-500/20">02</div>
                 <h4 className="text-sm font-bold text-white uppercase tracking-widest">Audit</h4>
                 <p className="text-xs text-zinc-500 leading-relaxed max-w-[240px] mx-auto">Gemini 2.5 analysis removes news noise, duplicates, and low-quality placeholders.</p>
              </div>
              <div className="relative z-10 space-y-4">
                 <div className="w-12 h-12 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center mx-auto text-sm font-bold shadow-xl shadow-emerald-500/20">03</div>
                 <h4 className="text-sm font-bold text-white uppercase tracking-widest">Deliver</h4>
                 <p className="text-xs text-zinc-500 leading-relaxed max-w-[240px] mx-auto">Structured, tagged, and ready-to-run prompts delivered to the Community Hub.</p>
              </div>
           </div>
        </div>

        {/* 4. Professional Footer */}
        <footer className="border-t border-white/5 pt-16 pb-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 md:col-span-1">
                 <div className="flex items-center gap-2 mb-4">
                   <div className="w-8 h-8 relative">
                      <Logo className="w-full h-full" color="white" />
                   </div>
                   <span className="text-sm font-bold text-white tracking-tight">Awesome Gemini Prompts</span>
                 </div>
                 <p className="text-xs text-zinc-500 leading-relaxed pr-4">
                   Building the definitive collection of high-quality prompts for the next generation of AI models.
                 </p>
              </div>
              
              <div>
                 <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</h4>
                 <ul className="space-y-2 text-xs text-zinc-400">
                    <li><Link href="/hub" className="hover:text-white transition-colors">Prompt Hub</Link></li>
                    <li><Link href="/hub?category=image" className="hover:text-white transition-colors">Image Prompts</Link></li>
                    <li><Link href="https://github.com/neverbiasu/awesome-gemini-prompts/issues/new?template=prompt_submission.yml" target="_blank" className="hover:text-white transition-colors">Submit Prompt</Link></li>
                 </ul>
              </div>

              <div>
                 <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Resources</h4>
                 <ul className="space-y-2 text-xs text-zinc-400">
                    <li><Link href="https://ai.google.dev" className="hover:text-white transition-colors">Gemini API</Link></li>
                    <li><Link href="/about" className="hover:text-white transition-colors">Documentation</Link></li>
                    <li><Link href="https://github.com/neverbiasu/awesome-gemini-prompts" className="hover:text-white transition-colors">GitHub</Link></li>
                    <li><Link href="https://www.reddit.com/r/awesomegeminiprompts/" className="hover:text-white transition-colors text-[#FF4500]">Reddit Community</Link></li>
                 </ul>
              </div>

              <div>
                 <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Legal</h4>
                 <ul className="space-y-2 text-xs text-zinc-400">
                    <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                    <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                    <li><Link href="/LICENSE" className="hover:text-white transition-colors">License</Link></li>
                 </ul>
              </div>
           </div>
           
           <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-zinc-600">
              <p>© 2026 Awesome Gemini Prompts. Released under CC BY-NC-SA 4.0.</p>
              <div className="flex gap-4">
                 <span>Built using Next.js 14</span>
                 <span>Hosted on Vercel</span>
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
}
