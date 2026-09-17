const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers to resolve MongoDB SRV records on Windows/local ISP
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // Ignore in environments where custom DNS servers cannot be set
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
