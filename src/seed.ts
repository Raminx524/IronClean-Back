import mongoose from "mongoose";
import User from "./models/User";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import connectDB from "./config/db";

dotenv.config();

const seedDatabase = async () => {
  await connectDB();

  try {
    await User.deleteMany({});

    console.log("Previous data cleared");

    // Creating Users
    const users = [
      {
        username: "Dima",
        email: "dima@example.com",
        password: "123",
        imgUrl: "Dima.jpeg",
      },
      {
        username: "david",
        email: "david@example.com",
        password: "password4",
        imgUrl: "userPlaceHolder.avif",
      },
      {
        username: "eva",
        email: "eva@example.com",
        password: "password5",
        imgUrl: "userPlaceHolder.avif",
      },
      {
        username: "frank",
        email: "frank@example.com",
        password: "password6",
        imgUrl: "userPlaceHolder.avif",
      },
      {
        username: "grace",
        email: "grace@example.com",
        password: "password7",
        imgUrl: "userPlaceHolder.avif",
      },
      {
        username: "henry",
        email: "henry@example.com",
        password: "password8",
        imgUrl: "userPlaceHolder.avif",
      },
    ];

    for (const user of users) {
      user.password = await bcrypt.hash(user.password, 10);
    }

    await User.insertMany(users);

    console.log("Database seeded successfully");
  } catch (err) {
    console.error("Error seeding database", err);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();
