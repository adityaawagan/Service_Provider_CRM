import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signinServiceProvider } from "../services/serviceprovider.service";
import { signinCustomer } from "../services/customer.services";

const Signin = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        email: "",
        password: ""
    })

    const handleSubmit = async (e) => {
        e.preventDefault();

        const type = localStorage.getItem("userType");
        localStorage.setItem("isAuthenticated", "true");
        if (type === "service-provider") {
            const spData = await signinServiceProvider(user.email, user.password);
            if (spData?.role) {
                localStorage.setItem("spRole", spData.role);
            }
            navigate("/ServiceProviderHome");
        } else if (type === "customer") {
            await signinCustomer(user.email, user.password);
            navigate("/home")
        }
        // Add signin logic here
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Sign In
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Access your account to manage your services
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    >
                        Sign in
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out">
                            Register Here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Signin;