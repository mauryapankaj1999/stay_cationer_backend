import axios from 'axios';

interface SendOTPParams {
  number: string;
  otp: string;
}

export async function sendOTP({ number, otp }: SendOTPParams): Promise<void> {
  const apiKey = 'YxJHRGuqfkWM5k32F7Vuhw';
  const senderId = 'SAYERT';
  const channel = 2;
  const DCS = 0;
  const flashsms = 0;
  const text = `Your OTP for The StayCationer login is ${otp}. Valid for 10 minutes. Do not share it with anyone. Visit: www.thestaycationer.in - SAYERET BUSINESS SOLUTIONS PRIVATE LIMITED`;

  const url = `http://sms.connexiva.com/api/mt/SendSMS`;
  const params = {
    APIKey: apiKey,
    senderid: senderId,
    channel,
    DCS,
    flashsms,
    number,
    text,
  };

  try {
    await axios.post(url, null, { params });
  } catch (error) {
    // Handle error as needed
    throw new Error('Failed to send OTP');
  }
}
interface BookingSMSParams {
  number: string;
  name: string;
  bookingId: string;
  property: string;
  checkIn: string;
  checkOut: string;
}

export async function sendBookingSMS({
  number,
  name,
  bookingId,
  property,
  checkIn,
  checkOut,
}: BookingSMSParams): Promise<void> {
  const apiKey = 'YxJHRGuqfkWM5k32F7Vuhw';
  const senderId = 'SAYERT';
  const channel = 2;
  const DCS = 0;
  const flashsms = 0;
  const text = `Hi ${name}, Thank you for choosing The StayCationer! Your booking (ID: ${bookingId}) for ${property} is confirmed. We look forward to hosting you from ${checkIn} to ${checkOut}. For details, visit www.thestaycationer.in Safe travels and see you soon! - SAYERET BUSINESS SOLUTIONS PRIVATE LIMITED`;

  const url = `http://sms.connexiva.com/api/mt/SendSMS`;
  const params = {
    APIKey: apiKey,
    senderid: senderId,
    channel,
    DCS,
    flashsms,
    number,
    text,
  };

  try {
    await axios.post(url, null, { params });
  } catch (error) {
    throw new Error('Failed to send booking SMS');
  }
}
