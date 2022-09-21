const client = require('./dbpg');

module.exports = {
  reviews: (params) => {
    let getReviews = `
  (SELECT (json_agg(json_build_object(
		'review_id', rw.id,
		'rating', rw.rating,
		'summary', rw.summary,
		'recommend', rw.recommend,
		'response', rw.response,
		'body', rw.body,
		'date', rw.date,
		'reviewer_name', rw.reviewer_name,
		'helpfulness', rw.helpfulness,
		'photos', (SELECT COALESCE(json_agg(json_build_object('id', rp.id, 'url', rp.url))
              FILTER (WHERE rp.id IS NOT NULL), '[]')
              FROM reviews_photos rp WHERE rp.review_id=rw.id))))
    FROM reviews rw
    WHERE rw.product_id = $1
    GROUP BY rw.product_id)
`;
    return client.query(getReviews, params);
  },


  meta: (params) => {

    let getMeta = `
    SELECT json_build_object
    (
    'product_id', rw.product_id,
    'ratings', (SELECT json_object_agg(rww.rating, (SELECT COUNT (rc.rating) FROM reviews as rc WHERE rc.product_id = $1 GROUP BY rc.product_id))
        FROM reviews as rww
        WHERE rww.product_id = rw.product_id
        GROUP BY rww.product_id
			),

'recommended', (SELECT json_build_object('false', COUNT (rs.recommend::int), 'true', COUNT (rs.recommend::int))
			FROM reviews rs
			WHERE rs.product_id = $2
			GROUP BY rs.product_id
          ),
  'characteristics', (SELECT json_object_agg (c.name, (select json_build_object('id', cr.id, 'value', (cr.value::float / cr.id))
            FROM characteristic_reviews as cr, reviews as rw
            WHERE cr.review_id = rw.id
            GROUP BY cr.id
				    LIMIT 1
													)
                        )
            FROM characteristics as c
            WHERE c.product_id = rw.product_id
            GROUP BY c.product_id)
  )
  FROM reviews rw
  WHERE rw.product_id = $3
  GROUP BY rw.product_id`;

    return client.query(getMeta, params)
  },

  newReview: (params) => {
    let insertReviewQuery = `
          INSERT INTO reviews( \
            product_id, rating, summary, body, recommend, reviewer_name, reviewer_email, photos, characteristics) \
            VALUES ($1, $2, $3, $4, $5, $6,  0, 0) \
          `;
    return client.query(insertReviewQuery, params);
  },


  reportReview: (params) => {
    let updateReportedQuery = `
      UPDATE reviews rw
      SET reported = true
      WHERE rw.id = $1
    `;
    return client.query(updateReportedQuery, params)
  },

  helpfulReview: (params) => {
    let updateHelpfulQuery = `
      UPDATE reviews rw
      SET helpfulness = helpfulness + 1
      WHERE rw.id = $1
    `;
    return client.query(updateHelpfulQuery, params)
  },

  getPhotoCount: () => {
    return client.query('SELECT COUNT(*)+1 FROM reviews_photos')
  },

  insertPhoto: (params) => {
    let insertPhotoQuery = `INSERT INTO public.reviews_photos(id, answer_id, url) VALUES ($1, $2, $3)`;
    return client.query(insertPhotoQuery, params)
  }
};