import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  updateDoc
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit2, X, ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Course = {
  id: string;
  title: string;
  instructor: string;
  thumbnail?: string;
  category?: string;
};

type Category = {
  id: string;
  name: string;
  description?: string;
  courseCount?: number;
  courses?: Course[];
  createdAt: any;
};

export default function ContentCategoryPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "categories"), orderBy("name"));
      const snapshot = await getDocs(q);
      
      // Get all courses
      const coursesSnapshot = await getDocs(collection(db, "courses"));
      const coursesByCategory = new Map<string, Course[]>();
      
      coursesSnapshot.forEach(doc => {
        const data = doc.data();
        const cat = data.category || "Uncategorized";
        const course: Course = {
          id: doc.id,
          title: data.title,
          instructor: data.instructor,
          thumbnail: data.thumbnail,
          category: cat,
        };
        
        if (!coursesByCategory.has(cat)) {
          coursesByCategory.set(cat, []);
        }
        coursesByCategory.get(cat)!.push(course);
      });

      const cats: Category[] = snapshot.docs.map(doc => {
        const categoryName = doc.data().name;
        const courses = coursesByCategory.get(categoryName) || [];
        return {
          id: doc.id,
          ...doc.data(),
          courseCount: courses.length,
          courses,
        };
      }) as Category[];

      setCategories(cats);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setSubmitting(true);
    try {
      if (editId) {
        // Update existing category
        await updateDoc(doc(db, "categories", editId), {
          name: categoryName.trim(),
          description: categoryDescription.trim(),
          updatedAt: serverTimestamp(),
        });
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
        setEditId(null);
      } else {
        // Add new category
        await addDoc(collection(db, "categories"), {
          name: categoryName.trim(),
          description: categoryDescription.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({
          title: "Success",
          description: "Category added successfully",
        });
      }

      setCategoryName("");
      setCategoryDescription("");
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save category",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditId(category.id);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setCategoryName("");
    setCategoryDescription("");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "categories", id));
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      fetchCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Content Categories</h1>
          <p className="text-muted-foreground">
            Organize your courses by creating and managing categories
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Category Form */}
          <Card className="lg:col-span-1 shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle>{editId ? "Edit Category" : "Add Category"}</CardTitle>
              <CardDescription>
                {editId ? "Update the category details" : "Create a new course category"}
              </CardDescription>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name *</Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Neurologic Music Therapy"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryDescription">Description</Label>
                <Input
                  id="categoryDescription"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Brief description..."
                />
              </div>

              <div className="flex gap-2">
                {editId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={submitting}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={submitting}
                  className={editId ? "flex-1" : "w-full"}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editId ? <Edit2 className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                      {editId ? "Update" : "Add"} Category
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Categories List */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader className="bg-muted/30">
            <CardTitle>All Categories</CardTitle>
            <CardDescription>
              Manage course categories and view course counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No categories yet.</p>
                <p className="text-sm mt-2">Create your first category to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {category.courseCount || 0} {category.courseCount === 1 ? 'course' : 'courses'}
                            </span>
                          </div>
                          {category.description && (
                            <CardDescription className="mt-1">{category.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(category.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {category.courses && category.courses.length > 0 && (
                      <CardContent className="pt-0">
                        <Collapsible
                          open={expandedCategories.has(category.id)}
                          onOpenChange={(open) => {
                            const newExpanded = new Set(expandedCategories);
                            if (open) {
                              newExpanded.add(category.id);
                            } else {
                              newExpanded.delete(category.id);
                            }
                            setExpandedCategories(newExpanded);
                          }}
                        >
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                              {expandedCategories.has(category.id) ? (
                                <ChevronDown className="h-4 w-4 mr-2" />
                              ) : (
                                <ChevronRight className="h-4 w-4 mr-2" />
                              )}
                              {expandedCategories.has(category.id) ? 'Hide' : 'Show'} Courses
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-3">
                            <div className="space-y-2">
                              {category.courses.map((course) => (
                                <div
                                  key={course.id}
                                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                  {course.thumbnail && (
                                    <img
                                      src={course.thumbnail}
                                      alt={course.title}
                                      className="w-16 h-16 rounded object-cover"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">{course.title}</h4>
                                    <p className="text-xs text-muted-foreground">{course.instructor}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
              Courses in this category will remain but will be marked as "Uncategorized".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}

