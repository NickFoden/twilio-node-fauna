require("dotenv").config();
const port = process.env.PORT || 8000;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const {
  addNewClass,
  addNewUser,
  addSingleRecord,
  getAllUsers,
  getUserByPhone,
  makeAQuery,
  sendMessage
} = require("./faunaFunctions");
const twilio = require("twilio");
const { messagesObj } = require("./messages");
const twilioClient = new twilio(
  process.env.TWILLIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const MessagingResponse = require("twilio").twiml.MessagingResponse;

app.use(bodyParser.urlencoded({ extended: false }));
app.post("/sms", (req, res) => {
  const { From, FromCountry, FromZip, Body } = req.body;
  const twiml = new MessagingResponse();
  let user = {
    Approved: false,
    From,
    FromCountry,
    FromZip
  };
  let lowerCaseTextBody = String(Body).toLowerCase();
  if (lowerCaseTextBody.includes("fyes")) {
    addNewUser("Users", user);
    twiml.message(messagesObj.welcome);
  } else {
    getUserByPhone(req, res);
  }
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

app.get("/", (req, res) => {
  // addNewClass("messages");
  res.send("Sent the text");
  // sendMessage();
  console.log("Hello");
});

app.listen(port, () => {
  console.log("Holler listening on port 8000!");
});
