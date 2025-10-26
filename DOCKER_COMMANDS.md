# Docker Build and Push Cheatsheet

## Backend API Image
1. **Build**
   ```powershell
   docker build -t ghcr.io/saivighnesh2190/personal-productivity-assistant-backend:latest ./backend
   ```

2. **Push**
   ```powershell
   docker push ghcr.io/saivighnesh2190/personal-productivity-assistant-backend:latest
   ```

## Frontend Web Image
1. **Build**
   ```powershell
   docker build -t ghcr.io/saivighnesh2190/personal-productivity-assistant-frontend:latest ./frontend
   ```

2. **Push**
   ```powershell
   docker push ghcr.io/saivighnesh2190/personal-productivity-assistant-frontend:latest
   ```

## Notes
- Log in to GitHub Container Registry first:
  ```powershell
  echo $env:GITHUB_TOKEN | docker login ghcr.io -u saivighnesh2190 --password-stdin
  ```
- Update the `:latest` tag as needed (e.g., `:v1.0.0`).
- Make sure `.env` or secrets are provided at runtime; they arent baked into the images.
