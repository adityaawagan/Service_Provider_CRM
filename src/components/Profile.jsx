import React, { useState, useEffect } from 'react';
import { auth, db } from '../../environment/environment';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState({
        name: '',
        email: '',
        contact: '',
        area: '',
        city: '',
        role: '', // for service providers
        description: '' // for service providers
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    const userType = localStorage.getItem("userType"); // 'customer' or 'service-provider'

    useEffect(() => {
        const fetchUserData = async () => {
            if (!auth.currentUser) {
                // Not logged in, wait for auth to load
                const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
                    if (currentUser) {
                        await loadData(currentUser.uid, currentUser.email);
                    } else {
                        navigate("/");
                    }
                });
                return () => unsubscribe();
            } else {
                await loadData(auth.currentUser.uid, auth.currentUser.email);
            }
        };

        const loadData = async (uid, email) => {
            try {
                const collectionName = userType === 'customer' ? 'customers' : 'service_providers';
                const docRef = doc(db, collectionName, uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUser(docSnap.data());
                } else {
                    // User data doesn't exist, create a new document with email
                    const newUserData = {
                        id: uid,
                        email: email,
                        name: '',
                        contact: '',
                        area: '',
                        city: '',
                        role: userType === 'service-provider' ? '' : undefined,
                        description: userType === 'service-provider' ? '' : undefined,
                        createdAt: new Date()
                    };
                    
                    // Remove undefined fields
                    if (userType === 'customer') {
                        delete newUserData.role;
                        delete newUserData.description;
                    }
                    
                    await setDoc(docRef, newUserData);
                    setUser(newUserData);
                    setMessage({ text: 'Profile created. Please fill in your details.', type: 'success' });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setMessage({ text: 'Failed to load profile data. Please refresh and try again.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate, userType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const uid = auth.currentUser.uid;
            const collectionName = userType === 'customer' ? 'customers' : 'service_providers';
            const docRef = doc(db, collectionName, uid);
            
            const updateData = {
                name: user.name,
                contact: user.contact,
                area: user.area,
                city: user.city,
            };

            if (userType === 'service-provider') {
                updateData.role = user.role;
                updateData.description = user.description || '';
            }

            await updateDoc(docRef, updateData);
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ text: 'Failed to update profile. ' + error.message, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                {/* Cover Photo Area */}
                <div className="h-40 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                            <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600 uppercase">
                                {user.name ? user.name.charAt(0) : '?'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-16 px-8 pb-8">
                    <div className="mb-8 flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h2>
                            <p className="text-slate-500 mt-1">Manage your personal information and preferences.</p>
                        </div>
                        {userType === 'service-provider' && (
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                {user.role || 'Service Provider'}
                            </span>
                        )}
                    </div>

                    {message.text && (
                        <div className={`mb-8 p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                            {message.type === 'success' ? '✅ ' : '❌ '}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Details Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Personal Details</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 shadow-sm"
                                        value={user.name || ''}
                                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed shadow-sm"
                                        value={user.email || ''}
                                        disabled
                                        title="Email cannot be changed here"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Number</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 shadow-sm"
                                        value={user.contact || ''}
                                        onChange={(e) => setUser({ ...user, contact: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Location</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 shadow-sm"
                                        value={user.city || ''}
                                        onChange={(e) => setUser({ ...user, city: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="sm:col-span-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Area / Neighborhood</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 shadow-sm"
                                        value={user.area || ''}
                                        onChange={(e) => setUser({ ...user, area: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Info Section (SP Only) */}
                        {userType === 'service-provider' && (
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Professional Information</h3>
                                <div className="grid grid-cols-1 gap-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Service Category</label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 shadow-sm appearance-none"
                                            value={user.role || ''}
                                            onChange={(e) => setUser({ ...user, role: e.target.value })}
                                            required
                                        >
                                            <option value="" disabled>Select a Category</option>
                                            <option value="Plumber">Plumber</option>
                                            <option value="Electrician">Electrician</option>
                                            <option value="Cleaner">Cleaner</option>
                                            <option value="Tutor">Tutor</option>
                                            <option value="Carpenter">Carpenter</option>
                                            <option value="Painter">Painter</option>
                                            <option value="Mechanic">Mechanic</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description / Bio</label>
                                        <textarea
                                            rows="4"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 shadow-sm resize-y"
                                            placeholder="Tell customers about your experience, skills, and what makes you great..."
                                            value={user.description || ''}
                                            onChange={(e) => setUser({ ...user, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-6 border-t border-slate-100 mt-8">
                            <button
                                type="submit"
                                disabled={saving}
                                className={`px-8 py-3 rounded-xl text-white font-bold tracking-wide shadow-lg transition-all transform ${
                                    saving ? 'bg-indigo-400 cursor-not-allowed scale-100' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-[1.02] hover:shadow-indigo-200 active:scale-95'
                                }`}
                            >
                                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
