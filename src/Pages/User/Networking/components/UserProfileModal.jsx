import { X, MapPin, Briefcase } from 'lucide-react';

export default function UserProfileModal({ user, isOpen, onClose, isGroup = false }) {
  if (!isOpen || !user) return null;

  const userInterests = Array.isArray(user.interests) ? user.interests : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/20 backdrop-blur">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">{isGroup ? 'Group Details' : 'User Profile'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {!isGroup ? (
            <>
              {/* Avatar & Basic Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <img
                  src={user.profileImage || 'https://via.placeholder.com/60'}
                  alt={user.firstName}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div>
                  <p className="text-sm text-gray-700">{user.bio}</p>
                </div>
              )}

              {/* Contact Info */}
              {(user.location || user.company) && (
                <div className="space-y-2 text-sm">
                  {user.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.company && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4 text-teal-600" />
                      <span>{user.company}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Interests */}
              {userInterests.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {userInterests.slice(0, 5).map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
                <div className="text-center">
                  <div className="font-bold text-teal-600">{user.followers || 0}</div>
                  <div className="text-xs text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-teal-600">{user.following || 0}</div>
                  <div className="text-xs text-gray-600">Following</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-teal-600">{user.posts || 0}</div>
                  <div className="text-xs text-gray-600">Posts</div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => window.location.href = `/profile/${user.id}`}
                className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
              >
                View Full Profile
              </button>
            </>
          ) : (
            <>
              {/* Group Info */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.memberCount} members</p>
              </div>

              {/* Members */}
              {user.members && user.members.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Members</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {user.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <img
                          src={member.profileImage || 'https://via.placeholder.com/32'}
                          alt={member.firstName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm text-gray-700">
                          {member.firstName} {member.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {user.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Description</p>
                  <p className="text-sm text-gray-700">{user.description}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}