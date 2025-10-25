import razorpay from "razorpay";
type PaymentProps = {
  amount: number;
  currency: string;
  receipt: number;
};
export const createPaymentOrder = async (options: PaymentProps) => {
    try {
        let instance = new razorpay({
          key_id:process.env.razorPayApiKey as string,
          key_secret: process.env.razorPayApiSecret as string,
        });
        let obj = {
          amount: options.amount,
          currency: options.currency,
          receipt: options.currency,
        };
    let orderObj = await instance.orders.create(obj);
    return orderObj;
  } catch (error) {
    console.error(error);
    return error;
  }
};
