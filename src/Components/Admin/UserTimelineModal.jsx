/* Feature 7: User Activity Timeline */
import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaUserPlus, FaEdit, FaCheckCircle, FaImage, FaShieldAlt, FaFileUpload, FaDollarSign, FaSignInAlt } from 'react-icons/fa';
import axios from 'axios';
import { BASE_URL, getAuthHeaders } from '../../Redux/config';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const UserTimelineModal = ({ isOpen, onClose, userId }) => {
    const [timeline, setTimeline] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchTimeline();
        }
    }, [isOpen, userId]);

    const fetchTimeline = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `${BASE_URL}/api/admin/users/${userId}/timeline/`,
                { headers: getAuthHeaders() }
            );

            setUser(response.data.user);
            setTimeline(response.data.timeline);
        } catch (err) {
            console.error('Failed to fetch timeline:', err);
            setError(err.response?.data?.error || 'Failed to load timeline');
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = (iconName) => {
        const icons = {
            'user-plus': FaUserPlus,
            'edit': FaEdit,
            'check-circle': FaCheckCircle,
            'image': FaImage,
            'shield': FaShieldAlt,
            'file-upload': FaFileUpload,
            'dollar-sign': FaDollarSign,
            'log-in': FaSignInAlt,
        };
        const Icon = icons[iconName] || FaCheckCircle;
        return <Icon />;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-600 border-green-300';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-600 border-yellow-300';
            case 'pending':
                return 'bg-gray-100 text-gray-600 border-gray-300';
            default:
                return 'bg-blue-100 text-blue-600 border-blue-300';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40 font-sfpro">
            <div className="bg-white rounded-lg max-w-3xl w-full p-6 shadow-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Activity Timeline</h3>
                        {user && (
                            <p className="text-sm text-gray-500 mt-1">
                                {user.name} • {user.user_type}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <FaSpinner className="animate-spin text-[#0b93c6] text-3xl" />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    ) : timeline && timeline.length > 0 ? (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                            <div className="space-y-6">
                                {timeline.map((event, idx) => (
                                    <div key={idx} className="relative flex gap-4">
                                        {/* Icon */}
                                        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStatusColor(event.status)}`}>
                                            {getIcon(event.icon)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 pb-6">
                                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{event.event}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${event.status === 'completed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : event.status === 'in_progress'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {event.status === 'completed' ? 'Done' : event.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                                    <span>{dayjs(event.date).format('MMM DD, YYYY')}</span>
                                                    <span>•</span>
                                                    <span>{dayjs(event.date).fromNow()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No activity timeline available
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end border-t pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-medium hover:bg-slate-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserTimelineModal;
