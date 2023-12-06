const mongoose = require("mongoose");

mongoose.connect('mongodb+srv://rajabov4you:4ilvQoQqd4sFKc3V@cluster0.lcxh9if.mongodb.net/?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});
