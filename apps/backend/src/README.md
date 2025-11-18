# Backend Structure Organization

This backend follows a domain-driven folder structure where each domain has its own folder containing controllers, models, and routes.

## Folder Structure

```
src/
├── configs/                 # ⚙️ SHARED: Application configurations
│   ├── database.js          # Database connection configs
│   ├── env.js               # Environment variables
│   └── ...                  # Other config files
│
├── middleware/              # ⚙️ SHARED: Express middleware
│   ├── auth.js              # Authentication middleware
│   ├── validation.js        # Request validation middleware
│   └── ...                  # Other middleware
│
├── services/                # ⚙️ SHARED: Business logic services
│   ├── emailService.js      # Email service
│   ├── paymentService.js    # Payment service
│   └── ...                  # Other shared services
│
├── jobs/                    # ⚙️ SHARED: Background jobs/cron tasks
│   ├── emailJobs.js         # Email-related jobs
│   └── ...                  # Other scheduled jobs
│
├── auth/                    # 🔐 DOMAIN: Authentication & OTP
│   ├── controllers/         # authController, otpController
│   ├── models/              # Auth-related models
│   └── routes/              # Auth routes
│
├── user/                    # 👤 DOMAIN: User Management
│   ├── controllers/         # userController, myProfileController
│   ├── models/              # User models
│   └── routes/              # User routes
│
├── profile/                 # 📋 DOMAIN: Profile Features (shared across user types)
│   ├── controllers/         # awardController, educationController, workExperienceController
│   ├── models/              # Profile-related models
│   └── routes/              # Profile routes
│
├── event/                   # 🎉 DOMAIN: Event Management
│   ├── controllers/         # eventController, eventRegisterController
│   ├── models/              # Event models
│   └── routes/              # Event routes
│
├── speaker/                 # 🎤 DOMAIN: Speaker Management
│   ├── controllers/         # speakerProfileController, speakerAvailabilityController, 
│   │                        # bookSpeakerController, savedSpeakerController, 
│   │                        # speakerManagementController
│   ├── models/              # Speaker models
│   └── routes/              # Speaker routes
│
├── negotiation/             # 💰 DOMAIN: Booking Negotiations
│   ├── controllers/         # negotiationController
│   ├── models/              # Negotiation models
│   └── routes/              # Negotiation routes
│
├── chat/                    # 💬 DOMAIN: Messaging
│   ├── controllers/         # chatController
│   ├── models/              # Chat models
│   └── routes/              # Chat routes
│
├── document/                # 📄 DOMAIN: Document Sharing
│   ├── controllers/         # documentController
│   ├── models/              # Document models
│   └── routes/              # Document routes
│
├── comment/                 # 💭 DOMAIN: Comments on Posts
│   ├── controllers/         # commentController
│   ├── models/              # Comment models
│   └── routes/              # Comment routes
│
├── dispute/                 # ⚖️ DOMAIN: Dispute Management
│   ├── controllers/         # disputeController
│   ├── models/              # Dispute models
│   └── routes/              # Dispute routes
│
├── subscription/            # 💳 DOMAIN: Subscription Management
│   ├── controllers/         # subscriptionController, adminSubscriptionController
│   ├── models/              # Subscription models
│   └── routes/              # Subscription routes
│
├── admin/                   # 👨‍💼 DOMAIN: Admin Features
│   ├── controllers/         # adminMessagingController
│   ├── models/              # Admin models
│   └── routes/              # Admin routes
│
└── privacy/                 # 🔒 DOMAIN: Privacy Settings
    ├── controllers/         # privacyController
    ├── models/              # Privacy models
    └── routes/              # Privacy routes
```

## Structure Explanation

### ⚙️ Shared Folders (at `src/` root level)

These folders contain code that is **shared across all domains** and should remain at the root level:

- **`configs/`** - Application-wide configurations (database, environment variables, third-party API keys)
- **`middleware/`** - Express middleware used across multiple routes (authentication, validation, error handling)
- **`services/`** - Shared business logic services (email, payment, file upload, etc.)
- **`jobs/`** - Background jobs and scheduled tasks (cron jobs, queue workers)

### 🔐 Domain Folders (at `src/` root level)

Each domain folder is **self-contained** with its own:
- **`controllers/`** - Request handlers for that domain
- **`models/`** - Database models specific to that domain
- **`routes/`** - API routes for that domain

### Why This Structure?

1. **Clear Separation**: Shared utilities vs. domain-specific code
2. **Easy Navigation**: Developers know exactly where to find things
3. **Scalable**: Easy to add new domains or shared utilities
4. **AWS-Friendly**: Standard Node.js structure that deploys seamlessly
5. **Maintainable**: Changes in one domain don't affect others

## Controller Mapping

### Auth Domain (`auth/`)
- `authController` - User authentication (login, signup, logout)
- `otpController` - OTP verification during signup

### User Domain (`user/`)
- `userController` - User registration, signup, payment, bank details, and general user info
- `myProfileController` - User's own profile management

### Profile Domain (`profile/`)
- `awardController` - Awards in user profile (speaker/organiser/participant)
- `educationController` - Education in user profile (speaker/organiser/participant)
- `workExperienceController` - Work experience in user profile (speaker/organiser/participant)

### Event Domain (`event/`)
- `eventController` - Event CRUD operations
- `eventRegisterController` - Event registration/participation by participants

### Speaker Domain (`speaker/`)
- `speakerProfileController` - Speaker profile management
- `speakerAvailabilityController` - Speaker availability management
- `bookSpeakerController` - Booking a speaker for an event
- `savedSpeakerController` - Organiser saves speakers to their database
- `speakerManagementController` - Organiser manages all speakers they've approached

### Negotiation Domain (`negotiation/`)
- `negotiationController` - Money negotiation between organiser and speaker for booking

### Chat Domain (`chat/`)
- `chatController` - Chat between speaker and organiser

### Document Domain (`document/`)
- `documentController` - Documents shared between organiser and speaker

### Comment Domain (`comment/`)
- `commentController` - Comments on posts (posted by speaker, organiser, or participant)

### Dispute Domain (`dispute/`)
- `disputeController` - Disputes raised by organiser, speaker, or participant against parties involved in events

### Subscription Domain (`subscription/`)
- `subscriptionController` - Subscription plans and who took which subscription (managed by admin)
- `adminSubscriptionController` - Admin management of subscriptions (organisers take subscriptions to use the platform)

### Admin Domain (`admin/`)
- `adminMessagingController` - Admin messaging functionality

### Privacy Domain (`privacy/`)
- `privacyController` - Privacy settings management

## Import Examples

### From Domain to Shared Resources
```javascript
// In event/controllers/eventController.js
const { authenticate } = require('../../middleware/auth');
const emailService = require('../../services/emailService');
const dbConfig = require('../../configs/database');
```

### From Domain to Another Domain
```javascript
// In speaker/controllers/bookSpeakerController.js
const Event = require('../../event/models/Event');
const { createEvent } = require('../../event/controllers/eventController');
```

### From Shared to Domain
```javascript
// In services/emailService.js
const User = require('../user/models/User');
const Event = require('../event/models/Event');
```

## Benefits of This Structure

1. **Better Organization**: Related functionality is grouped together
2. **Easier Maintenance**: Controllers, models, and routes for a domain are co-located
3. **Scalability**: Easy to add new features within existing domains or create new domains
4. **Clear Separation of Concerns**: Each domain handles its own responsibilities
5. **Team Collaboration**: Different developers can work on different domains without conflicts
6. **Shared Code Reusability**: Common utilities are easily accessible from any domain

## AWS Deployment Considerations

This folder structure is **completely compatible** with AWS deployment and will **NOT cause any problems**. Here's why:

### ✅ AWS-Compatible Structure

1. **No Path Length Issues**: All paths are well within Windows/Linux limits
2. **Standard Node.js Structure**: Follows Node.js best practices that AWS supports
3. **Module Resolution**: Node.js module resolution works the same on AWS as locally
4. **Case Sensitivity**: While Linux (AWS) is case-sensitive and Windows is not, your folder names are lowercase, avoiding issues

### Deployment Methods Supported

- **AWS Elastic Beanstalk**: Works perfectly with this structure
- **AWS EC2**: No issues with direct deployment
- **AWS Lambda**: Compatible (if using serverless framework)
- **AWS ECS/Fargate**: Docker containers work seamlessly
- **AWS App Runner**: Fully supported

### Best Practices for AWS Deployment

1. **Use Relative Imports**: 
   ```javascript
   // ✅ Good
   const EventController = require('../event/controllers/eventController');
   
   // ❌ Avoid absolute paths
   ```

2. **Environment Variables**: Store sensitive configs in AWS Systems Manager Parameter Store or Secrets Manager

3. **Build Process**: Ensure your build process (if any) handles the folder structure correctly

4. **Docker**: If using Docker, ensure your Dockerfile copies the entire `src/` directory structure

5. **Package.json**: Make sure your `main` or `start` script points to the correct entry file

### Example Dockerfile (if needed)
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# This will copy the entire structure including all domain folders
CMD ["node", "src/index.js"]
```

### No Special Configuration Needed

This structure requires **no special AWS configuration**. It's a standard Node.js application structure that AWS services understand and support natively.

