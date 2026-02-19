const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
const Employee = require('../models/Employee');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (imageSource) => {
  try {
    const result = await cloudinary.uploader.upload(imageSource, {
      folder: 'comp3133_employees',
    });
    return result.secure_url;
  } catch (err) {
    throw new Error('Cloudinary upload failed: ' + err.message);
  }
};

const resolvers = {
  Query: {
    // Login - allow user to access the system using username or email + password
    login: async (_, { usernameOrEmail, password }) => {
      if (!usernameOrEmail || !password) {
        throw new Error('Username/email and password are required');
      }

      const user = await User.findOne({
        $or: [
          { username: usernameOrEmail },
          { email: usernameOrEmail.toLowerCase() },
        ],
      });

      if (!user) {
        throw new Error('User not found. Invalid username or email.');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Incorrect password.');
      }

      return {
        message: 'Login successful',
        user,
      };
    },

    // Get all employees
    getAllEmployees: async () => {
      return await Employee.find();
    },

    // Search employee by employee id
    searchEmployeeById: async (_, { eid }) => {
      const employee = await Employee.findById(eid);
      if (!employee) {
        throw new Error('Employee not found with id: ' + eid);
      }
      return employee;
    },

    // Search employee by designation or department
    searchEmployeeByDesignationOrDepartment: async (_, { designation, department }) => {
      if (!designation && !department) {
        throw new Error('Please provide designation or department to search');
      }

      const query = {};
      if (designation) query.designation = designation;
      if (department) query.department = department;

      return await Employee.find(query);
    },
  },

  Mutation: {
    // Signup - allow user to create new account
    signup: async (_, { username, email, password }) => {
      if (!username || !email || !password) {
        throw new Error('Username, email, and password are required');
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please provide a valid email address');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const existingUser = await User.findOne({
        $or: [{ username }, { email: email.toLowerCase() }],
      });
      if (existingUser) {
        throw new Error('User already exists with that username or email');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
      });

      return await user.save();
    },

    // Add new employee and store profile picture on Cloudinary
    addEmployee: async (_, { first_name, last_name, email, gender, designation, salary, date_of_joining, department, employee_photo }) => {
      if (!first_name || !last_name || !email || !designation || !salary || !date_of_joining || !department) {
        throw new Error('first_name, last_name, email, designation, salary, date_of_joining, and department are required');
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please provide a valid email address');
      }

      if (salary < 1000) {
        throw new Error('Salary must be at least 1000');
      }

      if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
        throw new Error('Gender must be Male, Female, or Other');
      }

      const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
      if (existingEmployee) {
        throw new Error('Employee already exists with this email');
      }

      let photoUrl = null;
      if (employee_photo) {
        photoUrl = await uploadToCloudinary(employee_photo);
      }

      const employee = new Employee({
        first_name,
        last_name,
        email: email.toLowerCase(),
        gender,
        designation,
        salary,
        date_of_joining: new Date(date_of_joining),
        department,
        employee_photo: photoUrl,
      });

      return await employee.save();
    },

    // Update employee by employee id
    updateEmployee: async (_, { eid, first_name, last_name, email, gender, designation, salary, date_of_joining, department, employee_photo }) => {
      const employee = await Employee.findById(eid);
      if (!employee) {
        throw new Error('Employee not found with id: ' + eid);
      }

      if (email) {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Please provide a valid email address');
        }
        const duplicate = await Employee.findOne({ email: email.toLowerCase(), _id: { $ne: eid } });
        if (duplicate) {
          throw new Error('Another employee already exists with this email');
        }
      }

      if (salary !== undefined && salary < 1000) {
        throw new Error('Salary must be at least 1000');
      }

      if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
        throw new Error('Gender must be Male, Female, or Other');
      }

      const updateFields = {};
      if (first_name) updateFields.first_name = first_name;
      if (last_name) updateFields.last_name = last_name;
      if (email) updateFields.email = email.toLowerCase();
      if (gender) updateFields.gender = gender;
      if (designation) updateFields.designation = designation;
      if (salary !== undefined) updateFields.salary = salary;
      if (date_of_joining) updateFields.date_of_joining = new Date(date_of_joining);
      if (department) updateFields.department = department;
      if (employee_photo) updateFields.employee_photo = await uploadToCloudinary(employee_photo);

      return await Employee.findByIdAndUpdate(eid, updateFields, { new: true });
    },

    // Delete employee by employee id
    deleteEmployee: async (_, { eid }) => {
      const employee = await Employee.findById(eid);
      if (!employee) {
        throw new Error('Employee not found with id: ' + eid);
      }

      await Employee.findByIdAndDelete(eid);

      return 'Employee with id ' + eid + ' deleted successfully';
    },
  },
};

module.exports = resolvers;
