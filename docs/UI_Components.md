# UI Components & Mantine Guidelines

This document outlines the UI component architecture of the GreenLab H2 Calculator. The application relies heavily on custom reusable components built on top of the Mantine UI library. It enforces strict styling rules to maintain a consistent, accessible, and scalable codebase.

## 1. The Golden Rule: Mantine Style Props Only
**Strict Prohibition of Native CSS:** Whenever possible, you must absolutely avoid writing custom CSS classes or using native HTML tags (like `<div>`, `<input>`, or `<button>`) if a Mantine alternative exists. 

Instead, systematically use Mantine's built-in components and their **style props** (`mt`, `mb`, `p`, `bg`, `c`, etc.). This ensures the application correctly inherits theme variables, supports dark/light modes out of the box, and remains fully responsive.

**❌ Bad Practice (Do not do this):**
```jsx
// Avoid native HTML and custom CSS
import './MyComponent.css';

export default function MyComponent() {
  return (
    <div className="custom-container">
      <button className="primary-btn">Calculate</button>
    </div>
  );
}
```

**✅ Good Practice (The Mantine Way):**
```jsx
// Use Mantine components and style props
import { Box, Button } from '@mantine/core';

export default function MyComponent() {
  return (
    <Box p="md" bg="gray.1" style={{ borderRadius: '8px' }}>
      <Button mt="sm" color="green" radius="md">
        Calculate
      </Button>
    </Box>
  );
}
```

## 2. Core Reusable Components
To avoid code duplication across different simulator pages (such as `Calculator.jsx` and `Recycling.jsx`), several custom UI components have been created. Always scan the `src/components/` folder before building a new interface element.

### A. ValueInput
**Purpose:** A standardized input component used across the application to capture numerical data (e.g., electricity prices, efficiency rates, operational hours) from the user. It wraps Mantine's inputs to ensure consistent validation, localization, and styling.
**How to import:**
```jsx
import ValueInput from '../components/ValueInput';
```

### B. AdviceCards
**Purpose:** Used to display dynamic recommendations and scientific insights to the user. For instance, if a selected configuration is not optimal, this component renders formatted warning or advice cards based on the calculation states.
**How to import:**
```jsx
import AdviceCards from '../components/AdviceCards';
```

### C. ResultDisplay
**Purpose:** A comprehensive visualization component responsible for rendering the calculated metrics (e.g., LCOH, CAPEX, OPEX). It cleanly separates the presentation layer from the mathematical engine (`useCalculatorLogic`), utilizing Mantine grids, typography, and charts to display outputs.
**How to import:**
```jsx
import ResultDisplay from '../components/ResultDisplay';
```

### D. Layout & Navigation Components
The application's structural layout is standardized and injected at the top level in `App.jsx`.
- **Header:** Contains the main navigation, branding, and global settings.
- **Footer:** Contains secondary links, references, and legal information.
- **ScrollToTop / ScrollToTopButton:** Utility components that ensure the user is brought back to the top of the viewport when navigating between pages or interacting with long content forms.

**How to import (from App.jsx context):**
```jsx
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
```

## 3. Development Workflow
1. **Component Discovery:** Before building a slider, tooltip, or modal, always check the [Mantine Documentation](https://mantine.dev/) first. Do not reinvent standard UI patterns.
2. **Stateless UI:** Keep custom components like `ResultDisplay` purely presentation-focused. They should receive data via props rather than managing complex internal states.