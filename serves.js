/**
 * MALFIT Application Backend Server
 * Technology: Node.js (Express Framework)
 * Description: Handles API routes, including the logic for marking notifications as read.
 */

// --- 1. CORE MODULES & SETUP ---

const express = require('express');
const cors = require('cors'); 

const app = express();
const PORT = 3000;

// --- 2. MIDDLEWARE CONFIGURATION ---

// Set up Cross-Origin Resource Sharing (CORS)
// IMPORTANT: This allows your HTML file (running locally) to send requests to this server.
app.use(cors({
    // Replace this with the actual URL where your notification.html is served from (e.g., http://localhost:8080 or http://127.0.0.1:5500)
    origin: '*', 
    methods: 'POST',
}));

// Middleware to parse incoming JSON payload (body) from fetch requests
app.use(express.json());


// --- 3. DATABASE (DB) SIMULATION LAYER ---
// NOTE: This section replaces the need for a real database connection (like MySQL or MongoDB) for this example.
// In a real application, you would import a 'db' module here.

const mockNotificationsDB = {
    // Structure: { [notification_id]: { is_read: Boolean, owner: user_id } }
    '1': { is_read: false, owner: 1 }, // Unread notification for user 1
    '2': { is_read: false, owner: 1 }, // Another unread for user 1
    '3': { is_read: true, owner: 2 }   // Read notification for user 2
};

/**
 * Simulates updating the 'is_read' status in the database.
 * @param {string} notificationId - ID from the request.
 * @param {number} userId - Authenticated user ID.
 * @returns {Promise<{rowCount: number}>} - The result of the update operation.
 */
const updateNotificationStatus = async (notificationId, userId) => {
    // --- AUTHENTICATION & VALIDATION ---
    const notification = mockNotificationsDB[notificationId];

    if (!notification || notification.owner !== userId) {
        return { rowCount: 0 }; // Notification not found or user is not the owner
    }

    // --- DB UPDATE LOGIC ---
    if (notification.is_read === true) {
        console.log(`Notification ID ${notificationId} is already read.`);
    } else {
        // Simulate a successful update query
        notification.is_read = true;
        console.log(`[DB SUCCESS] Notification ID ${notificationId} marked as READ.`);
    }
    
    return { rowCount: 1 }; 
};


// --- 4. API ROUTES ---

/**
 * POST /api/mark-read
 * Endpoint to update the read status of a notification.
 * Expected body: { "id": "1" }
 */
app.post('/api/mark-read', async (req, res) => {
    // *** SECURITY NOTE: User ID must come from secure session/token, not a client-side guess. ***
    const AUTH_USER_ID = 1; // Assuming User ID 1 is logged in for testing purposes

    const { id: notificationId } = req.body;

    if (!notificationId) {
        return res.status(400).json({ success: false, message: 'Notification ID is missing.' });
    }

    try {
        const result = await updateNotificationStatus(notificationId, AUTH_USER_ID);

        if (result.rowCount > 0) {
            // Success response
            return res.json({ 
                success: true, 
                message: 'Notification status updated.',
                notificationId: notificationId
            });
        } else {
            // Failure: Notification not found or user unauthorized
            return res.status(404).json({ 
                success: false, 
                message: 'Notification not found or access is denied.' 
            });
        }

    } catch (error) {
        console.error('SERVER ERROR during /api/mark-read:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


// --- 5. SERVER STARTUP ---

app.listen(PORT, () => {
    console.log(`\n🎉 MALFIT Backend Server is running at http://localhost:${PORT}`);
    console.log(`💡 Remember to run 'node server.js' and open your notification.html in your browser.\n`);
});
