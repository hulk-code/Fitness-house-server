const express = require('express')
const cors=require('cors')
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}@cluster0.bw2yndc.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection

    const database = client.db("FitnessHouse");
    const FeaturedCollection = database.collection("FeaturedCard");
    const classesCollection=database.collection('classes')
    const reviewsCollection=database.collection('Reviews')
    const TodayBlogs=database.collection('Blogs')
    const OurSubscriber=database.collection('Subscriber')



    app.get('/featured' ,async (req , res) =>{
        const result = await FeaturedCollection.find().toArray();
      res.send(result);
    })
    app.get('/classes' ,async (req , res) =>{
        const result = await classesCollection.find().toArray();
      res.send(result);
    })
    app.get('/reviews' ,async (req , res) =>{
        const result = await reviewsCollection.find().toArray();
      res.send(result);
    })
    app.get('/blogs' ,async (req , res) =>{
        const result = await TodayBlogs.find().toArray();
      res.send(result);
    })
    app.get('/blogs/:id' , async(req ,res)=>{
      const id=req.params.id;
      const query={_id :new ObjectId(id)}
      const result=await TodayBlogs.findOne(query)
       res.send(result)
     })

     app.post('/subscriber' , async(req ,res) =>{
      
      const Subscribers=req.body;
      const result=await OurSubscriber.insertOne(Subscribers);
      res.send(result)
     })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})