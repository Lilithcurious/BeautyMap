import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { FileUpload } from "@/components/FileUpload";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Assessment() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) {
      toast({
        title: "Required Field Missing",
        description: "Please upload a photo for analysis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("photo", photo);
    if (video) {
      formData.append("video", video);
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setLocation("/results");
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Upload Your Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FileUpload
              type="photo"
              accept="image/*"
              label="Face Photo (required)"
              onFileSelect={setPhoto}
              required
            />

            <FileUpload
              type="video"
              accept="video/*"
              label="Video (optional)"
              onFileSelect={setVideo}
            />

            <div className="text-sm text-gray-500 mb-4">
              <p>For best results:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use good lighting</li>
                <li>Face the camera directly</li>
                <li>Remove glasses or hair covering your face</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="sm" text="Analyzing..." />
              ) : (
                "Start Analysis"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}