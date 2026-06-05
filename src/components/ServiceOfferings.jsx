import React, { useState, useEffect } from 'react';
import { auth, db } from '../../environment/environment';
import {
    collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc
} from 'firebase/firestore';

const SERVICE_CATEGORIES = {
    Plumber: ['Pipe Repair', 'Tap Installation', 'Drain Cleaning', 'Water Heater Installation', 'Water Tank Cleaning', 'Leak Detection'],
    Electrician: ['Wiring & Rewiring', 'Switch & Socket Repair', 'Fan Installation', 'Light Fixture Setup', 'MCB / Fuse Repair', 'Inverter Installation'],
    Cleaner: ['Home Deep Cleaning', 'Bathroom Cleaning', 'Kitchen Cleaning', 'Sofa / Carpet Cleaning', 'Office Cleaning', 'Post-Construction Cleaning'],
    Tutor: ['Math Tuition', 'Science Tuition', 'English Tuition', 'Competitive Exam Prep', 'Computer Basics', 'Language Classes'],
    Carpenter: ['Furniture Repair', 'Custom Furniture', 'Door / Window Fitting', 'Cabinet Making', 'Wood Polish', 'Partition Work'],
    Painter: ['Interior Painting', 'Exterior Painting', 'Texture Painting', 'Waterproofing', 'Wall Putty', 'Wood Painting'],
    Mechanic: ['Car Service', 'Bike Service', 'Engine Repair', 'Tyre Change', 'AC Service', 'Battery Replacement'],
    Other: ['Custom Service'],
};

const DURATION_OPTIONS = ['30 mins', '1 hour', '2 hours', '3 hours', '4 hours', 'Half Day', 'Full Day', 'Custom'];

const emptyForm = {
    serviceName: '',
    customServiceName: '',
    description: '',
    price: '',
    duration: '',
    customDuration: '',
    priceType: 'fixed', // fixed | starting
};

const ServiceOfferings = () => {
    const [offerings, setOfferings] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [spRole, setSpRole] = useState('Other');
    const [showForm, setShowForm] = useState(false);

    const uid = auth.currentUser?.uid;

    // Fetch SP role and existing offerings
    useEffect(() => {
        const loadData = async () => {
            if (!uid) return;
            try {
                // Get SP role from localStorage (set at login)
                const storedRole = localStorage.getItem('spRole');
                if (storedRole) setSpRole(storedRole);

                // Fetch offerings
                const q = query(collection(db, 'service_offerings'), where('serviceProviderId', '==', uid));
                const snap = await getDocs(q);
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setOfferings(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [uid]);

    const suggestedServices = SERVICE_CATEGORIES[spRole] || SERVICE_CATEGORIES['Other'];

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3500);
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        const finalName = form.serviceName === '__custom__' ? form.customServiceName.trim() : form.serviceName;
        const finalDuration = form.duration === 'Custom' ? form.customDuration.trim() : form.duration;

        if (!finalName) {
            showMessage('Please enter a service name.', 'error');
            setSaving(false);
            return;
        }

        const payload = {
            serviceProviderId: uid,
            serviceName: finalName,
            description: form.description.trim(),
            price: form.price,
            priceType: form.priceType,
            duration: finalDuration,
            updatedAt: new Date(),
        };

        try {
            if (editingId) {
                await updateDoc(doc(db, 'service_offerings', editingId), payload);
                setOfferings(offerings.map(o => o.id === editingId ? { id: editingId, ...payload } : o));
                showMessage('Service updated successfully!');
            } else {
                payload.createdAt = new Date();
                const ref = await addDoc(collection(db, 'service_offerings'), payload);
                setOfferings([...offerings, { id: ref.id, ...payload }]);
                showMessage('Service added successfully!');
            }
            resetForm();
        } catch (err) {
            console.error(err);
            showMessage('Failed to save service. ' + err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (offering) => {
        const isSuggested = suggestedServices.includes(offering.serviceName);
        setForm({
            serviceName: isSuggested ? offering.serviceName : '__custom__',
            customServiceName: isSuggested ? '' : offering.serviceName,
            description: offering.description || '',
            price: offering.price || '',
            duration: DURATION_OPTIONS.includes(offering.duration) ? offering.duration : 'Custom',
            customDuration: DURATION_OPTIONS.includes(offering.duration) ? '' : offering.duration,
            priceType: offering.priceType || 'fixed',
        });
        setEditingId(offering.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this service offering?')) return;
        setDeletingId(id);
        try {
            await deleteDoc(doc(db, 'service_offerings', id));
            setOfferings(offerings.filter(o => o.id !== id));
            showMessage('Service removed.');
        } catch (err) {
            showMessage('Failed to delete. ' + err.message, 'error');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Services</h1>
                        <p className="text-slate-500 mt-1">Define exactly what you offer so customers know what to book.</p>
                    </div>
                    {!showForm && (
                        <button
                            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Service
                        </button>
                    )}
                </div>

                {/* Toast Message */}
                {message.text && (
                    <div className={`flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-medium border ${
                        message.type === 'error'
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                        <span>{message.type === 'error' ? '❌' : '✅'}</span>
                        {message.text}
                    </div>
                )}

                {/* Add / Edit Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        {/* Form Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {editingId ? '✏️ Edit Service' : '➕ Add New Service'}
                                </h2>
                                <p className="text-indigo-200 text-sm mt-0.5">
                                    {editingId ? 'Update the details of this service.' : 'Fill in the details of the service you provide.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-white/70 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="px-8 py-7 space-y-6">

                            {/* Service Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Service Name <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                                    {suggestedServices.map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setForm({ ...form, serviceName: s, customServiceName: '' })}
                                            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                                                form.serviceName === s
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, serviceName: '__custom__' })}
                                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                                            form.serviceName === '__custom__'
                                                ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-400 hover:bg-purple-50'
                                        }`}
                                    >
                                        + Custom
                                    </button>
                                </div>

                                {form.serviceName === '__custom__' && (
                                    <input
                                        type="text"
                                        placeholder="Type your custom service name..."
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 shadow-sm"
                                        value={form.customServiceName}
                                        onChange={(e) => setForm({ ...form, customServiceName: e.target.value })}
                                        autoFocus
                                    />
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Description
                                    <span className="text-slate-400 font-normal ml-1">(optional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Briefly describe what this service includes, tools used, etc."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 shadow-sm resize-y"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            {/* Price & Duration */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Price (₹) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        {['fixed', 'starting'].map(pt => (
                                            <button
                                                key={pt}
                                                type="button"
                                                onClick={() => setForm({ ...form, priceType: pt })}
                                                className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wide transition-all ${
                                                    form.priceType === pt
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'
                                                }`}
                                            >
                                                {pt === 'fixed' ? '₹ Fixed' : 'Starting At'}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="e.g. 499"
                                            required
                                            className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 shadow-sm"
                                            value={form.price}
                                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Estimated Duration <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 shadow-sm appearance-none"
                                        value={form.duration}
                                        onChange={(e) => setForm({ ...form, duration: e.target.value, customDuration: '' })}
                                    >
                                        <option value="" disabled>Select duration</option>
                                        {DURATION_OPTIONS.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                    {form.duration === 'Custom' && (
                                        <input
                                            type="text"
                                            placeholder="e.g. 90 mins"
                                            className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 shadow-sm"
                                            value={form.customDuration}
                                            onChange={(e) => setForm({ ...form, customDuration: e.target.value })}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`flex-1 py-3 px-6 rounded-xl text-white font-bold shadow-lg transition-all ${
                                        saving
                                            ? 'bg-indigo-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-[1.01] active:scale-95'
                                    }`}
                                >
                                    {saving ? 'Saving...' : editingId ? 'Update Service' : 'Add Service'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Offerings List */}
                <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4">
                        {offerings.length > 0
                            ? `${offerings.length} Service${offerings.length > 1 ? 's' : ''} Listed`
                            : 'No services added yet'}
                    </h2>

                    {offerings.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
                            <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-1">No services yet</h3>
                            <p className="text-slate-400 text-sm">Click "Add Service" to list what you offer to customers.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {offerings.map(o => (
                                <div key={o.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col gap-3">
                                    {/* Title row */}
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-lg font-bold text-slate-900 leading-snug">{o.serviceName}</h3>
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => handleEdit(o)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                title="Edit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.415.586H9v-2.414a2 2 0 01.586-1.414z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(o.id)}
                                                disabled={deletingId === o.id}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m4-3h2a1 1 0 011 1v1H8V5a1 1 0 011-1h2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {o.description && (
                                        <p className="text-slate-500 text-sm leading-relaxed">{o.description}</p>
                                    )}

                                    {/* Price & Duration chips */}
                                    <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-slate-50">
                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full">
                                            {o.priceType === 'starting' ? 'From ' : ''}₹{o.price}
                                        </span>
                                        {o.duration && (
                                            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full">
                                                ⏱ {o.duration}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceOfferings;
