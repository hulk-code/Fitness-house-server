const express = require('express')
const cors=require('cors')
const app = express()
const jwt = require('jsonwebtoken');
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
    const  Trainerprofile=database.collection('Trainerprofile')
    const  instructorprofile=database.collection('trainerPageProfile')
    const  userCollection=database.collection('users')
    const  beATrainercollection=database.collection('beATrainer')
    const  classRoutine=database.collection('ClassesRoutine')
    const  postCollection=database.collection('postdata')
    const  recommendedClass=database.collection('recommendedclass')



    app.post('/jwt', async(req , res) =>{
      const user=req.body;
      const token=jwt.sign(user , process.env.ACCESS_TOKEN_SECRET ,{
        expiresIn:'1hr'
      });
      res.send({token})
    })

    const verifytoken=(req , res , next)=>{
      console.log('inside vasify token' , req.headers.authorization)
      if(!req.headers.authorization){
        return res.status(401).send({message : 'forbidden access'})
      }
      const token=req.headers.authorization.split(' ')[1]
      jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err ,decoded) =>{
        if(err){
          return res.status(401).send({message:"forbodden Access"})
        }
        req.decoded =decoded;
        next();
      })
     
     }


     const verifyAdmin=async(req  , res ,next)=>{
      const email=req.decoded.email;
      const query={email : email}
      const user=await userCollection.findOne(query)
      const isAdmin=user?.role==='admin';
      if(!isAdmin){
        return res.status(403).send({message:"forbidden access"})
      }
      next();
     }

     const verifyTrianer=async(req  , res ,next)=>{
      const email=req.decoded.email;
      const query={email : email}
      const user=await beATrainercollection.findOne(query)
      const isTrainer=user?.role==='trainer';
      if(isTrainer){
        return res.status(403).send({message:"forbidden access"})
      }
      next();
     }



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
     app.get('/subscriber' , verifytoken,verifyAdmin, async(req , res) =>{
      const result=await OurSubscriber.find().toArray()
      res.send(result)
     })
     app.get('/profile' ,async (req , res) =>{
      const result = await Trainerprofile.find().toArray();
    res.send(result);
  })
     app.get('/instructorprofile' ,async (req , res) =>{
      const result = await instructorprofile.find().toArray();
    res.send(result);
  })
  app.get('/instructorprofile/:id' , async(req ,res)=>{
    const id=req.params.id;
    const query={_id :new ObjectId(id)}
    const result=await instructorprofile.findOne(query)
     res.send(result)
   })

   app.get('/users' , verifytoken,verifyAdmin, async (req , res) =>{
    console.log(req.headers);
      const result = await userCollection.find().toArray();
    res.send(result);
  })

   


//set user role
  app.patch('/users/admin/:id' , verifytoken,verifyAdmin, async(req , res) =>{
    const id=req.params.id
    const filter={_id :new ObjectId(id)}
    const updatedDoc={
      $set:{
        role:'admin'
      }
    }
    const result=await userCollection.updateOne(filter,updatedDoc)
    res.send(result)
   })


   app.get('/users/admin/:email',verifytoken, async(req ,res) =>{
    const email=req.params.email;
    if(email !==req.decoded.email){
     return res.status(403).send({message:"unauthorize access"})
    }
    const query={email :email};
    const user=await userCollection.findOne(query)
    let admin=false;
    if(user){
     admin=user?.role==="admin";
    
    }
    res.send({admin})
    })


   app.post('/users', async (req, res) => {
      const user = req.body;
      
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });


    app.post('/beatrainer', async (req, res) => {
      const reqInfo = req.body;
      const result = await beATrainercollection.insertOne(reqInfo);
      res.send(result);
    });

    app.get('/beatrainer' ,async (req , res) =>{
      const result = await beATrainercollection.find().toArray();
    res.send(result);
  })

  app.get('/beatrainer/trainer/:email',verifytoken, async(req ,res) =>{
    const email=req.params.email;
    if(email !==req.decoded.email){
     return res.status(403).send({message:"unauthorize access"})
    }
    const query={email :email};
    const user=await beATrainercollection.findOne(query)
    let trainer=false;
    if(user){
     trainer=user?.role==="trainer";
    
    }
    res.send({trainer})
    })


  app.patch('/beatrainer/trainer/:id' , verifytoken,verifyTrianer, async(req , res) =>{
    const id=req.params.id
    const filter={_id :new ObjectId(id)}
    const updatedDoc={
      $set:{
        role:'trainer'
      }
    }
    const result=await beATrainercollection.updateOne(filter,updatedDoc)
    res.send(result)
   })
   app.delete('/beatrainer/:id', verifytoken, verifyAdmin, async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await beATrainercollection.deleteOne(query);
    res.send(result);
  })


    app.get('/routine' ,async (req , res) =>{
      const result = await classRoutine.find().toArray();
    res.send(result);
  })

  app.get('/routine/:id' , async(req ,res)=>{
    const id=req.params.id;
    const query={_id :new ObjectId(id)}
    const result=await classRoutine.findOne(query)
     res.send(result)
   })

   app.post('/routine', async (req, res) => {
    const routineInfo = req.body;
    const result = await classRoutine.insertOne(routineInfo);
    res.send(result);
  });

  //pagination
  app.get('/posts', async(req, res) => {
    const size=parseInt(req.query.size)
    const page=parseInt(req.query.page)
    console.log('pagination',req.query)
      const result = await postCollection.find()
      .skip(page) 
      .limit(size)
      .toArray();
      res.send(result);
  })
  app.post('/posts', async (req, res) => {
    const postInfo = req.body;
    const result = await postCollection.insertOne(postInfo);
    res.send(result);
  });


  app.get('/postsCount' ,async(req,res)=>{
    const count=await postCollection.estimatedDocumentCount()
    res.send({count})
  })

  app.get('/recommended' ,async (req , res) =>{
    const result = await recommendedClass.find().toArray();
  res.send(result);
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