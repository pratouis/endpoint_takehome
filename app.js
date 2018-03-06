import express from 'express';
import path from 'path';
let app = express();
import request from 'request';
//set up engine
import exphbs from 'express-handlebars';
app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'main'}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

import mongoose from 'mongoose';
import Feature from './models/feature';
if (! process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not in the environmental variables. Try running 'source env.sh'");
}
mongoose.connection.on('connected', function() {
  console.log('Success: connected to MongoDb!');
});
mongoose.connection.on('error', function() {
  console.log('Error connecting to MongoDb. Check MONGODB_URI in env.sh');
  process.exit(1);
});

mongoose.connect(process.env.MONGODB_URI);
let totalCount = Feature.count().catch(err => console.log('error in counting: ', err));
let last = Math.round(totalCount/10);
app.get('/listings', (req, res, next) => {
  let pageNum = parseInt(req.query.page || 1)-1;
  Feature.find({
    'data.properties.price' : {$gte: req.query.min_price || 0, $lte: req.query.max_price || Infinity},
    'data.properties.bedrooms': {$gte: req.query.min_bed || 0, $lte: req.query.max_bed || Infinity},
    'data.properties.bathrooms': {$gte: req.query.max_bath || 0, $lte: req.query.max_bath || Infinity}
  })
  .skip(10*pageNum)
  .limit(10)
  .exec()
  .catch((err) => {
    console.log('error in finding: ',err);
    res.status(500).send(err);
  })
  .then((results) => {
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl.split('&page')[0];
    res.links({
      first: `${fullUrl}&page=1`,
      last: `${fullUrl}&page=${last}`,
      prev: `${fullUrl}&page=${pageNum === 1 ? 1: pageNum-1}`,
      next: `${fullUrl}&page=${pageNum === last ? last: pageNum+1}`
    });

    res.status(200).json(results);
  })
})


let port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('Express started, listening to port: ', port);
});
