import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

export const connectCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    console.log('✅ Successfully connected to Cloudinary');
  } catch (error) {
    console.error("❌ Error connecting to Cloudinary:", error.message);
    // Don't exit process - allow server to run without Cloudinary for now
  }
};

export default cloudinary;

