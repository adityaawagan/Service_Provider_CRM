import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../environment/environment';
import { uploadImage, deleteImage } from '../services/image.service';
import {
    collection, addDoc, getDocs, deleteDoc, doc, query, where
} from 'firebase/firestore';

const WorkPhotos = () => {
    const [photos, setPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(true);
    const [preview, setPreview] = useState(null); // lightbox
    const fileInputRef = useRef(null);

    const uid = auth.currentUser?.uid;

    // ── Fetch existing photos ──
    useEffect(() => {
        const fetchPhotos = async () => {
            if (!uid) return;
            try {
                const q = query(collection(db, 'work_photos'), where('serviceProviderId', '==', uid));
                const snap = await getDocs(q);
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Sort newest first
                data.sort((a, b) => (b.uploadedAt?.seconds || 0) - (a.uploadedAt?.seconds || 0));
                setPhotos(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, [uid]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3500);
    };

    // ── Handle file selection & upload ──
    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploading(true);
        let uploaded = 0;
        const newPhotos = [];

        for (const file of files) {
            try {
                const url = await uploadImage(file, 'work_photos');
                const docRef = await addDoc(collection(db, 'work_photos'), {
                    serviceProviderId: uid,
                    url: url,
                    caption: file.name.replace(/\.[^/.]+$/, ''), // strip extension as default caption
                    uploadedAt: new Date(),
                });
                newPhotos.push({ id: docRef.id, serviceProviderId: uid, url, caption: file.name, uploadedAt: new Date() });
                uploaded++;
            } catch (err) {
                console.error('Upload error:', err);
            }
        }

        setPhotos(prev => [...newPhotos, ...prev]);
        setUploading(false);
        fileInputRef.current.value = '';

        if (uploaded === files.length) {
            showMessage(`${uploaded} photo${uploaded > 1 ? 's' : ''} uploaded successfully!`);
        } else {
            showMessage(`${uploaded}/${files.length} photos uploaded. Some failed.`, 'warn');
        }
    };

    // ── Delete a photo ──
    const handleDelete = async (photo) => {
        if (!window.confirm('Delete this photo? This cannot be undone.')) return;
        setDeletingId(photo.id);
        try {
            await deleteImage(photo.url);
            await deleteDoc(doc(db, 'work_photos', photo.id));
            setPhotos(prev => prev.filter(p => p.id !== photo.id));
            showMessage('Photo deleted.');
        } catch (err) {
            console.error(err);
            showMessage('Failed to delete photo: ' + err.message, 'error');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Work Photos</h1>
                        <p className="text-slate-500 mt-1">
                            Showcase your completed work to attract more customers.
                        </p>
                    </div>

                    {/* Upload button */}
                    <label
                        className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white shadow-lg cursor-pointer transition-all select-none ${
                            uploading
                                ? 'bg-indigo-400 cursor-wait'
                                : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95'
                        }`}
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Upload Photos
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>
                </div>

                {/* ── Toast message ── */}
                {message.text && (
                    <div className={`flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-medium border ${
                        message.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        message.type === 'warn'  ? 'bg-yellow-50 text-yellow-800 border-yellow-100' :
                                                   'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                        <span>{message.type === 'error' ? '❌' : message.type === 'warn' ? '⚠️' : '✅'}</span>
                        {message.text}
                    </div>
                )}

                {/* ── Drag-drop hint ── */}
                {!uploading && photos.length === 0 && !loading && (
                    <label
                        className="block border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                    >
                        <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-slate-600 font-semibold text-lg">Click to upload your work photos</p>
                        <p className="text-slate-400 text-sm mt-1">JPEG, PNG, WebP — max 5 MB per image. Multiple files supported.</p>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>
                )}

                {/* ── Loading skeleton ── */}
                {loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-square rounded-2xl bg-slate-100 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* ── Photo grid ── */}
                {!loading && photos.length > 0 && (
                    <>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-500">
                                {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
                            </p>
                            <p className="text-xs text-slate-400">Click a photo to enlarge · Click 🗑 to delete</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {photos.map(photo => (
                                <div
                                    key={photo.id}
                                    className="relative group rounded-2xl overflow-hidden bg-slate-100 aspect-square shadow-sm hover:shadow-lg transition-all duration-200"
                                >
                                    {/* Photo */}
                                    <img
                                        src={photo.url}
                                        alt={photo.caption || 'Work photo'}
                                        className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                                        onClick={() => setPreview(photo)}
                                    />

                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-end justify-between p-2 pointer-events-none group-hover:pointer-events-auto">
                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(photo); }}
                                            disabled={deletingId === photo.id}
                                            className="opacity-0 group-hover:opacity-100 bg-rose-600 hover:bg-rose-500 text-white p-2 rounded-lg transition-all shadow-lg"
                                            title="Delete photo"
                                        >
                                            {deletingId === photo.id ? (
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m4-3h2a1 1 0 011 1v1H8V5a1 1 0 011-1h2" />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Enlarge icon */}
                                        <button
                                            onClick={() => setPreview(photo)}
                                            className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-800 p-2 rounded-lg transition-all shadow-lg"
                                            title="View full size"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Add more tile */}
                            <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-xs text-slate-400 font-medium">Add more</span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </>
                )}
            </div>

            {/* ── Lightbox ── */}
            {preview && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setPreview(null)}
                >
                    <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
                        <img
                            src={preview.url}
                            alt={preview.caption || 'Work photo'}
                            className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                        />
                        <button
                            onClick={() => setPreview(null)}
                            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkPhotos;
