require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Startup = require('./models/Startup');
const Comment = require('./models/Comment');
const connectDB = require('./config/db');

async function checkData() {
  await connectDB();
  
  const userCount = await User.countDocuments();
  const startupCount = await Startup.countDocuments();
  const commentCount = await Comment.countDocuments();
  
  console.log('\n=== Database Status ===');
  console.log(`Users: ${userCount}`);
  console.log(`Startups: ${startupCount}`);
  console.log(`Comments: ${commentCount}`);
  
  if (startupCount > 0) {
    const sampleStartup = await Startup.findOne().populate('author', 'username').lean();
    console.log('\n=== Sample Startup ===');
    console.log(`Name: ${sampleStartup.name}`);
    console.log(`Author: ${sampleStartup.author?.username || 'N/A'}`);
    console.log(`Upvotes: ${sampleStartup.upvotes?.length || 0}`);
    console.log(`Comments: ${sampleStartup.commentCount || 0}`);
  }
  
  process.exit(0);
}

checkData().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
