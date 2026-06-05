import { db } from "../../environment/environment";
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    updateDoc,
    doc,
    getDocs,
    writeBatch
} from "firebase/firestore";

/**
 * Create a new notification in Firestore
 * @param {string} userId - Recipient User ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('booking_request', 'booking_accepted', 'booking_rejected', 'chat_message')
 * @param {Object} metadata - Optional metadata (e.g. bookingId, senderId)
 */
export const createNotification = async (userId, title, message, type, metadata = {}) => {
    try {
        if (!userId) return;
        await addDoc(collection(db, "notifications"), {
            userId,
            title,
            message,
            type,
            metadata,
            read: false,
            createdAt: new Date()
        });
        console.log("Notification created successfully for", userId);
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

/**
 * Listen to real-time notifications for a specific user
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function with notifications list
 * @returns {Function} Unsubscribe function
 */
export const listenToNotifications = (userId, callback) => {
    if (!userId) return () => {};
    try {
        const q = query(
            collection(db, "notifications"),
            where("userId", "==", userId)
        );

        return onSnapshot(q, (snapshot) => {
            const list = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                // Map Firebase Timestamp to JS Date
                if (data.createdAt && typeof data.createdAt.toDate === "function") {
                    data.createdAt = data.createdAt.toDate();
                }
                list.push({
                    id: docSnap.id,
                    ...data
                });
            });

            // Sort in memory by createdAt descending to avoid index requirement
            list.sort((a, b) => b.createdAt - a.createdAt);
            callback(list);
        });
    } catch (error) {
        console.error("Error listening to notifications:", error);
        return () => {};
    }
};

/**
 * Mark a single notification as read
 * @param {string} notificationId - Notification ID
 */
export const markAsRead = async (notificationId) => {
    try {
        const docRef = doc(db, "notifications", notificationId);
        await updateDoc(docRef, { read: true });
        console.log("Notification marked as read:", notificationId);
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
};

/**
 * Mark all notifications as read for a specific user
 * @param {string} userId - User ID
 */
export const markAllNotificationsAsRead = async (userId) => {
    if (!userId) return;
    try {
        const q = query(
            collection(db, "notifications"),
            where("userId", "==", userId),
            where("read", "==", false)
        );
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        
        snapshot.docs.forEach((docSnap) => {
            batch.update(docSnap.ref, { read: true });
        });

        await batch.commit();
        console.log(`Marked all notifications as read for user ${userId}`);
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
    }
};
