import 'express-async-errors';

import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';

//router
import jobRouter from './routers/jobRouter.js';
import authRouter from './routers/authRouter.js';
import userRouter from './routers/userRouter.js';

//public
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

//middleware
import { authenticateUser } from './middleware/authMiddleware.js';

import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static(path.resolve(__dirname, './public')));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the server!');
});

app.get('/api/v1/test', (req, res) => {
  res.json({ msg: 'test route' });
});

// app.post('/api/v1/test', validateTest, (req, res) => {
//   const { name } = req.body;
//   res.json({ msg: `hello ${name}` });
// });

// Not found error route
app.use('/api/v1/jobs', authenticateUser, jobRouter);
app.use('/api/v1/users', authenticateUser, userRouter);
app.use('/api/v1/auth', authRouter);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public', 'index.html'));
});

app.use('*', (req, res) => {
  res.status(404).json({ msg: 'Route not found' });
});

app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5100;

try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`server running on PORT ${port}....`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
