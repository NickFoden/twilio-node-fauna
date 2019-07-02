export const sendMessage = () => {
  twilioClient.messages
    .create({
      body: "UP THE IRONS",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.NICK_PHONE_NUMBER
    })
    .then(message => console.log(message.sid))
    .catch(err => {
      console.log("error " + err);
    });
};
