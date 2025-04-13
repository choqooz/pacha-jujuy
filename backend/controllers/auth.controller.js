import User from '../models/User.js';
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';

// Registrar un nuevo usuario
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const newUser = new User({
      username,
      email,
      password: CryptoJS.AES.encrypt(password, process.env.PASS_SEC).toString(),
    });

    const savedUser = await newUser.save();
    return res.status(201).json(savedUser);
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'Error al registrar el usuario', details: err });
  }
};

// Iniciar sesión
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Nombre de usuario incorrecto' });
    }

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== password) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SEC,
      { expiresIn: '3d' }
    );

    const { _id, email, isAdmin, createdAt, updatedAt, __v } = user;

    return res.status(200).json({
      _id,
      username,
      email,
      isAdmin,
      createdAt,
      updatedAt,
      __v,
      accessToken,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'Error al iniciar sesión', details: err });
  }
};
