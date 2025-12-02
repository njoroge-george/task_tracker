"use client";

import { useState, useRef, useEffect } from "react";
import { Monitor, MonitorOff, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ScreenShareButtonProps {
  context?: "discussion" | "task" | "meeting" | "analytics" | "playground" | "global";
  roomId?: string;
  className?: string;
}

export default function ScreenShareButton({ context = "global", roomId, className }: ScreenShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [viewers, setViewers] = useState<string[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);

  const startScreenShare = async () => {
    try {
      // Request screen sharing permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          displaySurface: "monitor",
        } as any,
        audio: false,
      });

      streamRef.current = stream;
      setIsSharing(true);
      setShowDialog(true);
      toast.success("Screen sharing started");

      // Connect to WebSocket for signaling
      connectToSignalingServer();

      // Handle stream end (user clicks stop sharing in browser UI)
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error: any) {
      console.error("Error starting screen share:", error);
      if (error.name === "NotAllowedError") {
        toast.error("Screen sharing permission denied");
      } else {
        toast.error("Failed to start screen sharing");
      }
    }
  };

  const connectToSignalingServer = () => {
    // Connect to WebSocket signaling server
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/screen-share/signaling?roomId=${roomId || 'global'}`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to signaling server");
      ws.send(JSON.stringify({
        type: "start-sharing",
        context,
        roomId: roomId || 'global',
      }));
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "viewer-joined":
          setViewers(prev => [...prev, data.viewerId]);
          toast.info(`${data.viewerName || "Someone"} joined your screen share`);
          // Create peer connection for new viewer
          await createPeerConnection(data.viewerId);
          break;

        case "viewer-left":
          setViewers(prev => prev.filter(id => id !== data.viewerId));
          peerConnectionsRef.current.get(data.viewerId)?.close();
          peerConnectionsRef.current.delete(data.viewerId);
          break;

        case "ice-candidate":
          const pc = peerConnectionsRef.current.get(data.fromId);
          if (pc && data.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
          break;

        case "answer":
          const peerConn = peerConnectionsRef.current.get(data.fromId);
          if (peerConn && data.answer) {
            await peerConn.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
          break;
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("Connection error");
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };
  };

  const createPeerConnection = async (viewerId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    // Add screen stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, streamRef.current!);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: "ice-candidate",
          toId: viewerId,
          candidate: event.candidate.toJSON(),
        }));
      }
    };

    peerConnectionsRef.current.set(viewerId, pc);

    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: "offer",
        toId: viewerId,
        offer: offer,
      }));
    }
  };

  const stopScreenShare = () => {
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: "stop-sharing" }));
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsSharing(false);
    setShowDialog(false);
    setViewers([]);
    toast.info("Screen sharing stopped");
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (isSharing) {
        stopScreenShare();
      }
    };
  }, []);

  return (
    <>
      <Button
        onClick={isSharing ? stopScreenShare : startScreenShare}
        variant={isSharing ? "destructive" : "default"}
        size="sm"
        className={className}
      >
        {isSharing ? (
          <>
            <MonitorOff className="w-4 h-4 mr-2" />
            Stop Sharing
          </>
        ) : (
          <>
            <Monitor className="w-4 h-4 mr-2" />
            Share Screen
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Screen Sharing Active</DialogTitle>
            <DialogDescription>
              Your screen is being shared {context !== "global" && `in ${context}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-accent" />
                <span className="font-medium">Sharing your screen</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-secondary">
                <Users className="w-4 h-4" />
                <span>{viewers.length} viewer{viewers.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {viewers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Current Viewers:</h4>
                <div className="space-y-1">
                  {viewers.map((viewerId, index) => (
                    <div key={viewerId} className="text-sm text-secondary flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Viewer {index + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={stopScreenShare} variant="destructive" className="flex-1">
                <MonitorOff className="w-4 h-4 mr-2" />
                Stop Sharing
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Tip: You can also stop sharing from your browser's address bar or notification area
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
