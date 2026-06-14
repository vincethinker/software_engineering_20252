const express = require('express');
const router  = express.Router();
const requireStaff = require('../middleware/requireStaff');

//Models
const Book                = require('../models/Book');
const DrinkProduct        = require('../models/DrinkProduct');
const SnackProduct        = require('../models/SnackProduct');
const CafeOrder           = require('../models/CafeOrder');
const BookOrderDetail     = require('../models/BookOrderDetail');
const DrinkOrderDetail    = require('../models/DrinkOrderDetail');
const WorkingSpaceBooking = require('../models/WorkingSpaceBooking');
const EventRegistration   = require('../models/EventRegistration');
const Deposit             = require('../models/Deposit');
const EventDrinkItem      = require('../models/EventDrinkItem');
const EventSnackItem      = require('../models/EventSnackItem');
const Customer            = require('../models/Customer');
const LoyalMember         = require('../models/LoyalMember');

// Protect all staff routes
router.use(requireStaff);

//  DASHBOARD

router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      pendingOrders,
      ordersToday,
      pendingBookings,
      upcomingEvents,
      depositsToConfirm,
      bookStockResult
    ] = await Promise.all([
      CafeOrder.countDocuments({ order_status: 'pending' }),
      CafeOrder.countDocuments({ order_date: { $gte: today, $lt: tomorrow } }),
      WorkingSpaceBooking.countDocuments({ booking_status: 'pending' }),
      EventRegistration.countDocuments({ event_date: { $gte: today }, registration_status: { $ne: 'cancelled' } }),
      Deposit.countDocuments({ deposit_status: 'received' }),
      Book.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }])
    ]);

    res.render('staff/dashboard', {
      pendingOrders,
      ordersToday,
      pendingBookings,
      upcomingEvents,
      depositsToConfirm,
      bookStock: bookStockResult[0]?.total || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

//  BOOKS

router.get('/books', async (req, res) => {
  try {
    const books = await Book.find().sort({ title: 1 });
    res.render('staff/products/books', { books });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/books/add', (req, res) => {
  res.render('staff/products/book-form', { book: null, action: '/staff/books/add' });
});

router.post('/books/add', async (req, res) => {
  try {
    await Book.create(req.body);
    res.redirect('/staff/books');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/books/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).send('Book not found');
    res.render('staff/products/book-form', { book, action: `/staff/books/${book._id}/edit` });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/books/:id/edit', async (req, res) => {
  try {
    await Book.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/staff/books');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/books/:id/delete', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.redirect('/staff/books');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

//  DRINKS

router.get('/drinks', async (req, res) => {
  try {
    const drinks = await DrinkProduct.find().sort({ drink_name: 1 });
    res.render('staff/products/drinks', { drinks });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/drinks/add', (req, res) => {
  res.render('staff/products/drink-form', { drink: null, action: '/staff/drinks/add' });
});

router.post('/drinks/add', async (req, res) => {
  try {
    await DrinkProduct.create(req.body);
    res.redirect('/staff/drinks');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/drinks/:id/edit', async (req, res) => {
  try {
    const drink = await DrinkProduct.findById(req.params.id);
    if (!drink) return res.status(404).send('Drink not found');
    res.render('staff/products/drink-form', { drink, action: `/staff/drinks/${drink._id}/edit` });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/drinks/:id/edit', async (req, res) => {
  try {
    await DrinkProduct.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/staff/drinks');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/drinks/:id/delete', async (req, res) => {
  try {
    await DrinkProduct.findByIdAndDelete(req.params.id);
    res.redirect('/staff/drinks');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

//  SNACKS

router.get('/snacks', async (req, res) => {
  try {
    const snacks = await SnackProduct.find().sort({ snack_name: 1 });
    res.render('staff/products/snacks', { snacks });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/snacks/add', (req, res) => {
  res.render('staff/products/snack-form', { snack: null, action: '/staff/snacks/add' });
});

router.post('/snacks/add', async (req, res) => {
  try {
    await SnackProduct.create(req.body);
    res.redirect('/staff/snacks');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/snacks/:id/edit', async (req, res) => {
  try {
    const snack = await SnackProduct.findById(req.params.id);
    if (!snack) return res.status(404).send('Snack not found');
    res.render('staff/products/snack-form', { snack, action: `/staff/snacks/${snack._id}/edit` });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/snacks/:id/edit', async (req, res) => {
  try {
    await SnackProduct.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/staff/snacks');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/snacks/:id/delete', async (req, res) => {
  try {
    await SnackProduct.findByIdAndDelete(req.params.id);
    res.redirect('/staff/snacks');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

//  ORDERS

router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { order_status: status } : {};
    const orders = await CafeOrder.find(filter).sort({ order_date: -1 });
    res.render('staff/orders/list', { orders, currentStatus: status || 'all' });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/orders/add', async (req, res) => {
  try {
    const books  = await Book.find({ status: 'available' }).sort({ title: 1 });
    const drinks = await DrinkProduct.find({ status: 'available' }).sort({ drink_name: 1 });
    res.render('staff/orders/order-form', { books, drinks });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/orders/add', async (req, res) => {
  try {
    const { order_type, order_status } = req.body;
    const bookIds   = [].concat(req.body.book_id  || []);
    const bookQtys  = [].concat(req.body.book_qty || []);
    const drinkIds  = [].concat(req.body.drink_id  || []);
    const drinkQtys = [].concat(req.body.drink_qty || []);

    const order = await CafeOrder.create({ order_type, order_status, total_amount: 0 });
    let total = 0;

    for (let i = 0; i < bookIds.length; i++) {
      if (!bookIds[i]) continue;
      const book = await Book.findById(bookIds[i]);
      const qty  = parseInt(bookQtys[i]) || 1;
      if (book) {
        await BookOrderDetail.create({ order_id: order._id, book_id: book._id, quantity: qty, unit_price: book.price });
        total += book.price * qty;
      }
    }
    for (let i = 0; i < drinkIds.length; i++) {
      if (!drinkIds[i]) continue;
      const drink = await DrinkProduct.findById(drinkIds[i]);
      const qty   = parseInt(drinkQtys[i]) || 1;
      if (drink) {
        await DrinkOrderDetail.create({ order_id: order._id, drink_id: drink._id, quantity: qty, unit_price: drink.price });
        total += drink.price * qty;
      }
    }
    await CafeOrder.findByIdAndUpdate(order._id, { total_amount: total });
    res.redirect('/staff/orders');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await CafeOrder.findById(req.params.id);
    if (!order) return res.status(404).send('Order not found');
    const bookItems  = await BookOrderDetail.find({ order_id: req.params.id }).populate('book_id');
    const drinkItems = await DrinkOrderDetail.find({ order_id: req.params.id }).populate('drink_id');
    res.render('staff/orders/detail', { order, bookItems, drinkItems });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/orders/:id/status', async (req, res) => {
  try {
    await CafeOrder.findByIdAndUpdate(req.params.id, { order_status: req.body.order_status });
    res.redirect('/staff/orders');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

//  BOOKINGs

router.get('/bookings', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { booking_status: status } : {};
    const bookings = await WorkingSpaceBooking.find(filter).sort({ booking_date: 1 });
    res.render('staff/bookings/list', { bookings, currentStatus: status || 'all' });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/bookings/add', (req, res) => {
  res.render('staff/bookings/booking-form');
});

router.post('/bookings/add', async (req, res) => {
  try {
    await WorkingSpaceBooking.create({
      booking_date:     req.body.booking_date,
      start_time:       req.body.start_time,
      end_time:         req.body.end_time,
      number_of_people: req.body.number_of_people,
      booking_status:   req.body.booking_status
    });
    res.redirect('/staff/bookings');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/bookings/:id/status', async (req, res) => {
  try {
    await WorkingSpaceBooking.findByIdAndUpdate(req.params.id, { booking_status: req.body.booking_status });
    res.redirect('/staff/bookings');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

//  events

router.get('/events', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { registration_status: status } : {};
    const events = await EventRegistration.find(filter).sort({ event_date: 1 });
    res.render('staff/events/list', { events, currentStatus: status || 'all' });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/events/add', async (req, res) => {
  try {
    const drinks = await DrinkProduct.find({ status: 'available' }).sort({ drink_name: 1 });
    const snacks = await SnackProduct.find({ status: 'available' }).sort({ snack_name: 1 });
    res.render('staff/events/event-form', { drinks, snacks });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/events/add', async (req, res) => {
  try {
    const { event_name, event_date, start_time, end_time, participant_count, registration_status } = req.body;
    const drinkIds  = [].concat(req.body.drink_id  || []);
    const drinkQtys = [].concat(req.body.drink_qty || []);
    const snackIds  = [].concat(req.body.snack_id  || []);
    const snackQtys = [].concat(req.body.snack_qty || []);

    const event = await EventRegistration.create({
      event_name, event_date, start_time, end_time,
      participant_count, registration_status, quotation_amount: 0
    });
    let total = 0;

    for (let i = 0; i < drinkIds.length; i++) {
      if (!drinkIds[i]) continue;
      const drink = await DrinkProduct.findById(drinkIds[i]);
      const qty   = parseInt(drinkQtys[i]) || 1;
      if (drink) {
        await EventDrinkItem.create({ event_registration_id: event._id, drink_id: drink._id, quantity: qty, unit_price: drink.price });
        total += drink.price * qty;
      }
    }
    for (let i = 0; i < snackIds.length; i++) {
      if (!snackIds[i]) continue;
      const snack = await SnackProduct.findById(snackIds[i]);
      const qty   = parseInt(snackQtys[i]) || 1;
      if (snack) {
        await EventSnackItem.create({ event_registration_id: event._id, snack_id: snack._id, quantity: qty, unit_price: snack.price });
        total += snack.price * qty;
      }
    }
    await EventRegistration.findByIdAndUpdate(event._id, { quotation_amount: total });
    res.redirect('/staff/events');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/events/:id', async (req, res) => {
  try {
    const event = await EventRegistration.findById(req.params.id);
    if (!event) return res.status(404).send('Event not found');
    const deposit    = await Deposit.findOne({ event_registration_id: req.params.id });
    const drinkItems = await EventDrinkItem.find({ event_registration_id: req.params.id }).populate('drink_id');
    const snackItems = await EventSnackItem.find({ event_registration_id: req.params.id }).populate('snack_id');
    res.render('staff/events/detail', { event, deposit, drinkItems, snackItems });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/events/:id/status', async (req, res) => {
  try {
    await EventRegistration.findByIdAndUpdate(req.params.id, { registration_status: req.body.registration_status });
    res.redirect(`/staff/events/${req.params.id}`);
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/events/:id/confirm-deposit', async (req, res) => {
  try {
    await Deposit.findOneAndUpdate(
      { event_registration_id: req.params.id },
      { deposit_status: 'confirmed', deposit_date: new Date() }
    );
    await EventRegistration.findByIdAndUpdate(req.params.id, { registration_status: 'confirmed' });
    res.redirect(`/staff/events/${req.params.id}`);
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});


//  customers

router.get('/customers', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ full_name: 1 });
    const members   = await LoyalMember.find();

    const memberMap = {};
    members.forEach(m => { memberMap[m.customer_id.toString()] = m; });
    res.render('staff/customers/list', { customers, memberMap });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/customers/add', (req, res) => {
  res.render('staff/customers/customer-form', { customer: null, action: '/staff/customers/add' });
});

router.post('/customers/add', async (req, res) => {
  try {
    await Customer.create(req.body);
    res.redirect('/staff/customers');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send('Customer not found');
    const member = await LoyalMember.findOne({ customer_id: req.params.id });
    res.render('staff/customers/detail', { customer, member });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.get('/customers/:id/edit', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send('Customer not found');
    res.render('staff/customers/customer-form', { customer, action: `/staff/customers/${customer._id}/edit` });
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/customers/:id/edit', async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/staff/customers/${req.params.id}`);
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

router.post('/customers/:id/delete', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    await LoyalMember.deleteOne({ customer_id: req.params.id }); // cascade
    res.redirect('/staff/customers');
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

// register vip
router.post('/customers/:id/enroll', async (req, res) => {
  try {
    await LoyalMember.create({ customer_id: req.params.id });
    res.redirect(`/staff/customers/${req.params.id}`);
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

// update tier&points
router.post('/customers/:id/membership', async (req, res) => {
  try {
    await LoyalMember.findOneAndUpdate(
      { customer_id: req.params.id },
      { tier: req.body.tier, total_points: req.body.total_points }
    );
    res.redirect(`/staff/customers/${req.params.id}`);
  } catch (err) { console.error(err); res.status(500).send('Database error'); }
});

module.exports = router;