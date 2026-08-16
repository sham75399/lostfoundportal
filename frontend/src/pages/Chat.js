import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Button,
  Badge,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  Send,
  ArrowBack,
  Person,
  AttachFile,
  Search
} from '@mui/icons-material';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { timeAgo } from '../utils/helpers';

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ✅ Check if trying to message self
  useEffect(() => {
    if (userId && user && userId === user.id) {
      setError('You cannot message yourself');
      setSelectedUser(null);
    } else {
      setError('');
    }
  }, [userId, user]);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
    setSocket(newSocket);

    if (user) {
      newSocket.emit('join-room', user.id);
    }

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (message) => {
        console.log('📨 Received message:', message);
        // ✅ Don't add if sender is current user (prevent duplicates)
        if (message.sender?._id !== user?.id) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
          fetchConversations();
        }
      });

      socket.on('user-typing', (data) => {
        if (data.userId === userId) {
          setIsTyping(data.isTyping);
        }
      });

      socket.on('message-sent', (message) => {
        console.log('✅ Message sent confirmation:', message);
      });
    }

    return () => {
      if (socket) {
        socket.off('receive-message');
        socket.off('user-typing');
        socket.off('message-sent');
      }
    };
  }, [socket, userId]);

  useEffect(() => {
    if (userId && userId !== user?.id) {
      fetchConversations();
      fetchMessages(userId);
      fetchUserDetails(userId);
    } else if (userId === user?.id) {
      setError('You cannot message yourself');
      setLoading(false);
    } else {
      fetchConversations();
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      // ✅ Filter out conversations with yourself
      const filtered = response.data.data?.filter(conv => conv.user?._id !== user?.id) || [];
      setConversations(filtered);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const response = await api.get(`/chat/${otherUserId}`);
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchUserDetails = async (otherUserId) => {
    try {
      const response = await api.get(`/users/${otherUserId}`);
      setSelectedUser(response.data.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      if (conversations.length > 0) {
        const conv = conversations.find(c => c.user?._id === otherUserId);
        if (conv) {
          setSelectedUser(conv.user);
        }
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId) {
      console.log('❌ Cannot send empty message or no user selected');
      return;
    }

    // ✅ Prevent messaging yourself
    if (userId === user?.id) {
      setError('You cannot send a message to yourself');
      return;
    }

    console.log('📤 Sending message to:', userId);
    console.log('📝 Content:', newMessage.trim());

    setSending(true);
    setError('');
    try {
      const response = await api.post('/chat', {
        receiverId: userId,
        content: newMessage.trim()
      });

      console.log('✅ Message sent:', response.data);

      const message = response.data.data;
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      if (socket) {
        socket.emit('send-message', {
          senderId: user.id,
          receiverId: userId,
          content: newMessage.trim()
        });
      }

      scrollToBottom();
      fetchConversations();
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && userId && userId !== user?.id) {
      if (!typing) {
        setTyping(true);
        socket.emit('typing', {
          userId: user.id,
          receiverId: userId,
          isTyping: true
        });
      }
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
        socket.emit('typing', {
          userId: user.id,
          receiverId: userId,
          isTyping: false
        });
      }, 1000);
    }
  };

  const handleSelectConversation = (otherUser) => {
    // ✅ Prevent selecting yourself
    if (otherUser._id === user?.id) {
      setError('You cannot chat with yourself');
      return;
    }
    navigate(`/chat/${otherUser._id}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Box className="flex justify-center items-center h-96">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // ✅ Show error if trying to message self
  if (userId === user?.id) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Paper className="p-8 text-center">
          <Typography variant="h5" className="text-red-600 mb-4">
            ⚠️ Cannot Message Yourself
          </Typography>
          <Typography variant="body1" color="textSecondary">
            You cannot send a message to yourself. Please select another user to chat with.
          </Typography>
          <Button
            variant="contained"
            className="mt-4"
            onClick={() => navigate('/chat')}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="py-8">
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Paper className="h-[600px] flex">
        {/* Conversation List */}
        <div className="w-80 border-r flex flex-col">
          <Box className="p-4 border-b bg-gray-50">
            <Typography variant="h6" className="font-bold">
              Messages
            </Typography>
          </Box>
          <Box className="p-2 border-b">
            <TextField
              fullWidth
              placeholder="Search conversations..."
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <List className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <Box className="p-8 text-center">
                <Person className="text-6xl text-gray-400 mb-4" />
                <Typography variant="body2" color="textSecondary">
                  No conversations yet
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Start by messaging someone from an item
                </Typography>
              </Box>
            ) : (
              conversations.map((conv) => {
                // ✅ Skip if conversation is with yourself
                if (conv.user?._id === user?.id) {
                  return null;
                }
                return (
                  <ListItem
                    key={conv.user?._id}
                    button
                    selected={conv.user?._id === userId}
                    onClick={() => handleSelectConversation(conv.user)}
                    className="hover:bg-gray-50"
                  >
                    <ListItemAvatar>
                      <Badge
                        color="success"
                        variant="dot"
                        invisible={!conv.user?.online}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                      >
                        <Avatar src={conv.user?.avatar}>
                          {conv.user?.name?.charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={conv.user?.name}
                      secondary={
                        <Typography variant="caption" color="textSecondary" className="truncate block">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </Typography>
                      }
                    />
                    <Box className="flex flex-col items-end">
                      <Typography variant="caption" color="textSecondary">
                        {conv.lastMessage?.createdAt ? timeAgo(conv.lastMessage.createdAt) : ''}
                      </Typography>
                      {conv.unread > 0 && (
                        <Box className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-1">
                          {conv.unread}
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                );
              })
            )}
          </List>
        </div>

        {/* Chat Area */}
        {userId && selectedUser && userId !== user?.id ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <Box className="p-4 border-b flex items-center gap-3 bg-gray-50">
              <IconButton onClick={() => navigate('/chat')} className="md:hidden">
                <ArrowBack />
              </IconButton>
              <Avatar src={selectedUser?.avatar}>
                {selectedUser?.name?.charAt(0)}
              </Avatar>
              <div className="flex-1">
                <Typography variant="subtitle1" className="font-bold">
                  {selectedUser?.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {isTyping ? 'Typing...' : 'Online'}
                </Typography>
              </div>
              <IconButton>
                <AttachFile />
              </IconButton>
            </Box>

            {/* Messages */}
            <Box className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <Box className="flex flex-col items-center justify-center h-full text-center">
                  <Person className="text-6xl text-gray-300 mb-4" />
                  <Typography variant="body2" color="textSecondary">
                    No messages yet
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Send a message to start the conversation
                  </Typography>
                </Box>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.sender?._id === user.id;
                  return (
                    <Box
                      key={message._id || index}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
                    >
                      {!isOwn && (
                        <Avatar
                          src={message.sender?.avatar}
                          sx={{ width: 32, height: 32, mr: 1 }}
                        >
                          {message.sender?.name?.charAt(0)}
                        </Avatar>
                      )}
                      <Box className={`max-w-[70%] ${isOwn ? 'order-1' : ''}`}>
                        <Box
                          className={`p-3 rounded-lg ${
                            isOwn
                              ? 'bg-primary text-white rounded-br-none'
                              : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                          }`}
                        >
                          <Typography variant="body2" className="break-words">
                            {message.content}
                          </Typography>
                        </Box>
                        <Box className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                          <Typography variant="caption" color="textSecondary">
                            {message.createdAt ? timeAgo(message.createdAt) : ''}
                          </Typography>
                          {isOwn && message.isRead && (
                            <Typography variant="caption" color="textSecondary">
                              ✓✓ Read
                            </Typography>
                          )}
                          {isOwn && !message.isRead && (
                            <Typography variant="caption" color="textSecondary">
                              ✓ Sent
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  multiline
                  maxRows={4}
                  size="small"
                  variant="outlined"
                  disabled={userId === user?.id}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending || userId === user?.id}
                  className="bg-primary text-white hover:bg-primary-dark"
                >
                  {sending ? <CircularProgress size={24} color="inherit" /> : <Send />}
                </IconButton>
              </div>
            </Box>
          </div>
        ) : (
          <Box className="flex-1 flex items-center justify-center bg-gray-50">
            <Box className="text-center">
              <Person className="text-6xl text-gray-400 mb-4" />
              <Typography variant="h6" color="textSecondary">
                Select a conversation to start chatting
              </Typography>
              <Typography variant="body2" color="textSecondary">
                or browse items to find someone to connect with
              </Typography>
              <Button
                variant="contained"
                className="mt-4"
                onClick={() => navigate('/search')}
              >
                Browse Items
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Chat;