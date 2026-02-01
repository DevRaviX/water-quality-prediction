# ☁️ Deployment Guide: AWS ECS (Fargate)

This guide walks you through deploying the **Water Quality Prediction System** as a single Docker container on AWS ECS (Elastic Container Service).

## 📋 Prerequisites
- **AWS Account**
- **AWS CLI** installed and configured (`aws configure`)
- **Docker** installed locally

---

## 🚀 Step 1: Create ECR Repository
Elastic Container Registry (ECR) stores your Docker images.

1.  **Create Repository**:
    ```bash
    aws ecr create-repository --repository-name water-quality-app --region us-east-1
    ```
2.  **Login to ECR**:
    ```bash
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
    ```

---

## 📦 Step 2: Build & Push Image

1.  **Build the Image** (Frontend + Backend):
    ```bash
    docker build -t water-quality-app .
    ```
    *(Note: This uses the multi-stage Dockerfile to build React and Bundle it with Python)*

2.  **Tag the Image**:
    ```bash
    docker tag water-quality-app:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/water-quality-app:latest
    ```

3.  **Push to ECR**:
    ```bash
    docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/water-quality-app:latest
    ```

---

## 🌐 Step 3: Create ECS Cluster & Task

1.  **Create Cluster**:
    - Go to AWS Console -> ECS -> Clusters -> **Create Cluster**.
    - Name: `water-quality-cluster`.
    - Infrastructure: **Fargate** (Serverless).

2.  **Create Task Definition**:
    - Go to Task Definitions -> **Create new Task Definition**.
    - Family name: `water-quality-task`.
    - Infrastructure: **AWS Fargate**.
    - **Container Details**:
        - Name: `water-quality-container`
        - Image URI: `<AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/water-quality-app:latest`
        - Container Port: `8000`
    - **Resource Allocation**:
        - CPU: `.5 vCPU`
        - Memory: `1 GB`

---

## 🚀 Step 4: Run the Service

1.  **Create Service**:
    - Go to your Cluster (`water-quality-cluster`).
    - Services -> **Create**.
    - Launch type: **Fargate**.
    - Task Family: `water-quality-task`.
    - Service Name: `water-quality-service`.
    - Desired tasks: `1`.

2.  **Networking**:
    - Select your VPC and Subnets.
    - Security Group: **Create new** -> Allow **Custom TCP** on port `8000` from `Anywhere (0.0.0.0/0)`.
    - **Public IP**: ENABLED.

3.  **Deploy**: Click **Create**.

---

## ✅ Step 5: Verify

1.  Wait for the Service status to be **STEADY**.
2.  Click on the **Task ID** -> **Networking** tab.
3.  Copy the **Public IP**.
4.  Open in browser: `http://<PUBLIC_IP>:8000`

🎉 You should see the Water Quality Prediction App!
