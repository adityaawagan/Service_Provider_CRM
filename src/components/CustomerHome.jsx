import { useEffect, useState } from "react";
import { fetchAllServiceProviders } from "../services/serviceprovider.service";
import { Link } from "react-router-dom";

const CustomerHome = () => {
    const [spArray, setSpArray] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedCity, setSelectedCity] = useState("");

    const fetchSPs = async () => {
        try {
            const arr = await fetchAllServiceProviders();
            setSpArray(arr);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchSPs();
    }, []);

    const filteredSPs = spArray.filter(sp => {
        const matchesSearch = sp.name?.toLowerCase().includes(searchTerm.toLowerCase()) || sp.area?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? sp.role === selectedCategory : true;
        const matchesCity = selectedCity ? sp.city?.toLowerCase() === selectedCity.toLowerCase() : true;
        return matchesSearch && matchesCategory && matchesCity;
    });

    const uniqueCities = [...new Set(spArray.map(sp => sp.city).filter(Boolean))];

    return (
        <div className='min-h-[calc(100vh-4rem)] bg-slate-50 p-6 md:p-10 font-sans'>
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                    <div>
                        <h2 className='text-4xl font-extrabold text-slate-900 tracking-tight'>
                            Service Providers
                        </h2>
                        <p className="text-slate-500 mt-2 text-lg">Find and book the best professionals for your needs.</p>
                    </div>
                    <Link to="/bookings" className="inline-flex items-center justify-center bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        My Bookings
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by name or area..." 
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 transition-shadow"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <select 
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 appearance-none cursor-pointer transition-shadow"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
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
                    <div className="w-full md:w-64">
                        <select 
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 appearance-none cursor-pointer transition-shadow"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                        >
                            <option value="">All Cities</option>
                            {uniqueCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Provider Grid */}
                {filteredSPs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSPs.map((sp) => (
                            <div key={sp.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xl font-bold text-indigo-700 shadow-inner">
                                            {sp.name ? sp.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 leading-tight">{sp.name}</h3>
                                            <div className="mt-1 inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wide uppercase">
                                                {sp.role}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grow space-y-3 mb-6">
                                    <div className="flex items-center text-slate-500 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {sp.area}{sp.city ? `, ${sp.city}` : ""}
                                    </div>
                                    {sp.description && (
                                        <p className="text-slate-600 text-sm line-clamp-2">
                                            {sp.description}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-50">
                                    <Link to={"/slots/" + sp.id} className="w-full flex items-center justify-center py-2.5 px-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors duration-200">
                                        View Availability
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Providers Found</h3>
                        <p className="text-slate-500">We couldn't find any service providers matching your current filters. Try adjusting your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomerHome;