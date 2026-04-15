/* Feature 1: Bulk Profile Status Checker */
import React, { useState } from 'react';
import { FaTimes, FaSearch, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { BASE_URL, getAuthHeaders } from '../../Redux/config';
import dayjs from 'dayjs';

const BulkProfileChecker = ({ isOpen, onClose }) => {
    const [namesInput, setNamesInput] = useState('');
    const [results, setResults] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState(null);

    const handleCheck = async () => {
        if (!namesInput.trim()) {
            setError('Please enter at least one name to check');
            return;
        }

        setIsChecking(true);
        setError(null);

        // Parse names - support comma, newline, or semicolon separated
        const names = namesInput
            .split(/[,;\n]/)
            .map(n => n.trim())
            .filter(n => n.length > 0);

        try {
            const response = await axios.post(
                `${BASE_URL}/api/admin/users/bulk-check/`,
                { names },
                { headers: getAuthHeaders() }
            );

            setResults(response.data);
        } catch (err) {
            console.error('Bulk check failed:', err);
            setError(err.response?.data?.error || 'Failed to check profiles. Please try again.');
        } finally {
            setIsChecking(false);
        }
    };

    const getStatusIcon = (result) => {
        if (!result.found) return <FaTimesCircle className="text-red-500" />;

        const missingCount = result.missing_fields?.length || 0;
        if (missingCount === 0 && result.verification_status === 'Verified') {
            return <FaCheckCircle className="text-green-500" />;
        }
        return <FaExclamationTriangle className="text-yellow-500" />;
    };

    const getStatusText = (result) => {
        if (!result.found) return 'Not Found';

        const missingCount = result.missing_fields?.length || 0;
        if (missingCount === 0 && result.verification_status === 'Verified') {
            return 'Complete & Verified';
        }
        if (missingCount === 0) {
            return 'Complete - Pending Verification';
        }
        return `Incomplete (${missingCount} missing)`;
    };

    const handleReset = () => {
        setNamesInput('');
        setResults(null);
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40 font-sfpro">
            <div className="bg-white rounded-lg max-w-5xl w-full p-6 shadow-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Bulk Profile Status Checker</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Check profile completion status for multiple providers at once
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {!results ? (
                    <div className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter Names (one per line, or comma-separated)
                            </label>
                            <textarea
                                value={namesInput}
                                onChange={(e) => setNamesInput(e.target.value)}
                                placeholder="Obi Uchechukwu&#10;Anike Giwa&#10;Paul Nwonu&#10;Ojo Olawale&#10;Jennifer Palmer"
                                rows="12"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-[#0b93c6] focus:border-transparent outline-none font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Tip: You can paste a list of names directly from your message
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCheck}
                                disabled={isChecking}
                                className="flex-1 px-4 py-2.5 bg-[#0b93c6] text-white rounded-md font-medium shadow-sm hover:bg-[#0a82b0] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isChecking ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <FaSearch />
                                        Check Profiles
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-900">
                                        Found {results.total_found} out of {results.total_searched} names
                                    </p>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-50"
                                >
                                    Check More Names
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {results.results.map((result, idx) => (
                                <div
                                    key={idx}
                                    className={`border rounded-lg p-4 ${!result.found
                                            ? 'bg-red-50 border-red-200'
                                            : result.missing_fields?.length === 0
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-yellow-50 border-yellow-200'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">{getStatusIcon(result)}</div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {result.found ? result.full_name : result.search_name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {getStatusText(result)}
                                                    </p>
                                                </div>
                                                {result.found && (
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${result.verification_status === 'Verified'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {result.verification_status}
                                                    </span>
                                                )}
                                            </div>

                                            {result.found && (
                                                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Email:</span>
                                                        <span className="ml-2 text-gray-900">{result.email}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Phone:</span>
                                                        <span className="ml-2 text-gray-900">{result.phone_number || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Joined:</span>
                                                        <span className="ml-2 text-gray-900">
                                                            {dayjs(result.date_joined).format('MMM DD, YYYY')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Last Active:</span>
                                                        <span className="ml-2 text-gray-900">
                                                            {result.last_activity ? dayjs(result.last_activity).format('MMM DD, YYYY') : 'Never'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {result.found && result.missing_fields && result.missing_fields.length > 0 && (
                                                <div className="mt-3 p-3 bg-white rounded border border-yellow-300">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Missing Fields:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {result.missing_fields.map((field, i) => (
                                                            <span
                                                                key={i}
                                                                className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
                                                            >
                                                                {field}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {!result.found && (
                                                <p className="mt-2 text-sm text-red-700">
                                                    {result.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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

export default BulkProfileChecker;
