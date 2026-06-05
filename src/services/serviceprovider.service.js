import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../environment/environment";
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { createNotification } from "./notification.service";


export const addServiceProvider = async (ServiceProvider) => {
    try {
        const spResponse = await createUserWithEmailAndPassword(auth, ServiceProvider.email, ServiceProvider.password);
        const id = spResponse.user.uid;
        ServiceProvider.id = id;
        await setDoc(doc(db, "service_providers", id), Object.assign({}, ServiceProvider));
        console.log("service provider added");
    } catch (error) {
        console.log(error);
    }
}

export const signinServiceProvider = async (email, password) => {
    try {
        const userResponse = await signInWithEmailAndPassword(auth, email, password);
        const id = userResponse.user.uid;
        const docSnap = await getDoc(doc(db, "service_providers", id));
        const val = docSnap.data();
        return val;
    } catch (error) {
        console.log(error);
    }
}

export const addSlot = async (slot) => {
    try {
        if (!auth.currentUser) {
            throw new Error("User must be signed in to add a slot");
        }
        const serviceProviderId = auth.currentUser.uid;
        slot.serviceProviderId = serviceProviderId;
        await addDoc(collection(db, "slots"), Object.assign({}, slot));
        console.log("slot added");
    } catch (error) {
        console.log(error);
    }
}

/**
 * Fetch booking requests for a service provider
 * @returns {Promise<Array>} - Array of booking requests
 */
export const getBookingRequests = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User must be logged in");
        }

        let bookingRequests = [];
        // Query the bookings collection for bookings where serviceProviderId matches
        const q = query(
            collection(db, "bookings"),
            where("serviceProviderId", "==", auth.currentUser.uid)
        );
        const bookingSnap = await getDocs(q);

        // Process each booking
        const bookingPromises = bookingSnap.docs.map(async (bookingDoc) => {
            var booking = bookingDoc.data();
            booking.id = bookingDoc.id;

            if (booking.date && typeof booking.date.toDate === 'function') {
                booking.date = booking.date.toDate();
            }
            if (booking.startTime && typeof booking.startTime.toDate === 'function') {
                booking.startTime = booking.startTime.toDate();
            }
            if (booking.endTime && typeof booking.endTime.toDate === 'function') {
                booking.endTime = booking.endTime.toDate();
            }
            
            // Get customer details
            const customerRef = doc(db, "customers", booking.customerId);
            const customerSnap = await getDoc(customerRef);

            if (customerSnap.exists()) {
                var customer = customerSnap.data();
                booking.customerName = customer.name;
                booking.customerContact = customer.contact;
            }

            return booking;
        });

        bookingRequests = await Promise.all(bookingPromises);
        return bookingRequests;
    } catch (error) {
        console.error("Error fetching booking requests:", error);
        return [];
    }
};

/**
 * Accept or reject a booking request
 * @param {string} bookingId - Booking ID
 * @param {string} status - 'accepted' or 'rejected'
 */
export const respondToBooking = async (bookingId, status) => {
    try {
        if (!['accepted', 'rejected'].includes(status)) {
            throw new Error("Status must be 'accepted' or 'rejected'");
        }

        const bookingRef = doc(db, "bookings", bookingId);
        await updateDoc(bookingRef, {
            status: status,
            respondedAt: new Date()
        });

        // Fetch booking details to notify the customer
        const bookingSnap = await getDoc(bookingRef);
        if (bookingSnap.exists()) {
            const bookingData = bookingSnap.data();
            
            // Get service provider name
            const spSnap = await getDoc(doc(db, "service_providers", bookingData.serviceProviderId));
            const spName = spSnap.exists() ? spSnap.data().name : "Service Provider";
            
            const bookingDate = bookingData.date && typeof bookingData.date.toDate === 'function'
                ? bookingData.date.toDate()
                : new Date(bookingData.date);
            const formattedDate = bookingDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

            await createNotification(
                bookingData.customerId,
                `Booking ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
                `Your booking request with ${spName} for ${formattedDate} has been ${status}.`,
                status === 'accepted' ? 'booking_accepted' : 'booking_rejected',
                { bookingId, serviceProviderId: bookingData.serviceProviderId, status }
            );
        }

        console.log(`Booking ${status}`);
    } catch (error) {
        console.error("Error responding to booking:", error);
        throw error;
    }
};

export const toDate = (ts) => {
    // Convert seconds to ms and add nanoseconds converted to ms
    return new Date(ts.seconds * 1000 + ts.nanoseconds / 1000000);
}

export const fetchAllServiceProviders = async () => {
    try {
        const sps = await getDocs(collection(db, "service_providers"));
        let allSps = [];
        sps.forEach((sp) => {
            const val = sp.data();
            allSps.push(val);
        })
        return allSps;
    } catch (error) {
        console.log(error);
        return [];
    }
}

export const fetchSpById = async (id) => {
    try {
        const docSnap = await getDoc(doc(db, "service_providers", id));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const fetchOfferingsForSp = async (spId) => {
    try {
        const q = query(collection(db, "service_offerings"), where("serviceProviderId", "==", spId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.log(error);
        return [];
    }
}

export const fetchReviewsForSp = async (spId) => {
    try {
        const q = query(collection(db, "reviews"), where("serviceProviderId", "==", spId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.log(error);
        return [];
    }
}

export const fetchWorkPhotosForSp = async (spId) => {
    try {
        const q = query(collection(db, "work_photos"), where("serviceProviderId", "==", spId));
        const snap = await getDocs(q);
        const photos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        photos.sort((a, b) => (b.uploadedAt?.seconds || 0) - (a.uploadedAt?.seconds || 0));
        return photos;
    } catch (error) {
        console.log(error);
        return [];
    }
}

export const fetchSlotsForId = async (id) => {
    try {
        const q = query(collection(db, "slots"), where("serviceProviderId", "==", id), where("isBooked", "==", false));
        const slotsnaps = await getDocs(q);
        let slots = [];
        slotsnaps.forEach(snap => {
            let slot = snap.data();
            slot.id = snap.id;
            if (slot.date && typeof slot.date.toDate === 'function') {
                slot.date = slot.date.toDate();
            }
            if (slot.startTime && typeof slot.startTime.toDate === 'function') {
                slot.startTime = slot.startTime.toDate();
            }
            if (slot.endTime && typeof slot.endTime.toDate === 'function') {
                slot.endTime = slot.endTime.toDate();
            }
            slots.push(slot);
        })
        return slots;
    } catch (error) {
        console.log(error);
    }
}

export const fetchRequestedSlots = async (id) => {
    try {
        const q = query(collection(db, "slots"), where("serviceProviderId", "==", id), where("isBooked", "==", true));
        const slotsnaps = await getDocs(q);
        let slots = [];
        slotsnaps.forEach(snap => {
            let slot = snap.data();
            slot.id = snap.id;
            if (slot.date && typeof slot.date.toDate === 'function') {
                slot.date = slot.date.toDate();
            }
            if (slot.startTime && typeof slot.startTime.toDate === 'function') {
                slot.startTime = slot.startTime.toDate();
            }
            if (slot.endTime && typeof slot.endTime.toDate === 'function') {
                slot.endTime = slot.endTime.toDate();
            }
            slots.push(slot);
        });

        const slotsWithCustomer = await Promise.all(slots.map(async (slot) => {
            if (slot.customerId) {
                const custRef = doc(db, "customers", slot.customerId);
                const custSnap = await getDoc(custRef);
                if (custSnap.exists()) {
                    slot.customerName = custSnap.data().name;
                }
            }
            return slot;
        }));
        return slotsWithCustomer;
    } catch (error) {
        console.log(error);
    }
}

export const updateSlotStatus = async (slotId, status) => {
    try {
        await updateDoc(doc(db, "slots", slotId), {
            status: status
        });
        console.log("Slot status updated to", status);
    } catch (error) {
        console.log(error);
    }
}