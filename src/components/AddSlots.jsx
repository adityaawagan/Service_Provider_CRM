import { useState } from "react";
import { addSlot } from "../services/serviceprovider.service";

const AddSlot = () => {
    // 1. Initialize with an empty string or a formatted date string
    const [slotDate, setSlotDate] = useState({
        date: "",
        startTime: "",
        endTime: "",
        isBooked: false
    });

    // 2. Fixed the spelling to match the form call
    const handlesubmit = async (e) => {
        e.preventDefault();
        console.log(slotDate);
        try {
            const datestr = slotDate.date;
            const d = new Date(datestr);
            
            // Create a payload object to avoid mutating React state directly
            // and format startTime/endTime into full Date objects
            const payload = {
                ...slotDate,
                date: d,
                startTime: new Date(`${datestr}T${slotDate.startTime}`),
                endTime: new Date(`${datestr}T${slotDate.endTime}`)
            };
            
            await addSlot(payload);
            alert("Slot added successfully");
            setSlotDate({
                date: "",
                startTime: "",
                endTime: "",
                isBooked: false
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-6 py-10">
            <div className="max-w-md mx-auto">
                {/* Card Container */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                        <h3 className="text-3xl font-bold text-white">Add New Slot</h3>
                        <p className="text-blue-100 text-sm mt-1">Schedule your availability</p>
                    </div>

                    {/* Form Container */}
                    <form onSubmit={handlesubmit} className="px-8 py-8">
                        {/* Date Field */}
                        <div className="mb-6">
                            <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                                📅 Date
                            </label>
                            <input
                                type="date"
                                id="date"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                value={slotDate.date}
                                onChange={(e) => setSlotDate({ ...slotDate, date: e.target.value })}
                                required
                            />
                        </div>

                        {/* Start Time Field */}
                        <div className="mb-6">
                            <label htmlFor="startTime" className="block text-sm font-semibold text-gray-700 mb-2">
                                🕐 Start Time
                            </label>
                            <input
                                type="time"
                                id="startTime"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                value={slotDate.startTime}
                                onChange={(e) => setSlotDate({ ...slotDate, startTime: e.target.value })}
                                required
                            />
                        </div>

                        {/* End Time Field */}
                        <div className="mb-8">
                            <label htmlFor="endTime" className="block text-sm font-semibold text-gray-700 mb-2">
                                🕑 End Time
                            </label>
                            <input
                                type="time"
                                id="endTime"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                value={slotDate.endTime}
                                onChange={(e) => setSlotDate({ ...slotDate, endTime: e.target.value })}
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                        >
                            ✓ Add Slot
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddSlot;