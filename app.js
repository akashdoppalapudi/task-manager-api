import express from 'express';
import bodyParser from 'body-parser';

const app = express();

// Load in the mongoose models
import List from './db/models/List.model.js';
import Task from './db/models/Task.model.js';

import mongoose from './db/mongoose.js';

// Load Middleware
app.use(bodyParser.json());

/* Route Handlers */

/* List Routes */

/**
 * GET /lists
 * Purpose: Get all lists
 */

app.get('/lists', (req, res) => {
	// return an array of all the lists in the database
	List.find({}).then((lists) => {
		res.send(lists);
	});
});

/**
 * POST /lists
 * Purpose: Create a list
 */

app.post('/lists', (req, res) => {
	// create a list and return the document back to user (including the ID)
	// Th list information (fields) will be passed in via the JSON request body
	let title = req.body.title;

	let newList = new List({
		title,
	});
	newList.save().then((listDoc) => {
		// full list doc is returned
		res.send(listDoc);
	});
});

/**
 * PATCH /lists/:id
 * Purpose: Update a specified list
 */

app.patch('/lists/:id', (req, res) => {
	// Update the specified list (list document with id specified in url) with the new values specified in JSON request body
	List.findOneAndUpdate(
		{ _id: req.params.id },
		{
			$set: req.body,
		}
	).then(() => {
		res.sendStatus(200);
	});
});

/**
 * DELETE /lists/:id
 * Purpose: Delete a specified list
 */

app.delete('/lists/:id', (req, res) => {
	// Delete the specified list (list document with id specified in url)
	List.findOneAndRemove({ _id: req.params.id }).then((removedListDoc) => {
		res.send(removedListDoc);
	});
});

/* List Routes */

/**
 * GET /lists/:listId/tasks
 * Purpose: Get all tasks in a specific list
 */

app.get('/lists/:listId/tasks', (req, res) => {
	// return all tasks that belong to a specific list
	Task.find({ _listId: req.params.listId }).then((tasks) => {
		res.send(tasks);
	});
});

app.listen(3000, () => {
	console.log('Server Running on http://localhost:3000/');
});
