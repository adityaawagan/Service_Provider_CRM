import { storage, auth } from "../../environment/environment";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

/**
 * Upload image to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} folder - Folder path in storage (e.g., 'profiles', 'services', 'reviews')
 * @param {string} fileName - Custom file name (optional)
 * @returns {Promise<string>} - Download URL of uploaded image
 */
export const uploadImage = async (file, folder = 'images', fileName = null) => {
    try {
        if (!file) {
            throw new Error("No file provided");
        }

        if (!auth.currentUser) {
            throw new Error("User must be logged in to upload images");
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            throw new Error("Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image");
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error("File size must be less than 5MB");
        }

        // Create unique file name
        const uniqueName = fileName || `${Date.now()}_${file.name}`;
        const storagePath = `${folder}/${auth.currentUser.uid}/${uniqueName}`;
        const storageRef = ref(storage, storagePath);

        // Upload file
        const snapshot = await uploadBytes(storageRef, file);
        
        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        console.log("Image uploaded successfully:", downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};

/**
 * Delete image from Firebase Storage
 * @param {string} imageURL - Download URL of image to delete
 */
export const deleteImage = async (imageURL) => {
    try {
        if (!imageURL) {
            throw new Error("No image URL provided");
        }

        // Extract storage path from URL
        const decodedPath = decodeURIComponent(imageURL.split('/o/')[1].split('?')[0]);
        const imageRef = ref(storage, decodedPath);

        await deleteObject(imageRef);
        console.log("Image deleted successfully");
    } catch (error) {
        console.error("Error deleting image:", error);
        throw error;
    }
};

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files
 * @param {string} folder - Folder path in storage
 * @returns {Promise<string[]>} - Array of download URLs
 */
export const uploadMultipleImages = async (files, folder = 'images') => {
    try {
        const uploadPromises = files.map(file => uploadImage(file, folder));
        const urls = await Promise.all(uploadPromises);
        return urls;
    } catch (error) {
        console.error("Error uploading multiple images:", error);
        throw error;
    }
};
