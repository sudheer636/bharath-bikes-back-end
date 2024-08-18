const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const middleware = require("../auth-token");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
require("dotenv").config();

const app = express();
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
mongoose.connect(process.env.dbSecret, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const db = mongoose.connection;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

db.on("error", console.error.bind(console, "Connection Error"));
db.once("open", () => {
  console.log("connected to mongodb");
});
console.log("Connected to db!");
app.listen(3001, () => console.log(`Server Up and running at 3001`));

app.use("/api/auth", authRoutes);
app.use("/user", userRoutes);
