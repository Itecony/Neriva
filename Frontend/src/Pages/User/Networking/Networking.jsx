import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import ConversationsList from './components/ConversationsList';
import ChatSpace from './components/ChatSpace';
import socketService from '../../../utils/socketService';
import { useNotifications } from '../../../context/NotificationContext';

export default function Networking() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { profile } = useNotifications();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const currentUserId = profile?.id || profile?._id;

  // Initialize Global Socket Connection
  useEffect(() => {
    socketService.connect();

    if (currentUserId) {
      socketService.joinUser(currentUserId);
    }

    return () => {
      socketService.disconnect();
    };
  }, [currentUserId]);

  // Handle URL updates
  useEffect(() => {
    if (conversationId) {
      setSelectedConversation({ id: conversationId });
      setIsMobileChatOpen(true);
    }
  }, [conversationId]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setIsMobileChatOpen(true);
    navigate(`/networking/messages/${conversation.id}`, { replace: true });
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex overflow-hidden">
      {/* Sidebar List */}
      <div className={`${isMobileChatOpen ? 'hidden' : 'flex'} lg:flex w-full lg:w-auto`}>
        <ConversationsList
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation?.id}
          currentUserId={currentUserId}
        />
      </div>

      {/* Main Chat Area */}
      <div className={`${!isMobileChatOpen ? 'hidden' : 'flex'} lg:flex flex-1 flex-col h-full`}>
        {selectedConversation ? (
          <ChatSpace
            conversationId={selectedConversation.id}
            conversation={selectedConversation}
            onBack={() => {
              setIsMobileChatOpen(false);
              navigate('/networking');
            }}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white m-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-teal-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Select a conversation</h2>
              <p className="text-gray-500">Choose a contact to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}