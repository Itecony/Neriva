import { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, ChevronLeft, User, Users } from 'lucide-react';
import MessageItem from './MessageItem';
import UserProfileModal from './UserProfileModal';

export default function ChatSpace({ conversationId, conversation, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  
  // ✅ NEW: State to store the full profile of the user we are chatting with
  const [chatPartnerProfile, setChatPartnerProfile] = useState(null);
  
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem('userId');

  const isGroup = conversation?.type === 'group';
  
  // 1. Identify the other participant ID from the conversation prop
  const participantInfo = conversation?.participants?.find(
    (p) => (p.id || p._id) !== currentUserId
  );
  const targetUserId = participantInfo?.id || participantInfo?._id;

  // 2. Fetch Messages & User Profile on Load
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
    // If direct chat, fetch the specific user profile to get fresh Name/Image
    if (!isGroup && targetUserId) {
      fetchUserProfile(targetUserId);
    }
  }, [conversationId, targetUserId, isGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ NEW: Fetch User API
  const fetchUserProfile = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://itecony-neriva-backend.onrender.com/api/users/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setChatPartnerProfile(data); // Store full profile data
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://itecony-neriva-backend.onrender.com/api/messages/${conversationId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMsg = {
        id: Date.now(),
        content: newMessage,
        sender_id: currentUserId,
        createdAt: new Date().toISOString(),
        pending: true
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId,
          content: tempMsg.content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const realMsg = data.data || data.message || data; 
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? realMsg : m));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // --- DISPLAY LOGIC ---

  // Use fetched profile if available, otherwise fall back to conversation participant data
  const displayUser = isGroup ? conversation : (chatPartnerProfile || participantInfo);

  // 1. Get Name
  const displayName = isGroup 
    ? conversation.name 
    : (displayUser?.firstName 
        ? `${displayUser.firstName} ${displayUser.lastName || ''}`.trim() 
        : (displayUser?.username || 'Unknown User'));

  // 2. Get Profile Image (Check all possible keys)
  const profileImage = displayUser?.profileImage || displayUser?.profilePicture || displayUser?.avatar;

  // 3. Get Initials (Fallback if no image)
  const getInitials = () => {
    if (isGroup) return null;
    const first = displayUser?.firstName?.[0] || '';
    const last = displayUser?.lastName?.[0] || '';
    return (first + last).toUpperCase() || displayUser?.username?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="flex flex-col h-full bg-white lg:rounded-tr-xl lg:rounded-br-xl shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfile(true)}>
            {/* Avatar Section */}
            {profileImage ? (
                <img src={profileImage} className="w-10 h-10 rounded-full object-cover" alt={displayName} />
            ) : (
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm">
                    {isGroup ? <Users className="w-5 h-5"/> : getInitials()}
                </div>
            )}
            
            {/* Name Section */}
            <div>
              <h2 className="font-bold text-gray-900 leading-tight text-base">
                {displayName}
              </h2>
              {isGroup && <p className="text-xs text-gray-500">{conversation.memberCount || 0} members</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all">
            <Video className="w-5 h-5" />
          </button>
          <button onClick={() => setShowProfile(true)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p>No messages yet.</p>
            <p className="text-sm">Say hello to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              isOwn={(msg.sender_id || msg.sender?.id) === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent px-3 py-2 outline-none text-gray-700 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:hover:bg-teal-500 transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Profile Modal - Pass the full fetched profile */}
      <UserProfileModal
        user={displayUser}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        isGroup={isGroup}
      />
    </div>
  );
}