import { db, auth } from "../../environment/environment";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    getDocs,
    updateDoc,
    doc,
    getDoc,
    setDoc
} from "firebase/firestore";

/**
 * Create or get existing conversation between customer and service provider
 * @param {string} customerId - Customer UID
 * @param {string} serviceProviderId - Service Provider UID
 * @returns {Promise<string>} - Conversation ID
 */
export const createOrGetConversation = async (customerId, serviceProviderId) => {
    try {
        // Check if conversation already exists
        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", customerId)
        );

        const querySnapshot = await getDocs(q);
        
        for (const document of querySnapshot.docs) {
            const conversationData = document.data();
            if (conversationData.participants.includes(serviceProviderId)) {
                return document.id; // Existing conversation
            }
        }

        // Create new conversation
        const conversationRef = await addDoc(collection(db, "conversations"), {
            participants: [customerId, serviceProviderId],
            createdAt: new Date(),
            lastMessage: "",
            lastMessageTime: new Date(),
            lastMessageBy: null,
            isActive: true
        });

        console.log("Conversation created:", conversationRef.id);
        return conversationRef.id;
    } catch (error) {
        console.error("Error creating/getting conversation:", error);
        throw error;
    }
};

/**
 * Send a message in conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} message - Message text
 * @param {string} bookingId - Booking ID (optional, for reference)
 */
export const sendMessage = async (conversationId, message, bookingId = null) => {
    try {
        if (!auth.currentUser) {
            throw new Error("User must be logged in to send messages");
        }

        if (!message.trim()) {
            throw new Error("Message cannot be empty");
        }

        const messageRef = await addDoc(
            collection(db, "conversations", conversationId, "messages"),
            {
                senderId: auth.currentUser.uid,
                senderName: auth.currentUser.displayName || "Anonymous",
                message: message.trim(),
                timestamp: new Date(),
                isRead: false,
                bookingId: bookingId || null
            }
        );

        // Update conversation's last message
        const conversationRef = doc(db, "conversations", conversationId);
        await updateDoc(conversationRef, {
            lastMessage: message.trim(),
            lastMessageTime: new Date(),
            lastMessageBy: auth.currentUser.uid
        });

        console.log("Message sent successfully");
        return messageRef.id;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

/**
 * Real-time listener for messages in conversation
 * @param {string} conversationId - Conversation ID
 * @param {function} callback - Callback function with messages array
 * @returns {function} - Unsubscribe function
 */
export const listenToMessages = (conversationId, callback) => {
    try {
        const q = query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = [];
            snapshot.forEach((doc) => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(messages);
        });

        return unsubscribe;
    } catch (error) {
        console.error("Error listening to messages:", error);
        throw error;
    }
};

/**
 * Get all conversations for current user
 * @returns {Promise<Array>} - Array of conversations
 */
export const getUserConversations = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User must be logged in");
        }

        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", auth.currentUser.uid)
        );

        const snapshot = await getDocs(q);
        const conversations = [];

        for (const document of snapshot.docs) {
            const conversationData = document.data();
            
            // Get other participant info
            const otherParticipantId = conversationData.participants.find(
                id => id !== auth.currentUser.uid
            );

            if (otherParticipantId) {
                const participantDoc = await getParticipantInfo(otherParticipantId);
                conversations.push({
                    id: document.id,
                    ...conversationData,
                    otherParticipant: participantDoc
                });
            }
        }

        return conversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    } catch (error) {
        console.error("Error getting conversations:", error);
        throw error;
    }
};

/**
 * Get participant info (customer or service provider)
 * @param {string} userId - User ID
 */
const getParticipantInfo = async (userId) => {
    try {
        // Try customer collection first
        let docSnap = await getDoc(doc(db, "customers", userId));
        
        if (!docSnap.exists()) {
            // Try service provider collection
            docSnap = await getDoc(doc(db, "service_providers", userId));
        }

        if (docSnap.exists()) {
            return {
                id: userId,
                ...docSnap.data()
            };
        }

        return { id: userId, name: "Unknown User" };
    } catch (error) {
        console.error("Error getting participant info:", error);
        return { id: userId, name: "Unknown User" };
    }
};

/**
 * Mark messages as read
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message ID
 */
export const markMessageAsRead = async (conversationId, messageId) => {
    try {
        const messageRef = doc(db, "conversations", conversationId, "messages", messageId);
        await updateDoc(messageRef, {
            isRead: true
        });
    } catch (error) {
        console.error("Error marking message as read:", error);
    }
};

/**
 * Get booking details from message (if any)
 * @param {string} bookingId - Booking ID
 */
export const getBookingFromMessage = async (bookingId) => {
    try {
        if (!bookingId) return null;
        
        const bookingSnap = await getDoc(doc(db, "bookings", bookingId));
        return bookingSnap.exists() ? bookingSnap.data() : null;
    } catch (error) {
        console.error("Error getting booking:", error);
        return null;
    }
};
