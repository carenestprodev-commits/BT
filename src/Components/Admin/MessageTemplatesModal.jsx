/* Feature 6: Quick Message Templates */
import React, { useState, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { BASE_URL, getAuthHeaders } from '../../Redux/config';

const MessageTemplatesModal = ({ isOpen, onClose, selectedUser, onMessageSent }) => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [customizedMessage, setCustomizedMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedTemplate && selectedUser) {
            // Customize template with user data
            let message = selectedTemplate.content;
            message = message.replace('{name}', selectedUser.name || 'there');
            message = message.replace('{missing_fields}', selectedUser.missing_fields?.join(', ') || 'N/A');
            message = message.replace('{amount}', 'N/A');
            message = message.replace('{due_date}', 'N/A');
            setCustomizedMessage(message);
        }
    }, [selectedTemplate, selectedUser]);

    const fetchTemplates = async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}/api/admin/message-templates/`,
                { headers: getAuthHeaders() }
            );
            setTemplates(response.data.templates || []);
        } catch (err) {
            console.error('Failed to fetch templates:', err);
        }
    };

    const handleSend = async () => {
        if (!customizedMessage.trim()) {
            setError('Please select a template or write a message');
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            // Send via email campaign endpoint
            await axios.post(
                `${BASE_URL}/api/admin/email-campaign/send/`,
                {
                    user_ids: [selectedUser.id],
                    subject: selectedTemplate?.subject || 'Message from CareNest Admin',
                    content: customizedMessage
                },
                { headers: getAuthHeaders() }
            );

            onMessageSent?.(`Message sent to ${selectedUser.name}`);
            onClose();
        } catch (err) {
            console.error('Failed to send message:', err);
            setError(err.response?.data?.error || 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40 font-sfpro">
            <div className="bg-white rounded-lg max-w-3xl w-full p-6 shadow-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Quick Message Templates</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Send to: {selectedUser?.name}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select a Template
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template)}
                                    className={`p-3 border rounded-lg text-left transition-all ${selectedTemplate?.id === template.id
                                            ? 'border-[#0b93c6] bg-blue-50'
                                            : 'border-gray-200 hover:border-[#0b93c6] hover:bg-gray-50'
                                        }`}
                                >
                                    <p className="font-medium text-sm text-gray-900">{template.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{template.subject}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedTemplate && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customize Message
                            </label>
                            <textarea
                                value={customizedMessage}
                                onChange={(e) => setCustomizedMessage(e.target.value)}
                                rows="10"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-[#0b93c6] focus:border-transparent outline-none text-sm"
                            />
                        </div>
                    )}
                </div>

                <div className="mt-6 flex gap-3 border-t pt-4">
                    <button
                        onClick={onClose}
                        disabled={isSending}
                        className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-md font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isSending || !selectedTemplate}
                        className="flex-[2] px-4 py-2.5 bg-[#0b93c6] text-white rounded-md font-medium shadow-sm hover:bg-[#0a82b0] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSending ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <FaPaperPlane />
                                Send Message
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageTemplatesModal;
