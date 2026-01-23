# Document Management System (DMS) MVP

A fully responsive Document Management System built with React and Tailwind CSS.

## Features

- Dashboard with metrics and recent documents
- Document explorer with folder tree navigation
- File upload functionality with drag and drop
- Advanced search with filters
- User management with role-based permissions
- Folder-level access control
- Settings configuration
- Fully responsive design for all device sizes

## Tech Stack

- React 18
- React Router v6
- Tailwind CSS v3
- Vite.js
- JavaScript (ES6+)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd dms-mvp
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Build

To create a production build:

```bash
npm run build
```

### Preview

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── assets/         # Static assets
├── context/        # React context providers
├── hooks/          # Custom hooks
├── utils/          # Utility functions
├── App.jsx         # Main App component
└── main.jsx        # Entry point
```

## Responsive Design

The application is fully responsive and works on:
- Desktop screens
- Tablet devices
- Mobile phones

## License

This project is licensed under the MIT License.