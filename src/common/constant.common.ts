/**
 * This is a copy of the file in the backend
 * Do NOT add anything to this file, only copy and paste the entire file from the backend
 * For any frontend specific constants add it to constat_frontend.common.ts
 */
export const ROLES = {
  ADMIN: "ADMIN",
  SUBADMIN: "SUBADMIN",
  SELLER: "SELLER",
  USER: "USER",
} as const;
export type ROLES_TYPE = keyof typeof ROLES;

export const ROLE_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;
export type ROLE_STATUS_TYPE = keyof typeof ROLE_STATUS;

export const APPROVE_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  DENIED: "DENIED",
} as const;
export type APPROVE_STATUS_TYPE = keyof typeof APPROVE_STATUS;

export const ORDER_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DENIED: "DENIED",
  DISPATCHED: "DISPATCHED", //check stock
  DELIVERED: "DELIVERED",
  CANCELED: "CANCELED",
  RETURNED: "RETURNED",
} as const;
export type ORDER_STATUS_TYPE = keyof typeof ORDER_STATUS;

export const ORDER_UPDATE_STATUS = {
  REJECTED: "REJECTED",
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
} as const;
export type ORDER_UPDATE_STATUS_TYPE = keyof typeof ORDER_UPDATE_STATUS;


export const COUPON_TYPE = {
  PERCENTAGE: "PERCENTAGE",
  FLATOFF: "FLATOFF",
} as const;
export type COUPON_TYPE_TYPE = keyof typeof COUPON_TYPE;

