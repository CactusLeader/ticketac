var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');

var userModel = require('../models/users');
const journeyModel = require('../models/journeys');

var city = ["Paris","Marseille","Nantes","Lyon","Rennes","Melun","Bordeaux","Lille"];
var date = ["2018-11-20","2018-11-21","2018-11-22","2018-11-23","2018-11-24"];


/* GET home page. */
router.get('/', function(req, res, next) {

  console.log('/')

  if(req.session.dataTrain == undefined){
    req.session.dataTrain = []
  }

  res.render('index', { title: 'Express' });
});

/* GET No train available page */
router.get('/oops', function(req, res, next) {

  console.log('/oops')

  res.render('oops', { title: 'Express' });
});

/* POST Sign-up */
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
      userId: newUserSave._id,
    }
    
    res.redirect('/search')
  } else {
    res.redirect('/')
  }

  res.render('index', { title: 'Express' });
});

/* POST Sign-in */
router.post('/sign-in', async function(req,res,next){

  console.log('/sign-in')

  var searchUser = await userModel.findOne({
    email: req.body.emailFromFront,
    password: req.body.passwordFromFront
  })

  if(searchUser!= null){
    req.session.user = {
      email: searchUser.email,
      userId: searchUser._id
    }

    res.redirect('/search')
  } else {
    res.render('index')
  }

});

/* GET search page. */
router.get('/search', function(req, res, next) {

  if (req.session.user === null) {
    res.redirect('/')
  }

  res.render('search');
});

/* POST Search train availibility */
router.post('/search-train', async function(req, res, next){

  if (req.session.user === null) {
    res.redirect('/')
  }

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

/* GET Shop page */
router.get('/shop', function(req, res, next) {

  if (!req.session.user) {
    res.redirect('/')
  }

  console.log('/shop');
  console.log('req.query',req.query.date)

  let alreadyExist = false;

  for(var i = 0; i< req.session.dataTrain.length; i++){
    if(req.session.dataTrain[i].idtrain == req.query.idtrain){
      alreadyExist = true;
    }
  }

  if(alreadyExist == false){
    req.session.dataTrain.push({
      price: req.query.price,
      departure: req.query.departure,
      arrival: req.query.arrival,
      date: req.query.date,
      idtrain: req.query.idtrain,
      departureTime: req.query.departureTime,
    })
  }


  res.render('shop', {dataTrain: req.session.dataTrain});
})

router.get('/logout', function(req,res,next){

  req.session.user = null;

  res.redirect('/')
});
/* GET confirmation */
router.get('/confirmation', async function (req, res, next) {

  const idTrain = JSON.parse(req.query.idtrain);

  const userUpdate = await userModel.updateOne(
    {_id: req.session.user.userId},
    { $addToSet: {train: idTrain} }
  );

  res.render('index');
});

/* GET Last trip page */
router.get('/trip', async function(req, res, next) {

  if (!req.session.user) {
    res.redirect('/')
  } else {
  const user = await userModel.findOne({_id: req.session.user.userId});
  let train = await journeyModel.find({_id: user.train});
  res.render('trip', {user, train});
  };
});

module.exports = router;