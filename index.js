const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

//middlewareas
app.use(cors());
require("dotenv").config();
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function test() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
test().catch(console.dir);

const cryptoDB = client.db("cryptodb");
const userCollection = cryptoDB.collection("users");

app.get("/", async (req, res) => {
  res.send({ msg: true });
});

app.get("/users", async (req, res) => {
  const result = await userCollection.find().toArray();
  res.send(result);
});

app.get("/users/:email", async (req, res) => {
  const projecttion = { pass: 0, passConfirm: 0 };
  const result = await userCollection.findOne({ email: req.params.email });
  if (result) {
    delete result.pass;
    delete result.passConfirm;
  }

  console.log(result);

  res.send(result || {});
});

app.post("/user", async (req, res) => {
  try {
    const data = req.body;
    delete data.pass;
    delete data.passConfirm;
    console.log(data);

    const refferel = require("crypto").randomBytes(6).toString("hex");
    const credit = 100;

    const newUser = {
      ...data,
      refferel,
      credit,
    };

    const result = await userCollection.insertOne(newUser);
    res.send(newUser);
  } catch (error) {
    console.log(error);
    res.send({ err: error });
  }
});

app.listen(port, () => {
  console.log("Port : ", port);
});
