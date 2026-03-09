// backend/routes/connection.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const connectionController = require('../controllers/connectionController');

router.post('/send', auth, connectionController.sendRequest);
router.get('/list', auth, connectionController.listRequests);
router.post('/accept', auth, connectionController.acceptRequest);
router.post('/decline', auth, connectionController.declineRequest);
router.post('/cancel', auth, connectionController.cancelRequest);

module.exports = router;
