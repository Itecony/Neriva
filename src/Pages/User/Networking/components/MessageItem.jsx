export default function MessageItem({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2 mb-3`}>
      {!isOwn && (
        <img
          src={message.sender?.profileImage || 'https://via.placeholder.com/32'}
          alt={message.sender?.firstName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      )}
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <p className="text-xs text-gray-600 mb-1">
            {message.sender?.firstName} {message.sender?.lastName}
          </p>
        )}
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwn
              ? 'bg-teal-500 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-900 rounded-bl-none'
          }`}
        >
          <p className="text-sm break-words">{message.content}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
      {isOwn && (
        <img
          src="https://via.placeholder.com/32"
          alt="You"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      )}
    </div>
  );
}