# Setup & Running Guide

This guide provides step-by-step instructions to set up and run the AI-Powered HVAC Maintenance Intelligence Platform locally.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.9+**
- **Node.js 16+** (with npm or yarn)
- **Git**
- **Expo Go** app (installed on your iOS or Android device for mobile testing)

---

## 1. Backend Setup

The backend is built with FastAPI and provides the intelligence engine for the platform.

### Step 1: Navigate to the backend directory
```bash
cd backend
```

### Step 2: Create a virtual environment (Optional but Recommended)
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install dependencies
```bash
pip install -r ../requirements.txt
```

### Step 4: Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```text
OPENROUTER_API_KEY=your_openrouter_api_key_here
```
*Note: This is required for the AI Technical Analysis features.*

### Step 5: Run the Backend
```bash
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`. You can view the interactive documentation at `http://localhost:8000/docs`.

---

## 2. Mobile App Setup

The mobile dashboard is built with React Native and Expo.

### Step 1: Navigate to the mobile directory
```bash
cd mobile
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure API URL
Ensure the mobile app can reach your backend. In most cases, it uses `localhost:8000`. If testing on a physical device via Expo Go, you may need to update the API base URL in `mobile/services/api.ts` to your machine's local IP address (e.g., `http://192.168.1.50:8000`).

### Step 4: Start the Mobile App
```bash
npx expo start
```
- Press **'a'** for Android emulator.
- Press **'i'** for iOS simulator.
- Scan the **QR code** with your phone (using Expo Go) to test on a physical device.

---

## 3. Data & ML Pipeline (Optional)

If you wish to re-process the raw telemetry or re-run the incident engine:

### Step 1: Preprocess Telemetry
```bash
python ml/preprocess_data.py
```
This cleans the raw CSV data and generates the `processed_hvac_data.csv`.

### Step 2: Run Incident Engine
```bash
python ml/incident_engine.py
```
This runs the Isolation Forest anomaly detection and engineering rules to generate the `incidents.csv` file used by the dashboard.

---

## Project Structure Overview

- `/backend`: FastAPI server and data services.
- `/mobile`: React Native (Expo) frontend application.
- `/ml`: Python scripts for data cleaning, anomaly detection, and incident grouping.
- `/data`: Source CSV datasets for telemetry and generated incidents.
- `/architecture diagram.png`: Visual overview of the system data flow.

---

## Troubleshooting

- **API Connection Error**: Ensure the backend is running and the mobile app is pointing to the correct IP/port.
- **Missing Telemetry**: If graphs are empty, ensure `data/processed_hvac_data.csv` exists and is populated.
- **AI Analysis Failing**: Check your `OPENROUTER_API_KEY` in the `backend/.env` file.
