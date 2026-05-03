# TaskFlow - Team Task Manager

A full-stack MERN (MongoDB, Express, React, Node.js) application with TypeScript for team task management.

## Features

- **Authentication**: JWT-based user registration and login
- **Project Management**: Create, update, and delete projects
- **Team Management**: Add/remove team members with role-based access
- **Task Management**: Create, assign, and track tasks with status updates
- **Dashboard**: Visual overview of projects, tasks, status, and overdue work
- **Role-based Access**: Admin and Member roles with different permissions

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router for navigation
- Recharts for data visualization
- React Hook Form with Zod validation

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- express-validator for validation

## Project Structure

```text
team-task-manager/
|-- client/                 # React frontend (TypeScript)
|   |-- src/
|   |   |-- components/     # UI components
|   |   |-- pages/          # Page components
|   |   |-- context/        # React contexts
|   |   |-- services/       # API service
|   |   `-- hooks/          # Custom hooks
|   |-- package.json
|   `-- vite.config.ts
|-- server/                 # Node.js backend (TypeScript)
|   |-- src/
|   |   |-- config/         # Runtime config helpers
|   |   |-- controllers/    # Route controllers
|   |   |-- middleware/     # Express middleware
|   |   |-- models/         # Mongoose models
|   |   |-- routes/         # API routes
|   |   `-- types/          # TypeScript types
|   |-- package.json
|   `-- tsconfig.json
|-- package.json            # Root package.json
`-- README.md
```

## Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm

### Setup

1. **Install dependencies:**
```bash
npm run install:all
```

2. **Configure environment:**
```bash
# Server (.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=development

# Client (.env)
VITE_API_URL=http://localhost:5000/api
```

Use `server/.env.example` and `client/.env.example` as starting points.

3. **Start MongoDB:**
```bash
mongod
```

4. **Run the application:**
```bash
npm run dev:server  # Terminal 1 - Backend on port 5000
npm run dev:client  # Terminal 2 - Frontend on port 3000
```

5. **Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get users for assignment workflows

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member
- `DELETE /api/projects/:id/members/:userId` - Remove member
- `PUT /api/projects/:id/members/:userId/role` - Update member role

### Tasks
- `GET /api/tasks/projects/:projectId/tasks` - List project tasks
- `POST /api/tasks/projects/:projectId/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/status` - Update task status

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Roles

- **Admin**: Create/update projects, manage members, assign tasks, delete tasks
- **Member**: View assigned projects, create tasks, update task status, edit own tasks

## Production Build

```bash
npm run build
npm start
```

Set `JWT_SECRET` in production. The server will fail fast if it is missing.

## License

MIT
