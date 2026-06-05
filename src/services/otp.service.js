import { db, auth } from "../../environment/environment";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to email via Firebase Cloud Function
 * Note: You'll need to set up a Firebase Cloud Function to send emails
 * @param {string} email - User email
 * @param {string} otp - OTP code
 */
const sendOTPEmail = async (email, otp) => {
    try {
        // This is a placeholder - you need to set up Firebase Cloud Functions
        // For now, we'll store OTP in Firestore (insecure for production)
        // In production, call your cloud function:
        // const response = await fetch('YOUR_CLOUD_FUNCTION_URL', {
        //   method: 'POST',
        //   body: JSON.stringify({ email, otp })
        // });
        
        console.log(`OTP for ${email}: ${otp}`);
        // In production, replace above with actual email sending via cloud function
        return true;
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw error;
    }
};

/**
 * Request OTP for email verification
 * @param {string} email - User email
 * @returns {Promise<string>} - OTP sent to email
 */
export const requestOTP = async (email) => {
    try {
        if (!email) {
            throw new Error("Email is required");
        }

        // Generate OTP
        const otp = generateOTP();

        // Store OTP in Firestore with expiration (10 minutes)
        const otpRef = doc(db, "otpVerification", email);
        const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await setDoc(otpRef, {
            otp: otp,
            email: email,
            createdAt: new Date(),
            expiresAt: expirationTime,
            verified: false,
            attempts: 0
        }, { merge: true });

        // Send OTP email
        await sendOTPEmail(email, otp);

        console.log("OTP sent to email:", email);
        return otp; // For development - remove in production
    } catch (error) {
        console.error("Error requesting OTP:", error);
        throw error;
    }
};

/**
 * Verify OTP for email
 * @param {string} email - User email
 * @param {string} otp - OTP code to verify
 * @returns {Promise<boolean>} - True if OTP is valid
 */
export const verifyOTP = async (email, otp) => {
    try {
        if (!email || !otp) {
            throw new Error("Email and OTP are required");
        }

        const otpRef = doc(db, "otpVerification", email);
        const otpSnap = await getDoc(otpRef);

        if (!otpSnap.exists()) {
            throw new Error("OTP not found. Please request a new one.");
        }

        const otpData = otpSnap.data();

        // Check if OTP has expired
        if (new Date() > otpData.expiresAt) {
            await deleteDoc(otpRef);
            throw new Error("OTP has expired. Please request a new one.");
        }

        // Check if too many attempts
        if (otpData.attempts >= 5) {
            await deleteDoc(otpRef);
            throw new Error("Too many incorrect attempts. Please request a new OTP.");
        }

        // Verify OTP
        if (otpData.otp !== otp) {
            // Increment attempts
            await setDoc(otpRef, { attempts: (otpData.attempts || 0) + 1 }, { merge: true });
            throw new Error("Invalid OTP. Please try again.");
        }

        // Mark as verified
        await setDoc(otpRef, { verified: true }, { merge: true });

        console.log("OTP verified successfully for:", email);
        return true;
    } catch (error) {
        console.error("Error verifying OTP:", error);
        throw error;
    }
};

/**
 * Check if email is verified
 * @param {string} email - User email
 * @returns {Promise<boolean>} - True if email is verified
 */
export const isEmailVerified = async (email) => {
    try {
        const otpRef = doc(db, "otpVerification", email);
        const otpSnap = await getDoc(otpRef);

        if (!otpSnap.exists()) {
            return false;
        }

        return otpSnap.data().verified === true;
    } catch (error) {
        console.error("Error checking email verification:", error);
        return false;
    }
};

/**
 * Clear OTP record (after successful registration)
 * @param {string} email - User email
 */
export const clearOTP = async (email) => {
    try {
        const otpRef = doc(db, "otpVerification", email);
        await deleteDoc(otpRef);
        console.log("OTP record cleared for:", email);
    } catch (error) {
        console.error("Error clearing OTP:", error);
        throw error;
    }
};
