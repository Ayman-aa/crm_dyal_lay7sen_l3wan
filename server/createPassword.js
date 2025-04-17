const bcrypt = require('bcryptjs');

// Create an async function to use await
async function generatePassword() {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    console.log("Use this hash:", hashedPassword);
  } catch (error) {
    console.error("Error generating password:", error);
  }
}

// Call the async function
generatePassword();
db.users.insertOne({
    name: "Test Employer",
    email: "employer@test.com",
    password: "$2b$10$UFuGd38fzm3VTokqIE9Wvef2edZRGPkuqzuXHMR7FvGSPA4nJgGRm",
    role: "employer",
    createdAt: new Date()
  })