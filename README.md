# 🔐 VAULT-KEEPER

> **Secure your passwords, empower your peace of mind.**

<p align="center">
  <img src="https://img.shields.io/badge/last%20commit-today-brightgreen" />
  <img src="https://img.shields.io/badge/typescript-93.1%25-blue" />
  <img src="https://img.shields.io/badge/languages-5-informational" />
</p>

---

## 🛠 Built with the tools and technologies:

<p>
  <img src="https://img.shields.io/badge/JSON-black?logo=json&logoColor=white" />
  <img src="https://img.shields.io/badge/Markdown-000000?logo=markdown&logoColor=white" />
  <img src="https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white" />
  <img src="https://img.shields.io/badge/Autoprefixer-E7312B?logo=autoprefixer&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=white" />
  <img src="https://img.shields.io/badge/PostCSS-DD3A0A?logo=postcss&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Zod-9f7aea?logo=zod&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white" />
  <img src="https://img.shields.io/badge/React Hook Form-EC5990?logo=react&logoColor=white" />
</p>

---

## 🧠 Overview

**Password Manager** is a modern and secure application for managing your passwords effectively and privately.

### 🔐 Core Features

- AES-encrypted password storage.
- Firebase authentication with support for Google login.
- Mobile-friendly UI with dark mode toggle.
- Built with modular architecture for scalability.
- Type-safe, fast, and responsive frontend.
- Full offline capabilities via service workers and Firebase sync.

---

## 🛡️ Security Features

### ✅ Input Validation & Sanitization
- Strong validation for email, password, and username fields.
- DOMPurify integration to sanitize all rendered user inputs.
- Input sanitization applied to all form data and password entries.

### 🔐 Authentication Security
- Passwords are securely hashed via Firebase Auth.
- Login attempts are rate-limited to 5 attempts with a 15-minute lockout.
- Strong password requirements enforced (uppercase, lowercase, numbers, symbols).
- Clipboard auto-clears after 30 seconds for sensitive copied data.

### 📊 Security Logging & Monitoring
- Tracks sensitive events: logins, password changes, and failed attempts.
- Logs include IP address, user agent, and event timestamp.
- Security logs are stored in Firestore for auditing purposes.

### 🛡️ OWASP-Based Hardening
| OWASP Risk | Implementation |
|------------|----------------|
| **A01: Broken Access Control** | User-specific access to stored data |
| **A03: Injection**             | Firebase handles secure data operations |
| **A05: Security Misconfiguration** | Sensitive info hidden using `.env` |
| **A07: Identification & Authentication** | Strong password policies enforced |
| **A09: Security Logging & Monitoring** | Centralized logging of critical events |

### 🚨 Additional Protections
- Automatic clipboard clearing to prevent clipboard attacks.
- All error messages are generic and avoid exposing sensitive info.
- Global input sanitization to defend against injection and XSS.
- Built-in protection against brute-force login attempts.

---

## 🚀 Getting Started

### 📦 Prerequisites

Make sure you have the following installed:

- **Node.js**
- **npm**
- **Firebase account** (for authentication and DB)

---

## 🔄 CI/CD & Deployment

This project leverages a robust Continuous Integration/Continuous Deployment (CI/CD) pipeline to ensure code quality, automated testing, and seamless deployments. Jenkins is a core component of this pipeline.

### 🚀 Automated Workflow with Jenkins

- **Automated Builds:** Jenkins automatically triggers a build whenever new changes are pushed to the main branch.
- **Unit and Integration Testing:** Comprehensive test suites are run automatically to catch regressions and ensure stability.
- **Code Quality Checks:** Static analysis and linting are performed to maintain code standards and identify potential issues.
- **Containerization:** The application is containerized using Docker for consistent environments across development and production.
- **Deployment Automation:** Jenkins orchestrates the deployment process to our production environment, ensuring minimal downtime and reliable releases.

---

## ⚙️ Installation

```bash
# Clone the repo
git clone https://github.com/SPECT3R0/Password-Manager.git

# Navigate into the directory
cd Password-Manager

# Install dependencies
npm install

# Start the development server
npm run dev
