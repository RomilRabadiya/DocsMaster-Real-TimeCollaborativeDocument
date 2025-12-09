# DocsMaster

## Collaborative Document Management System

A full-stack, real-time collaborative document management application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. DocsMaster enables teams and individuals to create, edit, share, and collaborate on documents seamlessly with Google Docs-like functionality.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Data Model](#data-model)
6. [API Endpoints](#api-endpoints)
7. [Real-Time Collaboration](#real-time-collaboration)
8. [Installation & Setup](#installation--setup)
9. [Environment Variables](#environment-variables)
10. [Usage Guide](#usage-guide)
11. [Security Features](#security-features)
12. [Performance Optimization](#performance-optimization)
13. [Testing](#testing)
14. [Deployment](#deployment)
15. [Future Roadmap](#future-roadmap)
16. [Contributing](#contributing)
17. [License](#license)

---

## Overview

DocsMaster (evolved from NotePadMaster) is a modern collaborative document management system designed to facilitate seamless teamwork and efficient document organization. The application provides a robust platform for creating, editing, sharing, and managing documents with real-time synchronization across multiple users.

**Project Information:**
- **Version:** DocsMaster v1.0
- **Academic Project:** Advanced Technologies (23CE520)
- **Institution:** Dharmsinh Desai University, Faculty of Technology
- **Developer:** Romil Jitendrabhai Rabadiya (CE136)
- **Supervisor:** Prof. Siddharth P. Shah

---

## Key Features

### Document Management

#### Core Document Operations
- **Create Documents:** Intuitive document creation with title, subject/section, content, and keyword tagging
- **Edit Documents:** Full-featured editing interface with auto-save functionality
- **Delete Documents:** Secure document deletion with owner-only permissions
- **View Documents:** Full-screen document viewer with clean, distraction-free interface
- **Search & Filter:** Advanced search capabilities across titles, content, and tags
- **Sort Options:** Sort documents by last selection time, update time, or creation date
- **Pagination:** Efficient pagination for large document collections

#### Document Organization
- **Categorization:** Organize documents by sections/subjects for better management
- **Keyword Tagging:** Multi-tag support for enhanced searchability and organization
- **Recent Documents:** Quick access to recently viewed or edited documents
- **Selection Tracking:** Automatic tracking of document access patterns

### Collaboration Features

#### Real-Time Synchronization
- **Live Updates:** Instant synchronization of document changes across all connected users
- **Presence Awareness:** See who's currently viewing or editing a document
- **Conflict Prevention:** Automatic handling of concurrent edits
- **Update Notifications:** Real-time notifications when documents are modified by collaborators

#### Sharing Mechanisms
- **Share Codes:** Generate secure, unique share codes for document access
- **Email Invitations:** Send email invites directly to collaborators
- **Public Preview:** Preview shared documents before joining
- **Join by Code:** Simple join process using share codes

#### Access Control
- **Role-Based Permissions:** Three-tier permission system
  - **Owner:** Full control including deletion and role management
  - **Editor:** Can modify document content and metadata
  - **Reader:** View-only access to document content
- **Role Management:** Owners can promote/demote collaborators
- **Participant Removal:** Owners can remove collaborators from documents
- **Access Validation:** Server-side permission checks on all operations

### User Interface

#### Modern Design
- **Google Docs-Style Interface:** Familiar, professional document editing experience
- **Full-Screen Modals:** Immersive editing and viewing experience
- **Responsive Design:** Seamless experience across desktop, tablet, and mobile devices
- **Dark Mode Support:** Eye-friendly interface for extended use sessions

#### Document Editor
- **Rich Text Input:** Multi-line content editor with auto-growing height
- **Title Editor:** Prominent title field with Google Docs-like styling
- **Metadata Panel:** Side panel showing document statistics and information
- **Action Toolbar:** Quick access to save, share, and formatting tools
- **Status Indicators:** Real-time save status and character count
- **Keyboard Shortcuts:** Efficient navigation and editing shortcuts

#### Document Viewer
- **Clean Layout:** Distraction-free reading experience
- **Metadata Display:** Created date, last updated, and modification history
- **Participant List:** View all collaborators and their roles
- **Keyword Chips:** Visual tag representation for quick identification
- **Action Buttons:** Quick access to edit, share, and delete functions

### History & Version Control

#### Undo/Redo System
- **Local History:** Client-side undo/redo for immediate content changes
- **History Limit:** Configurable history depth (default: 100 entries)
- **Debounced Snapshots:** Efficient snapshot creation every 300ms after typing pause
- **Memory Optimization:** Automatic cleanup of old history entries

#### Modification Tracking
- **Modified By:** Track which user last modified each document
- **Timestamps:** Automatic creation and update timestamp management
- **Selection Time:** Track when documents were last accessed
- **Activity Monitoring:** View document engagement patterns

### AI-Powered Features (Placeholder)

The application includes framework for future AI enhancements:
- **Document Summarization:** Generate concise summaries of long documents
- **Auto-Outline Generation:** Create structured outlines from document content
- **Content Improvement:** Grammar and style suggestions
- **Smart Tagging:** Automatic keyword suggestion based on content

### Dashboard & Analytics

#### User Dashboard
- **Quick Stats:** Overview of total documents, shared documents, and collaborations
- **Recent Activity:** Timeline of recent document interactions
- **Quick Actions:** Fast access to create, join, and search functions
- **Navigation Hub:** Central access point to all application features

#### Document Board
- **Grid/List View:** Toggle between card grid and list layouts
- **Filtering:** Filter by tags, sections, or sharing status
- **Bulk Actions:** Perform actions on multiple documents
- **Visual Indicators:** Clear badges for shared/private documents

---

## Technology Stack

### Frontend
- **React 18+:** Modern UI library with hooks and functional components
- **React Router:** Client-side routing and navigation
- **Socket.IO Client:** Real-time WebSocket communication
- **Axios:** HTTP client for API requests
- **CSS3:** Custom styling with modern CSS features
- **CommonMark:** Markdown rendering support

### Backend
- **Node.js:** JavaScript runtime environment
- **Express.js:** Web application framework
- **MongoDB:** NoSQL database for document storage
- **Mongoose:** ODM for MongoDB with schema validation
- **Socket.IO:** Real-time bidirectional event-based communication
- **JWT:** JSON Web Tokens for authentication
- **bcrypt:** Password hashing and security

### Development Tools
- **ESLint:** Code linting and quality checks
- **Prettier:** Code formatting
- **Jest:** Testing framework
- **Supertest:** API testing
- **Morgan:** HTTP request logging
- **Nodemon:** Development server auto-reload

---

## Architecture

### System Architecture

DocsMaster follows a three-tier architecture:

#### Presentation Layer (Client)
- React-based Single Page Application (SPA)
- Component-based architecture with reusable UI elements
- State management at component level
- Real-time updates via Socket.IO client
- Responsive design with mobile-first approach

#### Application Layer (Server)
- RESTful API built with Express.js
- Controller-based business logic separation
- Middleware for authentication, validation, and error handling
- WebSocket server for real-time features
- Route-based endpoint organization

#### Data Layer (Database)
- MongoDB for flexible document storage
- Mongoose schemas for data validation
- Indexed queries for performance
- Reference-based relationships between collections
- Atomic operations for data consistency

### Project Structure

```
docsmaster/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── api/                    # API wrapper functions
│   │   │   └── documentApis.js    # Document API calls
│   │   ├── components/
│   │   │   ├── common/            # Reusable UI components
│   │   │   │   ├── Buttons.js
│   │   │   │   └── InputFields.js
│   │   │   ├── documents/         # Document-related components
│   │   │   │   ├── DocumentCard.js
│   │   │   │   ├── DocumentFormModal.js
│   │   │   │   ├── DocumentModal.js
│   │   │   │   └── CreateDocumentButton.js
│   │   │   ├── collaboration/     # Collaboration components
│   │   │   │   ├── ParticipantsManager.js
│   │   │   │   ├── ShareByEmail.js
│   │   │   │   └── JoinDocument.js
│   │   │   ├── layout/            # Layout components
│   │   │   │   ├── Navbar.js
│   │   │   │   └── GoToDocumentsBoardButton.js
│   │   │   └── dashboard/         # Dashboard components
│   │   ├── pages/                 # Page-level components
│   │   │   ├── DocsBoard.js       # Main document board
│   │   │   ├── Dashboard.js       # User dashboard
│   │   │   └── Login.js           # Authentication page
│   │   ├── socket.js              # Socket.IO client setup
│   │   ├── App.js                 # Root application component
│   │   └── index.js               # Application entry point
│   └── public/                     # Static assets
│
├── server/                          # Node.js backend application
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── documentController.js  # Document operations
│   │   └── shareController.js     # Sharing functionality
│   ├── models/
│   │   ├── Document.js            # Document schema
│   │   └── User.js                # User schema
│   ├── routes/
│   │   ├── authRoutes.js          # Auth endpoints
│   │   ├── documentRoutes.js      # Document endpoints
│   │   └── shareRoutes.js         # Sharing endpoints
│   ├── middleware/
│   │   ├── auth.js                # JWT authentication
│   │   ├── validation.js          # Input validation
│   │   └── errorHandler.js        # Error handling
│   └── server.js                   # Server entry point
│
└── README.md                        # Project documentation
```

---

## Data Model

### Document Schema

The Document model represents the core entity in the system:

```javascript
{
  title: String,                    // Document title (required)
  section: String,                  // Subject/category (optional)
  content: String,                  // Document content (required)
  keywords: [String],               // Array of tags/keywords
  
  user: ObjectId,                   // Reference to owner (User)
  
  collaborators: [                  // Array of collaborators
    {
      user: ObjectId,               // Reference to User
      role: String,                 // 'reader' | 'editor'
      invitedAt: Date              // Invitation timestamp
    }
  ],
  
  isShared: Boolean,                // Sharing status flag
  shareCode: String,                // Unique share code (optional)
  selectionTime: Date,              // Last selection/view time
  
  createdAt: Date,                  // Creation timestamp
  updatedAt: Date,                  // Last update timestamp
  modifiedBy: ObjectId             // Reference to last modifier
}
```

### User Schema

```javascript
{
  email: String,                    // User email (unique)
  password: String,                 // Hashed password
  name: String,                     // User display name
  createdAt: Date,                  // Registration date
  updatedAt: Date                   // Last profile update
}
```

### Database Indexes

For optimal query performance:
- `{ user: 1, updatedAt: -1 }` - User documents sorted by update time
- `{ selectionTime: -1 }` - Recently accessed documents
- `{ shareCode: 1 }` - Quick share code lookup
- `{ 'collaborators.user': 1 }` - Shared document queries

---

## API Endpoints

### Authentication Endpoints

```
POST   /api/auth/register         # Register new user
POST   /api/auth/login            # User login
GET    /api/auth/verify           # Verify JWT token
POST   /api/auth/logout           # User logout
```

### Document Management Endpoints

```
GET    /api/documents             # List user's documents
       Query params: ?sort=selectionTime|updatedAt&limit=20&page=1
       
POST   /api/documents             # Create new document
       Body: { title, section, content, keywords }
       
GET    /api/documents/:id         # Get specific document
       
PUT    /api/documents/:id         # Update document
       Body: { title, section, content, keywords }
       
DELETE /api/documents/:id         # Delete document (owner only)
       
PUT    /api/documents/:id/selection
                                  # Update selection time
```

### Sharing Endpoints

```
POST   /api/documents/:id/share   # Generate share code (owner only)
       
GET    /api/documents/shared/:code
                                  # Preview shared document (public)
       
POST   /api/documents/shared/:code/join
                                  # Join shared document
       
PUT    /api/documents/:documentId/collaborators/:userId
                                  # Change participant role (owner only)
       Body: { role: 'reader' | 'editor' }
       
DELETE /api/documents/:documentId/collaborators/:userId
                                  # Remove participant (owner only)
```

### Email Invitation Endpoints

```
POST   /api/share/invite          # Send email invitation
       Body: { documentId, email, role }
       
GET    /api/share/invites         # Get pending invites
       
POST   /api/share/accept          # Accept invitation
       Body: { inviteId }
       
POST   /api/share/reject          # Reject invitation
       Body: { inviteId }
```

---

## Real-Time Collaboration

### Socket.IO Events

#### Client to Server Events

```javascript
joinDocument              // Join document room
  { documentId }
  
leaveDocument            // Leave document room
  { documentId }
```

#### Server to Client Events

```javascript
documentUpdated          // Document content changed
  { document: {...} }
  
documentDeleted          // Document removed
  { documentId }
  
participantsChanged      // Collaborator list updated
  { documentId, participants: [...] }
  
participantJoined        // New collaborator joined
  { documentId, user: {...} }
  
documentShared           // Document shared status changed
  { documentId, isShared, shareCode }
```

### Real-Time Flow

**Document Edit Sequence:**

1. User edits content in DocumentFormModal
2. User clicks Save button
3. Client sends `PUT /api/documents/:id` request
4. Server validates user permissions (owner/editor)
5. Server updates document in MongoDB
6. Server sets `modifiedBy` and `updatedAt` fields
7. Server emits `documentUpdated` to room `document::<id>`
8. All connected clients in room receive update
9. Clients update local state and UI automatically
10. UI shows "Saved" status indicator

**Collaboration Join Sequence:**

1. User receives share code or email invite
2. User enters code in JoinDocument component
3. Client calls `POST /api/documents/shared/:code/join`
4. Server validates code and adds user to collaborators
5. Server emits `participantJoined` event
6. All active participants see new collaborator in list
7. New collaborator gains access based on assigned role

---

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager
- Git for version control

### Step-by-Step Installation

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/docsmaster.git
cd docsmaster
```

#### 2. Install Server Dependencies

```bash
cd server
npm install
```

#### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

#### 4. Configure Environment Variables

Create `.env` file in server directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/docsmaster

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration (for invites)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@docsmaster.com

# Socket.IO
SOCKET_ORIGIN=http://localhost:3000

# Security
BCRYPT_ROUNDS=10
```

Create `.env` file in client directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

#### 5. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud connection
# Update MONGO_URI in server .env file
```

#### 6. Run Development Servers

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm start
```

Application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## Environment Variables

### Server Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port number | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/docsmaster |
| JWT_SECRET | Secret key for JWT signing | your_secret_key |
| JWT_EXPIRE | JWT expiration time | 7d |
| EMAIL_HOST | SMTP server host | smtp.gmail.com |
| EMAIL_PORT | SMTP server port | 587 |
| EMAIL_USER | Email account username | your-email@gmail.com |
| EMAIL_PASSWORD | Email account password | app-password |
| SOCKET_ORIGIN | Allowed Socket.IO origin | http://localhost:3000 |

### Client Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API base URL | http://localhost:5000 |
| REACT_APP_SOCKET_URL | Socket.IO server URL | http://localhost:5000 |

---

## Usage Guide

### Creating Your First Document

1. **Register/Login** to the application
2. Click **"Create Document"** button on Dashboard or DocsBoard
3. Fill in document details:
   - Title (required)
   - Section/Subject (optional)
   - Content (required)
   - Keywords/Tags (optional)
4. Click **"Save"** - document auto-saves with timestamp
5. Document appears in your DocsBoard

### Sharing Documents

**Method 1: Share Code**
1. Open document in viewer
2. Click **"Share"** button
3. System generates unique share code
4. Copy and send code to collaborators
5. Recipients use **"Join by Code"** to access

**Method 2: Email Invite**
1. Open document ParticipantsManager
2. Enter collaborator email address
3. Select role (Reader/Editor)
4. Click **"Send Invite"**
5. Recipient receives email with join link

### Managing Collaborators

**Change Roles:**
- Open document
- Navigate to Participants section
- Click role dropdown next to collaborator name
- Select new role (Reader ↔ Editor)
- Changes apply immediately

**Remove Collaborators:**
- Open document (must be owner)
- Find collaborator in Participants list
- Click **"Remove"** button
- Confirm removal
- Collaborator loses access immediately

### Document Organization

**Using Keywords:**
- Add relevant tags during creation/editing
- Use consistent tag naming for better organization
- Filter board by clicking on tag chips
- Search documents by tag keywords

**Sections:**
- Group related documents by subject/section
- Use sections for project-based organization
- Filter documents by section in board view

---

## Security Features

### Authentication
- **JWT-based authentication** with secure token generation
- **Password hashing** using bcrypt (10 rounds)
- **Token expiration** with configurable timeout
- **Secure cookie options** for production (httpOnly, secure)

### Authorization
- **Role-based access control** (Owner, Editor, Reader)
- **Server-side permission validation** on all operations
- **Owner-only actions** for deletion and role management
- **Editor restrictions** for content modification only

### Data Protection
- **Input sanitization** to prevent XSS attacks
- **MongoDB injection prevention** via Mongoose
- **Secure share codes** (32+ character random tokens)
- **HTTPS enforcement** in production environment
- **CORS configuration** with allowed origins only

### Share Code Security
- Cryptographically secure random generation
- One-time use option (configurable)
- Expiration timestamps (TTL support)
- Rate limiting on share code generation

---

## Performance Optimization

### Database Optimization
- **Compound indexes** for common query patterns
- **Selective field projection** to reduce payload size
- **Query result pagination** for large collections
- **Connection pooling** for efficient DB connections

### Caching Strategy
- Browser caching for static assets
- API response caching for read-heavy operations
- Client-side state caching for frequently accessed data

### Socket.IO Optimization
- Room-based broadcasting to reduce network traffic
- Redis adapter for horizontal scaling (production)
- Connection pooling and reconnection handling
- Event debouncing for high-frequency updates

### Frontend Performance
- Code splitting for faster initial load
- Lazy loading of components and routes
- Debounced search and filter operations
- Virtual scrolling for large document lists

---

## Testing

### Unit Tests
```bash
# Server unit tests
cd server
npm test

# Client unit tests
cd client
npm test
```

### API Tests
```bash
# Run API integration tests
cd server
npm run test:api
```

### Test Coverage
```bash
# Generate coverage report
npm run test:coverage
```

---

## Deployment

### Production Build

**Client:**
```bash
cd client
npm run build
```

**Server:**
```bash
cd server
npm run build  # if using TypeScript
```

### Deployment Checklist

- [ ] Set all environment variables
- [ ] Configure production MongoDB connection
- [ ] Enable HTTPS/SSL certificates
- [ ] Set secure JWT_SECRET
- [ ] Configure CORS for production domain
- [ ] Enable request rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Configure logging (Morgan)
- [ ] Use process manager (PM2)
- [ ] Set up automatic backups
- [ ] Configure CDN for static assets
- [ ] Enable gzip compression

### Deployment Platforms

**Recommended Services:**
- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
- **Backend:** Heroku, AWS EC2, DigitalOcean, Render
- **Database:** MongoDB Atlas, AWS DocumentDB
- **File Storage:** AWS S3, Cloudinary

---

## Future Roadmap

### Phase 1: Enhanced Collaboration
- **Real-time collaborative editing** with CRDT/OT algorithms
- **Cursor presence** showing collaborator positions
- **Comment system** for document feedback
- **Mention system** to tag collaborators
- **Activity feed** showing document history

### Phase 2: Rich Content
- **Rich text editor** (Slate/ProseMirror integration)
- **Markdown support** with live preview
- **Image uploads** and embedding
- **File attachments** (PDF, DOCX)
- **Code syntax highlighting** for technical docs
- **Tables and charts** support

### Phase 3: AI Integration
- **AI-powered summarization** using GPT models
- **Auto-outline generation** from content
- **Grammar and style checking**
- **Smart keyword suggestions**
- **Content improvement recommendations**
- **Translation services**

### Phase 4: Advanced Features
- **Document versioning** with diff view
- **Offline editing** with sync queue
- **Export options** (PDF, DOCX, Markdown)
- **Import from** Google Docs, Word
- **Templates library** for common document types
- **Advanced search** with full-text indexing

### Phase 5: Enterprise Features
- **Team workspaces** with hierarchical organization
- **Admin dashboard** for user management
- **Audit logs** for compliance
- **SSO integration** (OAuth, SAML)
- **Advanced permissions** (folder-level access)
- **Usage analytics** and reporting

---

## Contributing

We welcome contributions from the community! Please follow these guidelines:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Write/update tests
5. Ensure code passes linting (`npm run lint`)
6. Commit changes (`git commit -m 'Add AmazingFeature'`)
7. Push to branch (`git push origin feature/AmazingFeature`)
8. Open a Pull Request

### Code Standards
- Follow ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments for functions
- Maintain test coverage above 80%
- Update documentation for new features

### Reporting Issues
- Use GitHub Issues for bug reports
- Provide detailed reproduction steps
- Include system information
- Add relevant error messages/logs

---

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

## Acknowledgments

**Academic Guidance:**
- Prof. Siddharth P. Shah - Project Supervisor
- Dr. C.K. Bhensdadia - Head of Department
- Department of Computer Engineering, Dharmsinh Desai University

**Technology Credits:**
- React Team for the amazing UI library
- MongoDB for the flexible database solution
- Socket.IO for real-time communication
- Express.js for the robust backend framework
- The open-source community for invaluable tools and libraries

---

## Contact & Support

**Developer:** Romil Jitendrabhai Rabadiya  
**Email:** romil.rabadiya@example.com  
**Institution:** Dharmsinh Desai University  
**Department:** Computer Engineering  

For issues, questions, or feature requests, please open an issue on GitHub or contact the development team.

---

## Project Status

**Current Version:** 1.0.0  
**Status:** Active Development  
**Last Updated:** 2025  

This project is being actively developed as part of the Advanced Technologies course (23CE520) at Dharmsinh Desai University.

---

**Built with ❤️ by Romil Rabadiya**