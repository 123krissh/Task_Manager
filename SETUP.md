# Setup & Installation Guide

## Prerequisites

- Node.js 18+ (from nodejs.org)
- MongoDB (local installation or MongoDB Atlas cloud)
- npm (comes with Node.js)

## Installation Steps

### 1. Clone/Extract Project

Extract the project to your preferred location:
```bash
cd d:\team-task-manager
```

### 2. Install Dependencies

Install dependencies for both server and client:

```bash
# Option 1: Install all at once
npm install

# Option 2: Install separately
cd server && npm install
cd ../client && npm install
```

### 3. Configure Environment Variables

Both `.env` files are already created with default values. You can modify them if needed:

**Server Configuration (server/.env)**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=taskflow_development_secret_change_me
CORS_ORIGIN=http://localhost:5173
```

**Client Configuration (client/.env)**
```
VITE_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

**Windows:**
```bash
# If installed locally
mongod

# Or using WSL
wsl -d <DistributionName> mongod
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

Or use MongoDB Atlas (Cloud):
- Visit https://www.mongodb.com/cloud/atlas
- Create account and cluster
- Update `MONGODB_URI` in `server/.env` with your connection string

### 5. Build the Project (Optional)

To build for production:

**Server:**
```bash
cd server
npm run build
```

**Client:**
```bash
cd client
npm run build
```

### 6. Run Development Servers

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```

Expected output:
```
> ts-node src/server.ts
Connected to MongoDB
Server running on port 5000
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```

Expected output:
```
> vite
VITE v6.0.1  ready in 123 ms
➜  Local:   http://localhost:5173/
➜  press h to show help
```

### 7. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## First-Time Usage

1. **Create Account**
   - Go to http://localhost:5173/signup
   - Fill in name, email, and password
   - Click "Sign Up"

2. **Login**
   - Use the credentials you just created

3. **Create Project**
   - Click "Create Project" on the Projects page
   - Give it a name, description, and pick a color
   - Click "Create"

4. **Add Team Members**
   - Go to project details
   - Click "Add Member"
   - Enter email of existing user
   - Choose role (Admin/Member)
   - Click "Add"

5. **Create Tasks**
   - Inside project, click "Create Task"
   - Fill in title, description, priority, due date
   - Assign to team member
   - Click "Create"

6. **Manage Tasks**
   - Drag tasks between columns to change status
   - Click task to edit details
   - Update status directly

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB is accessible at localhost:27017

### Port Already in Use
```bash
# Kill process using port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process using port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### CORS Errors
- Make sure frontend URL is in CORS_ORIGIN in server/.env
- Verify API URL in client/.env

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### TypeScript Errors
```bash
# Rebuild TypeScript files
npm run build

# For server
cd server && npm run build

# For client
cd client && npm run build
```

## Production Deployment

### Server Deployment

1. Build the server:
```bash
npm run build
```

2. Set environment variables:
- `NODE_ENV=production`
- `JWT_SECRET=<long-random-string>`
- `MONGODB_URI=<production-mongodb-url>`

3. Start server:
```bash
npm start
```

### Client Deployment

1. Build the client:
```bash
npm run build:prod
```

2. Deploy the `dist` folder to your web server

3. Set `VITE_API_URL` to production API URL

## Database Seeding (Optional)

To add sample data:

```javascript
// Create users
db.users.insertMany([
  { name: "John Doe", email: "john@example.com", password: "hashed_password" },
  { name: "Jane Smith", email: "jane@example.com", password: "hashed_password" }
])

// Create projects
db.projects.insertOne({
  name: "Website Redesign",
  description: "Redesign company website",
  color: "#6366F1",
  owner: ObjectId("..."),
  members: [...]
})
```

## Scripts Reference

### Server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run built server

### Client
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run build:prod` - Build with production settings

## Need Help?

1. Check the console for error messages
2. Verify MongoDB is running
3. Check `.env` files for correct configuration
4. Review API responses in browser DevTools Network tab
5. Check server logs for backend errors

## Next Steps

After setup, you can:
- Customize colors and styling
- Add more validation rules
- Implement additional features
- Deploy to production
- Add unit tests
- Set up CI/CD pipeline
