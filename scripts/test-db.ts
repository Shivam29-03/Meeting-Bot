import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "../src/lib/mongodb";
import Meeting from "../src/models/Meeting";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

async function testDatabase() {
  let meetingId: mongoose.Types.ObjectId | null = null;

  try {
    console.log("\n Starting MongoDB Connection Test...\n");

    // Connect to MongoDB
    await connectDB();
    console.log(" Connected to MongoDB Atlas\n");

    // -----------------------------
    // CREATE
    // -----------------------------
    console.log(" Creating test meeting...");

    const meeting = await Meeting.create({
      user_id: "test-user-001",
      bot_id: `test-bot-${Date.now()}`,
      meeting_url: "https://meet.google.com/test-abc-def",
      status: "requested",
    });

    meetingId = meeting._id;

    console.log(" Meeting Created");
    console.log(`   ID       : ${meeting._id}`);
    console.log(`   Status   : ${meeting.status}`);
    console.log(`   Created  : ${meeting.created_at}\n`);

    // -----------------------------
    // READ
    // -----------------------------
    console.log(" Reading meeting...");

    const foundMeeting = await Meeting.findById(meetingId);

    if (!foundMeeting) {
      throw new Error("Meeting not found.");
    }

    console.log(" Meeting Retrieved");
    console.log(`   URL      : ${foundMeeting.meeting_url}`);
    console.log(`   Bot ID   : ${foundMeeting.bot_id}`);
    console.log(`   User ID  : ${foundMeeting.user_id}\n`);

    // -----------------------------
    // UPDATE
    // -----------------------------
    console.log(" Updating meeting status...");

    foundMeeting.status = "joining";
    await foundMeeting.save();

    console.log(" Status Updated");
    console.log(`   New Status : ${foundMeeting.status}\n`);

    // -----------------------------
    // DELETE
    // -----------------------------
    console.log(" Deleting test meeting...");

    await Meeting.findByIdAndDelete(meetingId);

    console.log(" Meeting Deleted\n");

    console.log(" Database CRUD Test Passed Successfully!");
  } catch (error) {
    console.error("\n❌ Database Test Failed\n");
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 MongoDB Connection Closed");
    process.exit(0);
  }
}

testDatabase();