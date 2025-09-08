const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  formId: { type: String, required: true },
  formName: String,
});

module.exports = mongoose.model("Form", FormSchema);
