/**
 * Screen Share Component
 * 
 * Universal screen sharing UI that can be embedded anywhere
 */

"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useScreenShare, ScreenShareOptions } from '@/hooks/use-screen-share';
import { hasFeature } from '@/lib/plan-features';
import Link from 'next/link';
import {
  MonitorUp,
  MonitorStop,
  Users,
  Video,
  Download,
  Maximize2,
  Minimize2,
  Settings,
  Mic,
  MicOff,
  Crown,
  Lock,
} from 'lucide-react';

interface ScreenShareProps {
  roomId: string;
  userId: string;
  userName: string;
  context?: 'discussion' | 'task' | 'meeting' | 'report' | 'playground';
  showParticipants?: boolean;
  className?: string;
}

export default function ScreenShare({
  roomId,
  userId,
  userName,
  context = 'discussion',
  showParticipants = true,
  className = '',
}: ScreenShareProps) {
  const { data: session } = useSession();
  const userPlan = session?.user?.plan;
  const {
    isSharing,
    isViewing,
    participants,
    localStream,
    remoteStream,
    isRecording,
    recordedChunks,
    startSharing,
    stopSharing,
    startRecording,
    stopRecording,
    downloadRecording,
  } = useScreenShare(roomId, userId);

  const [options, setOptions] = useState<ScreenShareOptions>({
    includeAudio: false,
    resolution: 'auto',
    frameRate: 30,
    recordSession: false,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleStartSharing = async () => {
    await startSharing(options);
  };

  const handleStopSharing = () => {
    stopSharing();
  };

  const toggleFullscreen = () => {
    const videoElement = document.getElementById('screen-share-video');
    if (videoElement) {
      if (!isFullscreen) {
        videoElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const activeSharingSessions = participants.filter(p => p.isSharing).length;
  const hasScreenShareAccess = hasFeature(userPlan, 'screenSharing');

  // If FREE user, show upgrade prompt
  if (!hasScreenShareAccess) {
    return (
      <Card className="border-2 border-dashed border-primary/30">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <MonitorUp className="h-16 w-16 text-muted-foreground" />
              <Lock className="h-8 w-8 text-yellow-500 absolute -bottom-1 -right-1 bg-card rounded-full p-1" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-primary flex items-center gap-2 justify-center">
                <Crown className="h-5 w-5 text-yellow-500" />
                Screen Sharing - PRO Feature
              </h3>
              <p className="text-sm text-secondary max-w-md">
                Upgrade to PRO or ENTERPRISE to share your screen with team members in real-time.
                Perfect for presentations, code reviews, and collaborative work sessions.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <Link href="/dashboard/pricing">
                <Button variant="default" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade to PRO
                </Button>
              </Link>
              <Link href="/dashboard/pricing">
                <Button variant="outline">View Plans</Button>
              </Link>
            </div>
            <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/30">
              <p className="text-xs text-secondary">
                <strong className="text-primary">PRO Features:</strong> Screen sharing, Video messages, Voice messages, Advanced analytics, AI suggestions, and more!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {!isSharing ? (
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <MonitorUp className="h-4 w-4" />
                  Share Screen
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-2 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-primary">Screen Sharing Settings</DialogTitle>
                  <DialogDescription className="text-secondary">
                    Configure your screen sharing preferences
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {/* Resolution */}
                  <div className="space-y-2">
                    <Label className="text-primary">Resolution</Label>
                    <Select
                      value={options.resolution}
                      onValueChange={(value: any) =>
                        setOptions({ ...options, resolution: value })
                      }
                    >
                      <SelectTrigger className="bg-input border-default text-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-default">
                        <SelectItem value="auto">Auto (Default)</SelectItem>
                        <SelectItem value="720p">720p HD</SelectItem>
                        <SelectItem value="1080p">1080p Full HD</SelectItem>
                        <SelectItem value="4k">4K Ultra HD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Frame Rate */}
                  <div className="space-y-2">
                    <Label className="text-primary">Frame Rate</Label>
                    <Select
                      value={options.frameRate?.toString()}
                      onValueChange={(value) =>
                        setOptions({ ...options, frameRate: parseInt(value) })
                      }
                    >
                      <SelectTrigger className="bg-input border-default text-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-default">
                        <SelectItem value="15">15 FPS (Low bandwidth)</SelectItem>
                        <SelectItem value="30">30 FPS (Recommended)</SelectItem>
                        <SelectItem value="60">60 FPS (Smooth)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Include Audio */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-audio" className="flex items-center gap-2 text-primary">
                      {options.includeAudio ? (
                        <Mic className="h-4 w-4" />
                      ) : (
                        <MicOff className="h-4 w-4" />
                      )}
                      Share System Audio
                    </Label>
                    <Switch
                      id="include-audio"
                      checked={options.includeAudio}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, includeAudio: checked })
                      }
                    />
                  </div>

                  {/* Record Session */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="record-session" className="flex items-center gap-2 text-primary">
                      <Video className="h-4 w-4" />
                      Record Session
                    </Label>
                    <Switch
                      id="record-session"
                      checked={options.recordSession}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, recordSession: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSettings(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      handleStartSharing();
                      setShowSettings(false);
                    }}
                  >
                    Start Sharing
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <>
              <Button variant="destructive" className="gap-2" onClick={handleStopSharing}>
                <MonitorStop className="h-4 w-4" />
                Stop Sharing
              </Button>

              {isRecording && (
                <Badge variant="destructive" className="gap-1 animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-white" />
                  Recording
                </Badge>
              )}
            </>
          )}

          {recordedChunks.length > 0 && (
            <Button variant="outline" className="gap-2" onClick={downloadRecording}>
              <Download className="h-4 w-4" />
              Download Recording
            </Button>
          )}
        </div>

        {/* Active Sessions Badge */}
        {activeSharingSessions > 0 && (
          <Badge variant="secondary" className="gap-2">
            <MonitorUp className="h-3 w-3" />
            {activeSharingSessions} sharing
          </Badge>
        )}
      </div>

      {/* Screen Share Display */}
      {(isSharing || isViewing) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MonitorUp className="h-5 w-5" />
              {isSharing ? 'Your Screen' : 'Viewing Screen'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="gap-2"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                id="screen-share-video"
                autoPlay
                playsInline
                muted={isSharing}
                ref={(video) => {
                  if (video) {
                    if (isSharing && localStream) {
                      video.srcObject = localStream;
                    } else if (isViewing && remoteStream) {
                      video.srcObject = remoteStream;
                    }
                  }
                }}
                className="w-full h-full object-contain"
              />

              {/* Overlay Info */}
              <div className="absolute top-4 left-4">
                <Badge className="gap-2 bg-black/50 backdrop-blur">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Live
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Participants List */}
      {showParticipants && participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {participant.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{participant.name}</p>
                      {participant.isSharing && (
                        <p className="text-xs text-muted-foreground">Sharing screen</p>
                      )}
                    </div>
                  </div>
                  {participant.isSharing && (
                    <Badge variant="secondary" className="gap-1">
                      <MonitorUp className="h-3 w-3" />
                      Sharing
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Context-Specific Tips */}
      {!isSharing && !isViewing && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              {context === 'discussion' && (
                <p>💬 Share your screen to collaborate in real-time during discussions</p>
              )}
              {context === 'task' && (
                <p>🐛 Share your screen for live debugging walkthroughs and code reviews</p>
              )}
              {context === 'meeting' && (
                <p>📊 Share your screen for presentations and team-wide demonstrations</p>
              )}
              {context === 'report' && (
                <p>📈 Share your screen to explain charts and analytics in real-time</p>
              )}
              {context === 'playground' && (
                <p>⚡ Share your screen to demonstrate code examples and live coding sessions</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
