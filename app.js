import express from 'express';
import path from 'path';
let app = express();
import request from 'request';
//set up engine
import exphbs from 'express-handlebars';
app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'main'}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

//set up filestream
import fs from 'fs';
import es from 'event-stream';
import _ from 'underscore';
import sReduce from 'stream-reduce';

app.get('/listings', (req, res, next) => {
  let header = null;
  request('https://s3.amazonaws.com/opendoor-problems/listing-details.csv')
           .pipe(es.split('\n'))
           .pipe(es.mapSync((data) => { return data.split(","); }))
           .pipe(es.mapSync((data) => {
             if(data[0] === 'id'){
               header = data;
               return;
             }
             if(!data[0]) return;
             return _.object(header,data);
           }))
           .pipe(es.mapSync((data) =>{

             if(data.price < (req.query.min_price || 0)) {return;}
             if(data.price > (req.query.max_price || Infinity)) {return;}
             if(data.bedrooms < (req.query.min_bed || 0)) {return;}
             if(data.bedrooms > (req.query.max_bed || Infinity)) {return;}
             if(data.bathrooms < (req.query.min_bath || 0)) {return;}
             if(data.bathrooms >( req.query.max_bath || Infinity)) {return;}
             // return {
             //   type: "Feature",
             //   geometry: {type: "Point", coordinates: [data.lat, data.lng]},
             //   properties: {
             //     "id": data.id,
             //     "street": data.street,
             //     "price": data.price,
             //     "bedrooms": data.bedrooms,
             //     "bathrooms": data.bathrooms,
             //     "sq_ft": data.sq_ft
             //   }
             // };
             return data;
           }))
           .pipe(sReduce((acc, data) => {
             return acc.concat(data)
           }, []))
           .on('data', (data) => {
             if(!data){
               res.status(500).send('unable to filter data');
             }
             // let houses = {type: "FeatureCollection", "features": data};
             res.render('listings.hbs', {
               query: req.query,
               header: header,
               houses: data
             });
             // res.status(200).json(houses);
           })
})


let port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('Express started, listening to port: ', port);
});
