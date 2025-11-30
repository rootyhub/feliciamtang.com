"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, X, ChevronRight, Upload, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { checkAdmin } from "@/lib/auth";
import { getFeaturedPages, getNavPages, addPage, deletePage } from "@/lib/db/pages";
import { getNotes, addNote, deleteNote } from "@/lib/db/notes";
import { Page } from "@/lib/types";
import type { Note } from "@/lib/db/notes";

export default function MyPages() {
  const [navPages, setNavPages] = useState<Page[]>([]);
  const [featuredPages, setFeaturedPages] = useState<Page[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [newPage, setNewPage] = useState({
    title: "",
    headingImage: "",
    body: "",
    images: [] as string[],
  });
  
  // Note submission state
  const [noteContent, setNoteContent] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteSubmitted, setNoteSubmitted] = useState(false);
  const [showNotesPage, setShowNotesPage] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  
  const handleDeleteNote = async (noteId: string) => {
    if (confirm("Delete this note?")) {
      await deleteNote(noteId);
      const updatedNotes = await getNotes();
      setNotes(updatedNotes);
    }
  };

  useEffect(() => {
    setIsAdmin(checkAdmin());
    // Load pages from Supabase
    const loadData = async () => {
      const [nav, featured, notesData] = await Promise.all([
        getNavPages(),
        getFeaturedPages(),
        getNotes(),
      ]);
      setNavPages(nav);
      setFeaturedPages(featured);
      setNotes(notesData);
    };
    loadData();
  }, []);

  const handleSubmitNote = async () => {
    if (!noteContent.trim()) return;
    
    setIsSubmittingNote(true);
    try {
      // Save note to Supabase
      await addNote(noteContent.trim());
      
      // Send email via API
      await fetch("/api/send-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteContent.trim() }),
      });
      
      setNoteContent("");
      setNoteSubmitted(true);
      // Refresh notes
      const updatedNotes = await getNotes();
      setNotes(updatedNotes);
      setTimeout(() => {
        setNoteSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to submit note:", error);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleAddPage = async () => {
    if (newPage.title.trim()) {
      await addPage({
        ...newPage,
        isFeatured: true, // Add to featured pages by default
      });
      const featured = await getFeaturedPages();
      setFeaturedPages(featured);
      setNewPage({ title: "", headingImage: "", body: "", images: [] });
      setIsDialogOpen(false);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      await deletePage(id);
      const [nav, featured] = await Promise.all([getNavPages(), getFeaturedPages()]);
      setNavPages(nav);
      setFeaturedPages(featured);
    }
  };

  const handleHeadingImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPage({ ...newPage, headingImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPage({
          ...newPage,
          images: [...newPage.images, reader.result as string],
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Title box - matching "About Me" style */}
      <div className="flex items-stretch gap-1 mb-2">
        <div className="w-4 bg-muted inner-card-grey-muted flex items-center justify-center flex-shrink-0 border-3d">
          <span className="text-[6px] sm:text-[8px]">•</span>
        </div>
        <div className="flex-1 px-2 py-0.5 bg-muted inner-card-grey-muted flex items-center border-3d">
          <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wide">MY PAGES</span>
        </div>
      </div>

      {/* Two-column content area - stacks on small screens, horizontal scroll on medium */}
      <div className="flex flex-col md:flex-row gap-3 flex-1 overflow-x-auto md:overflow-hidden">
        {/* Featured images - shows first on mobile (order-1), second on desktop (md:order-2) */}
        <div className="order-1 md:order-2 flex-1 flex flex-col gap-0 overflow-y-auto overflow-x-hidden md:min-w-0">
          {featuredPages.map((page) => {
            const isExternalLink = !!page.externalUrl;
            
            const handleClick = () => {
              if (isExternalLink && page.externalUrl) {
                window.open(page.externalUrl, "_blank", "noopener,noreferrer");
              } else {
                setSelectedPage(page);
              }
            };
            
            return (
              <div
                key={`preview-${page.id}`}
                className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity bg-card inner-card-grey border-3d relative"
                onClick={handleClick}
              >
                {/* External link icon in top right corner */}
                {isExternalLink && (
                  <div className="absolute top-1 right-1 z-10 bg-background/80 p-0.5 border border-border">
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
                {page.headingImage ? (
                  <div>
                    <img
                      src={page.headingImage}
                      alt={page.title}
                      className="w-full h-20 object-cover"
                    />
                    {/* Title below image in grey text */}
                    <div className="px-2 py-1">
                      <span className="text-sm font-bold text-muted-foreground">
                        {page.title}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-20 bg-muted inner-card-grey-muted flex items-center justify-center">
                    <span className="text-[8px] text-muted-foreground">No Image</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Nav links column - shows second on mobile (order-2), first on desktop (md:order-1) */}
        <div className="order-2 md:order-1 w-full md:w-48 flex flex-col gap-0 overflow-hidden flex-shrink-0">
        {navPages.map((page, index) => (
          <div
            key={page.id}
            className="flex items-stretch gap-1 cursor-pointer hover:opacity-80 transition-opacity h-5"
            onClick={() => setSelectedPage(page)}
            style={{
              marginBottom: index < navPages.length - 1 ? '2px' : '0',
            }}
          >
            {/* Left arrow square */}
            <div className="w-5 h-5 bg-card inner-card-grey flex items-center justify-center flex-shrink-0 border-3d">
              <ChevronRight className="h-3 w-3" />
            </div>
            
            {/* Right-aligned text rectangle - fixed height, truncate text */}
            <div className="flex-1 h-5 px-2 bg-card inner-card-grey flex items-center justify-end overflow-hidden border-3d">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                {page.title}
              </span>
            </div>
          </div>
        ))}
        
        {/* Website Notes link - only visible to admin */}
        {isAdmin && (
          <div
            className="flex items-stretch gap-1 cursor-pointer hover:opacity-80 transition-opacity h-5 mt-2"
            onClick={() => setShowNotesPage(true)}
            style={{ marginBottom: '2px' }}
          >
            <div className="w-5 h-5 bg-card inner-card-grey flex items-center justify-center flex-shrink-0 border-3d">
              <ChevronRight className="h-3 w-3" />
            </div>
            <div className="flex-1 h-5 px-2 bg-card inner-card-grey flex items-center justify-end overflow-hidden border-3d">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                WEBSITE NOTES
              </span>
            </div>
          </div>
        )}
        
        {/* Note submission box - always expanded */}
        <div className="mt-3 space-y-2">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="write me a note! :)"
            className="w-full h-32 px-2 py-1 text-[10px] bg-card inner-card-grey border-3d resize-none focus:outline-none"
            disabled={isSubmittingNote}
          />
          <div className="flex justify-end">
            <button
              onClick={handleSubmitNote}
              disabled={!noteContent.trim() || isSubmittingNote}
              className="h-6 px-3 text-[10px] font-bold uppercase bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed border-3d"
              style={{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderTopColor: 'white',
                borderRightColor: 'white',
                borderBottomColor: '#a09890',
                borderLeftColor: '#a09890',
              }}
            >
              {noteSubmitted ? "SENT! ♥" : isSubmittingNote ? "..." : "SEND"}
            </button>
          </div>
        </div>
        
        {/* Admin add button */}
        {isAdmin && (
          <div className="mt-2 flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Page</DialogTitle>
                  <DialogDescription>
                    Add a new page with title, images, and content.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="page-title">Title</Label>
                    <Input
                      id="page-title"
                      value={newPage.title}
                      onChange={(e) =>
                        setNewPage({ ...newPage, title: e.target.value })
                      }
                      placeholder="Page title"
                      autoFocus
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="heading-image">Heading Image</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="heading-image"
                        type="file"
                        accept="image/*"
                        onChange={handleHeadingImageUpload}
                        className="cursor-pointer"
                      />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {newPage.headingImage && (
                      <div className="relative mt-2">
                        <img
                          src={newPage.headingImage}
                          alt="Heading preview"
                          className="h-32 w-full object-cover border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => setNewPage({ ...newPage, headingImage: "" })}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 border border-border"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body-text">Body Text</Label>
                    <textarea
                      id="body-text"
                      value={newPage.body}
                      onChange={(e) =>
                        setNewPage({ ...newPage, body: e.target.value })
                      }
                      placeholder="Write your page content here..."
                      className="flex min-h-[200px] w-full border-2 border-border bg-background px-3 py-2 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Images</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAdditionalImageUpload}
                        className="cursor-pointer"
                      />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {newPage.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newPage.images.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={img}
                              alt={`Image ${idx + 1}`}
                              className="h-20 w-20 object-cover border border-border"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setNewPage({
                                  ...newPage,
                                  images: newPage.images.filter((_, i) => i !== idx),
                                });
                              }}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 border border-border"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setNewPage({ title: "", headingImage: "", body: "", images: [] });
                    }}
                  >
                    CANCEL
                  </Button>
                  <Button onClick={handleAddPage}>CREATE PAGE</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>

      {/* POPUP DIALOG for viewing full page */}
      <Dialog open={selectedPage !== null} onOpenChange={() => setSelectedPage(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedPage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">{selectedPage.title}</DialogTitle>
                {isAdmin && (
                  <button
                    onClick={() => {
                      handleDeletePage(selectedPage.id);
                      setSelectedPage(null);
                    }}
                    className="absolute top-3 right-12 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </DialogHeader>
              <div className="space-y-4">
                {selectedPage.headingImage && (
                  <img
                    src={selectedPage.headingImage}
                    alt={selectedPage.title}
                    className="w-full h-64 object-cover border border-border"
                  />
                )}
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {selectedPage.body}
                </p>
                {selectedPage.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPage.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${selectedPage.title} image ${idx + 1}`}
                        className="w-full h-32 object-cover border border-border"
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* POPUP DIALOG for viewing website notes (admin only) */}
      <Dialog open={showNotesPage} onOpenChange={setShowNotesPage}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Website Notes</DialogTitle>
            <DialogDescription>
              Notes left by visitors on your website
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No notes yet. When visitors leave notes, they will appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-muted border-3d relative">
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-muted-foreground mb-1">
                      {note.createdAt.toLocaleString()}
                    </p>
                    <p className="text-sm whitespace-pre-wrap break-words pr-6">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowNotesPage(false)}
              className="h-6 px-3 text-[10px] font-bold uppercase bg-card hover:bg-muted"
              style={{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderTopColor: 'white',
                borderRightColor: 'white',
                borderBottomColor: '#a09890',
                borderLeftColor: '#a09890',
              }}
            >
              CLOSE
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
