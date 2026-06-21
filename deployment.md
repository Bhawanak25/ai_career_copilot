# Production Cloud Deployment Guide
### Multi-Cloud Scale Blueprint — Elite System Engineering

This guide outlines optimal strategies to deploy the Next-Gen AI Career Copilot to highly available, secure, and auto-scaling cloud landscapes.

---

## ☁️ Option A: Google Cloud Run (Fully Serverless, Scale-to-Zero)
Google Cloud Run is the recommended platform because of its native security architecture, integration with Gemini APIs, and serverless pricing model.

### 1. Build and Submit Container to Artifact Registry
Ensure you are authenticated with the Google Cloud SDK, then trigger the build:
```bash
# Configure default Google Project variables
gcloud config set project [YOUR_PROJECT_ID]

# Create a regional Artifact Registry repository
gcloud artifacts repositories create career-copilot-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker Repository for Career Copilot Service"

# Build and push directly to Container Registry
gcloud builds submit --tag us-central1-docker.pkg.dev/[YOUR_PROJECT_ID]/career-copilot-repo/service:latest
```

### 2. Launch the Application Container
Deploy the compiled container mapping required parameters:
```bash
gcloud run deploy career-copilot-service \
    --image us-central1-docker.pkg.dev/[YOUR_PROJECT_ID]/career-copilot-repo/service:latest \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --set-env-vars="NODE_ENV=production,PORT=3000" \
    --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY_SECRET:latest,JWT_SECRET=JWT_SECRET_SECRET:latest"
```

---

## ☁️ Option B: AWS Elastic Beanstalk (Docker Platform)
For scalable, AWS-native setups, AWS Elastic Beanstalk offers simple load balancing and automatic deployment.

### 1. Construct Deployable Bundle ZIP
Elastic Beanstalk relies on standard source package bundles:
```bash
# Compress critical source coordinates (excluding heavy dependency directories)
zip -r deploy_bundle.zip Dockerfile package.json server.ts src/ .env.example
```

### 2. Create Application & Environment
1. Open the **AWS Elastic Beanstalk Management Console**.
2. Select **Create Application** and define its name (`career-copilot`).
3. Under Platform, select **Docker** (running on 64bit Al2).
4. Select **Upload your code** and supply `deploy_bundle.zip`.
5. Under **Software Configuration -> Environment Properties**, map your keys:
   - `GEMINI_API_KEY`: `your-gemini-key`
   - `JWT_SECRET`: `your-jwt-string-salt`
   - `NODE_ENV`: `production`
6. Complete setup deployment.

---

## 🔒 Post-Deployment Security Checklists
Regardless of your provider, always verify the following parameters are active:
- **HTTPS Enforcement**: Confirm HTTP traffic redirects automatically to SSL ports.
- **Port Isolation**: Ensure external internet ingress is permitted solely over standard web ports, preventing direct database or background listener exposures.
- **Persistent Directories**: Double check `/app/data/` mounts to a durable network persistence file system (like AWS EFS or Cloud Source Mounts) if persistence between system reboots is required.
