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

        // GET Package API
        app.get('/products' , async(req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        // const ser = {
        //     googl:"Wide Variety of Tours",
        //     descrip:"We offer a wide variety of personally picked tours with destinations a...",
        //     icon:"fab fa-watchman-monitoring"
        // }
        // const result = await productsCollection.insertOne(ser);
        // console.log(`ser : ${result.insertedId}`);

        // GET Services API
      app.get('/services' , async(req, res) => {
        const cursor = servicesCollection.find({});
        const services = await cursor.toArray();
        res.send(services);
      })

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