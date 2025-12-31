'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useVoiceRoom } from '@/contexts/VoiceRoomContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  Phone,
  PhoneOff,
  Plus,
  Users,
  Volume2,
  Loader2,
  Settings,
  Trash2,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  PictureInPicture,
  Maximize2,
  Grid3X3,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { VideoGrid } from '@/components/rooms/VideoGrid';

interface VoiceRoom {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  maxMembers: number;
  isActive: boolean;
  createdBy: {
    id: string;
    name: string;
    image?: string;
  };
  participants: Array<{
    id: string;
    userId: string;
    isMuted: boolean;
    user: {
      id: string;
      name: string;
      image?: string;
    };
  }>;
}

export default function VoiceRoomsPage() {
  const { data: session } = useSession();
  const { currentWorkspace } = useWorkspace();
  const {
    isInRoom,
    currentRoom,
    participants,
    localVideoStream,
    localScreenStream,
    isMuted,
    isDeafened,
    isVideoOn,
    isScreenSharing,
    isSpeaking,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleDeafen,
    toggleVideo,
    toggleScreenShare,
    isConnecting,
    enterPiP,
    exitPiP,
    isPiPActive,
  } = useVoiceRoom();

  const [rooms, setRooms] = useState<VoiceRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch voice rooms
  const fetchRooms = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    try {
      const response = await fetch(`/api/voice-rooms?workspaceId=${currentWorkspace.id}`);
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Failed to fetch voice rooms:', error);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchRooms();
    // Refresh every 10 seconds for participant updates
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  // Create a new room
  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || !currentWorkspace?.id) return;

    setCreating(true);
    try {
      const response = await fetch('/api/voice-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoomName.trim(),
          description: newRoomDescription.trim() || undefined,
          workspaceId: currentWorkspace.id,
        }),
      });

      if (response.ok) {
        const room = await response.json();
        setRooms(prev => [room, ...prev]);
        setCreateDialogOpen(false);
        setNewRoomName('');
        setNewRoomDescription('');
        toast.success('Voice room created');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create room');
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error('Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  // Delete a room
  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this voice room?')) return;

    try {
      const response = await fetch(`/api/voice-rooms/${roomId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRooms(prev => prev.filter(r => r.id !== roomId));
        toast.success('Voice room deleted');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Failed to delete room:', error);
      toast.error('Failed to delete room');
    }
  };

  // Handle joining a room
  const handleJoinRoom = async (room: VoiceRoom) => {
    if (isInRoom && currentRoom?.id === room.id) {
      leaveRoom();
      return;
    }

    await joinRoom({
      id: room.id,
      name: room.name,
      description: room.description,
      workspaceId: room.workspaceId,
      maxMembers: room.maxMembers,
    });
  };

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a workspace to view voice rooms</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Voice Rooms</h1>
          <p className="text-muted-foreground mt-1">
            Join a voice channel to talk with your team in real-time
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Room
        </Button>
      </div>

      {/* Active Voice Panel - Shows when in a room */}
      {isInRoom && currentRoom && (
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Volume2 className={cn(
                    "w-5 h-5",
                    isSpeaking ? "text-green-500 animate-pulse" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <CardTitle className="text-lg">{currentRoom.name}</CardTitle>
                  <CardDescription>
                    {participants.length + 1} participant{participants.length !== 0 && 's'}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Mute */}
                <Button
                  variant={isMuted ? "destructive" : "secondary"}
                  size="icon"
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                {/* Deafen */}
                <Button
                  variant={isDeafened ? "destructive" : "secondary"}
                  size="icon"
                  onClick={toggleDeafen}
                  title={isDeafened ? 'Undeafen' : 'Deafen'}
                >
                  {isDeafened ? <HeadphoneOff className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                </Button>
                {/* Video toggle */}
                <Button
                  variant={isVideoOn ? "default" : "secondary"}
                  size="icon"
                  onClick={toggleVideo}
                  title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
                {/* Screen share toggle */}
                <Button
                  variant={isScreenSharing ? "default" : "secondary"}
                  size="icon"
                  onClick={toggleScreenShare}
                  title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                  {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <MonitorUp className="w-4 h-4" />}
                </Button>
                {/* Picture-in-Picture */}
                <Button
                  variant={isPiPActive ? "default" : "secondary"}
                  size="icon"
                  onClick={isPiPActive ? exitPiP : enterPiP}
                  title={isPiPActive ? 'Exit PiP' : 'Picture-in-Picture'}
                  disabled={!isVideoOn && !isScreenSharing && !participants.some(p => p.isVideoOn || p.isScreenSharing)}
                >
                  <PictureInPicture className="w-4 h-4" />
                </Button>
                {/* View mode toggle */}
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
                  title={viewMode === 'grid' ? 'List view' : 'Grid view'}
                >
                  {viewMode === 'grid' ? <Users className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </Button>
                {/* Leave */}
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={leaveRoom}
                  title="Leave room"
                >
                  <PhoneOff className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'grid' && (isVideoOn || isScreenSharing || participants.some(p => p.isVideoOn || p.isScreenSharing)) ? (
              /* Video Grid View */
              <div className="h-[400px] bg-slate-900 rounded-xl overflow-hidden">
                <VideoGrid
                  participants={participants.map(p => ({
                    oderId: p.userId,
                    odeName: p.userName,
                    oderAvatar: p.userAvatar,
                    socketId: p.socketId,
                    isMuted: p.isMuted,
                    isVideoOn: p.isVideoOn,
                    isScreenSharing: p.isScreenSharing,
                    isSpeaking: p.isSpeaking,
                    videoStream: p.videoStream,
                    screenStream: p.screenStream,
                    stream: p.stream,
                  }))}
                  localVideoStream={localVideoStream}
                  localScreenStream={localScreenStream}
                  isLocalVideoOn={isVideoOn}
                  isLocalScreenSharing={isScreenSharing}
                  isLocalMuted={isMuted}
                  localUserName={session?.user?.name || 'You'}
                  localUserAvatar={session?.user?.image || undefined}
                />
              </div>
            ) : (
              /* Participant List View */
              <div className="flex flex-wrap gap-3">
                {/* Current user */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-background">
                  <Avatar className={cn(
                    "w-8 h-8 ring-2",
                    isSpeaking ? "ring-green-500" : "ring-transparent"
                  )}>
                    <AvatarImage src={session?.user?.image || ''} />
                    <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{session?.user?.name} (You)</span>
                  {isMuted && <MicOff className="w-3 h-3 text-destructive" />}
                  {isVideoOn && <Video className="w-3 h-3 text-green-500" />}
                  {isScreenSharing && <MonitorUp className="w-3 h-3 text-blue-500" />}
                </div>
                {/* Other participants */}
                {participants.map((p) => (
                  <div key={p.socketId} className="flex items-center gap-2 p-2 rounded-lg bg-background">
                    <Avatar className={cn(
                      "w-8 h-8 ring-2",
                      p.isSpeaking ? "ring-green-500" : "ring-transparent"
                    )}>
                      <AvatarImage src={p.userAvatar || ''} />
                      <AvatarFallback>{p.userName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{p.userName}</span>
                    {p.isMuted && <MicOff className="w-3 h-3 text-destructive" />}
                    {p.isVideoOn && <Video className="w-3 h-3 text-green-500" />}
                    {p.isScreenSharing && <MonitorUp className="w-3 h-3 text-blue-500" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Room List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : rooms.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No voice rooms yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first voice room to start talking with your team
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => {
            const isCurrentRoom = isInRoom && currentRoom?.id === room.id;
            const participantCount = room.participants.length;

            return (
              <Card
                key={room.id}
                className={cn(
                  "transition-all hover:shadow-md",
                  isCurrentRoom && "ring-2 ring-primary"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className={cn(
                        "w-5 h-5",
                        participantCount > 0 ? "text-green-500" : "text-muted-foreground"
                      )} />
                      <CardTitle className="text-base">{room.name}</CardTitle>
                    </div>
                    {room.createdBy.id === session?.user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteRoom(room.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {room.description && (
                    <CardDescription className="line-clamp-2">
                      {room.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {participantCount > 0 ? (
                        <>
                          <div className="flex -space-x-2">
                            {room.participants.slice(0, 3).map((p) => (
                              <Avatar key={p.id} className="w-6 h-6 border-2 border-background">
                                <AvatarImage src={p.user.image || ''} />
                                <AvatarFallback className="text-xs">
                                  {p.user.name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {participantCount}/{room.maxMembers}
                          </Badge>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">Empty</span>
                      )}
                    </div>
                    <Button
                      variant={isCurrentRoom ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleJoinRoom(room)}
                      disabled={isConnecting}
                    >
                      {isConnecting && currentRoom?.id === room.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isCurrentRoom ? (
                        <>
                          <PhoneOff className="w-4 h-4 mr-1" />
                          Leave
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4 mr-1" />
                          Join
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Room Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Voice Room</DialogTitle>
            <DialogDescription>
              Create a new voice channel for your team to communicate in real-time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roomName">Room Name</Label>
              <Input
                id="roomName"
                placeholder="e.g., General, Stand-up, Design Review"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomDescription">Description (optional)</Label>
              <Textarea
                id="roomDescription"
                placeholder="What's this room for?"
                value={newRoomDescription}
                onChange={(e) => setNewRoomDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateRoom}
              disabled={!newRoomName.trim() || creating}
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Room'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
