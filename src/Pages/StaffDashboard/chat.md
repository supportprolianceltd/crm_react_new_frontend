# Chat System Documentation

## Overview

The Chat System provides real-time messaging functionality with support for text messages, emojis, file sharing, and threaded conversations. It includes WebSocket-based real-time communication, message history, reactions, and presence indicators.

## Core Features

### 🎯 **Real-time Messaging**
- Instant message delivery via WebSockets
- Message history and pagination
- Read receipts and typing indicators
- Online/offline presence status

### 💬 **Message Types**
- **Text**: Plain text messages
- **Emoji**: Unicode emoji support
- **File**: Document and image sharing
- **Image**: Optimized image display
- **System**: Automated status messages

### 👥 **Conversation Types**
- **Direct**: One-on-one private messaging
- **Group**: Multi-user group chats
- **Channel**: Broadcast-style channels

### 🎨 **Rich Interactions**
- Emoji reactions to messages
- Message threading (replies)
- File attachments with previews
- Message editing and deletion
- @mentions and notifications

## Architecture

### Database Models

#### ChatConversation
```python
{
  "id": "uuid",
  "tenant_id": "uuid",
  "title": "Project Discussion",
  "conversation_type": "group|direct|channel",
  "created_by": "uuid",
  "is_active": true,
  "last_message_at": "2024-01-01T12:00:00Z",
  "created_at": "2024-01-01T10:00:00Z"
}
```

#### ChatParticipant
```python
{
  "id": "uuid",
  "conversation": "uuid",
  "user_id": "uuid",
  "role": "admin|moderator|member",
  "joined_at": "2024-01-01T10:00:00Z",
  "last_seen_at": "2024-01-01T12:00:00Z",
  "is_active": true
}
```

#### ChatMessage
```python
{
  "id": "uuid",
  "conversation": "uuid",
  "sender_id": "uuid",
  "message_type": "text|emoji|file|image|system",
  "content": "Hello world!",
  "file_url": "/media/chat-files/...",
  "file_name": "document.pdf",
  "file_size": 1024000,
  "reply_to": "uuid",  // Optional
  "edited_at": "2024-01-01T12:05:00Z",
  "is_deleted": false,
  "created_at": "2024-01-01T12:00:00Z"
}
```

#### MessageReaction
```python
{
  "id": "uuid",
  "message": "uuid",
  "user_id": "uuid",
  "emoji": "👍",
  "created_at": "2024-01-01T12:01:00Z"
}
```

#### UserPresence
```python
{
  "id": "uuid",
  "user_id": "uuid",
  "status": "online|away|busy|offline",
  "last_seen": "2024-01-01T12:00:00Z",
  "current_conversation": "uuid"
}
```

## API Endpoints

### Conversations

#### List/Create Conversations
```
GET/POST /api/notifications/chat/conversations/
```

**Create Request:**
```json
{
  "title": "Project Team Chat",
  "conversation_type": "group"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Project Team Chat",
  "conversation_type": "group",
  "participant_count": 1,
  "last_message": null,
  "created_at": "2024-01-01T12:00:00Z"
}
```

#### Get/Update/Delete Conversation
```
GET/PUT/DELETE /api/notifications/chat/conversations/{id}/
```

### Participants

#### List/Add Participants
```
GET/POST /api/notifications/chat/conversations/{conversation_id}/participants/
```

**Add Participant:**
```json
{
  "user_id": "uuid",
  "role": "member"
}
```

### Messages

#### List/Send Messages
```
GET/POST /api/notifications/chat/conversations/{conversation_id}/messages/
```

**Send Message:**
```json
{
  "message_type": "text",
  "content": "Hello everyone! 👋",
  "reply_to": "uuid"  // Optional
}
```

**Send File:**
```json
{
  "message_type": "file",
  "content": "Check out this document",
  "file_url": "/media/chat-files/doc.pdf",
  "file_name": "project_plan.pdf",
  "file_size": 2048000
}
```

**Response:**
```json
{
  "id": "uuid",
  "sender_id": "uuid",
  "message_type": "text",
  "content": "Hello everyone! 👋",
  "reactions": [],
  "reply_count": 0,
  "created_at": "2024-01-01T12:00:00Z"
}
```

#### Get/Update/Delete Message
```
GET/PUT/DELETE /api/notifications/chat/conversations/{conversation_id}/messages/{id}/
```

### Reactions

#### List/Add Reactions
```
GET/POST /api/notifications/chat/messages/{message_id}/reactions/
```

**Add Reaction:**
```json
{
  "emoji": "👍"
}
```

### Presence

#### List User Presence
```
GET /api/notifications/chat/presence/
```

#### Update My Presence
```
GET/PUT /api/notifications/chat/presence/me/
```

**Update Presence:**
```json
{
  "status": "busy",
  "current_conversation": "uuid"
}
```

### File Upload

#### Upload File
```
POST /api/notifications/chat/upload/
```

**Multipart Form Data:**
- `file`: File to upload

**Response:**
```json
{
  "file_url": "/media/chat-files/tenant_123/document.pdf",
  "file_name": "document.pdf",
  "file_size": 2048000,
  "content_type": "application/pdf"
}
```

## WebSocket API

### Connection
```
WebSocket: ws://localhost:3001/ws/chat/{tenant_id}/
```

### Authentication
JWT token required in connection headers or initial message.

### Message Format
All WebSocket messages use JSON format:

```json
{
  "type": "message_type",
  "data": {...}
}
```

### Client → Server Messages

#### Join Conversation
```json
{
  "type": "join_conversation",
  "conversation_id": "uuid"
}
```

#### Send Message
```json
{
  "type": "send_message",
  "conversation_id": "uuid",
  "content": "Hello world!",
  "message_type": "text"
}
```

#### Start/Stop Typing
```json
{
  "type": "start_typing",
  "conversation_id": "uuid"
}
```

```json
{
  "type": "stop_typing",
  "conversation_id": "uuid"
}
```

#### Add/Remove Reaction
```json
{
  "type": "add_reaction",
  "message_id": "uuid",
  "emoji": "👍"
}
```

```json
{
  "type": "remove_reaction",
  "message_id": "uuid",
  "emoji": "👍"
}
```

#### Mark as Read
```json
{
  "type": "mark_read",
  "conversation_id": "uuid"
}
```

#### Update Presence
```json
{
  "type": "update_presence",
  "status": "away"
}
```

### Server → Client Messages

#### Connection Established
```json
{
  "type": "connection_established",
  "message": "Connected to chat service",
  "user_id": "uuid",
  "tenant_id": "uuid",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### New Message
```json
{
  "type": "new_message",
  "message": {
    "id": "uuid",
    "sender_id": "uuid",
    "content": "Hello!",
    "message_type": "text",
    "created_at": "2024-01-01T12:00:00Z",
    "reactions": []
  }
}
```

#### Message Updated
```json
{
  "type": "message_updated",
  "message": {
    "id": "uuid",
    "content": "Hello world!",
    "edited_at": "2024-01-01T12:05:00Z"
  }
}
```

#### Message Deleted
```json
{
  "type": "message_deleted",
  "message_id": "uuid"
}
```

#### Reaction Added/Removed
```json
{
  "type": "reaction_added",
  "reaction": {
    "message_id": "uuid",
    "user_id": "uuid",
    "emoji": "👍",
    "created_at": "2024-01-01T12:01:00Z"
  }
}
```

#### Typing Indicator
```json
{
  "type": "typing_indicator",
  "user_id": "uuid",
  "is_typing": true
}
```

## Frontend Integration

### React Chat Component Example

```javascript
import React, { useState, useEffect, useRef } from 'react';

function ChatRoom({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(`ws://localhost:3001/ws/chat/${tenantId}/`);
    ws.onopen = () => {
      // Join conversation
      ws.send(JSON.stringify({
        type: 'join_conversation',
        conversation_id: conversationId
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    setSocket(ws);
    return () => ws.close();
  }, [conversationId]);

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'new_message':
        setMessages(prev => [...prev, data.message]);
        break;
      case 'typing_indicator':
        setIsTyping(data.is_typing);
        break;
      // Handle other message types...
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    socket.send(JSON.stringify({
      type: 'send_message',
      conversation_id: conversationId,
      content: newMessage,
      message_type: 'text'
    }));

    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // Send typing indicators
    if (e.target.value && !isTyping) {
      socket.send(JSON.stringify({
        type: 'start_typing',
        conversation_id: conversationId
      }));
    } else if (!e.target.value && isTyping) {
      socket.send(JSON.stringify({
        type: 'stop_typing',
        conversation_id: conversationId
      }));
    }
  };

  return (
    <div className="chat-room">
      <div className="messages">
        {messages.map(message => (
          <div key={message.id} className="message">
            <strong>{message.sender_id}:</strong> {message.content}
            {message.reactions.length > 0 && (
              <div className="reactions">
                {message.reactions.map((reaction, index) => (
                  <span key={index}>{reaction.emoji}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {isTyping && <div className="typing">Someone is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
```

### File Upload Example

```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/notifications/chat/upload/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    },
    body: formData
  });

  const result = await response.json();

  // Send file message
  socket.send(JSON.stringify({
    type: 'send_message',
    conversation_id: conversationId,
    content: `Shared a file: ${result.file_name}`,
    message_type: 'file',
    file_url: result.file_url,
    file_name: result.file_name,
    file_size: result.file_size
  }));
};
```

## Security Features

### Authentication
- JWT token validation for WebSocket connections
- User identity verification for all operations
- Tenant isolation enforcement

### Authorization
- Conversation membership validation
- Message ownership checks for edits/deletes
- Role-based permissions (admin/moderator/member)

### Content Validation
- File type and size restrictions
- Message content sanitization
- Rate limiting for spam prevention

## Performance Optimizations

### Database Indexing
- Composite indexes on frequently queried fields
- Optimized queries with select_related/prefetch_related
- Efficient pagination for message history

### WebSocket Scaling
- Redis-backed channel layers for horizontal scaling
- Connection pooling and load balancing
- Message broadcasting optimization

### Caching
- User presence caching
- Conversation metadata caching
- File URL caching

## Monitoring & Analytics

### Message Metrics
- Messages sent per conversation/user
- File upload statistics
- Real-time connection counts

### Performance Monitoring
- WebSocket connection latency
- Message delivery times
- Database query performance

### User Engagement
- Active conversation tracking
- User participation metrics
- Feature usage analytics

## Future Enhancements

### Advanced Features
- **Voice Messages**: Audio recording and playback
- **Video Calls**: WebRTC integration
- **Screen Sharing**: Real-time collaboration
- **Message Encryption**: End-to-end security
- **Offline Support**: Service worker caching

### AI Integration
- **Smart Replies**: AI-generated response suggestions
- **Content Moderation**: Automated inappropriate content detection
- **Translation**: Real-time message translation
- **Sentiment Analysis**: Message tone detection

### Advanced Chat Features
- **Threaded Conversations**: Nested reply chains
- **Polls and Surveys**: Interactive content
- **Calendar Integration**: Meeting scheduling
- **Task Management**: Action item tracking

This chat system provides a solid foundation for real-time communication with room for extensive customization and feature expansion.





# React Frontend Integration Guide for In-App Notifications

## Overview

Your notification service now supports **real-time in-app notifications** via WebSocket alongside email notifications. This guide shows how to integrate the notification system with your React frontend application.

## Architecture

```
React App ↔ WebSocket ↔ Notification Service
    ↓              ↓              ↓
User sees     Real-time        Processes events
notifications  delivery        & sends to groups
```

## 1. WebSocket Connection Setup

### Install Dependencies

```bash
npm install react-use-websocket jwt-decode
# or
yarn add react-use-websocket jwt-decode
```

### WebSocket Hook (`useNotifications.js`)

```javascript
import { useState, useEffect, useCallback } from 'react';
import useWebSocket from 'react-use-websocket';
import { jwtDecode } from 'jwt-decode';

const useNotifications = (tenantId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Get authentication token (adjust based on your auth system)
  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  // WebSocket URL construction
  const getWebSocketUrl = useCallback(() => {
    const token = getAuthToken();
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8001';
    return `${wsUrl}/ws/notifications/${tenantId}/?token=${token}`;
  }, [tenantId]);

  // WebSocket configuration
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    getWebSocketUrl,
    {
      onOpen: () => {
        console.log('🔔 Connected to notification service');
        setIsConnected(true);
      },
      onClose: () => {
        console.log('🔕 Disconnected from notification service');
        setIsConnected(false);
      },
      onError: (error) => {
        console.error('🔔 WebSocket error:', error);
      },
      shouldReconnect: (closeEvent) => true,
      reconnectAttempts: 5,
      reconnectInterval: 3000,
    }
  );

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  // Message handler
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'connection_established':
        console.log('✅ Notification service connection established');
        // Request initial unread count
        sendMessage(JSON.stringify({ type: 'get_unread_count' }));
        break;

      case 'notification':
        // New in-app notification
        const newNotification = {
          id: data.id,
          title: data.title,
          body: data.body,
          data: data.data,
          timestamp: data.timestamp,
          priority: data.priority || 'normal',
          read: false,
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show browser notification if permitted
        showBrowserNotification(newNotification);
        break;

      case 'unread_count':
        setUnreadCount(data.count);
        break;

      case 'broadcast':
        // Tenant-wide broadcast
        console.log('📢 Broadcast received:', data);
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  };

  // Browser notification
  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/notification-icon.png',
        tag: notification.id,
      });
    }
  };

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    sendMessage(JSON.stringify({
      type: 'mark_read',
      notification_id: notificationId
    }));

    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );

    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [sendMessage]);

  // Request permissions for browser notifications
  const requestNotificationPermission = useCallback(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('✅ Browser notifications enabled');
        }
      });
    }
  }, []);

  // Send ping to keep connection alive
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (isConnected) {
        sendMessage(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected, sendMessage]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    requestNotificationPermission,
  };
};

export default useNotifications;
```

## 2. React Component Integration

### Notification Provider Component

```javascript
// NotificationProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import useNotifications from './hooks/useNotifications';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, tenantId }) => {
  const notificationData = useNotifications(tenantId);

  return (
    <NotificationContext.Provider value={notificationData}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};
```

### App.jsx Integration

```javascript
// App.jsx
import { NotificationProvider } from './components/NotificationProvider';
import NotificationBell from './components/NotificationBell';

function App() {
  // Get tenant ID from your auth context/user data
  const tenantId = '550e8400-e29b-41d4-a716-446655440000'; // Replace with actual tenant ID

  return (
    <NotificationProvider tenantId={tenantId}>
      <div className="App">
        <header>
          <NotificationBell />
          {/* Other header content */}
        </header>
        {/* Rest of your app */}
      </div>
    </NotificationProvider>
  );
}

export default App;
```

### Notification Bell Component

```javascript
// NotificationBell.jsx
import React, { useState, useEffect } from 'react';
import { useNotificationContext } from './NotificationProvider';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const { unreadCount, requestNotificationPermission } = useNotificationContext();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Request browser notification permission on mount
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  return (
    <div className="notification-bell">
      <button
        className="bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown onClose={() => setShowDropdown(false)} />
      )}
    </div>
  );
};

export default NotificationBell;
```

### Notification Dropdown Component

```javascript
// NotificationDropdown.jsx
import React from 'react';
import { useNotificationContext } from './NotificationProvider';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, markAsRead, unreadCount } = useNotificationContext();

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle notification action based on type
    if (notification.data?.action) {
      switch (notification.data.action) {
        case 'view_documents':
          // Navigate to documents page
          window.location.href = '/documents';
          break;
        case 'renew_document':
          // Navigate to document renewal
          window.location.href = `/documents/${notification.data.document_id}/renew`;
          break;
        default:
          console.log('Unknown action:', notification.data.action);
      }
    }

    onClose();
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="notification-dropdown">
      <div className="dropdown-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <span className="unread-count">{unreadCount} unread</span>
        )}
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="empty-state">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''} ${notification.priority}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-body">{notification.body}</div>
                <div className="notification-timestamp">
                  {formatTimestamp(notification.timestamp)}
                </div>
              </div>
              {!notification.read && <div className="unread-indicator" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
```

## 3. CSS Styling

```css
/* NotificationBell.css */
.notification-bell {
  position: relative;
}

.bell-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  position: relative;
  padding: 8px;
}

.unread-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ff4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* NotificationDropdown.css */
.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  max-height: 500px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.unread-count {
  background: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #fff8e1;
}

.notification-item.urgent {
  border-left: 4px solid #ff4444;
}

.notification-item.high {
  border-left: 4px solid #ff8800;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.notification-body {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.notification-timestamp {
  font-size: 12px;
  color: #999;
}

.unread-indicator {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 8px;
  height: 8px;
  background: #007bff;
  border-radius: 50%;
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: #999;
  font-style: italic;
}
```

## 4. Environment Configuration

### .env Configuration

```bash
# WebSocket URL for notifications
REACT_APP_WS_URL=ws://localhost:8001

# For production
REACT_APP_WS_URL=wss://your-domain.com
```

## 5. Document-Specific Notification Handling

### Enhanced Notification Handler

```javascript
// In NotificationDropdown.jsx
const handleNotificationClick = (notification) => {
  if (!notification.read) {
    markAsRead(notification.id);
  }

  // Handle different notification types
  const { data } = notification;

  switch (data?.type) {
    case 'document_expiry_warning':
      // Navigate to document renewal page
      navigate(`/documents/${data.document_id}/renew`, {
        state: {
          expiryDate: data.expiry_date,
          daysLeft: data.days_left,
          documentType: data.document_type
        }
      });
      break;

    case 'document_expired':
      // Navigate to urgent renewal page
      navigate(`/documents/${data.document_id}/renew`, {
        state: {
          expired: true,
          daysExpired: data.days_expired,
          documentType: data.document_type
        }
      });
      break;

    case 'login_success':
      // Navigate to account activity page
      navigate('/account/activity', {
        state: {
          highlight: 'recent_login',
          location: data.location
        }
      });
      break;

    case 'login_failed':
      // Navigate to security settings
      navigate('/account/security', {
        state: {
          alert: 'failed_login',
          ipAddress: data.ip_address,
          failureReason: data.failure_reason
        }
      });
      break;

    case 'profile_updated':
      // Navigate to profile page to review changes
      navigate('/profile', {
        state: {
          highlight: 'recent_changes',
          updatedFields: data.updated_fields,
          updatedBy: data.updated_by
        }
      });
      break;

    case 'account_locked':
      // Navigate to account status page
      navigate('/account/status', {
        state: {
          alert: 'account_locked',
          reason: data.reason,
          performedBy: data.performed_by
        }
      });
      break;

    case 'account_unlocked':
      // Navigate to account status page
      navigate('/account/status', {
        state: {
          alert: 'account_unlocked',
          performedBy: data.performed_by
        }
      });
      break;

    case 'account_suspended':
      // Navigate to account status page
      navigate('/account/status', {
        state: {
          alert: 'account_suspended',
          reason: data.reason,
          performedBy: data.performed_by
        }
      });
      break;

    case 'account_activated':
      // Navigate to dashboard
      navigate('/dashboard', {
        state: {
          highlight: 'account_activated',
          performedBy: data.performed_by
        }
      });
      break;

    case 'password_changed':
      // Navigate to security settings
      navigate('/account/security', {
        state: {
          highlight: 'password_changed',
          changeMethod: data.change_method,
          changedBy: data.changed_by
        }
      });
      break;

    default:
      console.log('Unknown notification type:', data?.type);
  }

  onClose();
};
```

## 6. Testing the Integration

### Test Script

```javascript
// test-notifications.js
const testNotifications = () => {
  // Test document expiry notification
  const documentNotification = {
    id: 'doc-123',
    title: '⚠️ Driver\'s Licence Expiring Soon',
    body: 'Your Driver\'s Licence expires in 7 days. Please renew to avoid disruption.',
    data: {
      type: 'document_expiry_warning',
      document_type: 'Driver\'s Licence',
      document_name: 'Driver\'s Licence',
      expiry_date: '2024-01-15',
      days_left: 7,
      action: 'view_documents'
    },
    timestamp: new Date().toISOString(),
    priority: 'high'
  };

  // Test login success notification
  const loginSuccessNotification = {
    id: 'login-456',
    title: '🔐 New Login Detected',
    body: 'A new login was detected on your account from Lagos, Nigeria',
    data: {
      type: 'login_success',
      action: 'view_activity',
      priority: 'normal'
    },
    timestamp: new Date().toISOString(),
    priority: 'normal'
  };

  // Test failed login notification
  const loginFailedNotification = {
    id: 'failed-789',
    title: '🚨 Security Alert: Failed Login',
    body: 'A failed login attempt was detected from Unknown Location. Attempt #3',
    data: {
      type: 'login_failed',
      action: 'view_security',
      priority: 'urgent',
      failure_reason: 'Invalid password',
      ip_address: '192.168.1.100'
    },
    timestamp: new Date().toISOString(),
    priority: 'urgent'
  };

  // Test profile update notification
  const profileUpdateNotification = {
    id: 'profile-101',
    title: '📝 Profile Updated',
    body: 'Your profile has been updated (3 fields changed)',
    data: {
      type: 'profile_updated',
      action: 'view_profile',
      updated_fields: ['phone_number', 'address', 'emergency_contact'],
      updated_by: 'john.doe@example.com',
      update_time: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    priority: 'normal'
  };

  // Test account locked notification
  const accountLockedNotification = {
    id: 'lock-202',
    title: '🔒 Account Locked',
    body: 'Your account has been locked for security reasons',
    data: {
      type: 'account_locked',
      action: 'view_account_status',
      reason: 'Multiple failed login attempts',
      performed_by: 'admin@example.com',
      action_time: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    priority: 'high'
  };

  // Test password changed notification
  const passwordChangedNotification = {
    id: 'pwd-303',
    title: '🔑 Password Changed by Admin',
    body: 'Your password was changed by an administrator',
    data: {
      type: 'password_changed',
      action: 'view_security_settings',
      change_method: 'admin',
      changed_by: 'admin@example.com',
      change_time: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    priority: 'high'
  };

  console.log(' Test notifications:');
  console.log('Document:', documentNotification);
  console.log('Login Success:', loginSuccessNotification);
  console.log('Login Failed:', loginFailedNotification);
  console.log('Profile Update:', profileUpdateNotification);
  console.log('Account Locked:', accountLockedNotification);
  console.log('Password Changed:', passwordChangedNotification);
};

export default testNotifications;
```

## 7. Backend WebSocket URL Configuration

### Django Channels Routing

Ensure your `notification_service/routing.py` includes:

```python
# notification_service/routing.py
from django.urls import path
from notifications import consumers

websocket_urlpatterns = [
    path('ws/notifications/<str:tenant_id>/', consumers.NotificationConsumer.as_asgi()),
]
```

## 8. Production Considerations

### Connection Management
- Implement exponential backoff for reconnection
- Handle network interruptions gracefully
- Monitor WebSocket connection health

### Performance
- Limit notification history in dropdown (pagination)
- Implement notification archiving for old notifications
- Use React.memo for notification components

### Security
- Validate WebSocket tokens on connection
- Implement rate limiting for notification requests
- Sanitize notification content

## 9. Troubleshooting

### Common Issues

1. **WebSocket Connection Fails**
   - Check WebSocket URL configuration
   - Verify authentication token
   - Check browser network tab for connection errors

2. **Notifications Not Received**
   - Verify tenant ID is correct
   - Check if user is properly authenticated
   - Confirm WebSocket connection is established

3. **Browser Notifications Not Working**
   - User must grant notification permission
   - Check if HTTPS is required for browser notifications

### Debug Logging

```javascript
// Add to useNotifications hook
useEffect(() => {
  console.log('🔔 WebSocket state:', readyState);
  console.log('🔔 Last message:', lastMessage);
}, [readyState, lastMessage]);
```

## Summary

Your React frontend now has **complete in-app notification support**:

✅ **Real-time WebSocket notifications**
✅ **Document expiry alerts**
✅ **User profile change notifications**
✅ **Account status change alerts**
✅ **Security event notifications**
✅ **Browser notification integration**
✅ **Unread count management**
✅ **Action-based notification handling**
✅ **Responsive notification UI**

The system automatically handles both **email notifications** (via SMTP) and **in-app notifications** (via WebSocket), providing users with multiple ways to stay informed about important events including:

- **Document Management**: Expiry warnings and renewal reminders
- **Account Security**: Login alerts, password changes, and account status updates
- **Profile Changes**: Notifications when user data is modified
- **Administrative Actions**: Account locks, unlocks, suspensions, and activations

**Integration complete!** 🚀🔔📱