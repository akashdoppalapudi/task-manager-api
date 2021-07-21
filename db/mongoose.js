// Handle the connection to the MongoDB Database
import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
mongoose
	.connect(
		'mongodb+srv://akashdoppalapudi:Akash@1729@cluster0.v7l6s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => {
		console.log('Successfully connected to MongoDB :)');
	})
	.catch((error) => {
		console.log('Error While connecting to MongoDB');
		console.log(error);
	});

export default mongoose;
