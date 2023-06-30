const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.l3p6wcn.mongodb.net/?retryWrites=true&w=majority`;

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
    /**=============================
     * Code below
    ================================*/
    // Collections
    const studentsCollection = client.db("my-client").collection("students");
    const usersCollection = client.db("my-client").collection("users");
    const galleryCollection = client.db("my-client").collection("gallery");

    // Students APIs
    app.post("/students", async (req, res) => {
      const student = req.body;
      const result = await studentsCollection.insertOne(student);
      res.send(result);
    });

    app.get("/students", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const query = {};
      const cursor = studentsCollection.find(query);
      const students = await cursor
        .skip(page * size)
        .limit(size)
        .toArray();
      const count = await studentsCollection.estimatedDocumentCount();
      res.send({ count, students });
    });

    app.get("/students/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await studentsCollection.findOne(query);
      res.send(result);
    });

    // Update student data
    app.put("/students/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = req.body;
      const student = {
        $set: {
          id: updatedDoc.id,
          photo: updatedDoc.photo,
          name: updatedDoc.name,
          class_name: updatedDoc.class_name,
          subject: updatedDoc.subject,
          email: updatedDoc.email,
          phone: updatedDoc.phone,
          address: updatedDoc.address,
        },
      };
      const result = await studentsCollection.updateOne(
        filter,
        student,
        options
      );
      res.send(result);
    });

    app.delete("/students/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await studentsCollection.deleteOne(query);
      res.send(result);
    });

    // Users related APIs
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({ message: "User already exists!" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Gallery APIs
    app.post("/gallery", async (req, res) => {
      const gallery = req.body;
      const result = await galleryCollection.insertOne(gallery);
      res.send(result);
    });

    app.get("/gallery", async (req, res) => {
      const result = await galleryCollection.find().toArray();
      res.send(result);
    });

    app.get("/gallery/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await galleryCollection.findOne(filter);
      res.send(result);
    });

    app.put("/gallery/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = req.body;
      const options = { upsert: true };
      const galleryImageData = {
        $set: {
          name: updatedDoc.name,
          photoUrl: updatedDoc.photoUrl,
        },
      };
      const result = await galleryCollection.updateOne(
        filter,
        galleryImageData,
        options
      );
      res.send(result);
    });

    app.delete("/gallery/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await galleryCollection.deleteOne(filter);
      res.send(result);
    });

    /**=============================
     * Code above
    ================================*/
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

app.listen(port, () => {
  `My server is listening on port: ${port}`;
});
