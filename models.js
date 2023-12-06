const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
  },
  phone: {
    type: String,
    default: "",
    required: true
  },
  feedback: {
    type: String,
    default: "",
  },
  rating: {
    type: Number,
    default: 0
  },
  branch: {
    type: String,
    default: ""
  }
});

const Client = mongoose.model("Clients", ClientSchema);

module.exports = Client;