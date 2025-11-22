import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Trash2, FileText, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface GeneratedImage {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
  saved_to_notes: boolean;
  note_id: string | null;
}

const ImageGalleryPage = () => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your images",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast({
        title: "Error",
        description: "Failed to load images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `study-diagram-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Downloaded",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("generated_images")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setImages(images.filter((img) => img.id !== id));
      toast({
        title: "Deleted",
        description: "Image deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleSaveToNotes = async () => {
    if (!selectedImage || !noteContent.trim()) return;

    setSavingNote(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create a study note with the image
      const { data: note, error: noteError } = await supabase
        .from("study_notes")
        .insert({
          user_id: user.id,
          subject: "Generated Diagram",
          topic: selectedImage.prompt,
          content: `${noteContent}\n\n![Generated Diagram](${selectedImage.image_url})`,
          ai_generated: true,
        })
        .select()
        .single();

      if (noteError) throw noteError;

      // Update the image record
      await supabase
        .from("generated_images")
        .update({
          saved_to_notes: true,
          note_id: note.id,
        })
        .eq("id", selectedImage.id);

      setImages(
        images.map((img) =>
          img.id === selectedImage.id
            ? { ...img, saved_to_notes: true, note_id: note.id }
            : img
        )
      );

      toast({
        title: "Saved",
        description: "Image saved to study notes",
      });

      setSelectedImage(null);
      setNoteContent("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save to notes",
        variant: "destructive",
      });
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Study Diagrams Gallery</h1>
          <p className="text-muted-foreground">
            View and manage your AI-generated study diagrams
          </p>
        </div>
      </div>

      {images.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No generated images yet. Try generating some diagrams in the AI Chat!
          </p>
          <Button onClick={() => navigate("/chat")}>Go to AI Chat</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={image.image_url}
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {image.prompt}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(image.image_url, image.prompt)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  {!image.saved_to_notes ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedImage(image)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Save to Notes
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Save to Study Notes</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <img
                            src={image.image_url}
                            alt={image.prompt}
                            className="w-full rounded-lg"
                          />
                          <div>
                            <label className="text-sm font-medium">
                              Add notes (optional)
                            </label>
                            <Textarea
                              value={noteContent}
                              onChange={(e) => setNoteContent(e.target.value)}
                              placeholder="Add additional notes or context..."
                              className="mt-2"
                              rows={4}
                            />
                          </div>
                          <Button
                            onClick={handleSaveToNotes}
                            disabled={savingNote}
                            className="w-full"
                          >
                            {savingNote ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save to Notes"
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      <FileText className="w-4 h-4 mr-2" />
                      Saved
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGalleryPage;
