import express from 'express';

const app = express();

/* Route Handlers */

/* List Routes */

/**
 * GET /lists
 * Purpose: Get all lists
 */

app.get('/lists', (req, res) => {
	// return an array of all the lists in the database
});

/**
 * POST /lists
 * Purpose: Create a list
 */

app.post('/lists', (req, res) => {
	// create a list and return the document back to user (including the ID)
	// Th list information (fields) will be passed in via the JSON request body
});

/**
 * PATCH /lists/:id
 * Purpose: Update a specified list
 */

app.patch('/lists/:id', (req, res) => {
	// Update the specified list (list document with id specified in url) with the new values specified in JSON request body
});

/**
 * DELETE /lists/:id
 * Purpose: Delete a specified list
 */

app.delete('/lists/:id', (req, res) => {
	// Delete the specified list (list document with id specified in url)
});

app.listen(3000, () => {
	console.log('Server Running on http://localhost:3000/');
});
