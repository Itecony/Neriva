import { useMemo } from 'react';

export default function MessageItem({ message, isOwn }) {
  
  // 🔍 DEBUG: Log the message data to verify API response
  // (We use useMemo to prevent spamming logs on every re-render)
  useMemo(() => {
    console.log(`📩 Rendering Message [${message.id}]:`, message);
  }, [message.id]);

  // 1. Safe Sender Extraction
  // The API might return 'sender' object, or we might need fallback
  const sender = message.sender || {};
  
  // 2. Handle Name & Initials
  const firstName = sender.firstName || 'Unknown';
  const lastName = sender.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const initial = firstName.charAt(0).toUpperCase() || 'U';

  // 3. Handle Image (API docs say 'avatar', but we check all common keys)
  const profileImage = sender.avatar || sender.profileImage || sender.profilePicture;

  // 4. Handle Date (API docs say 'created_at', Frontend often uses 'createdAt')
  const dateObj = new Date(message.created_at || message.createdAt || Date.now());
  const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-3 group mb-4`}>
      
      {/* Avatar (Only for other users) */}
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0 self-end mb-1 overflow-hidden">
          {profileImage ? (
             <img 
               src={profileImage} 
               className="w-full h-full object-cover" 
               alt={firstName} 
               onError={(e) => e.target.style.display = 'none'} // Hide broken images
             />
          ) : (
            <span>{initial}</span>
          )}
        </div>
      )}
      
      {/* Message Bubble */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {/* Name Label (Optional, good for groups) */}
        {!isOwn && (
          <span className="text-[10px] text-gray-500 ml-1 mb-1">
            {fullName}
          </span>
        )}

        <div
          className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm break-words ${
            isOwn
              ? 'bg-teal-600 text-white rounded-br-none'
              : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
          }`}
        >
          {/* Display content or fallback text */}
          <p className="whitespace-pre-wrap leading-relaxed">
            {message.content || <span className="italic opacity-50">Empty message</span>}
          </p>
        </div>
        
        {/* Timestamp & Status */}
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-[10px] text-gray-400">
            {timeString}
          </span>
          {/* If message is pending (Optimistic UI) */}
          {message.pending && (
            <span className="text-[10px] text-gray-400 italic"> • Sending...</span>
          )}
        </div>
      </div>
    </div>
  );
}