# Momentum Fit Studio

## Business name and description

Momentum Fit Studio is a personal training and fitness coaching business that helps clients stay on track with their workouts, nutrition, and progress goals. The system supports both the business owner and the members by making training management easier and more organized.

## Problem being solved

Many fitness businesses rely on scattered notes, spreadsheets, and manual check-ins. This leads to missed workouts, poor follow-up, inconsistent tracking, and difficulty showing progress. Momentum Fit Studio solves that problem by centralizing workout logs, meal tracking, and body metrics in one simple system.

## Features included

- Landing page with business branding and clear calls to action
- User registration and login with hashed passwords
- Two access roles: admin and regular member
- Protected app areas that redirect users away from private pages when not logged in
- CRUD for the core business entity: workouts
- Nutrition tracking and body metric tracking for client progress
- Local persistence so data stays available after refresh

## Tech stack

- HTML5
- Tailwind CSS
- JavaScript
- Browser LocalStorage

## Setup and run instructions

1. Open the project folder.
2. Open index.html in a browser, or serve the folder locally using:
   - python -m http.server 8000
3. Visit http://localhost:8000 in the browser.

## AI tools used

- GitHub Copilot was used to generate and refine the app structure, business logic, and UI behavior.
- The code was reviewed and adjusted manually to match the assignment requirements and verify that the functionality worked correctly.

## Test accounts

- Admin: admin@momentumfit.com / admin123
- Regular member: member@momentumfit.com / member123

## Notes

This project is designed as a functional fitness business system and follows the assignment requirements for a landing page, users, and CRUD.
