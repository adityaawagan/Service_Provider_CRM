import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    fetchSlotsForId,
    fetchSpById,
    fetchOfferingsForSp,
    fetchReviewsForSp,
    fetchWorkPhotosForSp,
} from '../services/serviceprovider.service';
import { bookASlot } from '../services/customer.services';

// --- Helper: render filled/half/empty stars ---
const StarDisplay = ({ rating, size = 18 }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        const filled = rating >= i;
        const half = !filled && rating >= i - 0.5;
        stars.push(
            <svg key={i} xmlns="http://www.w3.org/2000/svg"
                style={{ width: size, height: size, display: 'inline-block' }}
                viewBox="0 0 24 24"
            >
                {half ? (
                    <>
                        <defs>
                            <linearGradient id={`half-${i}`}>
                                <stop offset="50%" stopColor="#f59e0b" />
                                <stop offset="50%" stopColor="#d1d5db" />
                            </linearGradient>
                        </defs>
                        <path fill={`url(#half-${i})`} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </>
                ) : (
                    <path fill={filled ? '#f59e0b' : '#d1d5db'} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                )}
            </svg>
        );
    }
    return <span className="inline-flex items-center gap-0.5">{stars}</span>;
};

const Slots = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [sp, setSp] = useState(null);
    const [slots, setSlots] = useState([]);
    const [offerings, setOfferings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingId, setBookingId] = useState(null);
    const [lightbox, setLightbox] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');

    // Group slots by formatted date string (YYYY-MM-DD)
    const slotsByDate = {};
    slots.forEach(slot => {
        if (!slot.date) return;
        const dateObj = new Date(slot.date);
        const yr = dateObj.getFullYear();
        const mo = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dy = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${yr}-${mo}-${dy}`;
        
        if (!slotsByDate[dateStr]) {
            slotsByDate[dateStr] = [];
        }
        slotsByDate[dateStr].push(slot);
    });

    const uniqueDates = Object.keys(slotsByDate).sort((a, b) => new Date(a) - new Date(b));

    // Auto-select first date with slots
    useEffect(() => {
        if (uniqueDates.length > 0 && (!selectedDate || !uniqueDates.includes(selectedDate))) {
            setSelectedDate(uniqueDates[0]);
        }
    }, [slots]);

    useEffect(() => {
        if (!id) return;
        const loadAll = async () => {
            const [spData, slotsData, offeringsData, reviewsData, photosData] = await Promise.all([
                fetchSpById(id),
                fetchSlotsForId(id),
                fetchOfferingsForSp(id),
                fetchReviewsForSp(id),
                fetchWorkPhotosForSp(id),
            ]);
            setSp(spData);
            setSlots(slotsData || []);
            setOfferings(offeringsData || []);
            setReviews(reviewsData || []);
            setPhotos(photosData || []);
            setLoading(false);
        };
        loadAll();
    }, [id]);

    const avgRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : null;

    const handleBook = async (slotId) => {
        setBookingId(slotId);
        try {
            await bookASlot(slotId);
            const updated = await fetchSlotsForId(id);
            setSlots(updated || []);
        } catch (err) {
            console.error(err);
        } finally {
            setBookingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!sp) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-2xl font-bold text-slate-700 mb-2">Provider Not Found</p>
                    <button onClick={() => navigate('/home')} className="text-indigo-600 hover:underline font-medium">
                        ← Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>

            {/* ── Hero Banner ── */}
            <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 pb-20 pt-10 px-6 relative">
                <button
                    onClick={() => navigate('/home')}
                    className="mb-6 inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Providers
                </button>

                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-extrabold text-white shadow-xl border border-white/30">
                        {sp.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    {/* Name & meta */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">{sp.name}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                            <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
                                {sp.role}
                            </span>
                            {sp.city && (
                                <span className="flex items-center gap-1 text-white/80 text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {sp.area ? `${sp.area}, ` : ''}{sp.city}
                                </span>
                            )}
                            {avgRating && (
                                <span className="flex items-center gap-1.5 bg-amber-400/20 text-amber-200 text-sm font-semibold px-3 py-1 rounded-full">
                                    ⭐ {avgRating} / 5 &nbsp;·&nbsp; {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 pb-16 space-y-8">

                {/* ── About / Bio ── */}
                {sp.description && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <span className="text-indigo-500">📋</span> About
                        </h2>
                        <p className="text-slate-600 leading-relaxed">{sp.description}</p>
                    </div>
                )}

                {/* ── Experience / Contact quick info ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Category', value: sp.role, icon: '🛠' },
                        { label: 'Location', value: sp.city || '—', icon: '📍' },
                        { label: 'Reviews', value: reviews.length || '0', icon: '⭐' },
                        { label: 'Rating', value: avgRating ? `${avgRating} / 5` : 'No ratings yet', icon: '🏆' },
                    ].map(item => (
                        <div key={item.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
                            <div className="text-2xl mb-1">{item.icon}</div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{item.label}</p>
                            <p className="text-base font-bold text-slate-900 mt-0.5 truncate">{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Services Offered ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="text-indigo-500">🔧</span> Services Offered
                        <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                            {offerings.length} listed
                        </span>
                    </h2>

                    {offerings.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-6">No specific services listed yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {offerings.map(o => (
                                <div key={o.id} className="group border border-slate-100 rounded-xl p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-slate-900 text-sm leading-snug">{o.serviceName}</h3>
                                        <span className="shrink-0 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                                            {o.priceType === 'starting' ? 'From ' : ''}₹{o.price}
                                        </span>
                                    </div>
                                    {o.description && (
                                        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{o.description}</p>
                                    )}
                                    {o.duration && (
                                        <span className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-600 font-medium">
                                            ⏱ {o.duration}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Available Slots Calendar ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="text-indigo-500">📅</span> Booking Schedule
                        <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                            {slots.length} open
                        </span>
                    </h2>

                    {slots.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-slate-500 font-medium">No slots available right now</p>
                            <p className="text-slate-400 text-sm mt-1">Check back later for open booking times.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Horizontal Date Slider */}
                            <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                {uniqueDates.map(dateStr => {
                                    const dateObj = new Date(dateStr);
                                    const isSelected = selectedDate === dateStr;
                                    const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
                                    const dayNum = dateObj.getDate();
                                    const monthName = dateObj.toLocaleDateString('en-IN', { month: 'short' });
                                    
                                    return (
                                        <button
                                            key={dateStr}
                                            onClick={() => setSelectedDate(dateStr)}
                                            className={`flex flex-col items-center justify-center min-w-[70px] h-[90px] rounded-xl border transition-all duration-200 transform cursor-pointer ${
                                                isSelected 
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100 scale-105' 
                                                    : 'bg-white border-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span className={`text-xs font-semibold uppercase tracking-wider ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                {dayName}
                                            </span>
                                            <span className="text-2xl font-extrabold mt-1">
                                                {dayNum}
                                            </span>
                                            <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                                                {monthName}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Active Day Slots Grid */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    Available Times for {selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
                                </p>
                                {selectedDate && slotsByDate[selectedDate] && slotsByDate[selectedDate].length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {slotsByDate[selectedDate].map(slot => {
                                            const startTimeStr = slot.startTime ? new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                                            const endTimeStr = slot.endTime ? new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                                            
                                            return (
                                                <div 
                                                    key={slot.id} 
                                                    className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all duration-200"
                                                >
                                                    <div className="text-center mb-4">
                                                        <span className="text-lg font-bold text-slate-850">
                                                            {startTimeStr}
                                                        </span>
                                                        <span className="block text-[11px] font-semibold text-slate-400 mt-0.5">
                                                            to {endTimeStr}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleBook(slot.id)}
                                                        disabled={bookingId === slot.id}
                                                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
                                                    >
                                                        {bookingId === slot.id ? 'Booking...' : 'Book Slot'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No available times found for this day.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Work Photos ── */}
                {photos.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="text-indigo-500">📸</span> Work Photos
                            <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                                {photos.length} photo{photos.length !== 1 ? 's' : ''}
                            </span>
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {photos.map(photo => (
                                <div
                                    key={photo.id}
                                    className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer group hover:shadow-lg transition-all duration-200"
                                    onClick={() => setLightbox(photo)}
                                >
                                    <img
                                        src={photo.url}
                                        alt={photo.caption || 'Work photo'}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Customer Reviews ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="text-indigo-500">💬</span> Customer Reviews
                        {avgRating && (
                            <span className="ml-auto flex items-center gap-1.5">
                                <StarDisplay rating={parseFloat(avgRating)} size={18} />
                                <span className="text-sm font-bold text-slate-700">{avgRating}</span>
                            </span>
                        )}
                    </h2>

                    {reviews.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-6">No reviews yet. Be the first to book and review!</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map(r => (
                                <div key={r.id} className="border border-slate-100 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                                C
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">Customer</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StarDisplay rating={r.rating || 0} size={15} />
                                            <span className="text-xs font-bold text-amber-600">{r.rating}/5</span>
                                        </div>
                                    </div>
                                    {r.comment && (
                                        <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                                    )}
                                    {r.date && (
                                        <p className="text-xs text-slate-400 mt-2">
                                            {new Date(r.date?.toDate ? r.date.toDate() : r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

        {/* ── Lightbox ── */}
        {lightbox && (
            <div
                className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setLightbox(null)}
            >
                <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
                    <img
                        src={lightbox.url}
                        alt={lightbox.caption || 'Work photo'}
                        className="w-full max-h-[88vh] object-contain rounded-2xl shadow-2xl"
                    />
                    <button
                        onClick={() => setLightbox(null)}
                        className="absolute top-3 right-3 bg-black/60 hover:bg-black/90 text-white rounded-full p-2 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        )}
        </>
    );
};

export default Slots;