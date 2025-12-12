import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ConversationsList from './components/ConversationsList';
import ChatSpace from './components/ChatSpace';

export default function Networking() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setIsMobileChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* <div className="">
          <h1 className="text-black font-bold">Connect with other users and collaborate</h1>
        </div> */}

        <div className="flex">
          <ConversationsList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?.id}
          />
          <div className="flex-1">
            {selectedConversation ? (
              <ChatSpace
                conversationId={selectedConversation.id}
                conversation={selectedConversation}
                onBack={() => setIsMobileChatOpen(false)}
              />
            ) : (
              <div className="hidden lg:flex items-center justify-center h-screen bg-white rounded-xl shadow-lg">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h2>
                  <p className="text-gray-600">Choose a message thread to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}