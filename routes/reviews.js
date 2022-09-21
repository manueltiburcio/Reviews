const express = require('express');
const router = express.Router();

const controller = require('../controllers');

router.get('/', (req, res) => {
  res.status(422).send('Error: invalid product_id provided');
})

router.get('/:product_id', controller.reviews.getReview);

router.get('/meta', (req, res) => {
  res.status(422).send('Error: invalid meta provided');
})
router.get('/meta/:product_id', controller.reviews.getMeta);

router.post(':review_id', controller.reviews.createReview);

router.put('/:id/helpful', controller.reviews.markHelpful);

router.put('/:id/report', controller.reviews.reportReview);

module.exports = router;