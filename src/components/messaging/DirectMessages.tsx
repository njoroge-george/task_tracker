"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
  InputAdornment,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Popover,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Plus,
  X,
  Image as ImageIcon,
  Mic,
  Video as VideoIcon,
} from 'lucide-react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useCall } from '@/contexts/CallContext';
import { formatDistanceToNow } from 'date-fns';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import { VoiceRecorder } from './VoiceRecorder';
import { VideoRecorder } from './VideoRecorder';

// Initialize Giphy - you can get free API key at https://developers.giphy.com/
const giphyFetch = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'your_api_key_here');

type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

type Message = {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
  read: boolean;
  sender: User;
  messageType?: string;
  callType?: string;
  callDuration?: number;
  mediaUrl?: string;
  mediaDuration?: number;
  mediaThumbnail?: string;
};

type Conversation = {
  user: User;
  lastMessage: Message | null;
  unreadCount: number;
};

type Props = {
  currentUserId: string;
  users: User[];
  initialConversations: Conversation[];
};

export default function DirectMessages({ currentUserId, users, initialConversations }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [emojiAnchor, setEmojiAnchor] = useState<null | HTMLElement>(null);
  const [gifAnchor, setGifAnchor] = useState<null | HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useRealtime();
  const { initiateCall } = useCall();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when user is selected
  useEffect(() => {
    if (!selectedUser) return;

    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/messages/direct?userId=${selectedUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);
          
          // Mark messages as read
          await fetch('/api/messages/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderId: selectedUser.id }),
          });
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [selectedUser]);

  // Real-time message listening
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (message: Message) => {
      console.log('Received new message:', message);
      
      // Add to messages if conversation is open
      if (selectedUser?.id === message.senderId || selectedUser?.id === message.receiverId) {
        setMessages(prev => [...prev, message]);
        
        // Mark as read if conversation is open
        if (selectedUser?.id === message.senderId) {
          fetch('/api/messages/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId: message.id }),
          });
        }
      }

      // Update conversations list
      setConversations(prev => {
        const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
        const existingIndex = prev.findIndex(c => c.user.id === otherUserId);
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: message,
            unreadCount: selectedUser?.id === message.senderId ? 0 : updated[existingIndex].unreadCount + 1,
          };
          return updated;
        }
        
        return prev;
      });
    };

    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === selectedUser?.id) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on('dm:message', handleNewMessage);
    socket.on('dm:typing', handleTyping);

    return () => {
      socket.off('dm:message', handleNewMessage);
      socket.off('dm:typing', handleTyping);
    };
  }, [socket, isConnected, selectedUser, currentUserId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await fetch('/api/messages/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedUser.id,
          content: newMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        
        // Emit via socket
        socket?.emit('dm:send', data.message);
        socket?.emit('dm:typing', { recipientId: selectedUser.id, isTyping: false });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = () => {
    if (!selectedUser) return;
    socket?.emit('dm:typing', { recipientId: selectedUser.id, isTyping: true });
    
    // Stop typing after 3 seconds
    setTimeout(() => {
      socket?.emit('dm:typing', { recipientId: selectedUser.id, isTyping: false });
    }, 3000);
  };

  const handleStartNewChat = (user: User) => {
    setSelectedUser(user);
    setShowNewChatDialog(false);
    
    // Add to conversations if not already there
    if (!conversations.find(c => c.user.id === user.id)) {
      setConversations(prev => [
        {
          user,
          lastMessage: null,
          unreadCount: 0,
        },
        ...prev,
      ]);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setEmojiAnchor(null);
  };

  const handleGifClick = (gif: any, e: React.SyntheticEvent) => {
    e.preventDefault();
    const gifUrl = gif.images.fixed_height.url;
    setNewMessage(gifUrl);
    setGifAnchor(null);
    // Auto-send GIF
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleSendVoice = async (audioBlob: Blob, duration: number) => {
    if (!selectedUser) return;

    try {
      // Upload audio file
      const formData = new FormData();
      formData.append('file', audioBlob, `voice-${Date.now()}.webm`);
      formData.append('type', 'voice');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload voice note');
      }

      const uploadData = await uploadResponse.json();

      // Send message with media URL
      const response = await fetch('/api/messages/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedUser.id,
          content: '🎤 Voice message',
          messageType: 'VOICE',
          mediaUrl: uploadData.url,
          mediaDuration: duration,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setShowVoiceRecorder(false);
        
        // Emit via socket
        socket?.emit('dm:send', data.message);
      }
    } catch (error) {
      console.error('Failed to send voice message:', error);
    }
  };

  const handleSendVideo = async (videoBlob: Blob, duration: number, thumbnail: string) => {
    if (!selectedUser) return;

    try {
      // Upload video file
      const formData = new FormData();
      formData.append('file', videoBlob, `video-${Date.now()}.webm`);
      formData.append('type', 'video');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video message');
      }

      const uploadData = await uploadResponse.json();

      // Send message with media URL
      const response = await fetch('/api/messages/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedUser.id,
          content: '📹 Video message',
          messageType: 'VIDEO',
          mediaUrl: uploadData.url,
          mediaDuration: duration,
          mediaThumbnail: thumbnail,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setShowVideoRecorder(false);
        
        // Emit via socket
        socket?.emit('dm:send', data.message);
      }
    } catch (error) {
      console.error('Failed to send video message:', error);
    }
  };

  const fetchGifs = (offset: number) => giphyFetch.trending({ offset, limit: 10 });

  const filteredConversations = conversations.filter(conv =>
    conv.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get users not in conversations yet
  const availableUsers = users.filter(
    user => !conversations.find(c => c.user.id === user.id)
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
        height: 'calc(100vh - 200px)',
        gap: 2,
      }}
    >
      {/* Conversations List */}
      <Paper sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Direct Messages
            </Typography>
            <IconButton
              size="small"
              color="primary"
              onClick={() => setShowNewChatDialog(true)}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              <Plus size={20} />
            </IconButton>
          </Box>
          <TextField
            fullWidth
            size="small"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {filteredConversations.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                No conversations yet
              </Typography>
              <Button
                startIcon={<Plus size={16} />}
                onClick={() => setShowNewChatDialog(true)}
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
              >
                Start a conversation
              </Button>
            </Box>
          ) : (
            filteredConversations.map((conv) => (
            <Box key={conv.user.id}>
              <ListItemButton
                selected={selectedUser?.id === conv.user.id}
                onClick={() => setSelectedUser(conv.user)}
                sx={{ py: 2 }}
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={conv.unreadCount}
                    color="primary"
                    overlap="circular"
                  >
                    <Avatar src={conv.user.image || undefined}>
                      {(conv.user.name?.[0] || conv.user.email[0]).toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={conv.user.name || conv.user.email}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {conv.lastMessage && (
                        <>
                          {conv.lastMessage.senderId === currentUserId && (
                            <Box sx={{ display: 'flex', color: 'text.secondary' }}>
                              {conv.lastMessage.read ? <CheckCheck size={14} /> : <Check size={14} />}
                            </Box>
                          )}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: conv.unreadCount > 0 ? 600 : 400,
                            }}
                          >
                            {conv.lastMessage.content}
                          </Typography>
                        </>
                      )}
                    </Box>
                  }
                />
                {conv.lastMessage && (
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                  </Typography>
                )}
              </ListItemButton>
              <Divider />
            </Box>
          )))}
        </List>
      </Paper>

      {/* Chat Area */}
      <Paper sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={selectedUser.image || undefined}>
                  {(selectedUser.name?.[0] || selectedUser.email[0]).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {selectedUser.name || selectedUser.email}
                  </Typography>
                  {isTyping && (
                    <Typography variant="caption" color="primary">
                      typing...
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  size="small"
                  onClick={() => initiateCall(
                    selectedUser.id, 
                    selectedUser.name || selectedUser.email,
                    'audio',
                    selectedUser.image || undefined
                  )}
                  title="Voice call"
                >
                  <Phone size={20} />
                </IconButton>
                <IconButton 
                  size="small"
                  onClick={() => initiateCall(
                    selectedUser.id,
                    selectedUser.name || selectedUser.email,
                    'video',
                    selectedUser.image || undefined
                  )}
                  title="Video call"
                >
                  <Video size={20} />
                </IconButton>
                <IconButton size="small">
                  <MoreVertical size={20} />
                </IconButton>
              </Box>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {messages.map((message, index) => {
                const isOwn = message.senderId === currentUserId;
                const showDate = index === 0 || 
                  new Date(messages[index - 1].createdAt).toDateString() !== 
                  new Date(message.createdAt).toDateString();

                return (
                  <Box key={message.id}>
                    {showDate && (
                      <Box sx={{ textAlign: 'center', my: 2 }}>
                        <Chip
                          label={new Date(message.createdAt).toLocaleDateString()}
                          size="small"
                          sx={{ backgroundColor: 'action.hover' }}
                        />
                      </Box>
                    )}

                    {/* Check if it's a call message */}
                    {(message as any).messageType === 'CALL' ? (
                      <Box sx={{ textAlign: 'center', my: 1 }}>
                        <Chip
                          label={message.content}
                          size="small"
                          sx={{ 
                            backgroundColor: 'action.hover',
                            color: 'text.secondary',
                            fontStyle: 'italic',
                          }}
                        />
                      </Box>
                    ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isOwn ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Paper
                          sx={{
                            p: message.content.includes('giphy.com') || message.messageType === 'VOICE' || message.messageType === 'VIDEO' ? 0 : 1.5,
                            backgroundColor: isOwn ? 'primary.main' : 'background.default',
                            color: isOwn ? 'primary.contrastText' : 'text.primary',
                            borderRadius: 2,
                            borderTopRightRadius: isOwn ? 0 : 2,
                            borderTopLeftRadius: isOwn ? 2 : 0,
                            overflow: 'hidden',
                          }}
                        >
                          {message.messageType === 'VOICE' ? (
                            <Box sx={{ p: 1.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Mic size={16} />
                                <Typography variant="caption">
                                  Voice message ({Math.floor((message.mediaDuration || 0) / 60)}:{String((message.mediaDuration || 0) % 60).padStart(2, '0')})
                                </Typography>
                              </Box>
                              <audio 
                                controls 
                                src={message.mediaUrl}
                                style={{ width: '100%', maxWidth: '300px' }}
                              />
                            </Box>
                          ) : message.messageType === 'VIDEO' ? (
                            <Box>
                              <video 
                                controls 
                                src={message.mediaUrl}
                                poster={message.mediaThumbnail}
                                style={{ 
                                  width: '100%', 
                                  maxWidth: '300px',
                                  display: 'block',
                                  aspectRatio: '4/3',
                                }}
                              />
                              <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <VideoIcon size={16} />
                                <Typography variant="caption">
                                  Video message ({Math.floor((message.mediaDuration || 0) / 60)}:{String((message.mediaDuration || 0) % 60).padStart(2, '0')})
                                </Typography>
                              </Box>
                            </Box>
                          ) : message.content.includes('giphy.com') ? (
                            <img 
                              src={message.content} 
                              alt="GIF" 
                              style={{ 
                                maxWidth: '300px', 
                                width: '100%', 
                                display: 'block',
                                borderRadius: '8px',
                              }} 
                            />
                          ) : (
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                              {message.content}
                            </Typography>
                          )}
                        </Paper>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                          {isOwn && (
                            <Box sx={{ color: message.read ? 'primary.main' : 'text.secondary' }}>
                              {message.read ? <CheckCheck size={14} /> : <Check size={14} />}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    )}
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <IconButton 
                  size="small"
                  onClick={() => setShowVoiceRecorder(true)}
                  title="Voice message"
                >
                  <Mic size={20} />
                </IconButton>
                <IconButton 
                  size="small"
                  onClick={() => setShowVideoRecorder(true)}
                  title="Video message"
                >
                  <VideoIcon size={20} />
                </IconButton>
                <IconButton size="small">
                  <Paperclip size={20} />
                </IconButton>
                <IconButton 
                  size="small"
                  onClick={(e) => setEmojiAnchor(e.currentTarget)}
                >
                  <Smile size={20} />
                </IconButton>
                <IconButton 
                  size="small"
                  onClick={(e) => setGifAnchor(e.currentTarget)}
                >
                  <ImageIcon size={20} />
                </IconButton>

                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    },
                  }}
                />

                <IconButton
                  color="primary"
                  disabled={!newMessage.trim()}
                  onClick={handleSendMessage}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '&:disabled': {
                      backgroundColor: 'action.disabledBackground',
                    },
                  }}
                >
                  <Send size={20} />
                </IconButton>
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Select a conversation to start messaging
            </Typography>
            <Button
              startIcon={<Plus size={16} />}
              onClick={() => setShowNewChatDialog(true)}
              variant="contained"
            >
              Start New Conversation
            </Button>
          </Box>
        )}
      </Paper>

      {/* New Chat Dialog */}
      <Dialog
        open={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Start New Conversation</Typography>
            <IconButton onClick={() => setShowNewChatDialog(false)} size="small">
              <X size={20} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {availableUsers.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {users.length === 0 
                  ? "No team members found in your workspace"
                  : "You already have conversations with all team members"}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {availableUsers.map((user) => (
                <Box key={user.id}>
                  <ListItemButton
                    onClick={() => handleStartNewChat(user)}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemAvatar>
                      <Avatar src={user.image || undefined}>
                        {(user.name?.[0] || user.email[0]).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name || user.email}
                      secondary={user.name ? user.email : null}
                    />
                  </ListItemButton>
                  <Divider />
                </Box>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewChatDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Emoji Picker Popover */}
      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </Popover>

      {/* GIF Picker Popover */}
      <Popover
        open={Boolean(gifAnchor)}
        anchorEl={gifAnchor}
        onClose={() => setGifAnchor(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ width: 400, height: 500, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Choose a GIF
          </Typography>
          <Box sx={{ height: 450, overflow: 'auto' }}>
            <Grid
              key="trending"
              width={360}
              columns={2}
              fetchGifs={fetchGifs}
              onGifClick={handleGifClick}
            />
          </Box>
        </Box>
      </Popover>

      {/* Voice Recorder Dialog */}
      <VoiceRecorder 
        open={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        onSend={handleSendVoice}
      />

      {/* Video Recorder Dialog */}
      <VideoRecorder 
        open={showVideoRecorder}
        onClose={() => setShowVideoRecorder(false)}
        onSend={handleSendVideo}
      />
    </Box>
  );
}
