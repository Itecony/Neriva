import { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, ChevronLeft } from 'lucide-react';
import MessageItem from './MessageItem';
import UserProfileModal from './UserProfileModal';

export default function ChatSpace({ conversationId, conversation, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const messagesEndRef = useRef(null);

  const isGroup = conversation?.type === 'group';
  const otherUser = conversation?.participants?.find((p) => p.id !== localStorage.getItem('userId'));

  // Fetch messages
  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://itecony-neriva-backend.onrender.com/api/conversations/${conversationId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
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
          content: newMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.data || data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {isGroup ? (
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">{conversation.name}</h2>
              <p className="text-xs text-gray-600">{conversation.memberCount} members</p>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">
                {otherUser?.firstName} {otherUser?.lastName}
              </h2>
              <p className="text-xs text-gray-600">@{otherUser?.username}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Call (Coming soon)"
            disabled
          >
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Video (Coming soon)"
            disabled
          >
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setShowProfile(true)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="View details"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-teal-500 animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              {isGroup ? 'No messages yet. Start the conversation!' : 'No messages yet. Say hello!'}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === localStorage.getItem('userId') || msg.sender?.id === localStorage.getItem('userId')}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        user={isGroup ? { ...conversation, members: conversation.participants } : otherUser}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        isGroup={isGroup}
      />
    </div>
  );
}