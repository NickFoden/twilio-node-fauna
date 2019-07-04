const twilio = require("twilio");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const faunadb = require("faunadb"),
  q = faunadb.query;
const { messagesObj } = require("../messages");
const clientFauna = new faunadb.Client({ secret: process.env.FAUNA_KEY });

const twilioClient = new twilio(
  process.env.TWILLIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

//TWILIO
const sendMessage = (req, res, messageKey) => {
  const { From, FromCountry, FromZip, Body } = req.body;
  const phone = From;
  twilioClient.messages
    .create({
      body: messagesObj[messageKey],
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    })
    .then(message => console.log(message.sid))
    .catch(err => {
      console.log("error " + err);
    });
};

//FaunaDB
const addNewClass = async newClass => {
  try {
    const ret = await clientFauna.query(q.CreateClass({ name: newClass }));
    console.log(ret);
    return ret;
  } catch (err) {
    return console.error(err);
  }
};

const addNewUser = async (className, itemObj) => {
  try {
    const ret = await clientFauna.query(
      q.Create(q.Class(className), {
        data: {
          Phone: itemObj.From,
          Country: itemObj.FromCountry,
          Approved: false,
          Zip: itemObj.FromZip
        }
      })
    );
    console.log(ret);
    return ret;
  } catch (err) {
    return console.error(err);
  }
};
const addSingleRecord = async (className, itemObj) => {
  try {
    const ret = await clientFauna.query(
      q.Create(q.Class(className), {
        data: {
          Phone: itemObj.From
        }
      })
    );
    console.log(ret);
    return ret;
  } catch (err) {
    return console.error(err);
  }
};
const getAllUsers = () => {
  clientFauna
    .query(q.Match(q.Index("all_users")))
    .then(ret => console.log(ret));
};

const makeAQuery = () => {
  clientFauna.query(
    q.CreateIndex({
      name: "users_by_phone",
      source: q.Class("Users"),
      terms: [{ field: ["data", "Phone"] }],
      unique: true
    })
  );
  console.log("Hope it worked");
};

const getSingleRecordByRef = async (className, itemRef) => {
  try {
    const ret = await clientFauna.query(
      q.Get(q.Ref(q.Class(className), itemRef))
    );
    // console.log(ret);
    console.log(ret.data[0]);
    console.log(JSON.stringify(ret));
    console.log("Update the user");
    updateARecord(className, itemRef, "Approved", false);
    return ret;
  } catch (err) {
    return console.error(err);
  }
};

const getUserByPhone = async (req, res) => {
  const { From, FromCountry, FromZip, Body } = req.body;
  const phone = From;
  try {
    const ret = await clientFauna.query(
      q.Paginate(q.Match(q.Index("users_by_phone"), phone))
    );
    if (ret.data[0]) {
      getSingleRecordByRef("Users", ret.data[0].id);
    } else {
      sendMessage(req, res, "notApproved");
    }
    return ret;
  } catch (err) {
    return console.error(err);
  }
};

const updateARecord = async (className, itemRef, key, newValue) => {
  clientFauna
    .query(
      q.Update(q.Ref(q.Class(className), itemRef), {
        data: { [key]: newValue }
      })
    )
    .then(ret => console.log(ret));
};

module.exports = {
  addNewClass,
  addNewUser,
  addSingleRecord,
  getAllUsers,
  getUserByPhone,
  makeAQuery,
  sendMessage,
  updateARecord
};
