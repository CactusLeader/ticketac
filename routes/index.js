var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');

var journeySchema = mongoose.Schema({
  departure: String,
  arrival: String,
  date: Date,
  departureTime: String,
  price: Number,
});

var journeyModel = mongoose.model('journey', journeySchema);

var city = ["Paris","Marseille","Nantes","Lyon","Rennes","Melun","Bordeaux","Lille"]
var date = ["2018-11-20","2018-11-21","2018-11-22","2018-11-23","2018-11-24"]

var userModel = require('../models/users')

/* GET home page. */

router.get('/', function(req, res, next) {

  console.log('/')

  res.render('index', { title: 'Express' });
});

router.get('/oops', function(req, res, next) {

  console.log('/oops')

  res.render('oops', { title: 'Express' });
});


router.post('/sign-up', async function(req, res, next) {

  console.log('/sign-up');

  var searchUser = await userModel.findOne({
    email: req.body.emailFromFront
  })
  
  if(!searchUser){
    var newUser = new userModel({
      name: req.body.nameFromFront,
      firstname: req.body.firstnameFromFront,
      email: req.body.emailFromFront,
      password: req.body.passwordFromFront,
    })
  
    var newUserSave = await newUser.save();
  
    req.session.user = {
      email: newUserSave.email,
      id: newUserSave._id,
    }
  
    console.log(req.session.user)
  
    res.redirect('/search')
  } else {
    res.redirect('/')
  }

  res.render('index', { title: 'Express' });
});

router.post('/sign-in', async function(req,res,next){

  console.log('/sign-in')

  var searchUser = await userModel.findOne({
    email: req.body.emailFromFront,
    password: req.body.passwordFromFront
  })

  if(searchUser!= null){
    req.session.user = {
      email: searchUser.email,
      id: searchUser._id
    }
    res.redirect('/search')
  } else {
    res.render('index')
  }

});

/* GET search page. */
router.get('/search', function(req, res, next) {
  res.render('search');
});


router.post('/search-train', async function(req, res, next){

  var dateWanted = req.body.meetingTime;
  dateWanted = Date.parse(dateWanted);
  dateWanted = new Date(dateWanted)

  var journeyExist = null

  var journeyExist = await journeyModel.find({departure: req.body.departure, arrival: req.body.arrival, date: dateWanted});

  console.log('journeyExist',journeyExist)

  if(journeyExist.length === 0){
    res.redirect('/oops')
  }

  res.render('available', {journeyExist})
});

module.exports = router;
