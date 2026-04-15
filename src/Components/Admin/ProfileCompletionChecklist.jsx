/* Feature 5: Profile Completion Checklist View */
import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';

const ProfileCompletionChecklist = ({ user, profileData }) => {
    const checklistItems = [
        {
            id: 'basic_info',
            label: 'Basic Info (Name, Email, Phone)',
            completed: profileData?.has_basic_info ?? false,
            required: true
        },
        {
            id: 'profile_picture',
            label: 'Profile Picture',
            completed: profileData?.has_profile_picture ?? false,
            required: true
        },
        {
            id: 'location',
            label: 'Location Details (Country, City)',
            completed: profileData?.has_location ?? false,
            required: true
        },
        {
            id: 'about_me',
            label: 'About Me / Bio',
            completed: profileData?.has_about_me ?? false,
            required: true
        },
        {
            id: 'hourly_rate',
            label: 'Hourly Rate',
            completed: profileData?.has_hourly_rate ?? false,
            required: true
        },
        {
            id: 'experience',
            label: 'Years of Experience',
            completed: profileData?.has_experience ?? false,
            required: true
        },
        {
            id: 'bank_details',
            label: 'Bank Account Details',
            completed: profileData?.has_bank_details ?? false,
            required: false
        },
        {
            id: 'government_id',
            label: 'Government ID Upload',
            completed: user?.has_government_id ?? false,
            required: true
        },
        {
            id: 'payment',
            label: 'Payment Completed',
            completed: user?.payment_status === 'Paid',
            required: true
        },
        {
            id: 'verification',
            label: 'Background Check / Verification',
            completed: user?.verification_status === 'Verified',
            required: true
        }
    ];

    const completedCount = checklistItems.filter(item => item.completed).length;
    const totalCount = checklistItems.length;
    const completionPercentage = Math.round((completedCount / totalCount) * 100);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Profile Completion</h4>
                <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-700">
                        {completedCount}/{totalCount}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${completionPercentage === 100
                            ? 'bg-green-100 text-green-700'
                            : completionPercentage >= 70
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                        }`}>
                        {completionPercentage}%
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${completionPercentage === 100
                            ? 'bg-green-500'
                            : completionPercentage >= 70
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                        }`}
                    style={{ width: `${completionPercentage}%` }}
                ></div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2">
                {checklistItems.map((item) => (
                    <div
                        key={item.id}
                        className={`flex items-center gap-3 p-2 rounded ${item.completed ? 'bg-green-50' : 'bg-gray-50'
                            }`}
                    >
                        <div className="flex-shrink-0">
                            {item.completed ? (
                                <FaCheckCircle className="text-green-500 text-lg" />
                            ) : item.required ? (
                                <FaTimesCircle className="text-red-500 text-lg" />
                            ) : (
                                <FaExclamationCircle className="text-gray-400 text-lg" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm ${item.completed ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                                {item.label}
                                {item.required && !item.completed && (
                                    <span className="ml-2 text-xs text-red-600">(Required)</span>
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {completionPercentage < 100 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-800">
                        <strong>Missing {totalCount - completedCount} items.</strong> User needs to complete these before verification.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProfileCompletionChecklist;
