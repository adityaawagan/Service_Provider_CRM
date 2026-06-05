import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addServiceProvider } from "../services/serviceprovider.service";
import { addCustomer } from "../services/customer.services";

const Signup = () => {
    const [user, setUser] = useState({
        name: "",
        email: "",
        contact: "",
        area: "",
        city: "",
        password: "",
        role: ""
    })

    const userType = localStorage.getItem("userType");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const type = localStorage.getItem("userType");
        if (type == "service-provider") {
            await addServiceProvider(user);
        } else if (type == "customer") {
            await addCustomer(user);
            // Add signup logic here
        }
        navigate("/signin");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Create an Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join us to start managing your services
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                                placeholder="John Doe"
                                required
                                value={user.name}
                                onChange={(e) => setUser({ ...user, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Number
                            </label>
                            <input
                                type="text"
                                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                                placeholder="1234567890"
                                required
                                value={user.contact}
                                onChange={(e) => setUser({ ...user, contact: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                            placeholder="you@example.com"
                            required
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Area/Location
                            </label>
                            <input
                                type="text"
                                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                                placeholder="Region or neighborhood"
                                required
                                value={user.area}
                                onChange={(e) => setUser({ ...user, area: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>
                            <input
                                type="text"
                                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                                placeholder="City"
                                required
                                value={user.city}
                                onChange={(e) => setUser({ ...user, city: e.target.value })}
                            />
                        </div>

                        {userType === "service-provider" && (
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Service Role (e.g., Plumber)
                                </label>
                                <select
                                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out bg-white"
                                    required
                                    value={user.role}
                                    onChange={(e) => setUser({ ...user, role: e.target.value })}
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
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                            placeholder="••••••••"
                            required
                            value={user.password}
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out mt-4"
                    >
                        Sign up
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/signin" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out">
                            Sign In Here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Signup;