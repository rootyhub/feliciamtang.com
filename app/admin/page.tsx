"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, ArrowLeft, Upload, X, ChevronUp, ChevronDown, Image, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getHabits,
  addHabit,
  updateHabit,
  deleteHabit,
  moveHabitUp,
  moveHabitDown,
} from "@/lib/db/habits";
import {
  getPages,
  getFeaturedPages,
  getNavPages,
  addPage,
  updatePage,
  deletePage,
  movePageUp,
  movePageDown,
  togglePageVisibility,
} from "@/lib/db/pages";
import { uploadBase64Image } from "@/lib/db/storage";
import { checkAdmin } from "@/lib/auth";
import { Habit, Page } from "@/lib/types";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddSubHabitDialogOpen, setIsAddSubHabitDialogOpen] = useState(false);
  const [isAddPageDialogOpen, setIsAddPageDialogOpen] = useState(false);
  const [isEditPageDialogOpen, setIsEditPageDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [parentHabitForSub, setParentHabitForSub] = useState<Habit | null>(null);
  const defaultNewPage = {
    title: "",
    slug: "",
    headingImage: "",
    body: "",
    excerpt: "",
    images: [] as string[],
    isFeatured: false,
    layout: "default" as "default" | "gallery" | "photo-journal",
    published: true,
    externalUrl: "",
  };
  const [newPage, setNewPage] = useState(defaultNewPage);

  useEffect(() => {
    if (!checkAdmin()) {
      router.push("/login");
      return;
    }
    const loadData = async () => {
      const [habitsData, pagesData] = await Promise.all([
        getHabits(),
        getPages(),
      ]);
      setHabits(habitsData);
      setPages(pagesData);
    };
    loadData();
  }, [router]);

  const handleAddHabit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const frequency = (formData.get("frequency") as "daily" | "weekly") || "daily";
    const isNegative = formData.get("isNegative") === "on";
    const goalPerWeek = frequency === "weekly" 
      ? parseInt(formData.get("goal_per_week") as string) || 1
      : undefined;

    if (name.trim()) {
      await addHabit({
        name: name.trim(),
        color: "#22c55e",
        frequency,
        isNegative,
        goal_per_week: goalPerWeek,
      });
      const habitsData = await getHabits();
      setHabits(habitsData);
      setIsAddDialogOpen(false);
      e.currentTarget.reset();
    }
  };

  const handleAddSubHabit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!parentHabitForSub) return;
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    if (name.trim()) {
      // Add sub-habit as a new habit with parentId
      await addHabit({
        name: name.trim(),
        color: parentHabitForSub.color,
        frequency: parentHabitForSub.frequency,
        isNegative: parentHabitForSub.isNegative,
        parentId: parentHabitForSub.id,
      });
      const habitsData = await getHabits();
      setHabits(habitsData);
      setIsAddSubHabitDialogOpen(false);
      setParentHabitForSub(null);
      e.currentTarget.reset();
    }
  };

  const handleEditHabit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingHabit) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const frequency = (formData.get("frequency") as "daily" | "weekly") || editingHabit.frequency;
    const isNegative = formData.get("isNegative") === "on";
    const goalPerWeek = frequency === "weekly" 
      ? parseInt(formData.get("goal_per_week") as string) || 1
      : undefined;

    if (name.trim()) {
      await updateHabit(editingHabit.id, {
        name: name.trim(),
        color: editingHabit.color,
        frequency,
        isNegative,
        goal_per_week: goalPerWeek,
      });
      const habitsData = await getHabits();
      setHabits(habitsData);
      setIsEditDialogOpen(false);
      setEditingHabit(null);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      await deleteHabit(id);
      const habitsData = await getHabits();
      setHabits(habitsData);
    }
  };

  const handleMoveHabitUp = async (id: string) => {
    await moveHabitUp(id);
    const habitsData = await getHabits();
    setHabits(habitsData);
  };

  const handleMoveHabitDown = async (id: string) => {
    await moveHabitDown(id);
    const habitsData = await getHabits();
    setHabits(habitsData);
  };

  // Page management functions
  const handleAddPage = async () => {
    if (newPage.title.trim()) {
      await addPage({
        title: newPage.title,
        headingImage: newPage.headingImage,
        body: newPage.body,
        images: newPage.images,
        isFeatured: newPage.isFeatured,
      });
      const pagesData = await getPages();
      setPages(pagesData);
      setNewPage(defaultNewPage);
      setIsAddPageDialogOpen(false);
    }
  };

  const handleEditPage = async () => {
    if (editingPage) {
      // For regular pages, we use newPage state
      // Combine existing images with new ones (newPage.images contains all images including existing)
      const pageToUpdate = {
        title: newPage.title || editingPage.title,
        headingImage: newPage.headingImage || editingPage.headingImage,
        body: newPage.body || editingPage.body,
        images: newPage.images, // Use newPage.images directly as it's already populated with existing + new
        isFeatured: editingPage.isFeatured,
        externalUrl: newPage.externalUrl || undefined, // Include external URL
      };
      
      console.log('Saving page with images:', pageToUpdate.images);
      console.log('External URL:', pageToUpdate.externalUrl);
      
      if (pageToUpdate.title.trim()) {
        const result = await updatePage(editingPage.id, pageToUpdate);
        console.log('Update result:', result);
        const pagesData = await getPages();
        setPages(pagesData);
        setEditingPage(null);
        setNewPage(defaultNewPage);
        setIsEditPageDialogOpen(false);
      }
    }
  };

  const handleDeletePage = async (id: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      const success = await deletePage(id);
      if (success) {
        const pagesData = await getPages();
        setPages(pagesData);
      } else {
        alert("Failed to delete page. Please try again.");
      }
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isHeading: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      // First read as base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // Upload to Supabase Storage and get URL
        const imageUrl = await uploadBase64Image(base64, isHeading ? 'headings' : 'gallery');
        
        if (imageUrl) {
          if (isHeading) {
            setNewPage({ ...newPage, headingImage: imageUrl });
          } else {
            setNewPage({ ...newPage, images: [...newPage.images, imageUrl] });
          }
        } else {
          alert('Failed to upload image. Please try again.');
        }
        
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    setNewPage({
      ...newPage,
      images: newPage.images.filter((_, i) => i !== index),
    });
  };

  if (!checkAdmin()) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-8 md:px-16 lg:px-24 py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-semibold tracking-tight">Admin Dashboard</h1>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="habits" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="habits">Habits</TabsTrigger>
              <TabsTrigger value="pages">Pages</TabsTrigger>
            </TabsList>

            {/* HABITS TAB */}
            <TabsContent value="habits">
              <Card>
              <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Manage Habits</CardTitle>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Habit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Habit</DialogTitle>
                      <DialogDescription>
                        Create a new habit to track.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddHabit}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Habit Name</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="e.g., Read 30 mins"
                            required
                            autoFocus
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="frequency">Frequency</Label>
                          <select
                            id="frequency"
                            name="frequency"
                            className="flex h-10 w-full border border-border bg-background px-3 py-2 text-sm"
                            defaultValue="daily"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                          </select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="isNegative" name="isNegative" />
                          <Label htmlFor="isNegative" className="cursor-pointer">
                            Negative habit (e.g., getting croissants)
                          </Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Habit</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {habits.map((habit, index) => (
                  <div key={habit.id} className="space-y-2">
                    <div className="flex items-center justify-between border border-border bg-muted/50 p-3">
                      <div className="flex items-center gap-3">
                        {/* Reorder buttons */}
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => handleMoveHabitUp(habit.id)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => handleMoveHabitDown(habit.id)}
                            disabled={index === habits.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <div>
                          <p className={`font-medium ${habit.isNegative ? "text-red-600" : ""}`}>
                            {habit.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {habit.frequency === "daily" ? "Daily" : `Weekly (${habit.goal_per_week || 1}/week)`}
                            {habit.isNegative && " • Negative"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog
                          open={isAddSubHabitDialogOpen && parentHabitForSub?.id === habit.id}
                          onOpenChange={(open) => {
                            setIsAddSubHabitDialogOpen(open);
                            if (open) {
                              setParentHabitForSub(habit);
                            } else {
                              setParentHabitForSub(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setParentHabitForSub(habit);
                                setIsAddSubHabitDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Sub
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Sub-Habit to {habit.name}</DialogTitle>
                              <DialogDescription>
                                Add a sub-habit under {habit.name}.
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddSubHabit}>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="sub-name">Sub-Habit Name</Label>
                                  <Input
                                    id="sub-name"
                                    name="name"
                                    placeholder="e.g., Warmup"
                                    required
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit">Add Sub-Habit</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Dialog
                          open={isEditDialogOpen && editingHabit?.id === habit.id}
                          onOpenChange={(open) => {
                            setIsEditDialogOpen(open);
                            if (open) {
                              setEditingHabit(habit);
                            } else {
                              setEditingHabit(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Habit</DialogTitle>
                              <DialogDescription>
                                Update the habit details.
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleEditHabit}>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Habit Name</Label>
                                  <Input
                                    id="edit-name"
                                    name="name"
                                    defaultValue={habit.name}
                                    required
                                    autoFocus
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-frequency">Frequency</Label>
                                  <select
                                    id="edit-frequency"
                                    name="frequency"
                                    className="flex h-10 w-full border border-border bg-background px-3 py-2 text-sm"
                                    defaultValue={habit.frequency}
                                  >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                  </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="edit-isNegative"
                                    name="isNegative"
                                    defaultChecked={habit.isNegative}
                                  />
                                  <Label htmlFor="edit-isNegative" className="cursor-pointer">
                                    Negative habit
                                  </Label>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit">Save Changes</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteHabit(habit.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {habit.subHabits && habit.subHabits.length > 0 && (
                      <div className="ml-6 space-y-1">
                        {habit.subHabits.map((subHabit) => (
                          <div
                            key={subHabit.id}
                            className="flex items-center justify-between border border-border bg-muted/30 p-2"
                          >
                            <p className="text-sm text-muted-foreground">
                              • {subHabit.name}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                // Delete sub-habit directly
                                await deleteHabit(subHabit.id);
                                const habitsData = await getHabits();
                                setHabits(habitsData);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
            </TabsContent>

            {/* PAGES TAB */}
            <TabsContent value="pages">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Manage Pages</CardTitle>
                    <Dialog open={isAddPageDialogOpen} onOpenChange={setIsAddPageDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setNewPage(defaultNewPage)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Page
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Page</DialogTitle>
                          <DialogDescription>
                            Create a new page with images and content.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="page-title">Title</Label>
                            <Input
                              id="page-title"
                              value={newPage.title}
                              onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                              placeholder="Page title"
                              autoFocus
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="heading-image">Heading Image</Label>
                            <Input
                              id="heading-image"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, true)}
                            />
                            {newPage.headingImage && (
                              <div className="relative mt-2">
                                <img src={newPage.headingImage} alt="Heading" className="h-32 w-full object-cover border border-border" />
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
                              onChange={(e) => setNewPage({ ...newPage, body: e.target.value })}
                              placeholder="Write your page content here..."
                              className="flex min-h-[200px] w-full border-2 border-border bg-background px-3 py-2 text-xs sm:text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Additional Images {isUploading && <span className="text-muted-foreground">(uploading...)</span>}</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, false)}
                              disabled={isUploading}
                            />
                            {newPage.images.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {newPage.images.map((img, idx) => (
                                  <div key={idx} className="relative">
                                    <img src={img} alt={`Image ${idx + 1}`} className="h-20 w-20 object-cover border border-border" />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveImage(idx)}
                                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 border border-border"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="is-featured" 
                              checked={newPage.isFeatured}
                              onCheckedChange={(checked) => setNewPage({ ...newPage, isFeatured: checked as boolean })}
                            />
                            <Label htmlFor="is-featured" className="cursor-pointer">
                              Featured Page (show in image gallery)
                            </Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddPageDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddPage}>Create Page</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Featured Pages Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3">Featured Pages</h3>
                    <div className="space-y-2">
                      {pages.filter(p => p.isFeatured).length === 0 ? (
                        <p className="text-center py-4 text-muted-foreground text-sm">No featured pages yet.</p>
                      ) : (
                        pages.filter(p => p.isFeatured).map((page, index, arr) => (
                          <div key={page.id} className="flex items-center justify-between border border-border bg-muted/50 p-3">
                            <div className="flex items-center gap-3">
                              {/* Sort buttons */}
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  disabled={index === 0}
                                  onClick={async () => {
                                    await movePageUp(page.id);
                                    const pagesData = await getPages();
                                    setPages(pagesData);
                                  }}
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  disabled={index === arr.length - 1}
                                  onClick={async () => {
                                    await movePageDown(page.id);
                                    const pagesData = await getPages();
                                    setPages(pagesData);
                                  }}
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>
                              {page.headingImage && (
                                <img src={page.headingImage} alt={page.title} className={`w-16 h-16 object-cover border border-border ${!page.published ? 'opacity-50' : ''}`} />
                              )}
                              <div>
                                <p className={`font-medium ${!page.published ? 'text-muted-foreground line-through' : ''}`}>
                                  {page.title}
                                  {!page.published && <span className="ml-2 text-xs">(hidden)</span>}
                                  {page.externalUrl && <span className="ml-2 text-xs text-blue-500">🔗 external link</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(page.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Dialog
                                open={isEditPageDialogOpen && editingPage?.id === page.id}
                                onOpenChange={(open) => {
                                  setIsEditPageDialogOpen(open);
                                  if (open) {
                                    setEditingPage(page);
                                    setNewPage({
                                      ...defaultNewPage,
                                      title: page.title,
                                      slug: page.slug || "",
                                      headingImage: page.headingImage || "",
                                      body: page.body,
                                      excerpt: page.excerpt || "",
                                      images: page.images || [],
                                      isFeatured: page.isFeatured ?? false,
                                      layout: page.layout || "default",
                                      published: page.published ?? true,
                                      externalUrl: page.externalUrl || "",
                                    });
                                  } else {
                                    setEditingPage(null);
                                    setNewPage(defaultNewPage);
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Edit Featured Page</DialogTitle>
                                    <DialogDescription>
                                      Update the page details.
                                    </DialogDescription>
                                  </DialogHeader>
                                  {editingPage && (
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-page-title">Title</Label>
                                        <Input
                                          id="edit-page-title"
                                          value={newPage.title}
                                          onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                                          placeholder="Page title"
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-heading-image">Heading Image</Label>
                                        <Input
                                          id="edit-heading-image"
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleImageUpload(e, true)}
                                        />
                                        {newPage.headingImage && (
                                          <div className="relative mt-2">
                                            <img src={newPage.headingImage} alt="Heading" className="h-32 w-full object-cover border border-border" />
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
                                        <Label htmlFor="edit-body-text">Body Text</Label>
                                        <textarea
                                          id="edit-body-text"
                                          value={newPage.body}
                                          onChange={(e) => setNewPage({ ...newPage, body: e.target.value })}
                                          placeholder="Write your page content here..."
                                          className="flex min-h-[200px] w-full border-2 border-border bg-background px-3 py-2 text-xs sm:text-sm"
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label>Additional Images {isUploading && <span className="text-muted-foreground">(uploading...)</span>}</Label>
                                        <Input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleImageUpload(e, false)}
                                          disabled={isUploading}
                                        />
                                        {newPage.images.length > 0 && (
                                          <div className="flex flex-wrap gap-2 mt-2">
                                            {newPage.images.map((img, idx) => (
                                              <div key={idx} className="relative">
                                                <img src={img} alt={`Image ${idx + 1}`} className="h-20 w-20 object-cover border border-border" />
                                                <button
                                                  type="button"
                                                  onClick={() => handleRemoveImage(idx)}
                                                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 border border-border"
                                                >
                                                  <X className="h-3 w-3" />
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-external-url">
                                          External Link URL
                                          <span className="text-xs text-muted-foreground ml-2">(makes this a button that opens the link)</span>
                                        </Label>
                                        <Input
                                          id="edit-external-url"
                                          value={newPage.externalUrl}
                                          onChange={(e) => setNewPage({ ...newPage, externalUrl: e.target.value })}
                                          placeholder="https://substack.com/..."
                                        />
                                        {newPage.externalUrl && (
                                          <p className="text-xs text-green-600">✓ This page will open as an external link</p>
                                        )}
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <Checkbox 
                                          id="edit-is-featured" 
                                          checked={editingPage.isFeatured}
                                          onCheckedChange={(checked) => setEditingPage({ ...editingPage, isFeatured: checked as boolean })}
                                        />
                                        <Label htmlFor="edit-is-featured" className="cursor-pointer">
                                          Featured Page (show in image gallery)
                                        </Label>
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => {
                                      setIsEditPageDialogOpen(false);
                                      setEditingPage(null);
                                      setNewPage(defaultNewPage);
                                    }}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleEditPage} disabled={isUploading}>Save Changes</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title={page.published ? "Hide page" : "Show page"}
                                onClick={async () => {
                                  await togglePageVisibility(page.id);
                                  const pagesData = await getPages();
                                  setPages(pagesData);
                                }}
                              >
                                {page.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeletePage(page.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Regular Pages Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Pages</h3>
                    <div className="space-y-2">
                      {pages.filter(p => !p.isFeatured).length === 0 ? (
                        <p className="text-center py-4 text-muted-foreground text-sm">No pages yet.</p>
                      ) : (
                        pages.filter(p => !p.isFeatured).map((page) => (
                          <div key={page.id} className="flex items-center justify-between border border-border bg-muted/50 p-3">
                          <div>
                            <p className={`font-medium ${!page.published ? 'text-muted-foreground line-through' : ''}`}>
                              {page.title}
                              {!page.published && <span className="ml-2 text-xs">(hidden)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(page.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Dialog
                              open={isEditPageDialogOpen && editingPage?.id === page.id}
                              onOpenChange={(open) => {
                                setIsEditPageDialogOpen(open);
                                if (open) {
                                  setEditingPage(page);
                                  setNewPage({
                                    ...defaultNewPage,
                                    title: page.title,
                                    slug: page.slug || "",
                                    headingImage: page.headingImage || "",
                                    body: page.body,
                                    excerpt: page.excerpt || "",
                                    images: page.images || [],
                                    isFeatured: page.isFeatured ?? false,
                                    layout: page.layout || "default",
                                    published: page.published ?? true,
                                    externalUrl: page.externalUrl || "",
                                  });
                                } else {
                                  setEditingPage(null);
                                  setNewPage(defaultNewPage);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Page</DialogTitle>
                                  <DialogDescription>
                                    Update the page details.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-page-title">Title</Label>
                                    <Input
                                      id="edit-page-title"
                                      value={newPage.title}
                                      onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                                      placeholder="Page title"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-heading-image">Heading Image</Label>
                                    <Input
                                      id="edit-heading-image"
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageUpload(e, true)}
                                    />
                                    {newPage.headingImage && (
                                      <div className="relative mt-2">
                                        <img src={newPage.headingImage} alt="Heading" className="h-32 w-full object-cover border border-border" />
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
                                    <Label htmlFor="edit-body-text">Body Text</Label>
                                    <textarea
                                      id="edit-body-text"
                                      value={newPage.body}
                                      onChange={(e) => setNewPage({ ...newPage, body: e.target.value })}
                                      placeholder="Write your page content here..."
                                      className="flex min-h-[200px] w-full border-2 border-border bg-background px-3 py-2 text-xs sm:text-sm"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Additional Images</Label>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageUpload(e, false)}
                                    />
                                    {newPage.images.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {newPage.images.map((img, idx) => (
                                          <div key={idx} className="relative">
                                            <img src={img} alt={`Image ${idx + 1}`} className="h-20 w-20 object-cover border border-border" />
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveImage(idx)}
                                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 border border-border"
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <Checkbox 
                                      id="edit-is-featured-regular" 
                                      checked={newPage.isFeatured}
                                      onCheckedChange={(checked) => {
                                        setNewPage({ ...newPage, isFeatured: checked as boolean });
                                        if (editingPage) {
                                          setEditingPage({ ...editingPage, isFeatured: checked as boolean });
                                        }
                                      }}
                                    />
                                    <Label htmlFor="edit-is-featured-regular" className="cursor-pointer">
                                      Featured Page (show in image gallery)
                                    </Label>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => {
                                    setIsEditPageDialogOpen(false);
                                    setEditingPage(null);
                                    setNewPage(defaultNewPage);
                                  }}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleEditPage}>Save Changes</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title={page.published ? "Hide page" : "Show page"}
                              onClick={async () => {
                                await togglePageVisibility(page.id);
                                const pagesData = await getPages();
                                setPages(pagesData);
                              }}
                            >
                              {page.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePage(page.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </main>
    </div>
  );
}
