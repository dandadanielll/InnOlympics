# GabAi: Short BRD for AI Context

## Project Overview
**GabAi** is a Filipino Healthcare Encounter Companion (PWA) designed to guide low-to-middle income patients through the "maze" of the Philippine healthcare system. It addresses three critical phases: **Before**, **During**, and **After** a medical visit.

## Tech Stack
- **Framework**: Next.js 16.2.4 (App Router, Turbopack)
- **UI**: React 19.2.4, Tailwind CSS 4, Framer Motion, Lucide React
- **AI**: Gemini 2.0 Flash (Multimodal: Text, Voice, Vision)
- **Backend/DB**: Firebase 12.12.1 (Firestore, Auth)
- **State**: Zustand (Persistent across browser sessions)
- **Maps**: Leaflet + OpenStreetMap (for free routing/display)

## Core Workflow (Navigator)

### 1. Before Phase (`/navigator/before`)
- **Patient Intake**: User inputs symptoms or needed services; AI classifies the medical need and risk level.
- **Facility Routing**: Geolocation-based sorting of 47+ facilities (Public, Private, BHC, PhilHealth Konsulta).
- **Travel & Gastos**: Commute planning using OSRM with official LTFRB 2024 fare matrices.
- **Checklist**: Context-aware document requirements (e.g., PGH-specific protocols).
- **Reality Check**: Crowdsourced wait-time estimations (currently PGH-focused).

### 2. During Phase (`/navigator/during`)
- **Patient Rights**: Simplified, Gemini-powered explanation of rights during a consultation.
- **Recall Assistant**: Voice recording + transcription + AI summarization of doctor's instructions.
- **Document Scanner**: Vision-based analysis of lab reports and prescriptions.

### 3. After Phase (`/navigator/after`)
- **Recap**: Structured summary of the encounter.
- **Referral & Follow-up**: Processing of referral slips and automated follow-up scheduling.
- **Community Log**: Crowdsourced data collection for wait times and service quality.

### 4. Cross-Phase: Alaala Ko
- **Persistent Health Memory**: Encounters are saved in a unified timeline.
- **Contextual Intelligence**: Future "Before" phases use history to refine advice and scripts.

## Core Differentiators
- **Voice-First**: Optimized for transcription in medical environments.
- **Local Context**: Pre-computed LTFRB fares, PhilHealth awareness, and warm Taglish/Filipino tone.
- **Authority Gap Bridge**: Helps non-confrontational patients ask the right questions via AI-generated scripts.

## Key API Endpoints
- `/api/classify`: Risk and department classification.
- `/api/commute`: OSRM-based routing logic.
- `/api/gemini/recall`: Transcription and instruction synthesis.
- `/api/gemini/document-scan`: Multimodal analysis of medical documents.
