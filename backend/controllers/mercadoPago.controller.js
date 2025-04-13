import mercadopago from 'mercadopago';
import Venta from '../models/Venta.js';

export const createPaymentPreference = async (req, res) => {
  mercadopago.configure({ access_token: process.env.MP_SECRET_KEY });
  try {
    const cartId = req.body._id;
    const result = await mercadopago.preferences.create({
      items: [
        {
          id: cartId,
          title: 'Products Pacha',
          description: 'Carrrito Producto',
          unit_price: req.body.totalAmount,
          currency_id: 'ARS',
          quantity: 1,
        },
      ],
      metadata: {
        cartId: cartId,
        orderId: orderId,
      },
      notification_url: process.env.NOTIFICATION_URL,
      back_urls: {
        success: process.env.CORS_ORIGIN,
        //failure: "https://a907-186-190-128-121.ngrok-free.app/failure",
      },
    });

    res.json(result.body);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

// Process webhook notifications
export const processWebhook = async (req, res) => {
  try {
    const payment = req.query;

    if (payment.type === 'payment') {
      const data = await mercadopago.payment.findById(payment['data.id']);
      // console.log('Datos recibidos de MercadoPago:', data.body);

      // Extraer cartId de metadata
      const cartId = data.body.metadata?.cart_id; // cart_id en vez de cartId por convencion (nomenclatura de mp)

      if (!cartId)
        return res.status(400).json({ message: 'cartId es requerido' });

      // Guardar la venta
      const venta = new Venta({
        cartId,
        email: data.body.payer.email,
        firstName: data.body.payer.first_name,
        lastName: data.body.payer.last_name,
        dni: data.body.payer.identification.number,
        method: data.body.payment_method.type,
        receivedAmount: data.body.transaction_details.net_received_amount,
        totalAmount: data.body.transaction_details.total_paid_amount,
        status: data.body.status,
        status_detail: data.body.status_detail,
      });

      await venta.save();
    }

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error al procesar el webhook' });
  }
};
