import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoCallProps {
  consultationId: string;
}

export const VideoCall = ({ consultationId }: VideoCallProps) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    startCall();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Update consultation status
      await supabase
        .from("consultations")
        .update({ status: "in_progress", started_at: new Date().toISOString() })
        .eq("id", consultationId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access camera/microphone",
        variant: "destructive",
      });
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioOn(!isAudioOn);
    }
  };

  const endCall = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    await supabase
      .from("consultations")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", consultationId);

    toast({
      title: "Call Ended",
      description: "The video consultation has ended.",
    });
  };

  return (
    <Card className="p-4">
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: "500px" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
          <Button
            variant={isVideoOn ? "default" : "destructive"}
            size="icon"
            onClick={toggleVideo}
          >
            {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          
          <Button
            variant={isAudioOn ? "default" : "destructive"}
            size="icon"
            onClick={toggleAudio}
          >
            {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="destructive"
            size="icon"
            onClick={endCall}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
