const client = require('../models/dbpg.js');
let RW = require('../models');

module.exports = {

  getReview: (req, res) => {
    var limit = req.params.count || 5;
    var offset = req.params.page || 1;
    var id = parseInt(req.params.product_id) || 1;

    RW.reviews.reviews([id])
      .then(response => {
        res.status(200).send(response.rows[0].json_build_object);
      })
      .catch(err => console.log(err));
  },

  getMeta: (req, res) => {
    var id = parseInt(req.params.product_id) || 1;
    RW.reviews.meta([id, id, id])
    .then(response => {
      res.status(200).send(response.rows[0].json_build_object);
    })
    .catch(err => console.log(err));
  },

  // TODO SET createReview
  createReview: (req, res) => {

    let productId = parseInt(req.params.id);
    let rating = (req.params.rating)
    let summary = (req.params.rating)
    let body = (req.params.body)
    let recommend = (req.params.recommend)
    let name = (req.params.name)
    let email = (req.params.email)
    let photos = (req.params.photos)
    let characteristics = (req.params.characteristics)

    RW.reviews.newReview([id])
    .then(response => {
          res.status(201).send('Review created');
    })
    .catch(err => console.log(err));
  },


  markHelpful: (req, res) => {
    var id = parseInt(req.params.id) || 1;
    RW.reviews.helpfulQuestion([id])
    .then(response => {
      res.status(200).send();
    })
    .catch(err => console.log(err));
  },

  reportReview: (req, res) => {
    var id = parseInt(req.params.id) || 1;
    RW.reviews.reportReview([id])
    .then(response => {
      res.status(200).send();
    })
    .catch(err => console.log(err));
  },

};