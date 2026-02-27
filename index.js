
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require('path');
const PORT = 3000;
const sqlite3 = require('sqlite3').verbose();
const app = express();
app.use(express.static('public'));

// Middleware setup
app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key-for-your-store', 
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 10 * 60000 } 
}));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


// Connect to database

// เชื่อมต่อฐานข้อมูล
const db = new sqlite3.Database('./phones.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});
// Routes
app.get('/', (req, res) => {
    res.send(`Create your menu.`);
});

app.get('/menu', (req, res) => {  
  db.all(`SELECT * FROM phones`, (err, rows) => {
    if (err) {
      console.error(err.message);
    } else {      
      res.render('showproducts', { data : rows });
    }
  });
});

// add to cart route
app.get('/add-to-cart/:item', (req, res) => {
    const item = req.params.item;
    if (!req.session.cart) {
        req.session.cart = [];
    }
    // Add item to cart
    req.session.cart.push(item);
    console.log(`Item '${item}' added to cart...`);
    res.redirect('/menu');
});

// View cart
app.get('/cart', (req, res) => {

    const cart = req.session.cart || [];
    console.log("Cart:", cart);

    if (cart.length === 0) {
        return res.render('cart', { data: [] });
    }

    const placeholders = cart.map(() => '?').join(',');
    const sql = `SELECT * FROM phones WHERE id IN (${placeholders})`;

    console.log("SQL:", sql);

    db.all(sql, cart, (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("ROWS:", rows);
            res.render('cart', { data: rows });
        }
    });

});

// Clear cart
app.get('/clear-cart', (req, res) => {
    req.session.cart = [];
    res.send('Cart cleared!');
    res.redirect('/menu');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});