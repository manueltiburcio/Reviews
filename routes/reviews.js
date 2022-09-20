const express = require('express');
const client = require('../models/dbpg.js');
const router = express.Router();

var controller = require('../controllers');

router.get('/', (req, res)=>{
  let data = 'Error: invalid product_id provided';
  res.status(422).send(data);
})
router.get('/:product_id', controller.reviews.getReview);

router.get('/meta', (req, res)=>{
  let data = 'Error: invalid meta? provided';
  res.status(422).send(data);
})
router.get('/meta/:product_id', controller.reviews.getMeta);

router.post(':review_id', controller.reviews.createReview);

router.put('/:id/helpful', controller.reviews.markHelpful);

router.put('/:id/report', controller.reviews.reportReview);

module.exports = router;