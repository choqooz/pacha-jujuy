import mongoose from 'mongoose';
const { Schema } = mongoose;

const VentaSchema = new Schema({
  cartId: { type: String, required: true },
  email: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  dni: { type: String, required: true },
  method: { type: String, required: true },
  receivedAmount: { type: String, required: true },
  totalAmount: { type: String, required: true },
  status: { type: String, required: true },
  status_detail: { type: String, required: true },
});

export default mongoose.models.Venta || mongoose.model('Venta', VentaSchema);
