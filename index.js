const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

//Middlewares

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@brainbazzdatabase.ihuzu7m.mongodb.net/?retryWrites=true&w=majority&appName=BrainBazzDatabase`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const parcelCollection = client.db("parcelDB").collection("parcels");
    //all parcel get api
    app.get("/parcels", async (req, res) => {
      const result = await parcelCollection.find().toArray();
      res.send(result);
    });

    //GET: All parcel by user(email) and sort latest create time
    app.get("/parcels", async (req, res) => {
      try {
        const userEmail = req.query.email;

        const query = userEmail
          ? {
              created_by: userEmail,
            }
          : {};

        const options = {
          sort: { createdAt: -1 },
        };

        const result = await parcelCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Filed to the parcel get" });
      }
    });

    //parcel post api
    app.post("/parcels", async (req, res) => {
      try {
        const newParcel = req.body;
        const result = await parcelCollection.insertOne(newParcel);
        res.status(201).send(result);
      } catch (error) {
        console.log(error);
        res.status(501).send({ message: "Failed to the create parcel" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//start routes and server demos
app.get("/", (req, res) => {
  res.send("zap-shift-server is running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
