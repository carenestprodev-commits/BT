import React, { useState, useMemo } from 'react';
import { FaTimes, FaPaperPlane, FaUserCircle, FaExclamationCircle } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const SendEmailModal = ({ isOpen, onClose, selectedUsers, onEmailSent }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const recipientCount = selectedUsers?.length || 0;
  const recipientNames = useMemo(() => {
    if (recipientCount === 0) return '';
    if (recipientCount === 1) return selectedUsers[0].name;
    if (recipientCount <= 3) return selectedUsers.map(u => u.name).join(', ');
    return `${selectedUsers.slice(0, 3).map(u => u.name).join(', ')} and ${recipientCount - 3} others`;
  }, [selectedUsers, recipientCount]);

  const handleSend = async () => {
    if (!subject.trim() || !content.trim() || recipientCount === 0) {
      setError('Please provide a subject, content, and at least one recipient.');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const userIds = selectedUsers.map(u => u.id);
      
      // Get the API base URL from environment or assume same origin
      const API_URL = import.meta.env.VITE_API_URL || '';
      const accessToken = localStorage.getItem("accessToken") || localStorage.getItem("access");

      await axios.post(`${API_URL}/api/admin/users/send-email/`, {
        user_ids: userIds,
        subject: subject,
        content: content
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      onEmailSent(`Successfully queued email for ${recipientCount} recipients.`);
      onClose();
      // Reset form
      setSubject('');
      setContent('');
    } catch (err) {
      console.error('Failed to send email:', err);
      setError(err.response?.data?.error || 'Failed to send email campaign. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40 font-sfpro">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Send Email Campaign</h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-[#0b93c6] bg-blue-50 px-3 py-1.5 rounded-md">
              <FaUserCircle className="text-blue-500" />
              <span className="font-medium">To: {recipientNames}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-3 text-sm animate-shake">
              <FaExclamationCircle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-[#0b93c6] focus:border-transparent outline-none transition-all"
              placeholder="e.g. Important Update Regarding Your Account"
            />
          </div>

          <div className="flex flex-col h-[350px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>
            <div className="flex-1 border border-gray-300 rounded-md overflow-hidden flex flex-col transition-all focus-within:ring-2 focus-within:ring-[#0b93c6] focus-within:border-transparent">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                className="flex-1 flex flex-col overflow-hidden"
                placeholder="Write your email content here..."
                style={{ color: '#111111' }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3 border-t pt-6">
          <button
            onClick={onClose}
            disabled={isSending}
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-md font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || recipientCount === 0}
            className="flex-[2] px-4 py-2.5 bg-[#0b93c6] text-white rounded-md font-medium shadow-sm hover:bg-[#0a82b0] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending Campaign...
              </span>
            ) : (
              <>
                <FaPaperPlane className="text-sm" />
                Send to {recipientCount} Recipients
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendEmailModal;
