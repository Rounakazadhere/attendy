import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';

const Unauthorized = () => {
    const { user } = useAuth();
    const role = user?.role || 'Guest';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Access Denied</h1>
                <p className="text-gray-600 mb-6">
                    You do not have permission to view this page.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 text-left text-sm">
                    <p><strong>Current User:</strong> {user?.name || 'Not Logged In'}</p>
                    <p><strong>Your Role:</strong> <span className="text-blue-600 font-mono font-bold">{role}</span></p>
                    <p className="mt-2 text-xs text-gray-500">Required Role: Check System Administrator</p>
                </div>

                <div className="flex gap-4 justify-center">
                    <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">Go Home</Link>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                        Go Back
                    </button>
                    {!user && <Link to="/login" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">Login</Link>}
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
