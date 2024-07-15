const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion } = require('mongodb');
const {ObjectId} = require('mongodb');



const app = express()

//middlewares

const corsOptions = {
    origin: ['http://localhost:5173', 'https://atic-verse-voyage.netlify.app'],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())

//admin_verse_voyage
//a46jfxGH7P4RkRIP
const uri =
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ms3r4qf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const bookCollection = client.db('verse_voyage_db').collection('book_collection')
        const borrowCollection = client.db('verse_voyage_db').collection('borrow_collection')



        //get all books from mongodb
        app.get('/books', async (req, res) => {
            const result = await bookCollection.find().toArray()
            res.send(result)
        })

        app.get('/book/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await (bookCollection.findOne(query))
            res.send(result)
        })

        app.post('/book-collection', async (req, res) => {
            const newBookData = req.body
            console.log(newBookData);
            const result = await bookCollection.insertOne(newBookData)
            res.send(result)
        })

        app.put('/update-book/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const bookBody = req.body
            const updatedBook = {
                $set: {
                    name: bookBody.name,
                    image: bookBody.image,
                    author: bookBody.author,
                    category: bookBody.category,
                    rating: bookBody.rating
                }
            }

            const result = await bookCollection.updateOne(filter, updatedBook, options)
            res.send(result)
        })


        //get single book data
        app.get('/book/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await bookCollection.findOne(query)
            res.send(result)
        })


        app.patch('/borrowedBook/:id', async (req, res) =>{
            const id = req.params.id
            const status = req.body
            const query = {_id: new ObjectId(id)}
            const updateDoc= {
                $set: {
                    $inc: { quantity: -2 } 
                }
            }
            const result = await borrowCollection.updateOne(query, updateDoc)
            res.send(result)
        })

        //send borrowed booksdata to db
        app.post('/borrow', async(req, res)=>{
            const borrowedData = req.body
            const query = {_id: new ObjectId(borrowedData.bookId)}
            const updateDoc= {
               
                    $inc: { quantity: -1 } 
                
            }
            await bookCollection.updateOne(query, updateDoc)
            const result = await borrowCollection.insertOne(borrowedData)
            console.log(result);
            res.send(result)
        })


        app.get('/borrowedBooks', async (req, res) =>{
            console.log(req.query);
            let query= {}
            if(req.query?.email){
                query= { email:req.query.email }
            }
            const result = await borrowCollection.find(query).toArray()
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {


    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send("Hello from Verse Voyage Server")
})

app.listen(port, () => { console.log(`Verse Voyage is running on port: ${port}`); })