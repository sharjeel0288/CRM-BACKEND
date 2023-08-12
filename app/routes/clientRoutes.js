// app/routes/clientRoutes.js

const express = require('express');
const clientController = require('../controllers/clientController');
const validation = require('../utils/validation');

const router = express.Router();

router.get('/clients', clientController.getAllClients);

// Update the route to use getClientById function
router.get('/clients/:id', clientController.getClientById);

router.post('/clients', validation.validateClient, clientController.addClient);
router.put('/clients/:id', clientController.modifyClient);
router.delete('/clients/:id', clientController.deleteClient);

module.exports = router;
