import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../environment/environment';
import { doc, getDoc } from 'firebase/firestore';
import { getBookingRequests } from '../services/serviceprovider.service';

const ServiceProviderHome = () => {
    const [spDetails, setSpDetails] = useState(null);
    const [bookingCounts, setBookingCounts] = useState({ pending: 0, accepted: 0, all: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const userId = auth.currentUser?.uid;
                if (userId) {
                    const docRef = doc(db, 'service_providers', userId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setSpDetails(docSnap.data());
                    }

                    const bookings = await getBookingRequests();
                    const pending = bookings.filter(b => !b.status || b.status === 'pending').length;
                    const accepted = bookings.filter(b => b.status === 'accepted').length;
                    setBookingCounts({ pending, accepted, all: bookings.length });
                }
            } catch (error) {
                console.error(error);
            }
        };

        setTimeout(loadData, 500);
    }, []);


    return (
        <div className='min-h-screen bg-gray-50 p-8'>
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Dashboard Card */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className='text-3xl font-extrabold text-gray-900 mb-6 text-center'>
                    Service Provider Dashboard
                </h2>
                <div className="text-center text-gray-600">
                    {spDetails && (
                        <p className="text-lg font-medium text-indigo-700 mb-2">
                            Welcome, {spDetails.name} ({spDetails.role})
                        </p>
                    )}
                    <p>Manage your bookings and view your subscription details below.</p>
                </div>
                </div>

                {/* Booking Summary Section */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">📋 Booking Summary</h3>
                            <p className="text-gray-600">See your latest booking counts and requests.</p>
                        </div>
                        <button
                            onClick={() => navigate('/booking-requests')}
                            className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
                        >
                            View Booking Requests
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 text-center">
                            <p className="text-sm text-blue-500 uppercase tracking-[0.2em] font-semibold mb-2">Pending</p>
                            <p className="text-4xl font-extrabold text-blue-700">{bookingCounts.pending}</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 text-center">
                            <p className="text-sm text-emerald-500 uppercase tracking-[0.2em] font-semibold mb-2">Accepted</p>
                            <p className="text-4xl font-extrabold text-emerald-700">{bookingCounts.accepted}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center">
                            <p className="text-sm text-slate-500 uppercase tracking-[0.2em] font-semibold mb-2">Total Bookings</p>
                            <p className="text-4xl font-extrabold text-slate-900">{bookingCounts.all}</p>
                        </div>
                    </div>
                </div>

                {/* Subscription Section */}
                <div>
                    <div className="text-center mb-10">
                        <h3 className="text-3xl font-extrabold text-gray-900">Upgrade Your Plan</h3>
                        <p className="text-gray-500 mt-3 text-lg">Get more features and visibility with our premium subscriptions.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {/* Monthly Plan */}
                        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 hover:shadow-xl transition-all duration-300 flex flex-col">
                            <h4 className="text-2xl font-bold text-gray-900">Monthly</h4>
                            <p className="mt-4 flex items-baseline text-5xl font-extrabold text-indigo-600">
                                ₹199<span className="text-xl font-medium text-gray-500 ml-1">/mo</span>
                            </p>
                            <p className="mt-4 text-gray-500 grow">Perfect for getting started and testing the waters.</p>
                            <ul className="mt-8 space-y-4 mb-8">
                                <li className="flex items-start">
                                    <svg className="shrink-0 h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="ml-3 text-gray-600">Up to 50 slots/month</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="shrink-0 h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="ml-3 text-gray-600">Standard visibility</span>
                                </li>
                            </ul>
                            <button
                                onClick={() => alert("Redirecting to payment gateway for Monthly Plan (₹199)...")}
                                className="block w-full bg-indigo-50 text-indigo-700 font-bold py-4 px-4 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
                            >
                                Subscribe Monthly
                            </button>
                        </div>

                        {/* Yearly Plan */}
                        <div className="relative bg-linear-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-8 transform md:-translate-y-4 hover:scale-105 transition-transform duration-300 flex flex-col">
                            <div className="absolute top-0 right-0 -mt-4 mr-6 bg-linear-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                                Most Popular
                            </div>
                            <h4 className="text-2xl font-bold text-white">Yearly</h4>
                            <p className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                                ₹2199<span className="text-xl font-medium text-indigo-200 ml-1">/yr</span>
                            </p>
                            <p className="mt-4 text-indigo-100 grow">Save over 15% with our annual billing plan.</p>
                            <ul className="mt-8 space-y-4 mb-8">
                                <li className="flex items-start">
                                    <svg className="shrink-0 h-6 w-6 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="ml-3 text-white">Unlimited slots</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="shrink-0 h-6 w-6 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="ml-3 text-white">Priority visibility</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="shrink-0 h-6 w-6 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="ml-3 text-white">Premium support</span>
                                </li>
                            </ul>
                            <button
                                onClick={() => alert("Redirecting to payment gateway for Yearly Plan (₹2199)...")}
                                className="block w-full bg-white text-indigo-600 font-bold py-4 px-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                            >
                                Subscribe Yearly
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ServiceProviderHome;
