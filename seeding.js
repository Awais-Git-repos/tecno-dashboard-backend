const User = require("./Models/Admin");
const bcrypt = require("bcrypt");

const userInsertion = async () => {
  try {
    const email = "khizaryousuf72@gmail.com";
    const passwordPlain = "admin123";

    // Find if the admin already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Admin user already exists.");
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordPlain, salt);

    // Perform an atomic operation to insert the user if they don't exist
    const updatedUser = await User.findOneAndUpdate(
      { email }, // Filter for email
      { $setOnInsert: { email, password: hashedPassword } }, // Only insert new user, don't update if exists
      { upsert: true, new: true } // Create if it doesn't exist, return the created document
    );

    console.log("Admin user inserted:", updatedUser);
  } catch (error) {
    console.error("Error during seeding:", error.message);
  }
};

module.exports = userInsertion;
