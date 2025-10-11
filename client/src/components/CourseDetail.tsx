import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Award, BookOpen, Download, CheckCircle, Circle, Play } from "lucide-react";
import instructorImg from "@assets/stock_images/professional_instruc_df26bc9c.jpg";
import courseImg from "@assets/stock_images/medical_training_pro_24e28be1.jpg";

export default function CourseDetail() {
  const lessons = [
    { id: 1, title: "Introduction to NMT Principles", duration: "45 min", completed: true },
    { id: 2, title: "Neurological Foundations", duration: "60 min", completed: true },
    { id: 3, title: "Assessment Methods", duration: "50 min", completed: false },
    { id: 4, title: "Treatment Planning", duration: "55 min", completed: false },
    { id: 5, title: "Case Studies", duration: "70 min", completed: false },
  ];

  const resources = [
    { name: "Course Handbook.pdf", size: "2.4 MB" },
    { name: "Assessment Templates.pdf", size: "1.1 MB" },
    { name: "Reference Materials.pdf", size: "3.8 MB" },
    { name: "Music Samples.zip", size: "15.2 MB" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="bg-primary text-primary-foreground">Premium</Badge>
                <Badge className="bg-chart-3 text-white">
                  <Award className="w-3 h-3 mr-1" />
                  8 CE Credits
                </Badge>
                <Badge variant="secondary">Beginner</Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-4">
                Fundamentals of Neurologic Music Therapy
              </h1>

              <div className="flex items-center gap-6 mb-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>8 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>12 Lessons</span>
                </div>
              </div>

              <div className="aspect-video rounded-lg overflow-hidden mb-6 bg-muted">
                <img src={courseImg} alt="Course preview" className="w-full h-full object-cover" />
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Your Progress</span>
                  <span className="text-sm font-medium">40% Complete</span>
                </div>
                <Progress value={40} className="h-2" />
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="font-[Poppins]">Course Instructor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={instructorImg} />
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Dr. Sarah Mitchell</p>
                      <p className="text-sm text-muted-foreground">NMT-Fellow, MT-BC</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Board-certified music therapist with 15+ years of experience 
                    in neurologic rehabilitation.
                  </p>
                  <Button className="w-full" data-testid="button-continue-course">
                    <Play className="w-4 h-4 mr-2" />
                    Continue Course
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="lessons" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="lessons" data-testid="tab-lessons">Lessons</TabsTrigger>
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="resources" data-testid="tab-resources">Resources</TabsTrigger>
            <TabsTrigger value="discussions" data-testid="tab-discussions">Discussions</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      className="w-full flex items-center gap-4 p-4 rounded-md hover-elevate transition-all text-left"
                      data-testid={`button-lesson-${index + 1}`}
                    >
                      {lesson.completed ? (
                        <CheckCircle className="w-5 h-5 text-chart-3 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                      </div>
                      <Play className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <Card>
              <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
                <h3>Course Description</h3>
                <p>
                  This comprehensive course provides healthcare professionals with a solid 
                  foundation in Neurologic Music Therapy (NMT). Learn evidence-based techniques 
                  for working with patients experiencing neurological disorders.
                </p>
                <h3>What You'll Learn</h3>
                <ul>
                  <li>Fundamental principles of neurologic music therapy</li>
                  <li>Neurological foundations relevant to music therapy practice</li>
                  <li>Evidence-based assessment and treatment methods</li>
                  <li>Clinical applications across diverse populations</li>
                  <li>Best practices for documentation and treatment planning</li>
                </ul>
                <h3>Prerequisites</h3>
                <p>
                  Board certification in music therapy (MT-BC) or equivalent professional 
                  credential in a related healthcare field.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {resources.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-md border border-border hover-elevate transition-all"
                      data-testid={`resource-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{resource.name}</p>
                          <p className="text-sm text-muted-foreground">{resource.size}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-download-${index}`}>
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussions">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground py-8">
                  Discussion forum coming soon. Share insights and ask questions with fellow learners.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
