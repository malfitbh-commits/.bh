const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = 3000;
app.use(cors({
    origin: '*', 
    methods: 'POST',
}));
app.use(express.json());
const mockNotificationsDB = {
    '1': { is_read: false, owner: 1 }, 
    '2': { is_read: false, owner: 1 }, 
    '3': { is_read: true, owner: 2 } 
};
const updateNotificationStatus = async (notificationId, userId) => {
    const notification = mockNotificationsDB[notificationId];
    if (!notification || notification.owner !== userId) {
        return { rowCount: 0 }; 
    }
    if (notification.is_read === true) {
        console.log(`Notification ID ${notificationId} is already read.`);
    } else {
        notification.is_read = true;
        console.log(`[DB SUCCESS] Notification ID ${notificationId} marked as READ.`);
    }
    return { rowCount: 1 }; 
};

app.post('/api/mark-read', async (req, res) => {
    const AUTH_USER_ID = 1; 
    const { id: notificationId } = req.body;
    if (!notificationId) {
        return res.status(400).json({ success: false, message: 'Notification ID is missing.' });
    }
    try {
        const result = await updateNotificationStatus(notificationId, AUTH_USER_ID);

        if (result.rowCount > 0) {
            return res.json({ 
                success: true, 
                message: 'Notification status updated.',
                notificationId: notificationId
            });
        } else {
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

app.listen(PORT, () => {
    console.log(`\n🎉 MALFIT Backend Server is running at http://localhost:${PORT}`);
    console.log(`💡 Remember to run 'node server.js' and open your notification.html in your browser.\n`);
});
