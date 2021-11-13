const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleWare 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bonkw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("canvasHeadphone_data");
        const productsCollection = database.collection("products");
        const servicesCollection = database.collection("services");
        const userCollection = database.collection("users");
        const orderCollection = database.collection("orders");
        const reviewCollection = database.collection("reviews");

        // GET Package API
        app.get('/products' , async(req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        // GET Single Package API
        app.get('/products/:id' , async(req, res) => {
          const id = req.params.id;
          // console.log("Getting specific products " , id);
          const query = {_id:ObjectId(id)};
          const product = await productsCollection.findOne(query);
          // console.log('load user with id', id);
          // res.send(product);
          res.json(product);
        })

        // GET Services API
      app.get('/services' , async(req, res) => {
        const cursor = servicesCollection.find({});
        const services = await cursor.toArray();
        res.send(services);
      })

    // get reviews api
    app.get("/reviews", async (req, res) => {
      const reviews = await reviewCollection.find({}).toArray();
      res.send(reviews);
    });

    // get all orders
    app.get("/allOrders", async (req, res) => {
        const orders = await orderCollection.find({}).toArray();
        res.send(orders);
    });

    // get a single order
    app.get("/allOrders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.send(result);
    });

    // get order by user emails
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
        const query = { userEmail: email };
        const cursor = orderCollection.find(query);
        const orders = await cursor.toArray();
        res.json(orders);
    });

    // post a product api
    app.post("/products", async (req, res) => {
      const headphone = req.body;
      const result = await productsCollection.insertOne(headphone);
      res.json(result);
    });

    // post order api
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    // post review api
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    // save users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });

      // make admin

    app.get("/users/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await userCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === "admin") {
          isAdmin = true;
        }
        res.json({ admin: isAdmin });
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
        if (user.role === "admin") {
          const filter = { email: user?.email };
          const updateDoc = {
            $set: {
              role: "admin",
            },
          };
          const result = await userCollection.updateOne(filter, updateDoc);
          res.json(result);
        } else {
        res.status(403).json({ message: "You do not have access." });
      }
    });

    // for google login
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

      // update order status api
      app.put("/allOrders/:id", async (req, res) => {
        const id = req.params.id;
        const updateOrder = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            status: updateOrder.status,
          },
        };
        const result = await orderCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.json(result);
      });
  
      // delete a headpohne api
      app.delete("/products/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await productsCollection.deleteOne(query);
        res.json(result);
      });
  
      // delete an order api
      app.delete("/orders/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await orderCollection.deleteOne(query);
        res.json(result);
      });

    } finally {
      // await client.close();
    }
}
run().catch(console.dir);

app.get('/' , (req , res) => {
    res.send("Running Canvas Headphone Server");
});

app.listen(port , () => {
    console.log("Running server on port " , port);
})