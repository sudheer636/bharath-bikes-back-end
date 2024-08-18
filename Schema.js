const mongoose = require("mongoose");

const UserLoginSchema = new mongoose.Schema({
  Username: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  UserId: {
    type: String,
    required: true,
    unique: true,
  },
});

const AdminLoginSchema = new mongoose.Schema({
  Username: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  }
});

const BikesSchema = new mongoose.Schema({
  JobId: {
    type: String,
    required: true,
    unique: true,
  },
  UserId: {
    type: String,
    required: true,
  },
  Bikename: {
    type: String,
    required: true,
  },
  Status: {
    type: String,
    enum: ['Inprogress', 'Failed', 'Success'],
    default: 'Inprogress',
  },
  StartTime: {
    type: Date,
    default: Date.now,
  },
  EndTime: {
    type: Date,
    required: false,
  },
});


module.exports = {
  userSchema: mongoose.model("bikeuserloginschemas", UserLoginSchema),
  bikesSchema: mongoose.model("bikesSchema", BikesSchema),
  adminSchema: mongoose.model("adminSchema", AdminLoginSchema),
};
