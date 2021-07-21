import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		minLength: 1,
		trim: true,
	},
	_listId: {
		type: mongoose.Types.ObjectId,
		required: true,
	},
});

const Task = mongoose.model('Task', TaskSchema);

export default Task;
