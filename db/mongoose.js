// Handle the connection to the MongoDB Database
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.Promise = global.Promise;
mongoose
	.connect(process.env.CONNECTION_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(() => {
		console.log('Successfully connected to MongoDB :)');
	})
	.catch((error) => {
		console.log('Error While connecting to MongoDB');
		console.log(error);
	});

export default mongoose;
