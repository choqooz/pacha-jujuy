import mongoose from 'mongoose';

mongoose.set('strictQuery', false);
const connectDB = () => {
  try {
    mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
