require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000;


app.use(cors())
app.use(express.json())






const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ivpd0t4.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const usersCollection = client.db('musicInstrument').collection('users')
        const classCollection = client.db('musicInstrument').collection('classes')
        const instructorCollection = client.db('musicInstrument').collection('instructor')
        const classBookCollection = client.db('musicInstrument').collection('bookItem')


        //user oparetion
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })

        //admin api create 

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    role: 'admin'
                },
            };
            const result = await usersCollection.updateOne(filter, updatedDoc);
            res.send(result)
        });

        //instructor role update 

        app.patch('/users/instructor/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    role: 'instructor'
                },
            };
            const result = await usersCollection.updateOne(filter, updatedDoc);
            res.send(result)
        });


        //admin check via mail
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.role === 'admin' }
            res.send(result);
        })
        //instructor check via mail
        app.get('/users/instructor/:email', async (req, res) => {
            const email = req.params.email;
            console.log('instructor email', email)
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { instructor: user?.role === 'instructor' }
            console.log('result', result)
            res.send(result);
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })


        app.get('/class', async (req, res) => {
            const result = await classCollection.find().toArray()
            res.send(result)
        })
        app.get('/instructor', async (req, res) => {
            const result = await instructorCollection.find().toArray()
            res.send(result)
        })


        app.post('/bookCart', async (req, res) => {
            const item = req.body;
            const result = await classBookCollection.insertOne(item);
            res.send(result)
        })

        //book cart api
        app.get('/bookCart', async (req, res) => {
            const email = req.query.email;

            if (!email) {
                res.send([]);
                return; // Add this line to terminate the execution
            }

            const query = { email: email };
            const result = await classBookCollection.find(query).toArray();
            res.send(result);
        });


        //delete api from cart
        app.delete('/bookCart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await classBookCollection.deleteOne(query);
            res.send(result)
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Music Instrument Running!')
})

app.listen(port, () => {
    console.log(`Music Instrument listening on port ${port}`)
})