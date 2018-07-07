import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import { request } from 'http';
import { getSecret } from './secret';
import Comment from './models/comment';

const app = express();
const router = express.Router();

const API_PORT = process.env.API_PORT || 3001;

mongoose.connect(getSecret('dbUri'));
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.urlencoded( {extended: false}));
app.use(bodyParser.json());
app.use(logger('dev'));

router.get('/', (request, response) => {
  response.json({message: 'Hello, world!'});
});

router.get('/comments', (request, response) => {
  Comment.find((error, comments) => {
    if (error) return response.json({ success: false, error: error });
    return response.json({ success: true, data: comments });
  });
});

router.post('comments', (request, response) => {
  const comment = new Comment();
  const { author, text } = request.body;
  if (!author || !text) {
    return response.json({
      success: false,
      error: 'You must provide an author and comment'
    });
  }

  comment.author = author;
  comment.text = text;
  comment.save(error => {
    if (error) return response.json({ success: false, error: error });
    return response.json({ success: true });
  });
});

app.use('/api', router);

app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));