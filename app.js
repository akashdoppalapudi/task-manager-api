import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

const app = express();
dotenv.config();

const PORT = process.env.PORT; // getting port from the env

// Load in the mongoose models
import List from './db/models/List.model.js';
import Task from './db/models/Task.model.js';
import User from './db/models/User.model.js';

import mongoose from './db/mongoose.js';

// Load Middleware
app.use(bodyParser.json());

// CORS headers middleware
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
	res.header(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS'
	);
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	);
	next();
});

// Verify referesh token middleware
let verifySession = (req, res, next) => {
	// grab the refresh token from the request header
	let refreshToken = req.header('x-refresh-token');

	// grab the _id from the request header
	let _id = req.header('_id');

	User.findByIdAndToken(_id, refreshToken)
		.then((user) => {
			if (!user) {
				// user couldn't be found
				return Promise.reject({
					error:
						'User not found. Make sure that the refresh token and user id are correct',
				});
			}

			// if the code reaches here - the user was found
			// therefore the refresh token exists in the database - but we still have to check if it has expired or not

			req.user_id = user._id;
			req.userObject = user;
			req.refreshToken = refreshToken;

			let isSessionValid = false;

			user.sessions.forEach((session) => {
				if (session.token === refreshToken) {
					// check if the session has expired
					if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
						// refresh token has not expired
						isSessionValid = true;
					}
				}
			});

			if (isSessionValid) {
				// the session is VALID - call next() to continue with processing this web request
				next();
			} else {
				// the session is not valid
				return Promise.reject({
					error: 'Refresh token has expired or the session is invalid',
				});
			}
		})
		.catch((e) => {
			res.status(401).send(e);
		});
};

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
		res.send({ message: 'Updated Successfully' });
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
		res.send({ message: 'Updated Successfully' });
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

/* User Routes */

/**
 * POST /users
 * Purpose: Sign Up
 */
app.post('/users', (req, res) => {
	// User Signup
	let body = req.body;
	let newUser = new User(body);

	newUser
		.save()
		.then(() => {
			return newUser.createSession();
		})
		.then((refreshToken) => {
			return newUser.generateAccessAuthToken().then((accessToken) => {
				return { accessToken, refreshToken };
			});
		})
		.then((authTokens) => {
			res
				.header('x-refresh-token', authTokens.refreshToken)
				.header('x-access-token', authTokens.accessToken)
				.send(newUser);
		})
		.catch((error) => {
			res.status(400).send(error);
		});
});

/**
 * POST /users/login
 * Purpose: Login
 */
app.post('/users/login', (req, res) => {
	let email = req.body.email;
	let password = req.body.password;

	User.findByCredentials(email, password).then((user) => {
		return user
			.createSession()
			.then((refreshToken) => {
				return user.generateAccessAuthToken().then((accessToken) => {
					return { accessToken, refreshToken };
				});
			})
			.then((authTokens) => {
				res
					.header('x-refresh-token', authTokens.refreshToken)
					.header('x-access-token', authTokens.accessToken)
					.send(user);
			})
			.catch((error) => {
				res.status(400).send(error);
			});
	});
});

/**
 * GET /users/me/access-token
 * Purpose: Generates and returns an access token
 */
app.get('/users/me/access-token', verifySession, (req, res) => {
	// we know that the user/caller is authenticated and we have the user_id and user object available to us
	req.userObject
		.generateAccessAuthToken()
		.then((accessToken) => {
			res.header('x-access-token', accessToken).send({ accessToken });
		})
		.catch((e) => {
			res.status(400).send(e);
		});
});

app.listen(PORT, () => {
	console.log(`Server Running on port: ${PORT}`);
});
