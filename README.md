# Secure File Share

Secure File Share is a full-stack, secure file-sharing web application designed to demonstrate robust security, clean code architecture, and modern development practices. The application allows users to upload, download, and share files with advanced security features such as AES-256 encryption for files at rest, client-side encryption before upload, JWT-based authentication with multi-factor authentication (MFA), and role-based access control (RBAC).

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Overview](#project-overview)
- [Setup and Installation](#setup-and-installation)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Additional Notes](#additional-notes)
- [License](#license)

## Features

- **User Authentication & Authorization:**
  - User registration, login, and logout.
  - JWT-based authentication with secure session management.
  - Multi-factor authentication (MFA) via TOTP (with QR code) or SMS.
  - Role-based access control (Admin, Regular User, Guest).

- **File Management:**
  - Secure file upload with client-side encryption.
  - Files are encrypted at rest on the backend using AES-256.
  - File download with proper decryption on the client side.

- **File Sharing:**
  - Share files with specific users (download-only permission).
  - Generate one-time shareable links with configurable expiration (default 24 hours).
  - Shared files appear in the recipient’s dashboard.

- **UI/UX:**
  - Modern, responsive design using Next.js, React 18 (with TSX), and Tailwind CSS.
  - Smooth animations provided by Framer Motion.
  - Autocomplete in the share modal for user search.
  - MFA configuration integrated into the profile page.
  
- **Dockerized Development Environment:**
  - Fully Dockerized application for seamless development and deployment.
  - Docker Compose file to bring up both the backend (Django) and frontend (Next.js) services in watch mode.

## Technologies Used

- **Front-End:**
  - Next.js, React 18, and TypeScript (TSX)
  - Tailwind CSS
  - Redux for state management with Redux Persist (storing auth state in cookies)
  - Framer Motion for animations
  - [react-select](https://react-select.com/) for autocomplete functionality
  - [qrcode.react](https://www.npmjs.com/package/qrcode.react) for QR code generation

- **Back-End:**
  - Python with Django and Django REST Framework
  - SQLite for database storage
  - JWT-based authentication with support for MFA (TOTP and SMS)
  - AES-256 encryption for files at rest
  - Role-based access control (RBAC)
  
- **Deployment:**
  - Docker and Docker Compose for containerization and environment consistency
  - Self-signed SSL/TLS certificates for secure communication during development

## Project Overview

This project demonstrates a secure file-sharing application where:
- Users can register and authenticate securely using JWT tokens.
- Files are encrypted on the client before upload and further encrypted at rest on the server.
- MFA is implemented as a two-step process during login and can be configured via the user’s profile.
- Files can be shared with specific users (granting them download access) or via shareable links that expire after a configurable duration.
- The application is fully Dockerized for ease of deployment, and the code is written following modern security and code-quality best practices.

## Setup and Installation

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your system.
- Git installed.

### Clone the Repository

```bash
git clone <repository-url>
cd secure-file-share
```

## Environment Variables

The project uses environment variables for configuration. In development, these are set via Docker Compose. Key environment variables include:

- NEXT_PUBLIC_BACKEND_URL: Used by the frontend to communicate with the backend (set to something like http://backend:8000 for Docker networking).
- SECRET_KEY: Django secret key.
- Other variables for enabling debug mode, TLS, etc.


## Running the Application

The application is fully Dockerized. To build and start the application, simply run:

```bash
docker-compose up --build
```

This command will:

- Build the backend and frontend Docker images.
- Start the Django development server (with watch mode) on port 8000.
- Start the Next.js development server (with hot reload) on port 3000.

You can then access the application in your browser:

- Frontend: http://localhost:3000
- Backend API (for testing purposes): http://localhost:8000

## Testing

The project includes automated tests for key functionalities such as authentication, file upload/download, file sharing, and user search. To run the tests:

1. Inside the Docker container (backend):
   ```bash
   docker-compose exec backend python manage.py test
   ```

2. Or locally (if set up):
   ```bash
   python manage.py test
   ```

Test cases cover:

- User registration and login (with MFA).
- File uploads and secure downloads by both owners and shared users.
- Generation and expiration of shareable links.
- Autocomplete user search (excluding the current user).

## Security Considerations

- Encryption in Transit:
  The application is configured to use HTTPS (with self-signed certificates during development) ensuring all communications are encrypted.
- Encryption at Rest:
  Files uploaded are encrypted using AES-256 on the backend, with secure key management via environment variables.
- Authentication and MFA:
  The use of JWT tokens, secure password hashing (using Django’s built-in mechanisms), and multi-factor authentication (via TOTP and SMS) significantly enhance account security.
- Input Validation and RBAC:
  The application validates inputs on both client and server sides to prevent malicious data entry. RBAC ensures users have access only to the functionality permitted by their role (Admin, Regular User, Guest).
- Session Management:
  JWT tokens are securely handled, and authentication state is persisted in cookies (using Redux Persist with cookie storage) rather than local storage, reducing potential XSS risks.

## secure-file-share/

```
├── backend/                     # Django backend
│   ├── manage.py
│   ├── secure_file_share/       # Django settings, wsgi, etc.
│   ├── accounts/                # Custom user model, auth views, etc.
│   ├── files/                   # File upload, download, and sharing
│   ├── tests/                   # Django test cases
│   └── Dockerfile
├── frontend/                    # Next.js frontend
│   ├── package.json
│   ├── next.config.js
│   ├── pages/                   # Next.js pages (including API routes)
│   │   ├── _app.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── dashboard.tsx
│   │   ├── profile.tsx
│   │   ├── share/[link_id].tsx  # Redirect page for shareable links
│   │   └── api/                 # Next.js API routes (e.g., proxy routes)
│   │       └── share/[link_id].ts
│   ├── components/              # React components (file list, share modal, etc.)
│   ├── store/                   # Redux store and slices
│   ├── api/                     # Custom Axios instance (axiosConfig.ts)
│   └── Dockerfile
├── docker-compose.yml           # Docker Compose for frontend and backend
└── README.md
```

## API Endpoints

Some key API endpoints include:

- Authentication:
    - POST /api/auth/register/ – Register a new user.
    - POST /api/auth/login/ – Login with username/password (and MFA if required).
    - POST /api/auth/mfa/setup/ – Initiate MFA setup.
    - POST /api/auth/mfa/confirm/ – Confirm MFA setup.
    - GET /api/auth/profile/ – Retrieve the authenticated user’s profile.
- File Management:
    - POST /api/files/upload/ – Upload a file (encrypted on the client, re-encrypted on the server).
    - GET /api/files/<file_id>/download/ – Download a file (access controlled).
    - POST /api/files/<file_id>/share/ – Share a file with a user or generate a shareable link.
    - GET /api/files/shareable/<link_id>/ – Download a file using a shareable link (public access).
- User Search:
    - GET /api/users/search/?query=<search_term> – Search for users (excluding the current user).

## Additional Notes

- Dockerization: 
  The project is fully containerized with Docker and Docker Compose. The development environment supports watch mode so that any changes in the source code are immediately reflected.
- Environment Configuration:
  Environment variables for both frontend and backend are configured via Docker Compose. Make sure to adjust any sensitive values before deploying to production.
- SSL/TLS:
  Self-signed certificates are used during local development. For production, ensure you obtain valid certificates from a trusted Certificate Authority (CA).
- Documentation:
  Detailed inline comments and a modular codebase facilitate maintainability and future enhancements.