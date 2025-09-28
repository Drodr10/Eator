# Eator: Real-Time Food Finder

Eator is a full-stack web application designed to help students and faculty at the University of Florida find free food available on campus. Users can drop a pin on a map to share the location of free food and see pins dropped by others in real-time. Each pin has a limited lifespan, ensuring that the information is always current.

## Features

*   **Interactive Map**: Utilizes Google Maps to display food locations across campus.
*   **Real-Time Pin Drops**: Users can add a pin with details about the food, its location, and how long it will be available.
*   **Automatic Expiration**: Pins are automatically removed from the map after their specified duration, thanks to a MongoDB TTL index.
*   **User Authentication**: Secure sign-up and login system using JWT (JSON Web Tokens) to ensure only registered users can add or manage pins.
*   **Geofencing**: Pins can only be dropped within the boundaries of the UF campus.
*   **Admin Controls**: Admin users have the ability to manage (edit or delete) any pin on the map.

## Tech Stack

*   **Frontend**: React, Vite, Axios, Google Maps API
*   **Backend**: Flask, Python, MongoDB
*   **Authentication**: JWT, Flask-Bcrypt
*   **Deployment**: Designed for services like Render, Vercel, or Heroku.

## Project Structure

```
/
├── backend/         # Flask API and server-side logic
│   ├── app.py       # Main Flask application
│   ├── .env         # Environment variables (MongoDB URI, Secret Key)
│   └── requirements.txt # Python dependencies
└── frontend/        # React client application
    ├── src/         # React components and source code
    ├── package.json # Node.js dependencies
    └── vite.config.js # Vite configuration
```

## Setup and Installation

To get Eator running on your local machine, follow these steps.

### Prerequisites

*   Node.js and npm
*   Python 3 and pip
*   A MongoDB Atlas account (or a local MongoDB instance)

### 1. Clone the Repository

```bash
git clone https://github.com/Drodr10/Eator.git
cd Eator
```

### 2. Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment and activate it:**
    ```bash
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create a `.env` file** in the `backend` directory and add your configuration:
    ```
    MONGO_URI=your_mongodb_connection_string
    SECRET_KEY=a_strong_and_secret_key_for_jwt
    ```

5.  **Run the backend server:**
    ```bash
    python app.py
    ```
    The Flask server will start on `http://127.0.0.1:5001`.

### 3. Frontend Setup

1.  **Open a new terminal** and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    The React app will be available at `http://localhost:5173`.

## Usage

1.  **Sign Up / Log In**: Create an account or log in to an existing one. You must be logged in to add a pin.
2.  **Add a Pin**: Click the "Add Pin" button. Fill in the description, location name, and duration. Click "Get Current Location" to capture your coordinates, then submit.
3.  **View Pins**: See all active food pins on the map. Click a pin to see its details and how much time is left before it expires.
4.  **Edit/Delete Pins**: If you created a pin, you can click on it to open an edit form or delete it. Admins can edit or delete any pin.
