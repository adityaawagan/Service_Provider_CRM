import React, { useEffect, useState } from 'react'
import { showMyBookings } from '../services/customer.services';
import { useNavigate } from 'react-router-dom';
import { createOrGetConversation } from '../services/chat.service';
import { auth } from '../../environment/environment';

const MyBooking = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const getAllBookings = async () => {
        try {
            const data = await showMyBookings();
            setBookings(data);
        } catch (error) {
            setError("Failed to fetch bookings.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = (bookingId) => {
        navigate("/review/" + bookingId);
    };

    const handleMessage = async (serviceProviderId) => {
        try {
            if (!auth.currentUser) {
                navigate('/signin');
                return;
            }
            const conversationId = await createOrGetConversation(auth.currentUser.uid, serviceProviderId);
            navigate(`/chat/${conversationId}`);
        } catch (error) {
            console.error("Error starting chat:", error);
            alert("Failed to start chat: " + error.message);
        }
    };

    useEffect(() => {
        getAllBookings();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">My Bookings</h2>
                    <p className="text-sm text-gray-500 mt-1">View and review your past bookings</p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        {error}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && bookings.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="text-5xl mb-4">📭</span>
                        <p className="text-gray-500 text-base font-medium">No bookings found.</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Your confirmed bookings will appear here.
                        </p>
                    </div>
                )}

                {/* Booking Cards */}
                {!loading && !error && bookings.length > 0 && (
                    <ul className="space-y-4">
                        {bookings.map((booking, index) => (
                            <li
                                key={index}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between gap-4"
                            >
                                {/* Info */}
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                                        {booking.serviceProviderName?.charAt(0).toUpperCase() ?? "?"}
                                    </div>

                                    <div>
                                        <p className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                            {booking.serviceProviderName}
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${booking.status === 'accepted' ? 'bg-green-100 text-green-700' : booking.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {booking.status ? booking.status.toUpperCase() : 'PENDING'}
                                            </span>
                                        </p>
                                        <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                            {booking.serviceProviderRole}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="shrink-0 flex gap-2">
                                    {(!booking.status || booking.status === 'accepted') && (
                                    <button
                                        onClick={() => handleReview(booking.id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition duration-200"
                                    >
                                        Add Review
                                    </button>
                                    )}
                                    <button
                                        onClick={() => handleMessage(booking.serviceProviderId)}
                                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition duration-200 flex items-center gap-1"
                                    >
                                        💬 Message
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

            </div>
        </div>
    );
};

export default MyBooking;