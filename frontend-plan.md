# Frontend Development Plan

## 1. Goal

Build a simple, testable frontend for Chirper using Next.js, React, Tailwind CSS, REST API calls to the existing backend, and a mobile-first responsive layout.

## 2. Core Decisions

- Framework: Next.js with App Router
- Navigation: SPA-style client navigation
- Styling: Tailwind CSS
- State: local state by default, auth/session in React Context
- Data fetching: shared REST API utility layer
- Feed behavior: infinite scroll on home feed
- Profile behavior: simpler profile list with manual loading
- Real-time updates: no
- Optimistic UI: no
- Testing: Jest + Testing Library with a 70% coverage target

## 3. Main Screens

1. Login page
2. Signup page
3. Home feed page
4. User profile page
5. Single tweet detail page
6. Edit profile page

## 4. Main Components

- app shell / navigation
- protected layout
- auth form
- compose tweet box
- tweet card
- follow button
- profile header
- loading state
- error state
- empty state

## 5. Data and State Strategy

- Use `AuthContext` for session bootstrap and login/logout/signup state
- Use local page/component state for feed data, profile data, tweet detail data, and form states
- Use a shared API client so fetch behavior stays consistent

## 6. Build Order

1. Scaffold Next.js frontend workspace
2. Add Tailwind and test configuration
3. Build API utility layer
4. Build auth context and protected layout
5. Build login and signup pages
6. Build app shell and home feed page
7. Build tweet card and compose flow
8. Build profile page and follow flow
9. Build tweet detail page and comments flow
10. Build edit profile page
11. Add tests and verify coverage

## 7. Done Criteria

The frontend is complete when:

- unauthenticated users are redirected to login
- authenticated users can navigate the main UI
- feed, profile, tweet detail, and edit profile screens all work against the backend API
- loading, error, and empty states exist on major screens
- tests pass with at least 70% coverage
