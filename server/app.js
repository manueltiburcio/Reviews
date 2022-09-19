const express = require('express');
require("dotenv").config();
const date = require('date-and-time')
const client = require('./dbpg.js');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// TODO set routes and controllers structure
// reviews should not return anything if not passed product_id
app.get('/reviews', (req, res)=>{
  let data = 'Error: invalid product_id provided';
  res.status(422).send(data);
})

app.get('/reviews/:id', (req, res)=>{

  let offset = `
  select az.*, COALESCE(json_agg(json_build_object('id', ap.id, 'url', ap.url))
FILTER (WHERE ap.id IS NOT NULL), '[]') photos
from reviews az
left join reviews_photos ap on ap.review_id=az.id where az.id = ap.review_id
group by az.id
limit 5
OFFSET 3`

  let getQuery = `select json_build_object
  (
  'product_id', qs.product_id,
  'results', ( select json_agg(json_build_object(
         'question_id', qs.id,
         'question_body', qs.body,
         'question_date', qs.date_written,
         'asker_name', qs.asker_name,
         'question_helpfulness', qs.helpful,
         'reported', qs.reported,
         'answers', (select json_build_object(
              az.id, json_build_object(
                  'id', az.id,
                  'body', az.body,
                  'date', az.date_written,
                  'answerer_name', az.answerer_name,
                  'helpfulness', az.helpful,
                  'reported', az.reported,
                  'photos', (select COALESCE(json_agg(json_build_object('id', ap.id, 'url', ap.url))
                                               FILTER (WHERE ap.id IS NOT NULL), '[]')
                             from answers_photos ap where ap.answer_id=az.id)))
                   from answers az
                   where az.question_id=qs.id)
              )
          )
      )
  )
  from questions qs
  WHERE qs.product_id = 1
  GROUP BY qs.product_id;`;

    let getQuery2 = `select az.*, COALESCE(json_agg(json_build_object('id', ap.id, 'url', ap.url))
    FILTER (WHERE ap.id IS NOT NULL), '[]') photos
    from reviews az
    left join reviews_photos ap on ap.review_id=az.id where az.product_id = ${req.params.id}
    group by az.id`;

    let getQuery3 = `
    SELECT json_build_object
(
	'product', ${req.params.id},
	'page', 0,
	'count', 5,
	'results', (SELECT json_agg(json_build_object(
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
				   FROM reviews_photos rp WHERE rp.review_id=rw.id)))
	)


)
FROM reviews rw
WHERE rw.product_id = ${req.params.id}
GROUP BY rw.product_id;
    `;

  client.query(getQuery3, (err, result)=>{
      if(!err){
          res.send(result.rows[0].json_build_object);
      }
  });
  client.end;
})


app.get('/reviews/meta', (req, res)=>{
  let data = 'Error: invalid meta? provided';
  res.status(422).send(data);
})

app.get('/reviews/meta/:id', (req, res)=>{

    let getQuery = `
    SELECT json_build_object
(
'product_id', ${req.params.id},
'ratings', (SELECT json_object_agg(rww.rating, (SELECT COUNT (rc.rating) FROM reviews as rc WHERE rc.product_id = ${req.params.id} GROUP BY rc.product_id))
			 FROM reviews as rww
			 WHERE rww.product_id = ${req.params.id}
			 GROUP BY rww.product_id
			),

'recommended', (SELECT json_build_object('false', COUNT (rw.recommend::int), 'true', COUNT (rw.recommend::int))
			FROM reviews rw
			WHERE rw.product_id = ${req.params.id}
			GROUP BY rw.product_id
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
WHERE rw.product_id = ${req.params.id}
GROUP BY rw.product_id`;

  client.query(getQuery, (err, result)=>{
    if(!err){
        res.send(result.rows[0].json_build_object);
    }
  });
  client.end;
})

app.post('/reviews', (req, res)=> {
  const review = req.body;
  let insertQuery = `insert into reviews(product_id, rating, summary, body, recommend, name, email, photos, characteristics)
                      values('${review.product_id}',
                      '${review.rating}',
                      '${review.summary}',
                      '${review.body}'),
                      '${review.recommend}'),
                      '${review.name}'),
                      '${review.email}'),
                      '${review.photos}'),
                      '${review.characteristics}')`

  client.query(insertQuery, (err, result)=>{
      if(!err){
          res.send('review was created');
      }
      else{ console.log(err.message) }
  })
  client.end;
})

app.put('/reviews/:id/helpful', (req, res)=> {

  let updateQuery = `update reviews
  set helpfulness = helpfulness + 1
  FROM reviews rw
  WHERE reviews.id = ${req.params.id}`

  client.query(updateQuery, (err, result)=>{
      if(!err){
          res.send('Update was successful')
      }
      else{ console.log(err.message) }
  })
  client.end;
})

app.put('/reviews/:id/report', (req, res)=> {

  let updateQuery = `update reviews
  set reported = true
  FROM reviews rw
  WHERE reviews.id = ${req.params.id}`

  client.query(insertQuery, (err, result)=>{
      if(!err){
          res.send('Update was successful')
      }
      else{ console.log(err.message) }
  })
  client.end;
})

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

client.connect();