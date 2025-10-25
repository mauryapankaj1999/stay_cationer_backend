export const ERROR = {
  INVALID_FIELD: (fieldsArr: string[]) =>
    fieldsArr.length === 1
      ? `${fieldsArr[0]} is undefined`
      : `The following fields are undefined: ${fieldsArr.join(", ")}`,

  STOCK: {
    NOT_FOUND: "Stock Data for this Product is not found.",
    OUT_OF_STOCK: (skuCode: string) => `The Product with SKU Code ${skuCode} is out of stock.`,
  },
  ORDER_STATUS: {
    NOT_FOUND: "Status is not defined.",
  },
  ORDER: {
    NOT_FOUND: "Can't find the Order.",
    PREV_STATUS_UNMATCHED: "Order not yet Dispatched to be Delivered.",
  },
  REQUEST: {
    INVALID_ID: "Request id is not valid",
    NOT_FOUND: "Can't find the request.",
    EXIST_PENDING:
      "Your request associated with this email or phone number is still pending approval. Please wait for confirmation or contact support for assistance.",
    EXIST_APPROVED:
      "You already have a verified request associated with this email or phone number. Please login with your existing credentials.",
    EXIST_DENIED:
      "Your request associated with this email or phone number has been denied. Please contact support for further assistance.",
  },
  ROLE: {
    NOT_FOUND: "Role is not defined.",
    INSUFFICIENT_PERMISSION: "403 Forbidden: Insufficient permissions. Your role lacks the required scope.",
  },
  USER: {
    INVALID_CREDENTIAL: "Invalid credential.",
    EXIST: "Email or Phone is already registered.",
    EMAIL_BEING_USED: "This email is already being used.",
    PHONE_BEING_USED: "This phone is already being used.",
    NOT_FOUND: "Can't find your account. Please check your credentials or create a new account.",
    INVALID_USER_ID: "User id is not valid.",
    CAN_NOT_FOUND: "Can't find User account.",
    CAN_NOT_FOUND_BUYER: "Can't find Buyer User account.",
    CAN_NOT_LOGIN_FROM_WEB: "Can't login from website.",
  },
  DESTINATION: {
    EXIST: "Destination in this name is already exists.",
    NOT_FOUND: "Can't find the Destination.",
    INVALID_ID: "Destination id is not valid",
    CANT_DELETE: "Destination found under this Destination.",
  },
  COLLECTION: {
    EXIST: "Collection in this name is already exists.",
    NOT_FOUND: "Can't find the Collection.",
    INVALID_ID: "Collection id is not valid",
    CANT_DELETE: "Collection found under this Collection.",
  },
  AMENITYCATEGORY: {
    EXIST: "Amenity Category in this name is already exists.",
    NOT_FOUND: "Can't find the Amenity Category.",
    INVALID_ID: "Amenity Category id is not valid",
    CANT_DELETE: "Amenity Category found under this Amenity Category.",
  },
  AMENITY: {
    EXIST: "Amenity in this name is already exists.",
    NOT_FOUND: "Can't find the Amenity.",
    INVALID_ID: "Amenity id is not valid",
    CANT_DELETE: "Amenity found under this Amenity.",
  },
  PROPERTY: {
    EXIST: "Property in this name is already exists.",
    NOT_FOUND: "Can't find the Property.",
    INVALID_ID: "Property id is not valid",
    CANT_DELETE: "Property found under this Property.",
  },
  BANNER: {
    EXIST: "Banner in this name is already exists.",
    NOT_FOUND: "Can't find the Banner.",
    INVALID_ID: "Banner id is not valid",
    CANT_DELETE: "Banner found under this Banner.",
  },
  REVIEW: {
    EXIST: "Review in this name is already exists.",
    NOT_FOUND: "Can't find the Review.",
    INVALID_ID: "Review id is not valid",
    CANT_DELETE: "Review found under this Review.",
  },
  FAQCATEGORY: {
    EXIST: "Faq Category in this name is already exists.",
    NOT_FOUND: "Can't find the Faq Category.",
    INVALID_ID: "Faq Category id is not valid",
    CANT_DELETE: "Faq Category found under this Faq Category.",
  },
  FAQ: {
    EXIST: "Faq in this name is already exists.",
    NOT_FOUND: "Can't find the Faq.",
    INVALID_ID: "Faq id is not valid",
    CANT_DELETE: "Faq found under this Faq.",
  },
  RATE: {
    EXIST: "Rate in this name is already exists.",
    NOT_FOUND: "Can't find the Rate.",
    INVALID_ID: "Rate id is not valid",
    CANT_DELETE: "Rate found under this Rate.",
  },
  TRANSACTION: {
    EXIST: "Transction in this name is already exists.",
    NOT_FOUND: "Can't find the Transction.",
    INVALID_ID: "Transction id is not valid",
    CANT_DELETE: "Transction found under this Transction.",
  },
  COUPON: {
    EXIST: "Coupon in this name is already exists.",
    NOT_FOUND: "Can't find the Coupon.",
    INVALID_ID: "Coupon id is not valid",
    CANT_DELETE: "Coupon found under this Coupon.",
  },
  PAGE: {
    EXIST: "Page in this name is already exists.",
    NOT_FOUND: "Can't find the Page.",
    INVALID_ID: "Page id is not valid",
    CANT_DELETE: "Page found under this Page.",
  },
} as const;
export type ERROR_TYPE = keyof typeof ERROR;
