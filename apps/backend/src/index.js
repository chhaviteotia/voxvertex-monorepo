import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './auth/routes/authRoutes.js';
import profileRoutes from './profile/routes/profileRoutes.js';
import postRoutes from './post/routes/postRoutes.js';
import availabilityRoutes from './availability/routes/availabilityRoutes.js';
import disputeRoutes from './dispute/routes/disputeRoutes.js';
import eventRoutes from './event/routes/eventRoutes.js';
import documentRoutes from './document/routes/documentRoutes.js';
import bookingRoutes from './booking/routes/bookingRoutes.js';
import connectDB from './configs/dbConnect.js';
import { connectCloudinary } from './configs/cloudinary.config.js';

// Load environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increased limit for file uploads
app.use(cookieParser());

// Serve static files from uploads directory (must be before routes)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads'), {
  maxAge: '1d', // Cache images for 1 day
}));

// Connect to database
connectDB();

// Connect to Cloudinary (optional - server will work without it)
connectCloudinary();

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/post', postRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/dispute', disputeRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/booking', bookingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

