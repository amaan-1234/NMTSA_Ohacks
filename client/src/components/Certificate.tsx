import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Award, Calendar, User, FileText, Image } from "lucide-react";
import { useAuth } from "@/state/auth";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface CertificateProps {
  courseTitle: string;
  instructor: string;
  ceCredits: number;
  completedDate: string;
  userName: string;
  onDownload: () => void;
}

export default function Certificate({ 
  courseTitle, 
  instructor, 
  ceCredits, 
  completedDate, 
  userName,
  onDownload 
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!certificateRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 1200,
        height: 800
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Certificate_${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateJPG = async () => {
    if (!certificateRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 1200,
        height: 800
      });
      
      const link = document.createElement('a');
      link.download = `Certificate_${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (error) {
      console.error('Error generating JPG:', error);
      alert('Error generating JPG. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <CardContent className="p-0">
          <div 
            ref={certificateRef} 
            className="certificate-container"
            style={{
              width: '1200px',
              height: '800px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              border: '8px solid #1e40af',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: "'Times New Roman', serif"
            }}
          >
            {/* Decorative Border Pattern */}
            <div 
              className="absolute inset-4 border-4 border-double border-blue-600 rounded-lg"
              style={{ borderColor: '#1e40af' }}
            />
            
            {/* Corner Decorations */}
            <div className="absolute top-8 left-8 w-16 h-16 border-4 border-blue-600 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <div className="absolute top-8 right-8 w-16 h-16 border-4 border-blue-600 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <div className="absolute bottom-8 left-8 w-16 h-16 border-4 border-blue-600 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <div className="absolute bottom-8 right-8 w-16 h-16 border-4 border-blue-600 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-blue-600" />
            </div>

            {/* Background Pattern */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e40af' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}
            />

            {/* Header Section */}
            <div className="text-center pt-12 pb-6">
              {/* Organization Info */}
              <div className="mb-4">
                <div 
                  className="text-2xl font-bold text-blue-900 mb-2"
                  style={{ fontFamily: "'Times New Roman', serif" }}
                >
                  NMTSA
                </div>
                <div 
                  className="text-sm text-blue-700 font-semibold mb-1"
                  style={{ fontFamily: "'Times New Roman', serif" }}
                >
                  Neurologic Music Therapy Services of Arizona
                </div>
                <div className="text-xs text-blue-600 mb-1">
                  AMTA-Approved Continuing Education Provider
                </div>
                <div 
                  className="text-xs text-gray-600 italic"
                  style={{ fontFamily: "'Times New Roman', serif" }}
                >
                  This certificate verifies successful completion of the course requirements.
                </div>
              </div>

              {/* Certificate Title */}
              <div className="mb-4">
                <h1 
                  className="text-4xl font-bold text-blue-900 mb-3"
                  style={{ 
                    fontFamily: "'Times New Roman', serif",
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                    letterSpacing: '2px'
                  }}
                >
                  CERTIFICATE OF COMPLETION
                </h1>
                <div 
                  className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-3"
                />
                <p 
                  className="text-lg text-blue-700 font-semibold"
                  style={{ letterSpacing: '1px' }}
                >
                  Professional Development Achievement
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-16 py-4">
              {/* Congratulations Section */}
              <div className="text-center mb-8">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 px-8 rounded-2xl shadow-2xl"
                  style={{ 
                    background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                    boxShadow: '0 15px 30px rgba(30, 64, 175, 0.3)'
                  }}
                >
                  <h2 className="text-3xl font-bold mb-3">🎉 Congratulations!</h2>
                  <p className="text-lg opacity-90">
                    You have successfully completed the course and demonstrated mastery of the subject matter.
                  </p>
                </div>
              </div>

              {/* Course Details */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-blue-200">
                <h2 
                  className="text-3xl font-bold text-center text-blue-900 mb-6"
                  style={{ fontFamily: "'Times New Roman', serif" }}
                >
                  {courseTitle}
                </h2>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                    <User className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600 font-semibold">STUDENT</p>
                      <p className="text-lg font-bold text-blue-900">{userName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                    <Award className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600 font-semibold">INSTRUCTOR</p>
                      <p className="text-lg font-bold text-blue-900">{instructor}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600 font-semibold">COMPLETED</p>
                      <p className="text-lg font-bold text-blue-900">{completedDate}</p>
                    </div>
                  </div>
                  
                  {ceCredits > 0 && (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                      <Award className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-xs text-blue-600 font-semibold">CE CREDITS</p>
                        <p className="text-lg font-bold text-blue-900">{ceCredits}</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>


            {/* Decorative Seals */}
            <div className="absolute top-1/2 left-6 transform -translate-y-1/2">
              <div className="w-16 h-16 border-3 border-blue-600 rounded-full flex items-center justify-center bg-white shadow-md">
                <div className="w-12 h-12 border-2 border-blue-600 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="absolute top-1/2 right-6 transform -translate-y-1/2">
              <div className="w-16 h-16 border-3 border-blue-600 rounded-full flex items-center justify-center bg-white shadow-md">
                <div className="w-12 h-12 border-2 border-blue-600 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t bg-muted/30">
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={generatePDF}
                disabled={isGenerating}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </Button>
              <Button 
                onClick={generateJPG}
                disabled={isGenerating}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                <Image className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Download JPG'}
              </Button>
              <Button 
                variant="outline"
                onClick={onDownload}
                disabled={isGenerating}
              >
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
