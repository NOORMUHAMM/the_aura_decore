require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const collectionRoutes = require('./src/routes/collections');
const discountRoutes = require('./src/routes/discounts');
const miscRoutes = require('./src/routes/misc');
const statsRoutes = require("./src/routes/stats");

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api', miscRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/stats", statsRoutes);
// app.use("/api/stats", statsRoutes);



app.get('/', (req, res) => res.send({ ok: true, service: 'The Aura Decore API' }));

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });
