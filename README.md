# Sapcone Disbursement Platform

This repository contains both the frontend and backend components for the Sapcone Disbursement Platform, customized for Sustainable Approaches for Community Empowerment (SAPCONE).

## Repository Structure

The project is organized into a monorepo structure:

```
sapcone/
├── frontend/               # React and Tailwind UI application
└── backend/                # Go/PostgreSQL backend services
```

---

## 1. Frontend

The frontend is a React application built with Vite and styled with Tailwind CSS. It manages the 3-Phase DisburseFlow Studio dashboard for cashier validation, receiver KYC checks, and disbursement execution tracking.

For installation and local setup instructions, please refer to [frontend/README.md](file:///home/bethwel/stellar-disbursement-platform-frontend/frontend/README.md).

For detailed instructions on API integration, please refer to [frontend/BACKEND_INTEGRATION.md](file:///home/bethwel/stellar-disbursement-platform-frontend/frontend/BACKEND_INTEGRATION.md).

---

## 2. Backend

The backend will contain Go API services, Transaction Submission Service (TSS) daemon, database migration scripts, and integration services.

Please refer to the `backend/` directory for configuration and architecture details.
