const client = require('../models/dbpg.js');
let RW = require('../models');

module.exports = {

  getReview: async (req, res) => {
    const page = req.params.page || 1;
    const count = req.params.count || 5;
    const product_id = parseInt(req.params.product_id);

    try {
      let response = await RW.reviews.reviews([product_id]);

      response.rows[0].json_agg.map(review => {
        review.date = new Date(Number(review.date)).toISOString();
      })
      response = response.rows[0].json_agg;

      res.status(200);
      res.send({
        product: product_id,
        page: page,
        count: count,
        results: response
      })

    } catch (error) {
      console.error(error);
      res.status(404);
    }


  },

  getMeta: async (req, res) => {
    const product_id = parseInt(req.params.product_id);

    try {
      let response = await RW.reviews.meta([product_id, product_id, product_id]);

      let obj = response.rows[0].json_build_object.characteristics

      // for (key in obj) {
      //   console.log(obj[key].id);
      // }

      res.status(200).send(response.rows[0].json_build_object);

    } catch (error) {
      console.error(error);
      res.status(404);
    }



  },

  // TODO FINISH createReview
  createReview: async (req, res) => {

    const product_id = parseInt(req.params.id);
    const rating = (req.params.rating)
    const summary = (req.params.rating)
    const body = (req.params.body)
    const recommend = (req.params.recommend)
    const name = (req.params.name)
    const email = (req.params.email)
    const photos = (req.params.photos)
    const characteristics = (req.params.characteristics)

    try {
      let response = await RW.reviews.newReview([product_id])
      res.status(201).send('review created');
    } catch (error) {
      console.error(error);
      res.status(404);
    }

  },

  markHelpful: async (req, res) => {

    const review_id = parseInt(req.params.id);

    try {
      let response = RW.reviews.helpfulReview([review_id]);
      res.status(200).send('marked as helpful');

    } catch (error) {
      console.error(error);
      res.status(404);
    }

  },

  reportReview: async (req, res) => {
    const review_id = parseInt(req.params.id);

    try {
      let = await RW.reviews.reportReview([review_id]);
      res.status(200).send('review reported');

    } catch (error) {
      console.error(error);
      res.status(404);
    }
  },

};
