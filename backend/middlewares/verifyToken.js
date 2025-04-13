import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.token;

  if (authHeader) {
    const tokenParts = authHeader.split(' ');

    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({
        status: 0,
        msg: 'Formato de token inválido. Use "Bearer [token]"',
      });
    }

    const token = tokenParts[1];

    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) {
        let errorMessage = 'Token inválido';
        if (err.name === 'TokenExpiredError') {
          errorMessage = 'Token expirado';
        }
        return res.status(403).json({
          status: 0,
          msg: errorMessage,
        });
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({
      status: 0,
      msg: 'No se proporcionó token de autenticación',
    });
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user) return res.status(403).json('User not found!');
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json('You are not alowed to do that!');
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json('You are not alowed to do that!');
    }
  });
};

export { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin };
