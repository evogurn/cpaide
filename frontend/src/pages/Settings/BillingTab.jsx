import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTenantBillingInfo } from '../../services/tenantService.js';
import { toast } from 'sonner';

const BillingTab = () => {
  const {
    data: billingInfo,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['tenantBillingInfo'],
    queryFn: getTenantBillingInfo,
    onError: (error) => {
      toast.error(`Failed to load billing information: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-dark-bg-tertiary rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 dark:bg-dark-bg-tertiary rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-dark-bg-tertiary rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">Failed to load billing information. Please try again later.</p>
        </div>
      </div>
    );
  }

  const { tenant, currentPlan, effectivePrice, discountAmount, finalPrice, hasActiveDiscount } = billingInfo || {};

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
          Billing Information
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
              Current Plan
            </h3>
            <p className="text-gray-500 dark:text-dark-text-secondary">
              Your active subscription plan
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            tenant?.status === 'ACTIVE' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
          }`}>
            {tenant?.status}
          </span>
        </div>

        {currentPlan ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
                {currentPlan.displayName || currentPlan.name}
              </h4>
              <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
                {currentPlan.description}
              </p>
              <div className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
                ${currentPlan.price}
                <span className="text-sm font-normal text-gray-500 dark:text-dark-text-secondary">/month</span>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 dark:text-dark-text-primary mb-3">
                Plan Features:
              </h5>
              <ul className="space-y-2">
                {Array.isArray(currentPlan.features) 
                  ? currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-dark-text-primary">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))
                  : typeof currentPlan.features === 'object' && currentPlan.features !== null
                    ? Object.entries(currentPlan.features).map(([key, value], index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600 dark:text-dark-text-primary">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {key}: {value}
                        </li>
                      ))
                    : <li className="text-sm text-gray-600 dark:text-dark-text-primary">No features specified</li>
                }
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-dark-text-secondary">No active plan</p>
          </div>
        )}
      </div>

      {/* Pricing Summary Card */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
          Pricing Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-dark-text-secondary">Base Plan Price:</span>
              <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                ${currentPlan?.price?.toFixed(2) || '0.00'}
              </span>
            </div>
            

            
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">Discount Applied:</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  -${discountAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 dark:border-dark-border pt-3 md:border-0 md:pt-0">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Total:</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                ${finalPrice.toFixed(2)}
              </span>
            </div>
            
            {hasActiveDiscount && (
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                <span className="font-medium">Active Discount:</span> ${discountAmount.toFixed(2)} off

                {tenant?.discountExpiry && ` until ${new Date(tenant.discountExpiry).toLocaleDateString()}`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
          Recent Payments
        </h3>
        
        {billingInfo?.tenant?.paymentRecords && billingInfo.tenant.paymentRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-bg-primary dark:divide-dark-border">
                {billingInfo.tenant.paymentRecords.map((payment, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                      {payment.plan?.displayName || payment.plan?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary font-medium">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : payment.status === 'FAILED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-dark-text-secondary">No payment history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingTab;