require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Collection = require('../src/models/Collection');
const Product = require('../src/models/Product');
const Discount = require('../src/models/Discount');

async function run(){
  await mongoose.connect(process.env.MONGO_URI);
  console.log('connected');

  await User.deleteMany({});
  const pw = process.env.ADMIN_PASSWORD || 'Admin123!';
  const user = new User({ email: process.env.ADMIN_EMAIL || 'admin@example.com', passwordHash: await bcrypt.hash(pw, 10) });
  await user.save();
  console.log('admin created', user.email);

  await Collection.deleteMany({});
  const cols = [
    { slug: 'modern-tables', title: 'Modern Tables', image: '/collections/tables.jpg' },
    { slug: 'christmas-decor', title: 'Christmas Décor', image: '/collections/christmas.jpg' },
    { slug: 'sculptures', title: 'Sculptures', image: '/collections/sculptures.jpg' },
    { slug: 'vases', title: 'Vases', image: '/collections/vases.jpg' },
    { slug: 'wood-products', title: 'Wood Products', image: '/collections/wood.jpg' },
    { slug: 'judaica', title: 'Judaica', image: '/collections/judaica.jpg' }
  ];
  await Collection.insertMany(cols);
  console.log('collections seeded');

  await Product.deleteMany({});
  const products = [
    { name: 'Oak Side Table', title: 'Handcrafted Oak Side Table', price: 120, images: ['/products/oak1.jpg'], categories: ['tables'], collections: ['modern-tables'], inventory: 12 },
    { name: 'Ceramic Vase - Blue', title: 'Blue Ceramic Vase', price: 45, images: ['/products/vase1.jpg'], categories: ['vases'], collections: ['vases'], inventory: 30 },
    { name: 'Bronze Sculpture', title: 'Abstract Bronze Sculpture', price: 350, images: ['/products/sculp1.jpg'], categories: ['sculptures'], collections: ['sculptures'], inventory: 5 }
  ];
  await Product.insertMany(products);
  console.log('products seeded');

  await Discount.deleteMany({});
  const d = new Discount({ name: 'Summer Sale 50%', type: 'percentage', value: 50, criteria: { collections: ['modern-tables'], global: false }, active: true });
  await d.save();
  console.log('discount seeded');

  console.log('done');
  process.exit(0);
}

run().catch(e=>{console.error(e);process.exit(1)});
