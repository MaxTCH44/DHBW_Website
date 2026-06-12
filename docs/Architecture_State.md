# Architecture & State Management

This document provides a technical overview of the React architecture and data flow for the GreenLab H2 Calculator application. It is designed to help maintainers understand how the application routes users, manages state, and computes data.

## 1. Application Architecture & Routing (`App.jsx`)
The application is built as a React Single Page Application (SPA). The entry point and routing are managed entirely within `src/App.jsx`.

- **HashRouter:** The application uses `HashRouter` from `react-router-dom`. This choice is optimal for static hosting environments since it avoids server-side configuration requirements for URL paths.
- **Layout Structure:** `App.jsx` wraps the application in a flexbox layout (`.app-container`). It consistently renders a `<Header />`, a `<main>` container for dynamic content, a `<ScrollToTopButton />`, and a `<Footer />`. A `<ScrollToTop />` utility is also included to ensure the scroll position resets on navigation.
- **Static Data Injection:** Master JSON data files (such as `electrolyzersData` and `compressorsData`) are imported directly at the top level and passed down as props to specific pages (like `<EquipmentOverview />`).

## 2. Local State Persistence (`useSessionStorage`)
Pages that act as complex engineering tools, primarily `Calculator.jsx` and `Recycling.jsx`, handle dozens of interconnected user inputs. To prevent data loss when users navigate away to read the documentation and come back, the application uses session storage.

- **Implementation:** In `Calculator.jsx`, states are instantiated using the `useSessionStorage` hook rather than standard `useState`.
- **Usage Example:**
  ```jsx
  const [selectedElectrolyzer, setSelectedElectrolyzer] = useSessionStorage({ 
      key: 'calc-selected-electrolyzer', 
      defaultValue: electrolyzers.list[0], 
      getInitialValueInEffect: false 
  });
  ```
- **Benefit:** This allows the user's configuration (such as the chosen electrolyzer, operating time, and utility prices) to remain intact across the session without requiring a global state manager like Redux or Context API.

## 3. Business Logic Extraction (`useCalculatorLogic.js`)
To maintain clean and readable UI components, all heavy mathematical operations, financial projections, and physical sizings are strictly separated from the rendering layer. 

- **Role of the Hook:** The `useCalculatorLogic` hook acts as the central computation engine. It receives the aggregated raw state parameters from the `Calculator` component (e.g., `annualProd`, `selectedElectrolyzer`, `projectLifetime`, `carbonTax`).
- **Performance Optimization:** Inside the hook, the entire calculation block is wrapped in a `useMemo`. This ensures that the complex Levelized Cost of Hydrogen (LCOH), CAPEX, OPEX, and Return on Investment (ROI) equations are only recalculated when one of the dependency inputs actually changes.
- **Return Value:** The hook outputs a clean, structured object containing all the final metrics (e.g., `lcoh`, `capex`, `costBreakdown`, `avoidedCO2`), which are then passed down to presentation components like `ResultDisplay.jsx`.

## 4. Unidirectional Data Flow
The architecture strictly follows a top-down, unidirectional data flow:
1. **Data Initialization:** Static JSON lists and default state values are loaded.
2. **State Management:** Parent components (like `Calculator.jsx`) hold the state (`useSessionStorage`).
3. **Logic Processing:** State is fed into custom mathematical hooks (`useCalculatorLogic.js`).
4. **Rendering:** The calculated results and state setters are passed as props to specialized sub-components (`ElectrolyzerSetup.jsx`, `ResultDisplay.jsx`, `ResourcesCosts.jsx`) which handle user interaction and UI updates.