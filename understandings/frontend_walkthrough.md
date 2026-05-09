# Frontend Walkthrough: AI Maintenance Copilot

This document explains the mobile application architecture, especially for developers coming from an **Angular** background.

## 1. Architecture Overview
We use **React Native** with **Expo Router**. Unlike Angular's central `app-routing.module.ts`, Expo Router uses **File-based Routing**. The folder structure *is* the navigation structure.

### Key Concepts Mapping:
| Angular | React Native (Expo) |
| :--- | :--- |
| `app.component.html` | `app/_layout.tsx` |
| `router-outlet` | `<Stack />` or `<Tabs />` components |
| `ngOnInit()` | `useEffect(() => { ... }, [])` |
| `[(ngModel)]` / `{{ property }}` | `useState` and JSX curly braces `{}` |
| `*ngFor` | `<FlatList />` or `.map()` |

---

## 2. Directory Structure

### `app/` (The Routing Engine)
Every file here becomes a route (page).
- **`app/_layout.tsx`**: The global wrapper. Sets up the root navigation stack and provides the theme.
- **`app/(tabs)/_layout.tsx`**: Defines the bottom navigation bar. It wraps the screens inside the `(tabs)` folder.
- **`app/(tabs)/index.tsx`**: The Home screen (**Dashboard**). In Expo Router, `index` always maps to the root of that folder.
- **`app/(tabs)/health.tsx`**: The **Fleet Health** screen.
- **`app/incident/[id].tsx`**: The **Incident Detail** screen. The `[id]` syntax denotes a dynamic route (similar to `:id` in Angular).

### `components/` (Reusable UI)
- **`IncidentCard.tsx`**: A standalone UI component used in the Dashboard list. It's like an Angular component without the selector—you just import it and use it like an HTML tag: `<IncidentCard />`.

### `services/` (Data Layer)
- **`api.ts`**: Handles all HTTP requests using Axios. This is your "Service" layer. It doesn't use Dependency Injection like Angular; you simply import the functions where needed.

---

## 3. Screen Breakdown

### A. Dashboard Screen (`app/(tabs)/index.tsx`)
- **Purpose**: Displays the list of active maintenance incidents.
- **Logic**:
    - `useState`: Holds the `incidents` array.
    - `useEffect`: Calls `fetchIncidents()` when the component "mounts" (equivalent to `ngOnInit`).
    - `FlatList`: A high-performance way to render lists (equivalent to `*ngFor`).

### B. Health Screen (`app/(tabs)/health.tsx`)
- **Purpose**: Shows real-time averages for sensors across the fleet.
- **Design**: Uses card-based layouts with status-colored badges to indicate health percentages.

### C. Incident Detail Screen (`app/incident/[id].tsx`)
- **Purpose**: Deep dive into a specific problem.
- **Data Flow**: When you click a card on the Dashboard, we "push" the incident data through the router. This screen reads that data using `useLocalSearchParams()`.

---

## 4. State Management (React Hooks)
In React, we don't have classes with properties. We use **Hooks**:
- **`useState`**: `const [data, setData] = useState([])`. `data` is the variable, and `setData` is the function used to update it.
- **`useEffect`**: Handles side-effects. The empty array `[]` at the end ensures the code runs only once when the screen loads.

---

## 5. Styling (CSS-in-JS)
Instead of `.css` files, we use `StyleSheet.create()`.
- **Flexbox**: React Native uses Flexbox for everything.
- **No Units**: You don't use `px`. Numbers are density-independent pixels.

---

**Next Steps**: Try modifying a color in `app/(tabs)/_layout.tsx` or changing a text label in `index.tsx` to see how "Hot Reloading" works!
