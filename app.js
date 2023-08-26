require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cors = require('cors');
const { errorHandler } = require('./middlewares/error-handler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 4000 } = process.env;

const usersRoutes = require('./routes/users');
const moviesRoutes = require('./routes/movies');
const { validateLogin, validateCreateUser } = require('./middlewares/validate');
const { login, createUser, signOut } = require('./controllers/users');
const auth = require('./middlewares/auth');
const NotFoundError = require('./utils/errors/NotFoundError');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const app = express();
app.use(requestLogger);
app.use(helmet());
app.use(limiter);
app.use(cors({
  credentials: true,
  origin: ['http://localhost:4000',
    'https://api.jeka.movies-explorer.nomoredomainsicu.ru',
    'https://jeka.movies-explorer.nomoredomainsicu.ru',
  ],
}));
app.use(express.json());
app.use(cookieParser());
mongoose.connect('mongodb://127.0.0.1:27017/bitfilmsdb', {
  useNewUrlParser: true,
});
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.post('/signin', validateLogin, login);
app.post('/signup', validateCreateUser, createUser);
app.delete('/signout', signOut);

app.use(auth);
app.use('/users', usersRoutes);
app.use('/movies', moviesRoutes);
app.use(errorLogger);
app.use('*', () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Приложение слушает порт: ${PORT}`);
});
