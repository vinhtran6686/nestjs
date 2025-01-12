import mongoose from 'mongoose';
import { config } from 'dotenv';
config();

const migrate = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Get users collection
    const User = mongoose.connection.collection('users');

    // Update all documents that don't have isDeleted field
    const result = await User.updateMany(
      { isDeleted: { $exists: false } },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
        },
      },
    );

    console.log(
      `Migration completed. Updated ${result.modifiedCount} documents`,
    );
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

migrate();
