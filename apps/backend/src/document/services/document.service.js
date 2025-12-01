import Document from '../models/document.js';
import EnhancedUser from '../../auth/models/enhancedUser.js';
import cloudinary from '../../configs/cloudinary.config.js';
import { Readable } from 'stream';
import { normalizeId, idToString } from '../../utils/db/idUtils.js';

class DocumentService {
  
  /**
   * Upload document to Cloudinary and create document record
   */
  async uploadDocument(userId, userRole, documentData, file) {
    try {
      console.log('📄 Starting document upload process...');
      console.log('🔍 User role:', userRole);
      
      // Validate file type
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.');
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit.');
      }
      
      // Upload to Cloudinary
      console.log('☁️ Uploading to Cloudinary...');
      const uploadResult = await this.uploadToCloudinary(file, 'documents');
      
      // Create document record based on user role
      const documentData_obj = {
        documentName: documentData.documentName,
        documentType: documentData.documentType,
        file: {
          originalName: file.originalname,
          cloudinaryUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          mimeType: file.mimetype,
          size: file.size
        },
        direction: 'draft', // Set as draft until sent
        status: 'uploaded',
        tags: documentData.tags || [],
        notes: documentData.notes || ''
      };
      
      // Set organizer and speaker based on user role
      if (userRole === 'organizer') {
        documentData_obj.organizer = normalizeId(userId);
      } else if (userRole === 'speaker') {
        documentData_obj.speaker = normalizeId(userId);
      }
      
      const document = new Document(documentData_obj);
      const savedDocument = await document.save();
      
      // Populate user information based on role
      if (userRole === 'organizer') {
        await savedDocument.populate('organizer', 'firstName lastName email profileImageUrl');
      } else if (userRole === 'speaker') {
        await savedDocument.populate('speaker', 'firstName lastName email profileImageUrl');
      }
      
      console.log('✅ Document uploaded successfully:', savedDocument._id);
      
      return {
        success: true,
        document: savedDocument,
        message: 'Document uploaded successfully'
      };
      
    } catch (error) {
      console.error('❌ Error uploading document:', error);
      throw error;
    }
  }
  
  /**
   * Upload file to Cloudinary
   */
  async uploadToCloudinary(file, folder = 'documents') {
    try {
      // Create a stream from the buffer
      const stream = Readable.from(file.buffer);
      
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'auto',
            public_id: `document_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            overwrite: true,
            use_filename: true,
            unique_filename: true
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('✅ File uploaded to Cloudinary:', result.secure_url);
              resolve(result);
            }
          }
        );
        
        // Pipe the stream to the upload stream
        stream.pipe(uploadStream);
      });
    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error);
      throw error;
    }
  }
  
  /**
   * Assign document to a speaker
   */
  async assignDocumentToSpeaker(documentId, speakerId, organizerId, relatedBookingId = null) {
    try {
      console.log('📋 Assigning document to speaker...');
      
      // Find the document
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Verify organizer owns the document
      if (idToString(document.organizer) !== idToString(organizerId)) {
        throw new Error('Unauthorized: You can only assign your own documents');
      }
      
      // Verify speaker exists
      const speaker = await EnhancedUser.findById(speakerId);
      if (!speaker) {
        throw new Error('Speaker not found');
      }
      
      // Assign document to speaker
      await document.assignToSpeaker(normalizeId(speakerId), relatedBookingId ? normalizeId(relatedBookingId) : null);
      
      // Populate the updated document
      await document.populate([
        { path: 'speaker', select: 'firstName lastName email profileImageUrl' },
        { path: 'organizer', select: 'firstName lastName email profileImageUrl' },
        { path: 'relatedBooking', select: 'bookingId eventDetails' }
      ]);
      
      console.log('✅ Document assigned successfully');
      
      return {
        success: true,
        document: document,
        message: 'Document assigned to speaker successfully'
      };
      
    } catch (error) {
      console.error('❌ Error assigning document:', error);
      throw error;
    }
  }
  
  /**
   * Send document to speaker (change status to sent)
   */
  async sendDocumentToSpeaker(documentId, organizerId) {
    try {
      console.log('📤 Sending document to speaker...');
      
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      if (idToString(document.organizer) !== idToString(organizerId)) {
        throw new Error('Unauthorized: You can only send your own documents');
      }
      
      if (!document.speaker) {
        throw new Error('Document must be assigned to a speaker before sending');
      }
      
      await document.sendToSpeaker();
      
      // Populate the updated document
      await document.populate([
        { path: 'speaker', select: 'firstName lastName email profileImageUrl' },
        { path: 'organizer', select: 'firstName lastName email profileImageUrl' }
      ]);
      
      console.log('✅ Document sent successfully');
      
      return {
        success: true,
        document: document,
        message: 'Document sent to speaker successfully'
      };
      
    } catch (error) {
      console.error('❌ Error sending document:', error);
      throw error;
    }
  }
  
  /**
   * Assign document to an organizer (for speakers)
   */
  async assignDocumentToOrganizer(documentId, organizerId, speakerId, relatedBookingId = null) {
    try {
      console.log('📋 Assigning document to organizer...');
      
      // Find the document
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Verify speaker owns the document
      if (idToString(document.speaker) !== idToString(speakerId)) {
        throw new Error('Unauthorized: You can only assign your own documents');
      }
      
      // Verify organizer exists
      const organizer = await EnhancedUser.findById(organizerId);
      if (!organizer) {
        throw new Error('Organizer not found');
      }
      
      // Assign document to organizer
      await document.assignToOrganizer(normalizeId(organizerId), relatedBookingId ? normalizeId(relatedBookingId) : null);
      
      // Populate the updated document
      await document.populate([
        { path: 'organizer', select: 'firstName lastName email profileImageUrl' },
        { path: 'speaker', select: 'firstName lastName email profileImageUrl' },
        { path: 'relatedBooking', select: 'bookingId eventDetails' }
      ]);
      
      console.log('✅ Document assigned to organizer successfully');
      
      return {
        success: true,
        document: document,
        message: 'Document assigned to organizer successfully'
      };
      
    } catch (error) {
      console.error('❌ Error assigning document to organizer:', error);
      throw error;
    }
  }
  
  /**
   * Send document to organizer (change status to sent)
   */
  async sendDocumentToOrganizer(documentId, speakerId) {
    try {
      console.log('📤 Sending document to organizer...');
      
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      if (idToString(document.speaker) !== idToString(speakerId)) {
        throw new Error('Unauthorized: You can only send your own documents');
      }
      
      if (!document.organizer) {
        throw new Error('Document must be assigned to an organizer before sending');
      }
      
      await document.sendToOrganizer();
      
      // Populate the updated document
      await document.populate([
        { path: 'organizer', select: 'firstName lastName email profileImageUrl' },
        { path: 'speaker', select: 'firstName lastName email profileImageUrl' }
      ]);
      
      console.log('✅ Document sent to organizer successfully');
      
      return {
        success: true,
        document: document,
        message: 'Document sent to organizer successfully'
      };
      
    } catch (error) {
      console.error('❌ Error sending document to organizer:', error);
      throw error;
    }
  }
  
  /**
   * Get organizer's documents
   */
  async getOrganizerDocuments(organizerId, direction = null, status = null, page = 1, limit = 10) {
    try {
      console.log('📋 Fetching organizer documents...');
      
      // Organizers see documents where they are the organizer
      const query = { organizer: normalizeId(organizerId) };
      
      if (direction) {
        query.direction = direction;
      }
      
      if (status) {
        query.status = status;
      }
      
      const skip = (page - 1) * limit;
      
      const documents = await Document.find(query)
        .populate('speaker', 'firstName lastName email profileImageUrl')
        .populate('relatedBooking', 'bookingId eventDetails')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Document.countDocuments(query);
      
      console.log(`✅ Found ${documents.length} documents for organizer`);
      
      return {
        success: true,
        documents: documents,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          pages: Math.ceil(total / limit)
        }
      };
      
    } catch (error) {
      console.error('❌ Error fetching organizer documents:', error);
      throw error;
    }
  }
  
  /**
   * Get speaker's documents
   */
  async getSpeakerDocuments(speakerId, direction = null, status = null, page = 1, limit = 10) {
    try {
      console.log('📋 Fetching speaker documents...');
      
      // For speakers, we want documents where they are the speaker
      const query = { 
        speaker: normalizeId(speakerId),
        status: { $in: ['sent', 'pending_review', 'approved', 'signed', 'declined'] }
      };
      
      if (status) {
        query.status = status;
      }
      
      const skip = (page - 1) * limit;
      
      const documents = await Document.find(query)
        .populate('organizer', 'firstName lastName email profileImageUrl')
        .populate('relatedBooking', 'bookingId eventDetails')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Document.countDocuments(query);
      
      console.log(`✅ Found ${documents.length} documents for speaker`);
      
      return {
        success: true,
        documents: documents,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          pages: Math.ceil(total / limit)
        }
      };
      
    } catch (error) {
      console.error('❌ Error fetching speaker documents:', error);
      throw error;
    }
  }
  
  /**
   * Get all documents for current user (both incoming and outgoing)
   */
  async getAllUserDocuments(userId, userRole, direction = null, status = null, page = 1, limit = 10) {
    try {
      console.log('📋 Fetching all user documents...');
      
      const query = {};
      
      if (userRole === 'organizer') {
        query.organizer = normalizeId(userId);
      } else if (userRole === 'speaker') {
        query.speaker = normalizeId(userId);
      }
      
      if (direction) {
        query.direction = direction;
      }
      
      if (status) {
        query.status = status;
      }
      
      const skip = (page - 1) * limit;
      
      const documents = await Document.find(query)
        .populate('organizer', 'firstName lastName email profileImageUrl')
        .populate('speaker', 'firstName lastName email profileImageUrl')
        .populate('relatedBooking', 'bookingId eventDetails')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Document.countDocuments(query);
      
      // Calculate summary
      const summary = {
        total: total,
        uploaded: await Document.countDocuments({ ...query, status: 'uploaded' }),
        sent: await Document.countDocuments({ ...query, status: 'sent' }),
        pending_review: await Document.countDocuments({ ...query, status: 'pending_review' }),
        approved: await Document.countDocuments({ ...query, status: 'approved' }),
        signed: await Document.countDocuments({ ...query, status: 'signed' })
      };
      
      return {
        success: true,
        data: documents,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          pages: Math.ceil(total / limit)
        },
        summary: summary
      };
      
    } catch (error) {
      console.error('❌ Error fetching all user documents:', error);
      throw error;
    }
  }
  
  /**
   * Update document status
   */
  async updateDocumentStatus(documentId, newStatus, userId, userRole) {
    try {
      console.log('🔄 Updating document status...');
      
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Verify user has permission to update this document
      if (userRole === 'organizer') {
        if (idToString(document.organizer) !== idToString(userId)) {
          throw new Error('Unauthorized: You can only update your own documents');
        }
      } else if (userRole === 'speaker') {
        if (idToString(document.speaker) !== idToString(userId)) {
          throw new Error('Unauthorized: You can only update documents assigned to you');
        }
      }
      
      // Update status
      await document.updateStatus(newStatus);
      
      // Populate the updated document
      await document.populate([
        { path: 'speaker', select: 'firstName lastName email profileImageUrl' },
        { path: 'organizer', select: 'firstName lastName email profileImageUrl' },
        { path: 'relatedBooking', select: 'bookingId eventDetails' }
      ]);
      
      console.log('✅ Document status updated successfully');
      
      return {
        success: true,
        document: document,
        message: 'Document status updated successfully'
      };
      
    } catch (error) {
      console.error('❌ Error updating document status:', error);
      throw error;
    }
  }
  
  /**
   * Download document (track download)
   */
  async downloadDocument(documentId, userId, userRole) {
    try {
      console.log('📥 Processing document download...');
      
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Verify user has permission to download this document
      if (userRole === 'organizer') {
        if (idToString(document.organizer) !== idToString(userId)) {
          throw new Error('Unauthorized: You can only download your own documents');
        }
      } else if (userRole === 'speaker') {
        if (idToString(document.speaker) !== idToString(userId)) {
          throw new Error('Unauthorized: You can only download documents assigned to you');
        }
      }
      
      // Track download
      await document.trackDownload();
      
      console.log('✅ Document download processed successfully');
      
      return {
        success: true,
        document: document,
        downloadUrl: document.file.cloudinaryUrl,
        message: 'Document download processed successfully'
      };
      
    } catch (error) {
      console.error('❌ Error processing document download:', error);
      throw error;
    }
  }
  
  /**
   * Delete document
   */
  async deleteDocument(documentId, userId, userRole) {
    try {
      console.log('🗑️ Deleting document...');
      
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Verify user has permission to delete this document
      if (userRole === 'organizer') {
        if (idToString(document.organizer) !== idToString(userId)) {
          throw new Error('Unauthorized: You can only delete your own documents');
        }
      } else if (userRole === 'speaker') {
        if (idToString(document.speaker) !== idToString(userId)) {
          throw new Error('Unauthorized: You can only delete your own documents');
        }
      }
      
      // Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(document.file.cloudinaryPublicId);
        console.log('✅ Document deleted from Cloudinary');
      } catch (cloudinaryError) {
        console.error('⚠️ Error deleting from Cloudinary (continuing with DB delete):', cloudinaryError);
      }
      
      // Delete from database
      await Document.findByIdAndDelete(documentId);
      
      console.log('✅ Document deleted successfully');
      
      return {
        success: true,
        message: 'Document deleted successfully'
      };
      
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      throw error;
    }
  }
  
  /**
   * Get document statistics for organizer
   */
  async getOrganizerDocumentStats(organizerId) {
    try {
      console.log('📊 Fetching organizer document stats...');
      
      const total = await Document.countDocuments({ organizer: normalizeId(organizerId) });
      const byStatus = {
        uploaded: await Document.countDocuments({ organizer: normalizeId(organizerId), status: 'uploaded' }),
        assigned: await Document.countDocuments({ organizer: normalizeId(organizerId), status: 'assigned' }),
        sent: await Document.countDocuments({ organizer: normalizeId(organizerId), status: 'sent' }),
        pending_review: await Document.countDocuments({ organizer: normalizeId(organizerId), status: 'pending_review' }),
        approved: await Document.countDocuments({ organizer: normalizeId(organizerId), status: 'approved' }),
        signed: await Document.countDocuments({ organizer: normalizeId(organizerId), status: 'signed' }),
        declined: await Document.countDocuments({ organizer: normalizeId(organizerId), status: 'declined' })
      };
      
      const byType = {
        MOU: await Document.countDocuments({ organizer: normalizeId(organizerId), documentType: 'MOU' }),
        Contract: await Document.countDocuments({ organizer: normalizeId(organizerId), documentType: 'Contract' }),
        Invoice: await Document.countDocuments({ organizer: normalizeId(organizerId), documentType: 'Invoice' }),
        Agreement: await Document.countDocuments({ organizer: normalizeId(organizerId), documentType: 'Agreement' })
      };
      
      return {
        success: true,
        stats: {
          total: total,
          byStatus: byStatus,
          byType: byType
        }
      };
      
    } catch (error) {
      console.error('❌ Error fetching organizer document stats:', error);
      throw error;
    }
  }
  
  /**
   * Get document statistics for speaker
   */
  async getSpeakerDocumentStats(speakerId) {
    try {
      console.log('📊 Fetching speaker document stats...');
      
      const total = await Document.countDocuments({ speaker: normalizeId(speakerId) });
      const byStatus = {
        sent: await Document.countDocuments({ speaker: normalizeId(speakerId), status: 'sent' }),
        pending_review: await Document.countDocuments({ speaker: normalizeId(speakerId), status: 'pending_review' }),
        approved: await Document.countDocuments({ speaker: normalizeId(speakerId), status: 'approved' }),
        signed: await Document.countDocuments({ speaker: normalizeId(speakerId), status: 'signed' }),
        declined: await Document.countDocuments({ speaker: normalizeId(speakerId), status: 'declined' })
      };
      
      const byType = {
        MOU: await Document.countDocuments({ speaker: normalizeId(speakerId), documentType: 'MOU' }),
        Contract: await Document.countDocuments({ speaker: normalizeId(speakerId), documentType: 'Contract' }),
        Invoice: await Document.countDocuments({ speaker: normalizeId(speakerId), documentType: 'Invoice' }),
        Agreement: await Document.countDocuments({ speaker: normalizeId(speakerId), documentType: 'Agreement' })
      };
      
      return {
        success: true,
        stats: {
          total: total,
          byStatus: byStatus,
          byType: byType
        }
      };
      
    } catch (error) {
      console.error('❌ Error fetching speaker document stats:', error);
      throw error;
    }
  }
  
  /**
   * Get eligible organizers for speaker (organizers who have booked the speaker)
   */
  async getEligibleOrganizers(speakerId) {
    try {
      console.log('👥 Fetching eligible organizers for speaker...');
      
      // This would typically query the Booking model
      // For now, return empty array - this should be implemented with proper booking integration
      // TODO: Integrate with booking system to get confirmed bookings
      
      return {
        success: true,
        organizers: [],
        total: 0
      };
      
    } catch (error) {
      console.error('❌ Error fetching eligible organizers:', error);
      throw error;
    }
  }
}

export default new DocumentService();

