/*
 * Admin figures are always reported in INR.
 *
 * The storefront's useCurrency reads the shopper's selected
 * country out of Redux. Store takings must not change unit
 * because somebody browsed in another currency, so this standalone
 * version drops the Redux dependency entirely - which is also why
 * ADMIN-APP needs no store.
 */

export const formatCurrency = (amount) => {
  const value = Number(amount) || 0;

  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const useCurrency = () => ({
  country: "IN",
  countryName: "India",
  currency: "INR",
  currencySymbol: "₹",
  formatPrice: formatCurrency,
});

export default useCurrency;
