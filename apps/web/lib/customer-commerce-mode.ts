// Public routing flag only; server authorization and checkout policy remain authoritative.
export const usesCustomerCommerce =
  process.env.NEXT_PUBLIC_CUSTOMER_COMMERCE_TEST_MODE === '1' ||
  process.env.NEXT_PUBLIC_CUSTOMER_COMMERCE_MODE === 'operational' ||
  process.env.NEXT_PUBLIC_CUSTOMER_COMMERCE_MODE === 'testing';
