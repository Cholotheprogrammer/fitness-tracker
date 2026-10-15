# Building Guide

This project is a static front-end app built with HTML, Tailwind CSS, and vanilla JavaScript. It stores data in the browser using LocalStorage so it persists after refresh without a backend.

## 1. Run locally

Open the project folder in a browser directly or use a lightweight local server:

- Option A: Open index.html directly in the browser
- Option B: Run a local server from the project folder:
  - python -m http.server 8000
  - Then open http://localhost:8000

## 2. App flow

1. A visitor lands on the public landing page.
2. They can register a new user or log in to an existing account.
3. Admin and regular users have different access rules.
4. Logged-in users can manage workout records through the dashboard.

## 3. Roles and access

- Admin: admin@momentumfit.com / admin123
- Regular user: member@momentumfit.com / member123

## 4. CRUD feature

The core business entity is the workout record.

- Create a workout from the dashboard or workout tab
- Read all visible workouts from the list
- Update via the Edit button on each item
- Delete via the Delete button with confirmation

## 5. Password storage

Passwords are hashed client-side using the browser Web Crypto API before saving, so plain-text passwords are never stored.

## 6. Files

- index.html — landing page, auth screens, app shell
- app.js — business logic, login, registration, and CRUD behavior

## 7. Notes

This is a lightweight project designed to satisfy the assignment requirements while remaining easy to run from a local environment.
