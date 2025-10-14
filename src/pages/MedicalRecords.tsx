import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { ImageUpload } from "@/components/medical/ImageUpload";
import { ImageGallery } from "@/components/medical/ImageGallery";
import { MedicalHistory } from "@/components/medical/MedicalHistory";

const MedicalRecords = () => {
  const [refreshGallery, setRefreshGallery] = useState(0);

  const handleUploadComplete = () => {
    setRefreshGallery(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Medical Records</h1>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">Medical History</TabsTrigger>
            <TabsTrigger value="upload">Upload Images</TabsTrigger>
            <TabsTrigger value="gallery">My Images</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-6">
            <MedicalHistory />
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <ImageUpload onUploadComplete={handleUploadComplete} />
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <ImageGallery key={refreshGallery} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MedicalRecords;
