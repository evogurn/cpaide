import React, { useState } from "react";

const PaymentMethodModal = ({ paymentMethod, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    cardNumber: paymentMethod.cardNumber || "",
    cardholderName: paymentMethod.cardholderName || "",
    expiryDate: paymentMethod.expiryDate || "",
    cvv: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Format card number with spaces
    if (name === "cardNumber") {
      let formattedValue = value.replace(/\D/g, '').substring(0, 16);
      formattedValue = formattedValue.replace(/(\d{4})/g, '$1 ').trim();
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } 
    // Format expiry date with /
    else if (name === "expiryDate") {
      let formattedValue = value.replace(/\D/g, '').substring(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
      }
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } 
    // Limit CVV to 3-4 digits
    else if (name === "cvv") {
      const formattedValue = value.replace(/\D/g, '').substring(0, 4);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } 
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Remove spaces from card number before saving
    const cleanedData = {
      ...formData,
      cardNumber: formData.cardNumber.replace(/\s/g, ''),
    };
    onUpdate(cleanedData);
  };

  // Get card brand based on card number
  const getCardBrand = (number) => {
    const cleanedNumber = number.replace(/\s/g, '');
    if (cleanedNumber.startsWith('4')) return 'Visa';
    if (cleanedNumber.startsWith('5') || cleanedNumber.startsWith('2')) return 'MasterCard';
    if (cleanedNumber.startsWith('3')) return 'American Express';
    return 'Card';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={onClose}
          ></div>
        </div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Update Payment Method
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor="cardNumber"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Card Number
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type="text"
                          name="cardNumber"
                          id="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          placeholder="1234 5678 9012 3456"
                          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">
                            {getCardBrand(formData.cardNumber)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="cardholderName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Name on Card
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="cardholderName"
                          id="cardholderName"
                          value={formData.cardholderName}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="expiryDate"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Expiry Date
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="expiryDate"
                            id="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="cvv"
                          className="block text-sm font-medium text-gray-700"
                        >
                          CVV
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            name="cvv"
                            id="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="123"
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse dark:bg-dark-bg-tertiary">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent text-base font-medium text-accent-contrast hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border dark:hover:bg-dark-bg-primary"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;