// import OnboardingModal from '../../../UserDetail/UserOnboarding'
// const nextInterest = () => {
//     if (profile?.interests && profile.interests.length > 0) {
//       setCurrentInterestIndex((prev) =>
//         prev === profile.interests.length - 1 ? 0 : prev + 1
//       );
//     }
//   };

//   const prevInterest = () => {
//     if (profile?.interests && profile.interests.length > 0) {
//       setCurrentInterestIndex((prev) =>
//         prev === 0 ? profile.interests.length - 1 : prev - 1
//       );
//     }
//   };

//   const handleAddInterest = () => {
//     setShowOnboardingModal(true);
//   };
{/* Interests Card */}
        {/* <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Interests</h3>
            <button
              onClick={handleAddInterest}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              title="Add or edit interests"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-3">
            {userInterests.length > 0 ? (
              <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {userInterests[currentInterestIndex]}
              </span>
            ) : (
              <span className="inline-block bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm italic">
                No interests yet
              </span>
            )}
          </div>
          
          {userInterests.length > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={prevInterest}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Previous interest"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-1">
                {userInterests.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === currentInterestIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  ></div>
                ))}
              </div>
              <button
                onClick={nextInterest}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Next interest"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div> */}
{/* Onboarding Modal */}
    //   {showOnboardingModal && (
    //     <OnboardingModal
    //       isOpen={showOnboardingModal}
    //       onClose={handleOnboardingClose}
    //       existingData={profile}
    //     />
    //   )}