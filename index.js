const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId  } = require('mongodb');
require('dotenv').config();
app.use(cors());
app.use(express.json());
const port = process.env.Port || 5000;
const categories = require('./data/categories.json');
const phones = require('./data/phones.json');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5voiazn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const phonesCollection = client.db('phoneMart').collection('phones');

        app.post('/dashboard/add-product',async (req,res)=>{
            const phone = req.body;
            const postDate = new Date();
            const phoneWithDate = {...phone,postDate};
            const result = await phonesCollection.insertOne(phoneWithDate);
            res.send(result);
        });
    }
    finally{

    }
}

run().catch(error=>console.log(error));


app.get('/', (req,res)=>{
    res.send('phone mart server is running');
})

app.get('/categories', (req,res)=>{
    res.send(categories);
})

app.get('/categories/:id', (req,res)=>{
    const id = req.params.id;
    const phoneCategory = phones.filter(phone => id===phone.categoryId);
    const category = categories.find(category => id===category.categoryId);
    const name = category.categoryName;
    res.send({phoneCategory,name});
})

app.get('/phone/:id', (req,res)=>{
    const id = req.params.id;
    const phone = phones.find(phone => id===phone.id);
    res.send(phone);
})

app.listen(port, ()=>{
    console.log('server is running on port ',port);
})