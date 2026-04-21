const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    const hashedPassword = await bcrypt.hash('admin123', 10);

    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        joiningDate: new Date(),
        leaveBalance: 0
      });
      console.log('✅ Admin created successfully');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Password: admin123');
    } else {
      adminExists.name = adminExists.name || 'Admin User';
      adminExists.role = 'admin';
      adminExists.password = hashedPassword;
      await adminExists.save();
      console.log('⚠️ Admin already exists, credentials refreshed');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Password: admin123');
    }
    
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();