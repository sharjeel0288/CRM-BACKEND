// app\controllers\clientController.js
const Client = require('../model/Client');

// Add a new client
const addClient = async (req, res) => {
  try {
    const newClientId = await Client.addClient(req.body);
    const newClient = { id: newClientId, ...req.body };
    res.status(201).json({ success: true, message: 'Client added successfully', data: newClient });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a client by ID
const deleteClient = async (req, res) => {
  try {
    const deletedClient = await Client.deleteClient(req.params.id);
    if (!deletedClient) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    res.json({ success: true, message: 'Client deleted successfully', data: deletedClient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Modify a client by ID
const modifyClient = async (req, res) => {
  try {
    const updatedClient = await Client.updateClient(req.params.id, req.body, { new: true });
    if (!updatedClient) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    res.json({ success: true, message: 'Client updated successfully', data: updatedClient });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all clients
const getAllClients = async (req, res) => {
  try {
    const clients = await Client.getAllClients();
    res.json({ success: true, data: clients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get a client by name or email
const getClientByNameOrEmail = async (req, res) => {
  try {
    const { fname, email } = req.query;
    const client = await Client.getClientByNameOrEmail(fname, email);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    res.json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get a client by ID
const getClientById = async (req, res) => {
  try {
    const clientId = req.params.id;
    const client = await Client.getClientById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while fetching the client.' });
  }
};

module.exports = {
  addClient,
  deleteClient,
  getAllClients,
  modifyClient,
  getClientByNameOrEmail,
  getClientById,
};




// Modify a client by ID (PUT request):

// URL: http://localhost:3000/api/client/:id
// Method: PUT
// Replace :id in the URL with the ID of the client you want to modify.
// Body (JSON format): Include the updated client data in the request body.


