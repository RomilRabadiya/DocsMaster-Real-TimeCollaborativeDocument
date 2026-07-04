# DocsMaster - Real-Time Collaborative Document Editor

DocsMaster is a real-time collaborative document editing platform that allows multiple users to edit documents simultaneously, see each other's changes in real-time, and manage document access.

## 🚀 Tech Stack

*   **Frontend**: React.js, Socket.IO-client
*   **Backend**: Java, Spring Boot, Netty-SocketIO (for WebSocket communication)
*   **Database**: PostgreSQL
*   **Authentication**: Spring Security, JWT (JSON Web Tokens)

## ✨ Features

*   **Real-time Collaboration**: Multiple users can edit the same document concurrently with changes reflected instantly across all connected clients.
*   **User Authentication**: Secure user registration and login.
*   **Document Management**: Create, read, update, and delete documents.
*   **Sharing and Permissions**: Share documents with specific users by adding them as collaborators.

## 🛠️ Getting Started

### Prerequisites

*   Node.js (v14 or higher) and npm (for the React client)
*   Java Development Kit (JDK) 17 or higher
*   Maven (or you can use the included `mvnw` wrapper)
*   PostgreSQL database

### Backend Setup (Spring Boot)

1.  Navigate to the `server-spring` directory:
    ```bash
    cd server-spring
    ```

2.  Update the database credentials in `src/main/resources/application.properties`:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/your_database_name
    spring.datasource.username=your_username
    spring.datasource.password=your_password
    ```

3.  Run the Spring Boot application:
    ```bash
    ./mvnw spring-boot:run
    ```
    The backend API will run on `http://localhost:8080`, and the Socket.IO server will run on `http://localhost:9092`.

### Frontend Setup (React)

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```

2.  Install the dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm start
    ```
    The frontend will be available at `http://localhost:3000`.

## 🏗️ Architecture

This project was recently migrated from an Express.js backend to a robust **Spring Boot** architecture. It uses Spring MVC for REST API requests (Authentication, Document CRUD operations) and a dedicated Netty-SocketIO server to manage persistent WebSocket connections for real-time document syncing. The React frontend communicates with the REST API for standard operations and establishes a WebSocket connection for live collaborative editing.