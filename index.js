require("dotenv").config();
const port = process.env.PORT || 8000;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const faunadb = require("faunadb"),
  q = faunadb.query;
const sendMessage = require("./functions").default;
const twilio = require("twilio");
const twilioClient = new twilio(
  process.env.TWILLIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const MessagingResponse = require("twilio").twiml.MessagingResponse;
// const clientFauna = new faunadb.Client({ secret: process.env.FAUNA_KEY });

app.use(bodyParser.urlencoded({ extended: false }));
app.post("/sms", (req, res) => {
  const { From, Body } = req.body;
  const twiml = new MessagingResponse();
  twiml.message("Really. . You sent me " + Body + " From your number " + From);
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

app.get("/", (req, res) => {
  sendMessage();
  res.send("Sent the text");
});

app.listen(port, () => {
  console.log("Example app listening on port 8000!");
});
