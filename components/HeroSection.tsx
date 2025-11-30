"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, Mail, Twitter, Instagram, Music, Edit, Heart, Copy, Check } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { checkAdmin } from "@/lib/auth";
import { getCurrentSong, updateCurrentSong, SongSetting } from "@/lib/db/settings";

const links = [
  {
    name: "Substack",
    url: "https://substack.com/@capitolcitizen",
    icon: ExternalLink,
  },
  {
    name: "Instagram",
    url: "https://instagram.com/capitolcitizen",
    icon: Instagram,
  },
  {
    name: "Twitter/X",
    url: "https://twitter.com/feliciamtang",
    icon: Twitter,
  },
  {
    name: "Email",
    url: "#",
    icon: Mail,
  },
];

const defaultSong: SongSetting = {
  title: "Don't Look Back in Anger",
  artist: "Oasis",
  albumCover: "/dontlookbackinanger.jpg",
  spotifyUrl: "https://open.spotify.com/track/7CVYxHq1L0Z4G84jTDS6Jl",
};

export default function HeroSection() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [song, setSong] = useState<SongSetting>(defaultSong);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [editForm, setEditForm] = useState<SongSetting>(defaultSong);
  const [showCats, setShowCats] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsAdmin(checkAdmin());
    // Load song from Supabase
    getCurrentSong().then((songData) => {
      setSong(songData);
      setEditForm(songData);
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateCurrentSong(editForm);
    if (success) {
    setSong(editForm);
    setIsEditOpen(false);
    }
    setIsSaving(false);
  };

  const unleashCats = () => {
    setShowCats(!showCats);
  };

  const copyToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <Card className="flex flex-col h-auto min-h-[250px] overflow-hidden">
      <CardContent className="flex-1 flex flex-col p-1.5 sm:p-2 md:p-3 overflow-auto min-w-0">
        <div className="flex-1 min-w-0">
          <h1 className="mb-1 sm:mb-2 text-xl sm:text-2xl md:text-3xl tracking-tight truncate" style={{ fontFamily: '"Great Vibes", "Pinyon Script", cursive', lineHeight: '1.4' }}>
            Felicia Tang
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-2 sm:mb-3">
            welcome 2 my digi garden! &lt;3 wanna{" "}
            <button
              onClick={unleashCats}
              className="text-primary hover:text-primary/80 underline font-semibold transition-colors"
            >
              unleash the cats
            </button>
            ? 😼
          </p>
          
          {/* Cats overlay */}
          {showCats && (
            <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
              {/* Cat 1 - Miyuki */}
              <div
                className="absolute"
                style={{
                  width: '80px',
                  height: '80px',
                  animation: 'moveCat1 15s linear infinite',
                }}
              >
                <img src="/miyuki.png" alt="Miyuki cat" className="w-full h-full object-contain" />
              </div>
              {/* Cat 2 - Seasame */}
              <div
                className="absolute"
                style={{
                  width: '80px',
                  height: '80px',
                  animation: 'moveCat2 12s linear infinite',
                }}
              >
                <img src="/seasame.png" alt="Seasame cat" className="w-full h-full object-contain" />
              </div>
              {/* Goldfish */}
              <div
                className="absolute"
                style={{
                  width: '60px',
                  height: '60px',
                  animation: 'moveGoldfish 18s linear infinite',
                }}
              >
                <img src="/goldfish.png" alt="Goldfish" className="w-full h-full object-contain" />
              </div>
              <style jsx>{`
                @keyframes moveCat1 {
                  0% {
                    left: -120px;
                    top: 15%;
                    transform: scaleX(1);
                  }
                  25% {
                    left: 100%;
                    top: 15%;
                    transform: scaleX(1);
                  }
                  25.01% {
                    transform: scaleX(-1);
                  }
                  50% {
                    left: -120px;
                    top: 55%;
                    transform: scaleX(-1);
                  }
                  50.01% {
                    transform: scaleX(1);
                  }
                  75% {
                    left: 100%;
                    top: 55%;
                    transform: scaleX(1);
                  }
                  75.01% {
                    transform: scaleX(-1);
                  }
                  100% {
                    left: -120px;
                    top: 15%;
                    transform: scaleX(-1);
                  }
                }
                @keyframes moveCat2 {
                  0% {
                    left: 100%;
                    top: 35%;
                    transform: scaleX(-1);
                  }
                  33% {
                    left: -100px;
                    top: 35%;
                    transform: scaleX(-1);
                  }
                  33.01% {
                    transform: scaleX(1);
                  }
                  66% {
                    left: 100%;
                    top: 75%;
                    transform: scaleX(1);
                  }
                  66.01% {
                    transform: scaleX(-1);
                  }
                  100% {
                    left: -100px;
                    top: 35%;
                    transform: scaleX(-1);
                  }
                }
                @keyframes moveGoldfish {
                  0% {
                    left: -80px;
                    top: 85%;
                    transform: scaleX(1);
                  }
                  50% {
                    left: 100%;
                    top: 85%;
                    transform: scaleX(1);
                  }
                  50.01% {
                    transform: scaleX(-1);
                  }
                  100% {
                    left: -80px;
                    top: 85%;
                    transform: scaleX(-1);
                  }
                }
              `}</style>
            </div>
          )}
          
          {/* Current Song Card */}
          <div className="mb-2 sm:mb-3 overflow-hidden now-playing-card">
            <div className="flex items-center gap-2 p-2 now-playing-header">
              <Music className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-bold uppercase">NOW PLAYING</span>
              {isAdmin && (
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogTrigger asChild>
                    <button className="ml-auto">
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Current Song</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Song Title</Label>
                        <Input
                          id="title"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="artist">Artist</Label>
                        <Input
                          id="artist"
                          value={editForm.artist}
                          onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cover">Album Cover URL</Label>
                        <Input
                          id="cover"
                          value={editForm.albumCover}
                          onChange={(e) => setEditForm({ ...editForm, albumCover: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="spotify">Spotify URL</Label>
                        <Input
                          id="spotify"
                          value={editForm.spotifyUrl}
                          onChange={(e) => setEditForm({ ...editForm, spotifyUrl: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleSave}>Save</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <a
              href={song.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2 sm:gap-3 hover:opacity-80 transition-opacity p-2 sm:p-3"
            >
              <img
                src={song.albumCover}
                alt={`${song.title} album cover`}
                className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 object-cover"
                style={{ border: '1px solid #a09890' }}
              />
              <div className="flex flex-col justify-start min-w-0">
                <p className="text-xs sm:text-sm font-bold break-words now-playing-text">{song.title}</p>
                <p className="text-[10px] sm:text-xs break-words now-playing-text" style={{ opacity: 0.7 }}>{song.artist}</p>
              </div>
            </a>
          </div>
        </div>
        
        <div className="mt-auto overflow-hidden connect-card">
          <div className="flex items-center gap-2 px-2 py-2 connect-header">
            <Heart className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-bold uppercase">CONNECT</span>
          </div>
          <div className="flex flex-col">
            <a
              href="https://substack.com/@capitolcitizen"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-0.5 hover:opacity-80 transition-opacity connect-link"
            >
              <img src="/substack-icon.svg" alt="Substack" className="w-3 h-3 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs connect-text">Substack</span>
            </a>
            <a
              href="https://instagram.com/capitolcitizen"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-0.5 hover:opacity-80 transition-opacity connect-link"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" className="w-3 h-3 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs connect-text">Instagram</span>
            </a>
            <a
              href="https://twitter.com/feliciamtang"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-0.5 hover:opacity-80 transition-opacity connect-link"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png" alt="X/Twitter" className="w-3 h-3 bg-black p-0.5 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs connect-text">Twitter/X</span>
            </a>
            <a
              href="https://linkedin.com/in/feliciamtang"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-0.5 hover:opacity-80 transition-opacity connect-link"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" className="w-3 h-3 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs connect-text">LinkedIn</span>
            </a>
            <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
              <DialogTrigger asChild>
                <button
                  className="flex items-center gap-1.5 px-2 py-0.5 hover:opacity-80 transition-opacity w-full text-left"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Gmail" className="w-3 h-3 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs connect-text">Email</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Contact Me</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <div className="flex items-center justify-between p-2 bg-muted border border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Work</p>
                      <p className="text-sm font-medium">felicia@exa.ai</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("felicia@exa.ai")}
                      className="h-8 w-8 p-0"
                    >
                      {copiedEmail === "felicia@exa.ai" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted border border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Personal</p>
                      <p className="text-sm font-medium">feliciamtang@gmail.com</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("feliciamtang@gmail.com")}
                      className="h-8 w-8 p-0"
                    >
                      {copiedEmail === "feliciamtang@gmail.com" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
