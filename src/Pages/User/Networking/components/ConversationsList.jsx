import { useState, useEffect } from 'react';
import { MessageCircle, MoreVertical, Users } from 'lucide-react';

export default function ConversationsList({ onSelectConversation, selectedConversationId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(Array.isArray(data) ? data : data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-20 bg-gradient-to-b from-teal-500 via-cyan-600 to-blue-700 shadow-lg overflow-hidden">

      {/* Conversations List - Vertical Icon View */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 rounded-full border-3 border-gray-700 border-t-teal-500 animate-spin"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full p-2">
            <div className="text-center">
              <MessageCircle className="w-8 h-8 text-teal-300 mx-auto mb-1" />
              <p className="text-white text-xs">No chats</p>
            </div>
          </div>
        ) : (
          conversations.map((conv) => {
            const isGroup = conv.type === 'group';
            const otherUser = conv.participants?.[0];
            const isSelected = conv.id === selectedConversationId;
            const hasUnread = conv.unreadCount > 0;
            const hasError = conv.failedToSend;

            // Get initials for user
            const getInitials = () => {
              if (isGroup) {
                return conv.name?.substring(0, 2).toUpperCase() || 'GR';
              }
              const firstName = otherUser?.firstName?.charAt(0) || '';
              const lastName = otherUser?.lastName?.charAt(0) || '';
              return (firstName + lastName).toUpperCase() || 'U';
            };

            return (
              <div key={conv.id} className="relative group">
                <button
                  onClick={() => onSelectConversation(conv)}
                  className={`w-full flex flex-col items-center p-2 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-teal-600 bg-opacity-30 border border-teal-400'
                      : 'hover:bg-blue-800 border border-transparent'
                  }`}
                >
                  {/* Avatar or Initials */}
                  <div className="relative">
                    {isGroup ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
                        <Users className="w-5 h-5" />
                      </div>
                    ) : otherUser?.profileImage ? (
                      <img
                        src={otherUser.profileImage}
                        alt={otherUser?.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold text-xs">
                        {getInitials()}
                      </div>
                    )}

                    {/* Notification Badge */}
                    {hasUnread && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-400 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-blue-700">
                        {conv.unreadCount > 9 ? '9' : conv.unreadCount}
                      </div>
                    )}

                    {/* Error Badge */}
                    {hasError && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-blue-700">
                        !
                      </div>
                    )}
                  </div>

                  {/* User Name - Hidden on narrow */}
                  <p className="text-xs font-semibold text-white truncate mt-1 hidden">
                    {isGroup ? conv.name : otherUser?.firstName}
                  </p>
                </button>

                {/* Hover Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-10">
                  <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap border border-gray-700 shadow-lg">
                    {isGroup ? conv.name : `${otherUser?.firstName} ${otherUser?.lastName}`}
                  </div>
                  {isGroup && (
                    <p className="text-gray-400 text-xs text-center mt-1">{conv.memberCount} members</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-blue-600 p-2 flex flex-col gap-2">
        <button className="p-2 hover:bg-blue-800 rounded-lg transition-colors text-gray-300 hover:text-white" title="New chat">
          <MessageCircle className="w-5 h-5 mx-auto" />
        </button>
        <button className="p-2 hover:bg-blue-800 rounded-lg transition-colors text-gray-300 hover:text-white" title="Settings">
          <MoreVertical className="w-5 h-5 mx-auto" />
        </button>
      </div>
    </div>
  );
}