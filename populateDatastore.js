import mongoose from 'mongoose';
import Feature from './models/feature';

import fs from 'fs';
import es from 'event-stream';
import _ from 'underscore';
import sReduce from 'stream-reduce';
import request from 'request';
if (! fs.existsSync('./env.sh')) {
  throw new Error('env.sh file is missing');
}

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
let header = null;
request('https://s3.amazonaws.com/opendoor-problems/listing-details.csv')
         .pipe(es.split('\n'))
         .pipe(es.mapSync((data) => { return data.split(","); }))
         .pipe(es.mapSync((data) => {
           if(data[0] === 'id'){
             header = data;
             return;
           }
           if(!data[0]) return data;
           return _.object(header,data);
         }))
         .pipe(es.mapSync((data) => {
           let newFeat = new Feature({
             data: {
               geometry: {
                 coordinates: [data.lat, data.lng]
               },
               properties: {
                 id: data.id,
                 price: data.price,
                 street: data.street,
                 bedrooms: data.bedrooms,
                 bathrooms: data.bathrooms,
                 sq_ft: data.sq_ft
               }
             }
           });
           newFeat.save().catch(function(err) {console.log('err: ', err)});
         }))
         .on('finish',() => mongoose.connection.close());
// 'use strict';
//
// var mongoose = require('mongoose');
//
// var Feature = require('./models/feature');
//
// var fs = require('fs');
//
//
//
// var es= require('event-stream');
//
// var _ = require('underscore');
//
// var request = require('request');
//
// var sReduce = require('stream-reduce');
//
// if (! fs.existsSync('./env.sh')) {
//   throw new Error('env.sh file is missing');
// }
//
// if (! process.env.MONGODB_URI) {
//   throw new Error("MONGODB_URI is not in the environmental variables. Try running 'source env.sh'");
// }
// mongoose.connection.on('connected', function() {
//   console.log('Success: connected to MongoDb!');
// });
// mongoose.connection.on('error', function() {
//   console.log('Error connecting to MongoDb. Check MONGODB_URI in env.sh');
//   process.exit(1);
// });
//
// mongoose.connect(process.env.MONGODB_URI);
// let header = null;
// request('https://s3.amazonaws.com/opendoor-problems/listing-details.csv')
// .pipe(es.split('\n'))
// .pipe(es.mapSync(function (data) {
//   return data.split(",");
// })).pipe(es.mapSync(function (data) {
//   if (data[0] === 'id') {
//     header = data;
//     return;
//   }
//   if (!data[0]) return;
//   return _.object(header, data);
// }))
// .pipe(es.mapSync(function (data) {
//   var newFeat = new Feature({
//     data: {
//       geometry: {
//         coordinates: [data.lat, data.lng]
//       },
//       properties: {
//         id: data.id,
//         price: data.price,
//         street: data.street,
//         bedrooms: data.bedrooms,
//         bathrooms: data.bathrooms,
//         sq_ft: data.sq_ft
//       }
//     }
//   });
//   newFeat.save().then(function() { return 'saved';)
//     .catch(function(err) {console.log('err: ', err)});
// }))
// .then(
//   mongoose.connection.close();
// )
