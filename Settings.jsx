import React, { useState } from 'react';
import axios from 'axios';
import config from '../src/config';
import { useAuth } from '../src/context/AuthContext';
import { Lock, ShieldCheck, KeyRound } from 'lucide-react';

const Settings = () => {
    const { token, logout } = useAuth();

    // Form State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNew, setConfirmNew] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmNew) {
            return setError("New Passwords do not match!");
        }

        if (newPassword.length < 6) {
            return setError("Password must be at least 6 characters long.");
        }

        setLoading(true);

        try {
            const res = await axios.put(
                `${config.API_URL}/api/auth/updatepassword`,
                { oldPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage("✅ Password Changed Successfully! Please login again.");
            setOldPassword('');
            setNewPassword('');
            setConfirmNew('');

            // Optional: Logout after change
            setTimeout(() => {
                logout();
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 pb-24">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

                {/* Change Password Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                            <KeyRound size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                            <p className="text-sm text-gray-500">Update your account password securely.</p>
                        </div>
                    </div>

                    {message && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium border border-green-100">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <input
                                type="password"
                                required
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 focus:outline-none transition"
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 focus:outline-none transition"
                                    placeholder="Min 6 characters"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmNew}
                                    onChange={(e) => setConfirmNew(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 focus:outline-none transition"
                                    placeholder="Re-enter new password"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white p-4 rounded-xl font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : <><ShieldCheck size={20} /> Update Password</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
