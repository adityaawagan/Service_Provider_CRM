import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Rating } from 'react-simple-star-rating'
import { auth, db } from '../../environment/environment';
import { addReview } from '../services/customer.services';
import { doc, getDoc } from 'firebase/firestore';

const AddReview = () => {
    const params = useParams();
    const navigate = useNavigate();

    const [comment, setComment] = useState({
        comment: "",
        rating: 0,
        customerId: ""
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleRating = (rate) => {
        setComment({ ...comment, rating: rate });
        setError("");
    };

    const handleReview = async (e) => {
        e.preventDefault();

        if (comment.rating === 0) {
            setError("Please select a star rating!");
            return;
        }

        setSubmitting(true);
        const userId = auth.currentUser.uid;
        const bookingId = params.id;

        // Fetch the booking to get the serviceProviderId
        let serviceProviderId = null;
        try {
            const bookingSnap = await getDoc(doc(db, "bookings", bookingId));
            if (bookingSnap.exists()) {
                serviceProviderId = bookingSnap.data().serviceProviderId;
            }
        } catch (err) {
            console.error("Could not fetch booking:", err);
        }

        const reviewData = {
            ...comment,
            customerId: userId,
            bookingId: bookingId,
            serviceProviderId: serviceProviderId || null,
            date: new Date()
        };

        try {
            await addReview(reviewData);
            navigate('/bookings');
        } catch (error) {
            console.error("Error adding review:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8">

                {/* Header */}
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Add a Review</h3>
                    <p className="text-sm text-gray-500 mt-1">Share your experience with others</p>
                </div>

                <form onSubmit={handleReview} className="space-y-6">

                    {/* Star Rating */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Rate your experience
                        </label>
                        <div className="flex items-center gap-1">
                            <Rating
                                onClick={handleRating}
                                initialValue={comment.rating}
                                size={36}
                                fillColor="#f59e0b"
                                emptyColor="#d1d5db"
                                SVGstyle={{ display: "inline-block" }}
                                style={{ display: "flex", flexDirection: "row", gap: "4px" }}
                            />
                        </div>
                        {error && comment.rating === 0 && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Comment
                        </label>
                        <textarea
                            id="comment"
                            placeholder="How was the service?"
                            className="w-full h-36 px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                            value={comment.comment}
                            onChange={(e) => setComment({ ...comment, comment: e.target.value })}
                            required
                        />
                    </div>

                    {/* General Error */}
                    {error && comment.rating !== 0 && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition duration-200"
                        >
                            {submitting ? "Submitting..." : "Submit Review"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/bookings')}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition duration-200"
                        >
                            Cancel
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddReview;