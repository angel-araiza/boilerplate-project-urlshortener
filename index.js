require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();


const bodyParser = require('body-parser');
const dns = require('dns');


app.use(bodyParser.urlencoded({ extended: false })); //Not sure how the body parser methods work

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//In-memory storage for URLs
let URLDatabase = [];
let idCounter= 1;

app.post('/api/shorturl', function(req, res){
  let original_url = req.body.url //I am able to access this beacause of bodyParser

  try {
    const url = new URL(original_url);
    const hostname = url.hostname;

    //look up DNS to validate the url
    dns.lookup(hostname, (err, address, family)=>{
      if (err){
        res.json({ error: 'invalid url' });
      } else{
        let shortUrl = idCounter++;
        URLDatabase.push({ original_url: original_url, short_url: shortUrl})
        res.json({ original_url: original_url, short_url: shortUrl});
      }
    });
  } catch (e) {
    res.json({ error: 'invalid url' })
  }
});

app.get('/api/shorturl/:short_url', function(req, res){
  let shortUrl = parseInt(req.params.short_url);

  //find the original url associated with short url
  let urlEntry = URLDatabase.find(entry => entry.short_url == shortUrl);

  if (urlEntry){
    res.redirect(urlEntry.original_url);
  } else{
    res.json({ error: "No short URL found for the given input"})
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
