# GitHub Upload Guide

## Step-by-Step Instructions

### Step 1: Initialize Git Repository
```bash
cd voxvertex-monorepo
git init
```

### Step 2: Add All Files
```bash
git add .
```

### Step 3: Create Initial Commit
```bash
git commit -m "Initial commit: Monorepo structure with frontend, backend, and infrastructure"
```

### Step 4: Add Remote Repository
```bash
git remote add origin https://github.com/chhaviteotia/voxvertex-monorepo.git
```

### Step 5: Set Main Branch
```bash
git branch -M main
```

### Step 6: Push to GitHub
```bash
git push -u origin main
```

## Authentication

If prompted for authentication:
- **Username**: Your GitHub username (chhaviteotia)
- **Password**: Use a Personal Access Token (not your GitHub password)
  - Go to: GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Generate new token with `repo` scope
  - Use this token as password

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:
```bash
gh auth login
git push -u origin main
```

## Troubleshooting

### If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/chhaviteotia/voxvertex-monorepo.git
```

### If you get authentication errors:
- Use Personal Access Token instead of password
- Or set up SSH keys for authentication

### If you need to force push (only if repository was not empty):
```bash
git push -u origin main --force
```

