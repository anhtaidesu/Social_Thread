# Threads Clone Frontend

A modern React application that provides a UI similar to Instagram Threads.

## Features

- **Authentication**: Login, registration, and password recovery
- **Feed**: View and interact with posts from users you follow
- **Create Posts**: Share text and images with your followers
- **Profiles**: View user profiles and follow/unfollow users
- **Notifications**: Get notified of likes, comments, follows, and mentions
- **Dark/Light Mode**: Toggle between dark and light themes

## Technologies Used

- **React**: Frontend library for building user interfaces
- **TypeScript**: Static typing for JavaScript
- **Redux Toolkit**: State management
- **React Router**: Navigation and routing
- **Material UI**: UI component library
- **Axios**: HTTP client for API requests
- **Socket.IO**: Real-time notifications
- **date-fns**: Date formatting
- **Zod**: Runtime type validation

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Backend services running (Authentication and Social services)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Create a `.env` file in the root directory
- Add the following variables:
```
REACT_APP_AUTH_API_URL=http://localhost:8080
REACT_APP_SOCIAL_API_URL=http://localhost:8086
```

4. Start the development server:
```bash
npm start
```

## Project Structure

```
src/
├── app/                # Store configuration
├── components/         # Reusable components
├── features/           # Redux slices and related components
├── hooks/              # Custom hooks
├── layouts/            # Page layouts
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── ...
```

## Backend Services

This frontend connects to two microservices:
- **Authentication Service**: Handles user authentication, registration, and profile management
- **Social Service**: Manages posts, comments, likes, follows, and notifications

Make sure both services are running before starting the frontend.

## Deployment

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
