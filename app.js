const express = require('express');
const { initializeApp } = require('firebase/app');
const path = require('path')
const os = require('os')
const { getAnalytics, isSupported } = require('firebase/analytics');
const connectDb = require('./db/connectDb');
require('dotenv').config();
const viewRouter = require('./router/viewRouter');
const apiRouter = require('./router/apiRouter');
const adminRouter = require('./router/adminRouter');
const carRouter = require('./router/carRouter');
const bodyParser = require('body-parser')
const blogRouter = require('./router/blogRouter');
const cookieParser = require('cookie-parser');



const app = express();
connectDb();
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

const fApp = initializeApp(firebaseConfig);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'upload')));
app.use('/', viewRouter);
app.use('/admin', adminRouter);
app.use('/api/v1', apiRouter);
app.use('/car', carRouter);
app.use('/explore', blogRouter);


app.listen(process.env.PORT, () => {
  console.log('App is running on port server : ', process.env.PORT);
})