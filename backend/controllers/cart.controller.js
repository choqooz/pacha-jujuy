import Cart from '../models/Cart.js';

export const createCart = async (req, res) => {
  const newCart = new Cart(req.body);

  try {
    const savedCart = await newCart.save();
    res.status(200).json(savedCart);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const updateCart = async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const deleteCart = async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json('Cart has been deleted...');
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getUserCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId })
      .populate('user')
      .populate('products');
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getAllCarts = async (req, res) => {
  const query = req.query.new;
  try {
    let carts;
    if (query === 'true') {
      carts = await Cart.find()
        .sort({ _id: -1 })
        .limit(10)
        .populate('user')
        .populate('products');
    } else {
      carts = await Cart.find().populate('user').populate('products');
    }
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id)
      .populate('user')
      .populate('products');
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json(err);
  }
};