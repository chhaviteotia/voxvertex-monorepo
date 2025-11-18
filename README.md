# VoxVertex Monorepo

A comprehensive monorepo structure for VoxVertex marketplace platform with frontend (Next.js), backend (Node.js/Express), and infrastructure configurations.

## 📁 Project Structure

```
voxvertex-monorepo/
├── apps/
│   ├── frontend/          # Next.js frontend application
│   ├── backend/           # Node.js/Express backend API
│   ├── admin/             # Admin application (future)
│   └── ai-service/        # AI service (future)
│
├── packages/              # Shared packages
│   ├── shared-ui/         # Shared UI components
│   ├── shared-utils/      # Shared utilities
│   ├── shared-types/      # Shared TypeScript types
│   └── agent-logic/        # Agent logic package
│
├── infra/                 # Infrastructure as Code
│   ├── docker/            # Docker configurations
│   ├── terraform/          # Terraform configurations
│   ├── kubernetes/        # Kubernetes manifests
│   └── ci-cd/             # CI/CD pipeline configurations
│
├── scripts/               # Utility scripts
│   ├── switch-to-local.bat
│   └── switch-to-production.bat
│
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voxvertex-monorepo
   ```

2. **Install frontend dependencies**
   ```bash
   cd apps/frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd apps/backend
   npm install
   ```

### Development

**Run frontend:**
```bash
cd apps/frontend
npm run dev
```

**Run backend:**
```bash
cd apps/backend
npm run dev
```

**Run both (from frontend directory):**
```bash
cd apps/frontend
npm run dev:full
```

## 🏗️ Architecture

### Backend Structure

The backend follows a domain-driven architecture:

- **Domain Folders**: Each domain (auth, user, event, speaker, etc.) has its own folder with:
  - `controllers/` - Request handlers
  - `models/` - Database models
  - `routes/` - API routes

- **Shared Folders**:
  - `configs/` - Application configurations
  - `middleware/` - Express middleware
  - `services/` - Shared business logic services
  - `jobs/` - Background jobs and scheduled tasks

See `apps/backend/src/README.md` for detailed backend structure.

### Frontend Structure

- Next.js 15 with App Router
- TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling

## ☁️ AWS Deployment

This monorepo is structured for AWS deployment:

- **Frontend**: Can be deployed to AWS Amplify, S3 + CloudFront, or EC2
- **Backend**: Can be deployed to AWS EC2, ECS, Elastic Beanstalk, or Lambda
- **Infrastructure**: Use `infra/terraform/` or `infra/docker/` for infrastructure as code

## 📝 Environment Variables

### Frontend
Create `apps/frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend
Create `apps/backend/.env.local` (see `env.local.dev` or `env.local.prod` for reference)

**Note**: Environment files are gitignored. Never commit secrets!

## 🔧 Scripts

- `scripts/switch-to-local.bat` - Switch backend to local environment
- `scripts/switch-to-production.bat` - Switch backend to production environment

## 📚 Documentation

- `apps/backend/src/README.md` - Backend structure documentation
- `FILE_PLACEMENT_GUIDE.md` - Migration guide from old project structure
- `docs/` - Additional documentation

## 🛠️ Tech Stack

### Frontend
- Next.js 15
- React 19
- TypeScript
- Redux Toolkit
- Tailwind CSS
- Socket.io Client

### Backend
- Node.js
- Express.js
- MongoDB
- TypeScript (planned)

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Team/Contributors]

