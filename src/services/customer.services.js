import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../environment/environment";
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";



export const addCustomer = async (customer) => {
    try {
        const userResponse = await createUserWithEmailAndPassword(auth, customer.email, customer.password);
        const id = userResponse.user.uid;
        customer.id = id;
        await setDoc(doc(db, "customers", id), Object.assign({}, customer));
        console.log("Customer added");
    } catch (error) {
        console.log(error);
    }
}

export const signinCustomer = async (email, password) => {
    try {
        const userResponse = await signInWithEmailAndPassword(auth, email, password);
        const id = userResponse.user.uid;
        const docSnap = await getDoc(doc(db, "customers", id));
        const val = docSnap.data();
        return val;
    } catch (error) {
        console.log(error);
    }
}

export const addReview = async (review) => {
    try {
        await addDoc(collection(db, "reviews"), Object.assign({}, review));
        console.log("Review added");
    } catch (error) {
        console.log(error);
    }
}

export const bookASlot = async (slotId) => {
    try {
        const id = auth.currentUser.uid;
        const slotRef = doc(db, "slots", slotId);
        const slotSnap = await getDoc(slotRef);

        if (!slotSnap.exists()) {
            throw new Error("Slot not found");
        }

        const slotData = slotSnap.data();

        if (slotData.isBooked) {
            throw new Error("Slot is already booked");
        }

        if (!slotData.serviceProviderId) {
            throw new Error("This slot has no associated service provider. Please contact support.");
        }

        // Fetch customer details to embed in the booking for easy display
        const customerRef = doc(db, "customers", id);
        const customerSnap = await getDoc(customerRef);
        const customerData = customerSnap.exists() ? customerSnap.data() : {};

        // Create a booking document in the bookings collection
        await addDoc(collection(db, "bookings"), {
            slotId: slotId,
            customerId: id,
            customerName: customerData.name || "",
            customerContact: customerData.contact || customerData.phone || "",
            serviceProviderId: slotData.serviceProviderId,
            date: slotData.date,
            startTime: slotData.startTime,
            endTime: slotData.endTime,
            status: "pending",
            createdAt: new Date()
        });

        // Update the slot to mark it as booked
        await updateDoc(slotRef, {
            isBooked: true,
            customerId: id,
            status: "pending"
        });

        console.log("Slot booked successfully");
        alert("Slot booked successfully!");
    } catch (error) {
        console.error("Error booking slot:", error);
        alert("Error booking slot: " + error.message);
    }
}

export const showMyBookings = async () => {
    const id = auth.currentUser.uid;
    try {
        let bookings = [];
        // Query the bookings collection for bookings where customerId matches
        const q = query(
            collection(db, "bookings"),
            where("customerId", "==", id)
        );
        const bookingSnap = await getDocs(q);

        // Use Promise.all to handle async calls inside the loop
        const bookingPromises = bookingSnap.docs.map(async (bookingDoc) => {
            var booking = bookingDoc.data();
            booking.id = bookingDoc.id;

            // Convert Firestore timestamps to JS Date objects if necessary
            if (booking.date && typeof booking.date.toDate === 'function') {
                booking.date = booking.date.toDate();
            }
            if (booking.startTime && typeof booking.startTime.toDate === 'function') {
                booking.startTime = booking.startTime.toDate();
            }
            if (booking.endTime && typeof booking.endTime.toDate === 'function') {
                booking.endTime = booking.endTime.toDate();
            }

            // Get service provider details
            const spRef = doc(db, "service_providers", booking.serviceProviderId);
            const spSnap = await getDoc(spRef);

            if (spSnap.exists()) {
                var serviceProvider = spSnap.data();
                booking.serviceProviderName = serviceProvider.name;
                booking.serviceProviderRole = serviceProvider.role;
            }

            return booking;
        });

        bookings = await Promise.all(bookingPromises);
        return bookings;
    } catch (error) {
        console.log(error);
        return [];
    }
};