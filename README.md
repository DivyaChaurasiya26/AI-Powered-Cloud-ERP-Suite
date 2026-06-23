# 🚀 AI-Powered Cloud ERP System

A scalable **multi-tenant ERP backend system** built using **Node.js, Express, TypeScript, MongoDB**, featuring authentication, role-based access control, and SaaS-ready architecture.

---

## 📌 Project Status

✔ Backend foundation completed  
✔ Authentication system implemented  
✔ Role-Based Access Control (RBAC) ready  
✔ Multi-tenant architecture started  
➡ Ready for module development (HR, Finance, Inventory)

---

## 🏗️ Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs (password hashing)
- pnpm (package manager)

---

## 🔐 Features Implemented

### 👤 Authentication System
- User registration with encrypted passwords
- Secure login using JWT
- Token-based authentication system

### 🛡️ Security & Authorization
- JWT authentication middleware
- Role-Based Access Control (RBAC)
- Roles:
  - ADMIN
  - HR
  - EMPLOYEE

### 🏢 Multi-Tenant Architecture
- Tenant (Company) model created
- Users linked to tenants using `tenantId`
- SaaS-ready structure for multiple companies

### 🗄️ Database Layer
- MongoDB integration using Mongoose
- Initial models:
  - User
  - Tenant
- Schema validation and error handling

---

## ⚙️ Project Structure
Docker Setup

CI/CD Pipeline

Kubernetes Deployment

Monitoring

Cloud Deployment

Security
