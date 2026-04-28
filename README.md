# GreenLab H2 Platform

The GreenLab H2 Platform is a comprehensive, client-side web application developed to simulate the techno-economic viability of green hydrogen projects and provide interactive technical documentation. It is designed for researchers, laboratory technicians, and industrial engineers to evaluate production costs, assess recycling viability, and explore the hydrogen value chain.

## Core Features

*   **Techno-Economic Calculator (LCOH):** An advanced simulation engine that calculates the Levelized Cost of Hydrogen (LCOH), Total CAPEX, and Operational Expenditures (OPEX). It dynamically adjusts based on highly granular inputs, including electrolyzer specifications, balance-of-plant auxiliary consumption, and market variables like carbon taxes and grid electricity prices.
*   **Hydrogen Recycling ROI Estimator:** A dedicated tool to evaluate the financial viability of capturing and purifying unconsumed hydrogen from industrial exhaust gases. It calculates annual recovery volumes and Return on Investment (ROI) based on specific gas mixture complexities (e.g., Nitrogen, Carbon Dioxide, Argon).
*   **Interactive Knowledge Base:** A dynamic documentation module exploring the complete hydrogen production chain and hardware technologies. It utilizes custom interactive SVG schematics to explain the electrochemical mechanisms of various electrolyzers (PEM, Alkaline, AEM, SOEC) and compressors (Mechanical, Electrochemical).

## Technical Architecture & Stack

The application is engineered as a strict Single Page Application (SPA) to ensure rapid execution and maintain strict data privacy, functioning entirely without a backend database or external API dependencies.

*   **Framework:** React.js (via Vite).
*   **Routing:** React Router DOM for client-side navigation.
*   **UI & Data Visualization:** Mantine component library (`@mantine/core`, `@mantine/hooks`) and Mantine Charts for dynamic data rendering (e.g., LCOH breakdown rings and energy mix area charts).
*   **Styling:** Utility-first styling utilizing Mantine's style props, with isolated CSS strictly reserved for complex SVG schematic animations.

## Data Management & Extensibility

To allow researchers to update hardware specifications and educational content without altering the React source code, the platform utilizes a decoupled data architecture:

*   **Component Registry Engine:** The `ContentDetails` component acts as a dynamic rendering engine, mapping structured JSON data directly into Mantine UI components and React SVGs.
*   **Static Data Stores:** All equipment specifications, pricing matrices, and educational text blocks are maintained in local `.json` files within the `src/data/` directory.
*   **Centralized Constants:** Physical units, conversion factors, and baseline metrics (e.g., water requirements per kg of H2) are strictly governed by a centralized `calculatorConstants.js` file to ensure mathematical consistency across all modules.

## Installation, Local Development & Deployment

Prerequisites: Node.js must be installed on your local machine.

1. Clone the repository and navigate to the project directory:
   ```bash
   cd DHBW_Website
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at http://localhost:5173/ by default.

4. Production Build & Deployment:
   The project is configured for automated deployment via GitHub Pages. To build and deploy the application, run:
   ```bash
   npm run deploy
   ```
   This command automatically triggers the predeploy script (compiling the application via Vite into the dist directory) and pushes the optimized artifacts to the gh-pages branch.
