import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Camera, Video, X } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept: string;
  label: string;
  type: "photo" | "video";
  required?: boolean;
}

export function FileUpload({
  onFileSelect,
  accept,
  label,
  type,
  required = false,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      setFileName(file.name);

      if (type === "photo") {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (type === "video" && file.type.startsWith("video/")) {
        const videoUrl = URL.createObjectURL(file);
        setPreview(videoUrl);
      }
    } else {
      handleClear();
    }
  };

  const handleClear = () => {
    onFileSelect(null);
    setPreview(null);
    setFileName(null);
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      {!preview ? (
        <Card className="p-4 border-dashed">
          <div className="flex flex-col items-center justify-center gap-2">
            {type === "photo" ? (
              <Camera className="w-8 h-8 text-gray-400" />
            ) : (
              <Video className="w-8 h-8 text-gray-400" />
            )}
            <Input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              required={required}
              className="cursor-pointer"
            />
          </div>
        </Card>
      ) : (
        <div className="relative">
          {type === "photo" ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 rounded-lg mx-auto"
            />
          ) : (
            <video
              src={preview}
              controls
              className="max-h-48 w-full rounded-lg"
            />
          )}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {fileName && (
        <p className="text-sm text-gray-500 truncate">{fileName}</p>
      )}
    </div>
  );
}
