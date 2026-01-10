import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Search, ArrowRight } from 'lucide-react';
import socketService from '../../../../utils/socketService'; 

export default function ConversationsList({ onSelectConversation, selectedConversationId }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chats'); 
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typingStatus, setTypingStatus] = useState({}); 
  
  const currentUserId = localStorage.getItem('userId');

  // 1. Initial Data Fetch
  useEffect(() => {
    if (activeTab === 'chats') {
      // ✅ Only show loading spinner if we have NO data yet
      const shouldShowLoader = conversations.length === 0;
      fetchConversations(!shouldShowLoader); 
    } else {
      fetchContacts();
    }
  }, [activeTab]);

  // 2. WebSocket Listeners
  useEffect(() => {
    const handleListUpdate = (data) => {
      const msg = data.message || data;
      
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === msg.conversationId);
        
        if (index !== -1) {
          // Update existing: Move to top & update snippet
          const updatedConv = {
            ...prev[index],
            updatedAt: msg.createdAt, 
            messages: [msg] 
          };
          const newList = [...prev];
          newList.splice(index, 1); 
          return [updatedConv, ...newList]; 
        } else {
          // ✅ FIX: New conversation? Fetch SILENTLY (no spinner)
          fetchConversations(true); 
          return prev;
        }
      });
    };

    const handleTyping = ({ conversationId, userId }) => {
      if (userId !== currentUserId) {
        setTypingStatus(prev => ({ ...prev, [conversationId]: 'typing...' }));
      }
    };

    const handleStopTyping = ({ conversationId }) => {
      setTypingStatus(prev => {
        const newState = { ...prev };
        delete newState[conversationId];
        return newState;
      });
    };

    socketService.on('new_message', handleListUpdate);
    socketService.on('user_typing', handleTyping);
    socketService.on('user_stop_typing', handleStopTyping);

    return () => {
      socketService.off('new_message', handleListUpdate);
      socketService.off('user_typing', handleTyping);
      socketService.off('user_stop_typing', handleStopTyping);
    };
  }, [currentUserId]); 

  // ✅ UPDATED: Accepts 'silent' to prevent spinner flash
  const fetchConversations = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/conversations', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(Array.isArray(data.conversations) ? data.conversations : []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      let targetUserId = currentUserId;
      if (!targetUserId || targetUserId.toString().length < 10) {
          const profileRes = await fetch('https://itecony-neriva-backend.onrender.com/api/profile', {
             headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profileRes.ok) {
             const profile = await profileRes.json();
             targetUserId = profile.id || profile._id;
             localStorage.setItem('userId', targetUserId);
          }
      }

      const [followingRes, followersRes] = await Promise.all([
        fetch(`https://itecony-neriva-backend.onrender.com/api/users/${targetUserId}/following?limit=100`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`https://itecony-neriva-backend.onrender.com/api/users/${targetUserId}/followers?limit=100`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      let combinedContacts = [];
      if (followingRes.ok) combinedContacts = [...combinedContacts, ...(await followingRes.json()).data || []];
      if (followersRes.ok) combinedContacts = [...combinedContacts, ...(await followersRes.json()).data || []];

      const uniqueContacts = Array.from(
        new Map(combinedContacts.map(user => [user.id || user._id, user])).values()
      );

      setContacts(uniqueContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = async (contact) => {
    try {
      const token = localStorage.getItem('authToken');
      // Ensure we grab the correct ID field
      const targetId = contact.id || contact._id;

      if (!targetId) {
          console.error("Contact has no ID:", contact);
          return;
      }

      const response = await fetch('https://itecony-neriva-backend.onrender.com/api/conversations/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: targetId })
      });

      if (response.ok) {
        const data = await response.json();
        const conversation = data.conversation || data;
        
        // 1. Manually Add to 'Chats' list immediately
        setConversations(prev => {
            // Check if it already exists to avoid duplicates
            const exists = prev.find(c => c.id === conversation.id);
            if (exists) return prev;
            // Add to TOP of list
            return [conversation, ...prev];
        });

        // 2. Switch Tab & Navigate
        setActiveTab('chats'); 
        onSelectConversation(conversation);
        navigate(`/dreamboard/networking/messages/${conversation.id}`);
      }
    } catch (err) {
      console.error("Failed to start chat", err);
    }
  };
  
  const handleChatClick = (conversation) => {
    onSelectConversation(conversation);
    navigate(`/dreamboard/networking/messages/${conversation.id}`);
  };

  const filteredList = (activeTab === 'chats' ? conversations : contacts).filter(item => {
    const name = activeTab === 'chats' 
      ? (item.type === 'group' ? item.name : item.participants?.find(p => (p.id || p._id) !== currentUserId)?.firstName)
      : item.firstName;
    return (name || 'Unknown').toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full w-full lg:w-80 bg-white border-r border-gray-200 shadow-sm">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="p-4 bg-teal-600 text-white">
          <h2 className="font-bold text-lg">Networking</h2>
        </div>
        <div className="flex p-2 gap-2 bg-gray-50">
          <button onClick={() => setActiveTab('chats')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'chats' ? 'bg-white text-teal-600 shadow-sm border' : 'text-gray-500 hover:bg-gray-200'}`}>Chats</button>
          <button onClick={() => setActiveTab('contacts')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'contacts' ? 'bg-white text-teal-600 shadow-sm border' : 'text-gray-500 hover:bg-gray-200'}`}>Contacts</button>
        </div>
        <div className="px-4 pb-3 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" placeholder={activeTab === 'chats' ? "Search messages..." : "Search contacts..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-8"><div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-teal-500 animate-spin"></div></div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
            {activeTab === 'chats' ? (
              <><MessageCircle className="w-8 h-8 mb-2 opacity-20" /><p>No active conversations</p><button onClick={() => setActiveTab('contacts')} className="mt-2 text-teal-600 font-medium hover:underline">Start a chat</button></>
            ) : (
              <><Users className="w-8 h-8 mb-2 opacity-20" /><p>Follow users to connect</p></>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredList.map((item) => {
              if (activeTab === 'chats') {
                const isGroup = item.type === 'group';
                const otherUser = item.participants?.find(p => (p.id || p._id) !== currentUserId) || item.participants?.[0];
                const displayName = isGroup ? item.name : `${otherUser?.firstName || 'User'} ${otherUser?.lastName || ''}`;
                const image = isGroup ? null : (otherUser?.avatar || otherUser?.profileImage); 
                const isSelected = item.id === selectedConversationId;
                
                const isTyping = typingStatus[item.id];
                const lastMsg = item.messages?.[item.messages.length - 1] || item.lastMessage;
                const previewText = lastMsg?.content || 'Open chat';

                return (
                  <button key={item.id} onClick={() => handleChatClick(item)} className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${isSelected ? 'bg-teal-50 border-r-4 border-teal-500' : ''}`}>
                    <div className="relative flex-shrink-0">
                      {image ? <img src={image} className="w-10 h-10 rounded-full object-cover border" alt="" /> : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold">{isGroup ? <Users className="w-5 h-5" /> : (displayName[0] || 'U')}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className={`text-sm truncate ${isSelected ? 'font-bold text-teal-900' : 'font-medium text-gray-900'}`}>{displayName}</h3>
                      </div>
                      <p className={`text-xs truncate ${isTyping ? 'text-teal-600 font-medium italic' : 'text-gray-500'}`}>
                        {isTyping || previewText}
                      </p>
                    </div>
                  </button>
                );
              } else {
                const contact = item;
                const displayName = `${contact.firstName || 'User'} ${contact.lastName || ''}`;
                const image = contact.profilePicture || contact.profileImage || contact.avatar; 
                return (
                  <button key={contact.id || contact._id} onClick={() => handleContactClick(contact)} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left group">
                    <div className="relative flex-shrink-0">
                      {image ? <img src={image} className="w-10 h-10 rounded-full object-cover border" alt="" /> : <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold group-hover:bg-teal-100 group-hover:text-teal-700">{displayName[0] || 'U'}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{displayName}</h3>
                      <p className="text-xs text-gray-500 truncate">Tap to message</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500" />
                  </button>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}