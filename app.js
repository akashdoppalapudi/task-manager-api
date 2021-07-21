import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

const app = express();
dotenv.config();

const PORT = process.env.PORT; // getting port from the env

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
	// The list information (fields) will be passed in via the JSON request body
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

/**
 * POST /lists/:listId/tasks
 * Purpose: Create a new task in the specified list
 */
app.post('/lists/:listId/tasks', (req, res) => {
	// create a new task  in list specified by listId
	let newTask = new Task({
		title: req.body.title,
		_listId: req.params.listId,
	});
	newTask.save().then((newTaskDoc) => {
		res.send(newTaskDoc);
	});
});

/**
 * PATCH /lists/:listId/tasks/:taskId
 * Purpose: Update a specified task in a specified list
 */
app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
	// Update a task (with specified id in url) in a specified list (with specified id in url)
	Task.findOneAndUpdate(
		{ _id: req.params.taskId, _listId: req.params.listId },
		{ $set: req.body }
	).then(() => {
		res.sendStatus(200);
	});
});

/**
 * DELETE /lists/:listId/tasks/:taskId
 * Purpose: Delete a specified task in a specified list
 */
app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
	// Delete a task (with specified id in url) in a specified list (with specified id in url)
	Task.findOneAndRemove({
		_id: req.params.taskId,
		_listId: req.params.listId,
	}).then((removedTaskDoc) => {
		res.send(removedTaskDoc);
	});
});

app.listen(PORT, () => {
	console.log(`Server Running on port: ${PORT}`);
});
