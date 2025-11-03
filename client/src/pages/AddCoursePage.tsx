import React, { useState, useEffect } from "react";
import { db, storage, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { useLocation } from "wouter";

type Category = {
  id: string;
  name: string;
};

export default function AddCoursePage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [courseMaterials, setCourseMaterials] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    instructor: "",
    description: "",
    duration: "",
    ceCredits: "",
    price: "",
    level: "Beginner",
    category: "",
    isPremium: false,
  });

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "categories"), orderBy("name"));
        const snapshot = await getDocs(q);
        const cats: Category[] = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setCategories(cats);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const filename = `courses/${timestamp}_${file.name}`;
    const storageRef = ref(storage, filename);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const uploadCourseMaterial = async (file: File): Promise<{ name: string; url: string; type: string }> => {
    const timestamp = Date.now();
    const filename = `course-materials/${timestamp}_${file.name}`;
    const storageRef = ref(storage, filename);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      name: file.name,
      url: downloadURL,
      type: file.type
    };
  };

  const handleCourseMaterialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.includes('video') || file.type.includes('pdf') || file.type === 'application/pdf';
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a video or PDF file`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 100MB limit`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    setCourseMaterials(prev => [...prev, ...validFiles]);
  };

  const removeCourseMaterial = (index: number) => {
    setCourseMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check authentication
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to add courses",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validation
      if (!formData.title || !formData.instructor || !formData.duration) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!imageFile) {
        toast({
          title: "Error",
          description: "Please upload a course thumbnail",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Upload image first
      toast({
        title: "Uploading",
        description: "Uploading course thumbnail...",
      });
      const thumbnailUrl = await uploadImage(imageFile);

      // Upload course materials if any
      let materialUrls: { name: string; url: string; type: string }[] = [];
      if (courseMaterials.length > 0) {
        toast({
          title: "Uploading Materials",
          description: `Uploading ${courseMaterials.length} course material(s)...`,
        });
        
        for (let i = 0; i < courseMaterials.length; i++) {
          toast({
            title: "Uploading Materials",
            description: `Uploading file ${i + 1} of ${courseMaterials.length}: ${courseMaterials[i].name}`,
          });
          const material = await uploadCourseMaterial(courseMaterials[i]);
          materialUrls.push(material);
        }
      }

      // Create course object with createdBy field
      const courseData = {
        title: formData.title,
        instructor: formData.instructor,
        description: formData.description || "",
        thumbnail: thumbnailUrl,
        duration: formData.duration,
        ceCredits: formData.ceCredits ? parseInt(formData.ceCredits) : 0,
        price: formData.price ? parseFloat(formData.price) : 0,
        isPremium: formData.isPremium || (formData.price && parseFloat(formData.price) > 0),
        level: formData.level,
        category: formData.category || "Uncategorized",
        materials: materialUrls,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "published",
        active: true,
        accessLevel: "client",
        contentType: "pdf",
      };

      // Add to Firestore
      toast({
        title: "Saving",
        description: "Saving course to database...",
      });
      await addDoc(collection(db, "courses"), courseData);

      // Show success message
      toast({
        title: "✅ Course Added Successfully!",
        description: `"${formData.title}" has been added to ${formData.category || 'Uncategorized'} category.`,
      });

      // Reset form
      setFormData({
        title: "",
        instructor: "",
        description: "",
        duration: "",
        ceCredits: "",
        price: "",
        level: "Beginner",
        category: "",
        isPremium: false,
      });
      setImageFile(null);
      setImagePreview(null);
      setCourseMaterials([]);
      setLoading(false);

      // Redirect to content category page
      setTimeout(() => {
        setLocation("/admin/content-category");
      }, 1000);

    } catch (error: any) {
      console.error("Error adding course:", error);
      
      let errorMessage = "Failed to add course";
      
      // Provide more specific error messages
      if (error.code === "storage/unauthorized") {
        errorMessage = "Permission denied. Please ensure you're logged in and Firebase Storage rules are deployed.";
      } else if (error.code === "permission-denied") {
        errorMessage = "Permission denied. Please ensure Firestore rules are deployed.";
      } else if (error.code === "storage/quota-exceeded") {
        errorMessage = "Storage quota exceeded. Please check your Firebase Storage limits.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error Adding Course",
        description: errorMessage,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Add New Course</h1>
          <p className="text-muted-foreground">
            Create a new course with materials and organize by category
          </p>
        </div>

        <Card className="shadow-md">
          <CardHeader className="bg-muted/30">
            <CardTitle>Course Details</CardTitle>
            <CardDescription>
              Fill in the information below to add a new course to the system
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Course Thumbnail *</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a course thumbnail image (max 5MB)
                  </p>
                </div>
                {imagePreview && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {!imagePreview && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden border flex items-center justify-center bg-muted">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Fundamentals of Neurologic Music Therapy"
                required
              />
            </div>

            {/* Instructor */}
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor *</Label>
              <Input
                id="instructor"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                placeholder="e.g., Dr. Sarah Mitchell"
                required
              />
            </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the course..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Course Materials Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Course Materials</h3>
              </div>

            {/* Course Materials (Videos/PDFs) */}
            <div className="space-y-2">
              <Label htmlFor="courseMaterials">Course Materials (Videos/PDFs)</Label>
              <Input
                id="courseMaterials"
                type="file"
                accept="video/*,.pdf,application/pdf"
                multiple
                onChange={handleCourseMaterialsChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Upload course videos or PDF documents (max 100MB each)
              </p>
              
              {/* Display selected materials */}
              {courseMaterials.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium">Selected materials:</p>
                  {courseMaterials.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {file.type.includes('video') ? '🎥' : '📄'} {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCourseMaterial(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>

            {/* Course Details Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Loader2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Course Details</h3>
              </div>

            {/* Duration and CE Credits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 8 hours"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ceCredits">CE Credits</Label>
                <Input
                  id="ceCredits"
                  name="ceCredits"
                  type="number"
                  value={formData.ceCredits}
                  onChange={handleInputChange}
                  placeholder="e.g., 8"
                />
              </div>
            </div>

            {/* Level and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Course Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Create categories in "Content Category" page first
                </p>
              </div>
            </div>

            {/* Price and Premium */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Leave empty for free courses"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for free courses
                </p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPremium"
                    checked={formData.isPremium}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span>Mark as Premium Course</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Premium courses require payment to access
                </p>
              </div>
            </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Course...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Add Course
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

