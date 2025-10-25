import { ObjectId } from 'mongodb';

export interface OrderObject {
  companyName?: string;
  companyAddress?: string;
  companyLogo?: string;
  _id?: string | ObjectId;
  name?: string;
  sellerId?: string | ObjectId;
  email?: string;
  mobile?: string;
  dueDate?: string;
  commission: string | number;
  totalAmount?: string | number;
  subTotalAmount?: string | number;
  startDate?: string | Date;
  endDate?: string | Date;
  gst: {
    tax: number;
    amount: number;
    baseAmount?: number | string;
  };
  hotelsArr?: {
    name?: string;
    hsnSac?: string;
    days?: string;
    rate?: string;
    igst?: string;
    cess?: string;
    amount?: string;
    startDate?: string;
    endDate?: string;
  }[];
  companyContactPerson?: string;
  companyAddressLine1?: string;
  companyAddressLine2?: string;
  companyCity?: string;
  companyCountry?: string;
  companyGSTIN?: string;
  country?: string;
  orderStatus?: string;
  createdAt?: string;
  city?: string;
  state?: string;
  adminNote?: string;
  dicountObj?: {
    amount: number;
  };
  termsAndConditions?: string;
  bookingAmount?: string | number;
}
