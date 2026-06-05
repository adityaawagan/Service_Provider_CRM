import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../environment/environment';
import { listenToNotifications, markAsRead, markAllNotificationsAsRead } from '../services/notification.service';

const Header = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const type = localStorage.getItem("userType");
    const navigate = useNavigate();
    const location = useLocation();

    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(user => {
            if (user) {
                setCurrentUserId(user.uid);
            } else {
                setCurrentUserId(null);
                setNotifications([]);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!currentUserId) return;
        const unsubscribeNotifications = listenToNotifications(currentUserId, (data) => {
            setNotifications(data);
        });
        return () => unsubscribeNotifications();
    }, [currentUserId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;
    
    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    }

    return (
        <header className='w-full h-16 bg-slate-900 text-white shadow-lg flex items-center justify-between px-8'>
            <div>
                {type === "service-provider" && (
                    <Link className='text-xl font-bold tracking-wide hover:text-indigo-300 transition-colors' to="/ServiceProviderHome">
                        Service Provider CRM
                    </Link>
                )}
                {type === "customer" && (
                    <Link className='text-xl font-bold tracking-wide hover:text-indigo-300 transition-colors' to="/home">
                        Customer Portal
                    </Link>
                )}
                {!type && (
                    <Link className='text-xl font-bold tracking-wide hover:text-indigo-300 transition-colors' to="/">
                        Service Provider CRM
                    </Link>
                )}
            </div>
            <nav className="flex space-x-6 font-medium">
                {type === "service-provider" && (
                    <>
                        <Link to="/ServiceProviderHome" className="hover:text-indigo-300 transition-colors">
                            Dashboard
                        </Link>
                        <Link to="/my-services" className="hover:text-indigo-300 transition-colors">
                            🛠 My Services
                        </Link>
                        <Link to="/work-photos" className="hover:text-indigo-300 transition-colors">
                            📸 Work Photos
                        </Link>
                        <Link to="/add-slots" className="hover:text-indigo-300 transition-colors">
                            Add Slots
                        </Link>
                        <Link to="/booking-requests" className="hover:text-indigo-300 transition-colors">
                            📋 Bookings
                        </Link>
                    </>
                )}
                {
                    isAuthenticated && type === "customer" && (
                        <Link to="/bookings" className="hover:text-indigo-300 transition-colors">
                            📋 My Bookings
                        </Link>
                    )
                }
                {
                    isAuthenticated && (
                        <>
                            {/* Notification Bell Dropdown */}
                            <div className="relative flex items-center" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="relative p-1.5 text-gray-300 hover:text-white transition-colors focus:outline-none cursor-pointer rounded-full hover:bg-slate-800"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-1 ring-slate-900 animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-150 py-2 z-50 text-slate-800 overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                                            <h3 className="font-bold text-xs text-slate-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={() => markAllNotificationsAsRead(currentUserId)}
                                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 cursor-pointer"
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                                            {notifications.length === 0 ? (
                                                <div className="py-8 text-center text-slate-400 text-xs">
                                                    <span className="text-lg block mb-1">🔔</span>
                                                    No notifications yet
                                                </div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => !n.read && markAsRead(n.id)}
                                                        className={`px-4 py-2.5 text-left transition-colors cursor-pointer flex gap-2.5 items-start ${
                                                            n.read ? 'hover:bg-slate-50' : 'bg-indigo-50/30 hover:bg-indigo-50/50'
                                                        }`}
                                                    >
                                                        <div className="text-base shrink-0 mt-0.5">
                                                            {n.type === 'booking_request' ? '📅' : (n.type === 'booking_accepted' || n.type === 'accepted') ? '✅' : (n.type === 'booking_rejected' || n.type === 'rejected') ? '❌' : '🔔'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-[11px] font-bold ${n.read ? 'text-slate-600' : 'text-slate-800'}`}>
                                                                {n.title}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                                                                {n.message}
                                                            </p>
                                                            <span className="text-[8px] text-slate-400 block mt-1">
                                                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                            </span>
                                                        </div>
                                                        {!n.read && (
                                                            <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full shrink-0 mt-2" />
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link to="/profile" className="hover:text-indigo-300 transition-colors">
                                Profile
                            </Link>
                            <button onClick={handleLogout} className="hover:text-indigo-300 transition-colors cursor-pointer">
                                Logout
                            </button>
                        </>
                    )
                }
            </nav>
        </header>
    );
};

export default Header; 