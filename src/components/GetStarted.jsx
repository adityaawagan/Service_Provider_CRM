import { Link, useNavigate } from "react-router-dom";


const GetStarted = () => {
    const navigate = useNavigate();
    const clickuser = (type) => {
        localStorage.setItem("userType", type);
        navigate("/Signin");
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6 font-sans">
            <div className="max-w-5xl w-full text-center space-y-12">
                
                {/* Header Section */}
                <div className="space-y-4">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                        Welcome to ServiceProvider CRM
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                        Connect with top-rated professionals or manage your service business all in one place. How would you like to continue?
                    </p>
                </div>

                {/* Cards Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-8">
                    
                    {/* Service Provider Card */}
                    <button 
                        onClick={() => clickuser("service-provider")}
                        className="group relative bg-white rounded-3xl p-10 shadow-xl border border-slate-100 hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-2 text-left w-full overflow-hidden"
                    >
                        {/* Decorative background blob */}
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-60 group-hover:bg-indigo-100 transition-colors duration-300"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <div className="p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">I am a Service Provider</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    Manage your bookings, showcase your skills, and grow your client base with our powerful management tools.
                                </p>
                            </div>
                            <div className="pt-4 flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                                Get Started <span className="ml-2">→</span>
                            </div>
                        </div>
                    </button>

                    {/* Customer Card */}
                    <button 
                        onClick={() => clickuser("customer")}
                        className="group relative bg-white rounded-3xl p-10 shadow-xl border border-slate-100 hover:shadow-2xl hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-2 text-left w-full overflow-hidden"
                    >
                        {/* Decorative background blob */}
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-emerald-50 rounded-full blur-2xl opacity-60 group-hover:bg-emerald-100 transition-colors duration-300"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <div className="p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">I am a Customer</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    Find trusted professionals in your city, book appointments easily, and leave reviews for services you love.
                                </p>
                            </div>
                            <div className="pt-4 flex items-center text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                                Browse Services <span className="ml-2">→</span>
                            </div>
                        </div>
                    </button>

                </div>
            </div>
        </div>
    );

}

export default GetStarted;