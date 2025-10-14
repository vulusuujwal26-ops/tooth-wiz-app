import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  appointmentId?: string;
  onUploadComplete?: () => void;
}

export const ImageUpload = ({ appointmentId, onUploadComplete }: ImageUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    try {
      setUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to upload images");
        return;
      }

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('medical_images')
        .insert({
          patient_id: user.id,
          appointment_id: appointmentId || null,
          file_path: filePath,
          file_name: file.name,
          file_type: file.type,
          description: description || null,
        });

      if (dbError) throw dbError;

      toast.success("Image uploaded successfully");
      setFile(null);
      setPreview(null);
      setDescription("");
      onUploadComplete?.();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ImageIcon className="h-5 w-5" />
        Upload Medical Image
      </h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="image-upload">Select Image (X-ray, Photo)</Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Max size: 5MB. Formats: JPEG, PNG, WEBP
          </p>
        </div>

        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-48 object-contain rounded-lg border"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={clearFile}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes about this image..."
            rows={3}
            disabled={uploading}
            className="mt-2"
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
