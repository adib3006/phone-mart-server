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
        const usersCollection = client.db('phoneMart').collection('users');
        const categoriesCollection = client.db('phoneMart').collection('categories');
        const ordersCollection = client.db('phoneMart').collection('orders');

        //add products or phones
        app.post('/dashboard/add-product',async (req,res)=>{
            const phone = req.body;
            const postDate = new Date();
            const phoneWithDate = {...phone,postDate};
            const result = await phonesCollection.insertOne(phoneWithDate);
            res.send(result);
        });

        //get all categories
        app.get('/categories',async (req,res)=>{
            const query = {};
            const cursor = categoriesCollection.find(query);
            const categories =await cursor.toArray();
            res.send(categories);
        });

        //get all phones of one category
        app.get('/categories/:id', async (req,res)=>{
            const id = req.params.id;
            const query = {categoryId : id};
            const query1 = {categoryId: id};
            const phoneCategory =await phonesCollection.find(query).toArray();
            const category =await categoriesCollection.findOne(query1);
            const name = category.categoryName;
            res.send({phoneCategory,name});
        })

        //get all phones by email
        app.get('/dashboard/my-products', async(req,res)=>{
            const email = req.query.email;
            const query = {sellerEmail:email};
            const myProducts = await phonesCollection.find(query).toArray();
            res.send(myProducts);
        })

        //get single phone by id
        app.get('/phone', async(req,res)=>{
            let query = {};
            query = { 
                advertise : true,
                sold : false
            }
            const phoneList =await phonesCollection.find(query).sort({postDate:-1}).toArray();
            const phone = phoneList[0];
            res.send(phoneList);
        })

        //add users to database
        app.post('/users',async (req,res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        //get all users
        app.get('/users', async(req,res)=>{
            let query = {}
            if(req.query.email){
                query = {email:req.query.email}
            }
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })

        //get sellers
        app.get('/dashboard/all-sellers',async (req,res)=>{
            const query = {role:"seller"};
            const sellers =await usersCollection.find(query).toArray();
            res.send(sellers);
        })

        //get buyers
        app.get('/dashboard/all-buyers',async (req,res)=>{
            const query = {role:"buyer"};
            const buyers =await usersCollection.find(query).toArray();
            res.send(buyers);
        })

        //add orders
        app.post('/orders',async(req,res)=>{
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        })

        //update phone sold status
        app.patch('/orders/phone/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const updatedDoc = {
                $set : {
                    sold: true,
                    advertise: false
                }
            }
            const result = await phonesCollection.updateOne(query,updatedDoc);
            res.send(result);
        })

        //update phone sold status
        app.patch('/my-products/sold/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const updatedDoc = {
                $set : {
                    sold: false,
                    advertise: false
                }
            }
            const result = await phonesCollection.updateOne(query,updatedDoc);
            res.send(result);
        })

        //update phone advertise status
        app.patch('/my-products/ad/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const updatedDoc = {
                $set : {
                    advertise: true
                }
            }
            const result = await phonesCollection.updateOne(query,updatedDoc);
            res.send(result);
        })

        //remove prices from my-product
        app.patch('/my-products/price/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const updatedDoc = {
                $set : {
                    resellPrice: "N/A"
                }
            }
            const result = await phonesCollection.updateOne(query,updatedDoc);
            res.send(result);
        })

        //get orders by email
        app.get('/orders', async(req,res)=>{
            const email = req.query.email;
            const query = {email:email};
            const orders =await ordersCollection.find(query).toArray();
            res.send(orders);
        })

        //report a item
        app.patch('/report/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const updatedDoc = {
                $set : {
                    report: true
                }
            }
            const result = await phonesCollection.updateOne(query,updatedDoc);
            res.send(result);
        })

        //get reported products
        app.get('/reported-products', async(req,res)=>{
            const query = {report:true};
            const products = await phonesCollection.find(query).toArray();
            res.send(products);
        })

        //resolve selected items
        app.patch('/reported-products/resolve/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const updatedDoc = {
                $set : {
                    report: false
                }
            }
            const result = await phonesCollection.updateOne(query,updatedDoc);
            res.send(result);
        })

        //delete reported item
        app.delete('/reported-products/delete/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const phone = await phonesCollection.findOne(query);
            if(!phone?._id){
                res.send('Phone does not exist');
                return;
            }
            const result = await phonesCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally{

    }
}

run().catch(error=>console.log(error));


app.get('/', (req,res)=>{
    res.send('phone mart server is running');
})

// app.get('/categories', (req,res)=>{
//     res.send(categories);
// })

// app.get('/categories/:id', (req,res)=>{
//     const id = req.params.id;
//     const phoneCategory = phones.filter(phone => id===phone.categoryId);
//     const category = categories.find(category => id===category.categoryId);
//     const name = category.categoryName;
//     res.send({phoneCategory,name});
// })

app.get('/phone/:id', (req,res)=>{
    const id = req.params.id;
    const phone = phones.find(phone => id===phone.id);
    res.send(phone);
})

app.listen(port, ()=>{
    console.log('server is running on port ',port);
})