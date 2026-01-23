import React, { useState, useEffect } from 'react';
import { updateTenantPlan } from '../services/tenantService.js';

const PlanModal = ({ plan, onClose, currentPlan, onPlanChange }) => {
  const [countdown, setCountdown] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const isNewPlan = plan.name !== currentPlan;

  useEffect(() => {
    if (isNewPlan && !isProcessing) {
      // Automatically process the plan change when modal opens for new plan
      handlePlanChange();
    }
  }, []); // Empty dependency array to run only once when modal opens

  useEffect(() => {
    if (!isProcessing && countdown > 0 && !isNewPlan) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!isNewPlan && countdown <= 0) {
      onClose();
    }
  }, [countdown, isProcessing, onClose, isNewPlan]);

  const handlePlanChange = async () => {
    setIsProcessing(true);
    try {
      await updateTenantPlan(plan.id);
      if (onPlanChange) {
        onPlanChange(plan);
      }
    } catch (error) {
      console.error('Error updating plan:', error);
    } finally {
      setIsProcessing(false);
      // Start countdown after plan change is processed
      if (isNewPlan) {
        setCountdown(3);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {isProcessing ? 'Processing...' : (isNewPlan ? 'Plan Selected Successfully!' : 'Current Plan Confirmed')}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {isProcessing
                      ? `Switching to the ${plan.name} plan...`
                      : (isNewPlan 
                          ? `You have successfully switched to the ${plan.name} plan. Your new plan will be active immediately.`
                          : `You are currently on the ${plan.name} plan.`)}
                  </p>
                  {!isProcessing && !isNewPlan && (
                    <p className="mt-2 text-sm text-gray-500">
                      This window will automatically close in {countdown} seconds.
                    </p>
                  )}
                  {isProcessing && (
                    <div className="mt-2 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                      <span className="ml-2 text-sm text-gray-500">Please wait...</span>
                    </div>
                  )}
                </div> 
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm  dark:hover:bg-dark-bg-primary" 
              onClick={onClose}
              disabled={isProcessing}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanModal;