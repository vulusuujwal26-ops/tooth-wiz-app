import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Trash2, Download, Image as ImageIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MedicalImage {
  id: string;
  file_path: string;
  file_name: string;
  description: string | null;
  uploaded_at: string;
}

export const ImageGallery = () => {
  const [images, setImages] = useState<MedicalImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('medical_images')
        .select('*')
        .eq('patient_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      setImages(data || []);

      // Fetch URLs for all images
      const urls: Record<string, string> = {};
      for (const img of data || []) {
        const { data: urlData } = await supabase.storage
          .from('medical-images')
          .createSignedUrl(img.file_path, 3600); // 1 hour expiry

        if (urlData) {
          urls[img.id] = urlData.signedUrl;
        }
      }
      setImageUrls(urls);
    } catch (error: any) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (image: MedicalImage) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('medical-images')
        .remove([image.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('medical_images')
        .delete()
        .eq('id', image.id);

      if (dbError) throw dbError;

      toast.success("Image deleted successfully");
      fetchImages();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete image");
    }
  };

  const handleDownload = async (image: MedicalImage) => {
    try {
      const url = imageUrls[image.id];
      if (!url) return;

      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = image.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No medical images uploaded yet</p>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <Card key={image.id} className="overflow-hidden">
          <div className="aspect-video bg-muted relative">
            {imageUrls[image.id] ? (
              <img
                src={imageUrls[image.id]}
                alt={image.file_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium text-sm mb-1 truncate">{image.file_name}</h3>
            {image.description && (
              <p className="text-xs text-muted-foreground mb-3">{image.description}</p>
            )}
            <p className="text-xs text-muted-foreground mb-3">
              Uploaded: {new Date(image.uploaded_at).toLocaleDateString()}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(image)}
                className="flex-1"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Image?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this medical image. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(image)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
