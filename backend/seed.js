const express        = require('express');
const mongoose       = require('mongoose');
const dotenv         = require('dotenv');

dotenv.config();

const User           = require('./models/User');
const Project        = require('./models/Project');
const Progress       = require('./models/Progress');
const RolePermission = require('./models/RolePermission');
const AuditLog       = require('./models/AuditLog');
const { ROLE_DEFAULTS } = require('./config/permissions');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Project.deleteMany({});
    await Progress.deleteMany({});
    await RolePermission.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Cleared existing data');

    // Seed role permissions
    for (const [role, permissions] of Object.entries(ROLE_DEFAULTS)) {
      await RolePermission.create({ role, permissions });
    }
    console.log('Role permissions seeded');

    // Super Admin
    const superAdmin = await User.create({
      name:     'Super Admin',
      email:    'superadmin@fui.edu.pk',
      password: 'SuperAdmin@123',
      role:     'superadmin',
    });

    // Admin
    const admin = await User.create({
      name:     'Admin',
      email:    'admin@fui.edu.pk',
      password: 'Admin@123',
      role:     'admin',
    });

    // Supervisors
    const sup1 = await User.create({
      name:        'Sir Asad Javed',
      email:       'asad@fui.edu.pk',
      password:    'Asad@123',
      role:        'supervisor',
      designation: 'Lecturer',
      field:       'Information Technology',
      phone:       '03001234567',
      isActive:    true,
    });

    const sup2 = await User.create({
      name:        'Mam Saima Khan',
      email:       'saima@fui.edu.pk',
      password:    'Saima@123',
      role:        'supervisor',
      designation: 'Lecturer',
      field:       'Artificial Intelligence',
      phone:       '03661234567',
      isActive:    true,
    });

    // Students
    const stu1 = await User.create({
      name:        'Muhammad Abdullah Malik',
      email:       'abdullah@fui.edu.pk',
      password:    'Abdullah@123',
      role:        'student',
      rollNo:      '025',
      department:  'IET',
      batch:       '2022',
      semester:    '4A',
      supervisorId: sup1._id,
    });

    const stu2 = await User.create({
      name:        'Mahnoor Shah',
      email:       'mahnoor@fui.edu.pk',
      password:    'Mahnoor@123',
      role:        'student',
      rollNo:      '021',
      department:  'IET',
      batch:       '2022',
      semester:    '4A',
      supervisorId: sup2._id,
    });

    const stu3 = await User.create({
      name:        'Humera Mumtaz',
      email:       'humera@fui.edu.pk',
      password:    'Humera@123',
      role:        'student',
      rollNo:      '014',
      department:  'IET',
      batch:       '2022',
      semester:    '4A',
      supervisorId: sup1._id,
    });

    // Sample project
    await Project.create({
      title:       'FYP Management System',
      description: 'A full-stack MERN web application to manage Final Year Projects at Foundation University Islamabad, supporting Admin, Student, and Supervisor roles.',
      studentId:   stu1._id,
      supervisorId: sup1._id,
      status:      'pending',
    });

    console.log('\n✓ Database seeded successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('  SUPER ADMIN');
    console.log('  Email   : superadmin@fui.edu.pk');
    console.log('  Password: SuperAdmin@123');
    console.log('───────────────────────────────────────');
    console.log('  ADMIN');
    console.log('  Email   : admin@fui.edu.pk');
    console.log('  Password: Admin@123');
    console.log('───────────────────────────────────────');
    console.log('  SUPERVISORS');
    console.log('  Sir Asad  → asad@fui.edu.pk    / Asad@123');
    console.log('  Mam Saima → saima@fui.edu.pk   / Saima@123');
    console.log('───────────────────────────────────────');
    console.log('  STUDENTS');
    console.log('  Abdullah  → abdullah@fui.edu.pk / Abdullah@123');
    console.log('  Mahnoor   → mahnoor@fui.edu.pk  / Mahnoor@123');
    console.log('  Humera    → humera@fui.edu.pk   / Humera@123');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
