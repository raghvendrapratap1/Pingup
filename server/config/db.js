import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log("🔌 Attempting to connect to MongoDB...");
        console.log("📍 MongoDB URL:", process.env.MONGODB_URL);

        if (!process.env.MONGODB_URL) {
            throw new Error("MongoDB URL is not defined in .env file");
        }

        // Set up connection event listeners
        mongoose.connection.on("connected", () => {
            console.log("✅ MongoDB connected successfully");
        });

        mongoose.connection.on("error", (err) => {
            console.error("❌ MongoDB connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("⚠️ MongoDB disconnected");
        });

        // Attempt to connect
        await mongoose.connect(process.env.MONGODB_URL);
        
        // Verify connection is active
        if (mongoose.connection.readyState === 1) {
            console.log("✅ Database connection verified and ready");
            return true;
        } else {
            throw new Error("Database connection not ready");
        }

    } catch (err) {
        console.error("❌ Critical error while connecting to DB:", err.message);
        console.error("❌ Server cannot start without database connection");
        process.exit(1); // Exit the process if DB connection fails
    }
};

export default connectDB;
