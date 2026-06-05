import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookingRequests, respondToBooking } from '../services/serviceprovider.service';
import { auth } from '../../environment/environment';

const BookingRequests = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate(); // still used for redirect to signin

    useEffect(() => {
        // Wait for Firebase auth state to restore before querying
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                navigate('/signin');
                return;
            }
            try {
                const data = await getBookingRequests();
                setBookings(data);
            } catch (err) {
                console.error("Error fetching bookings:", err);
                setError("Failed to fetch booking requests");
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleAcceptBooking = async (bookingId) => {
        setActionLoading(bookingId);
        try {
            await respondToBooking(bookingId, 'accepted');
            setBookings(bookings.map(b => 
                b.id === bookingId ? { ...b, status: 'accepted' } : b
            ));
            alert('Booking accepted!');
        } catch (err) {
            alert('Error accepting booking: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectBooking = async (bookingId) => {
        setActionLoading(bookingId);
        try {
            await respondToBooking(bookingId, 'rejected');
            setBookings(bookings.filter(b => b.id !== bookingId));
            alert('Booking rejected');
        } catch (err) {
            alert('Error rejecting booking: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Filter bookings by status
    const pendingBookings = bookings.filter(b => !b.status || b.status === 'pending');
    const acceptedBookings = bookings.filter(b => b.status === 'accepted');

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
                    <p className="text-gray-600 mt-1">Manage your customer booking requests</p>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Pending Bookings Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        ⏳ Pending Requests ({pendingBookings.length})
                    </h2>

                    {pendingBookings.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                            <p className="text-gray-500">No pending booking requests</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {booking.customerName || 'Unknown Customer'}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                📞 {booking.customerContact || 'N/A'}
                                            </p>
                                        </div>
                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            PENDING
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 my-4 text-sm bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <p className="text-gray-600">📅 Date</p>
                                            <p className="font-semibold text-gray-900">
                                                {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">⏰ Time</p>
                                            <p className="font-semibold text-gray-900">
                                                {booking.startTime ? new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} - {booking.endTime ? new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleAcceptBooking(booking.id)}
                                            disabled={actionLoading === booking.id}
                                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                        >
                                            {actionLoading === booking.id ? 'Processing...' : '✓ Accept'}
                                        </button>
                                        <button
                                            onClick={() => handleRejectBooking(booking.id)}
                                            disabled={actionLoading === booking.id}
                                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                        >
                                            {actionLoading === booking.id ? 'Processing...' : '✕ Reject'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Accepted Bookings Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        ✓ Accepted Bookings ({acceptedBookings.length})
                    </h2>

                    {acceptedBookings.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                            <p className="text-gray-500">No accepted bookings yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {acceptedBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="bg-white rounded-lg border border-green-200 p-6 shadow-sm"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {booking.customerName || 'Unknown Customer'}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                📞 {booking.customerContact || 'N/A'}
                                            </p>
                                        </div>
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            ACCEPTED
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 my-4 text-sm bg-green-50 p-3 rounded-lg">
                                        <div>
                                            <p className="text-gray-600">📅 Date</p>
                                            <p className="font-semibold text-gray-900">
                                                {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">⏰ Time</p>
                                            <p className="font-semibold text-gray-900">
                                                {booking.startTime ? new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} - {booking.endTime ? new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-500 mt-2 italic">Booking confirmed</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingRequests;
