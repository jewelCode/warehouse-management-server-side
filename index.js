const express = require('express');
const cors = require('cors');
const jsonwebtoken = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const port = process.env.PORT || 5000;
const app = express();



app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ooxoo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const productsCollection = client.db("warehouseInventoryManagement").collection("products");

        app.get("/product", async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        app.get("/product/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.send(product);
        })
        // Delete Product
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });

        // Post Product
        app.post('/product', async (req, res) => {
            const addNewProduct = req.body;
            addNewProduct.quantity = parseInt(addNewProduct.quantity)
            const result = await productsCollection.insertOne(addNewProduct);
            res.send(result);
        });

        // Upadate Product
        app.put("/product/increase/:id", async (req, res) => {
            const id = req.params.id;
            const quantity = parseInt(req.body.quantity);
            const query = { _id: ObjectId(id) };
            const products = await productsCollection.findOne(query);
            const newQuantity = quantity + products.quantity;
            const updateProduct = await productsCollection.updateOne(query, {
              $set: { quantity: newQuantity },
            });
      
            res.send(updateProduct);
          });
      
          app.put("/product/decrease/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.updateOne(query, {
              $inc: { quantity: -1 },
            });
      
            res.send(product);
          });
        // handlle delivery

        // app.put("/product/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const inventory = await productsCollection.updateOne(query, {
        //         $inc: { quantity: -1 },
        //     });

        //     res.send(inventory);
        // });

        // JWT

        app.post('/login', async (req, res) => {
            const user = req.body;
            const token = jsonwebtoken.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            });
            res.send({ token })
        })
    }
    finally {

    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send("my server is running")
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
