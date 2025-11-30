"use client";

import { useState } from "react";
import Image from "next/image";
import { Flower2, HelpCircle, Moon, Sun } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import WeeklyHabitTracker from "@/components/WeeklyHabitTracker";
import ProgressViewer from "@/components/ProgressViewer";
import MyPages from "@/components/MyPages";
import AdminIndicator from "@/components/AdminIndicator";

export default function Home() {
  const [isSpringMode, setIsSpringMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showCats, setShowCats] = useState(false);

  const toggleSpringMode = () => {
    setIsSpringMode(!isSpringMode);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const unleashCats = () => {
    setShowCats(!showCats);
  };

  return (
    <div data-theme={isDarkMode ? "dark" : "light"} className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${isDarkMode ? "bg-[#3d2a24]" : "bg-[#d8d4cf]"}`}>
      {/* Bordered frame container - full height */}
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-0">
          <div className={`w-full h-full min-h-screen max-w-[950px] mx-auto overflow-hidden flex flex-col transition-colors duration-500 ${
            isSpringMode ? "bg-[#fffef9]" : isDarkMode ? "bg-[#1a2744]" : "bg-background"
          }`} style={{
            backgroundImage: isSpringMode ? 'none' : isDarkMode ? 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)' : 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '8px 8px',
            borderLeft: '1px solid #a09890',
            borderRight: '1px solid #a09890',
            boxShadow: isSpringMode ? 'none' : isDarkMode ? 'inset 1px 0 0 0 #f5e6d0, inset -1px 0 0 0 #f5e6d0' : 'inset 1px 0 0 0 white, inset -1px 0 0 0 white'
          }}>
            {/* Black and white vertical striped box at top */}
            <div className="w-full h-4" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, black 0px, black 8px, white 8px, white 16px)',
              flexShrink: 0
            }}></div>
            
            {/* Inner padding wrapper */}
            <div className="flex-1 px-2 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4 overflow-hidden">
              {/* Header Section - centered horse only with drop shadow */}
              <div className="mb-2 md:mb-3 flex justify-center">
                <div className="relative h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 flex-shrink-0" style={{
                  filter: 'drop-shadow(0 8px 12px rgba(0, 0, 0, 0.3))'
                }}>
                  <Image 
                    src="/images/profile/horse.png" 
                    alt="Horse Portrait" 
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 192px"
                    priority
                  />
                </div>
              </div>

              {/* Top thin box - separate square and rectangle */}
              <div className="mb-3 md:mb-4 flex items-stretch gap-1">
                <div className="w-4 bg-card divider-box flex items-center justify-center flex-shrink-0 border-3d">
                  <span className="text-[6px] sm:text-[8px]">•</span>
                </div>
                <div className="flex-1 px-2 py-0.5 bg-card divider-box flex items-center border-3d">
                </div>
              </div>

              {/* TOP ROW: My Pages + About Me in outer boxes */}
              <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-3 md:gap-4 overflow-hidden">
                {/* About Me - shows first on mobile (order-1), second on desktop (md:order-2) */}
                <div className="order-1 md:order-2 bg-card outer-card-bg p-2 sm:p-3 overflow-hidden border-3d">
                  <div className="w-full min-w-0 overflow-hidden flex flex-col">
                    {/* Title box for About Me - separate square and rectangle */}
                    <div className="flex items-stretch gap-1 mb-2">
                      <div className="w-4 bg-muted inner-card-grey-muted flex items-center justify-center flex-shrink-0 border-3d">
                        <span className="text-[6px] sm:text-[8px]">•</span>
                      </div>
                      <div className="flex-1 px-2 py-0.5 bg-muted inner-card-grey-muted flex items-center border-3d">
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wide">ABOUT</span>
                      </div>
                    </div>
                    <HeroSection />
                  </div>
                </div>

                {/* My Pages - shows second on mobile (order-2), first on desktop (md:order-1) */}
                <div className="order-2 md:order-1 bg-card outer-card-bg p-2 sm:p-3 overflow-hidden border-3d">
                  <MyPages />
                </div>
              </div>

              {/* BOTTOM ROW: Habit Tracker + Progress Visualization in outer box */}
              <div className="mt-3 md:mt-4 bg-card outer-card-bg p-2 sm:p-3 overflow-hidden border-3d">
                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-3 md:gap-4">
                  {/* LEFT: Title box + Weekly Habit Tracker */}
                  <div className="w-full min-w-0 overflow-hidden flex flex-col">
                    {/* Title box for Habit Tracker - separate square and rectangle */}
                    <div className="flex items-stretch gap-1 mb-2">
                      <div className="w-4 bg-muted inner-card-grey-muted flex items-center justify-center flex-shrink-0 border-3d">
                        <span className="text-[6px] sm:text-[8px]">•</span>
                      </div>
                      <div className="flex-1 px-2 py-0.5 bg-muted inner-card-grey-muted flex items-center justify-between border-3d">
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wide">HABIT TRACKER</span>
                        <div className="relative group">
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-card inner-card-grey border-3d p-2 text-[10px] leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                            I am tracking my habits in public to keep myself accountable
                          </div>
                        </div>
                      </div>
                    </div>
                    <WeeklyHabitTracker />
                  </div>

                  {/* RIGHT: Title box + Progress Viewer */}
                  <div className="w-full min-w-0 overflow-hidden flex flex-col">
                    {/* Title box for Progress Visualization - separate square and rectangle */}
                    <div className="flex items-stretch gap-1 mb-2">
                      <div className="w-4 bg-muted inner-card-grey-muted flex items-center justify-center flex-shrink-0 border-3d">
                        <span className="text-[6px] sm:text-[8px]">•</span>
                      </div>
                      <div className="flex-1 px-2 py-0.5 bg-muted inner-card-grey-muted flex items-center border-3d">
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wide">PROGRESS VISUALIZATION</span>
                      </div>
                    </div>
                    <ProgressViewer />
                  </div>
                </div>
              </div>

              {/* Bottom thin box - separate square and rectangle */}
              <div className="mt-3 md:mt-4 flex items-stretch gap-1">
                <div className="w-4 bg-card divider-box flex items-center justify-center flex-shrink-0 border-3d">
                  <span className="text-[6px] sm:text-[8px]">•</span>
                </div>
                <div className="flex-1 px-2 py-0.5 bg-card divider-box flex items-center border-3d">
                </div>
              </div>

              {/* Flower button and Admin button row */}
              <div className="mt-2 flex justify-between items-center">
                <button
                  onClick={toggleSpringMode}
                  className="transition-colors"
                >
                  <Flower2 className={`h-4 w-4 hover:opacity-80 transition-opacity duration-500 ${
                    isSpringMode ? "text-pink-400" : isDarkMode ? "text-white" : "text-red-500"
                  }`} />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleDarkMode}
                    className="transition-colors hover:opacity-80"
                  >
                    {isDarkMode ? (
                      <Sun className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </button>
                  <AdminIndicator />
                </div>
              </div>
            </div>
            
            {/* Black and white vertical striped box at bottom */}
            <div className="w-full h-4" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, black 0px, black 8px, white 8px, white 16px)',
              flexShrink: 0
            }}></div>
          </div>
        </main>
      </div>
    </div>
  );
}

