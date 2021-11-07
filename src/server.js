const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
import { MongoClient } from 'mongodb';
import path from 'path';


const app = express();


app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());
app.use(cors());

const withDB = async (operations, res) => { //creates one function to handle repeated code along with an 'operations' function to handle get, post etc. 
  // 'res' object is added as second argument here as need to pass the response to the catch block if error occurs
  try{
    const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true}); //create a client with the connection address
    const db = client.db('my-bloc'); //create database object
 
    await operations(db);

    client.close();//to close the client

  }catch(error) {
    res.status(500).json({message: 'something went wrong', error})
  }


}

app.get('/api/articles/:name', async (req, res, next) => {

    withDB(async (db) => { //takes callback 'operations function' defined below on db
      const articleName = req.params.name;

      const articleInfo = await db.collection('articles').findOne({name:articleName}); //queries the db object specific collection 'articles' to find a name matching the one given (in this cae the params variable set up )
      res.status(200).json(articleInfo); //to return in json      

    }, res) //note res object as per our withDB function. need to pass it anywhere that withDB(operations, res) is used.
   
})

app.post('/api/articles/:name/upvote', async (req, res, next) => {

    withDB(async (db) => {
      const articleName = req.params.name;

      const articleInfo = await db.collection('articles').findOne({ name:articleName });
      await db.collection('articles').updateOne({ name: articleName }, //update the valule of the 'upvotes' property use updateOne() method
      {'$set': { //'$set' in single quotes is specific syntax for mongodb to update item. which is added as second argument in the updateOne() parameter
        upvotes: articleInfo.upvotes + 1,
      }} );
  
      const updatedArticleInfo = await db.collection('articles').findOne({ name:articleName }); 
      res.status(200).json(updatedArticleInfo);
      }, res) 
  
});

app.post('/api/articles/:name/add-comment', (req, res, next) => {
  const { username, text } = req.body;
  const articleName = req.params.name;

  withDB(async (db) => {
    const articleInfo = await db.collection('articles').findOne( {name: articleName});
    await db.collection('articles').updateOne({ name: articleName}, 
      {'$set': {
        comments: articleInfo.comments.concat({username, text})
      }}
    );

    const updatedArticleInfo = await db.collection('articles').findOne( { name: articleName });
    res.status(200).json(updatedArticleInfo);

  }, res)
})

app.post('/hello', (req, res, next) => {
  res.send(`Hello ${req.body.name}!`);
});

app.get('*', (req, res, next) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(8000, () => {
  console.log('listening on port 8000');
});