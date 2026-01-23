import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTenantBillingInfo, getPersonalizedBillingPlans, updateTenantPlan } from '../services/tenantService.js';
import BillingInfoModal from '../components/BillingInfoModal';
import InvoiceModal from '../components/InvoiceModal';
import PlanModal from '../components/PlanModal';
import PaymentMethodModal from '../components/PaymentMethodModal'; // Added PaymentMethodModal import

const Billing = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('my-plan');
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // Added state for payment modal
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Fetch billing information using react-query
  const {
    data: billingData,
    isLoading: billingLoading,
    isError: billingError,
  } = useQuery({
    queryKey: ['tenantBillingInfo'],
    queryFn: getTenantBillingInfo,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  
  // Fetch personalized billing plans
  const {
    data: plansData,
    isLoading: plansLoading,
    isError: plansError,
  } = useQuery({
    queryKey: ['personalizedBillingPlans'],
    queryFn: getPersonalizedBillingPlans,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  
  // Extract data from API responses
  const tenantBillingInfo = billingData?.tenant || {};
  const currentPlanInfo = billingData?.currentPlan || {};
  const currentPlan = currentPlanInfo.name || 'Basic';
  
  // Scroll to current plan when upgrade plan tab is active
  useEffect(() => {
    if (activeTab === 'upgrade-plan' && currentPlanInfo.name) {
      setTimeout(() => {
        const currentPlanElement = document.querySelector(`[data-plan-name="${currentPlanInfo.name}"]`);
        if (currentPlanElement) {
          currentPlanElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          currentPlanElement.focus();
        }
      }, 100);
    }
  }, [activeTab, currentPlanInfo.name]);
  
  // Mock data fallbacks for payment method and invoices until we have proper API
  const [billingInfo, setBillingInfo] = useState({
    companyName: tenantBillingInfo.name || 'Acme Construction',
    billingEmail: tenantBillingInfo.users?.[0]?.email || 'billing@acme.com',
    billingAddress: tenantBillingInfo.settings?.billingAddress || '123 Main St, City, State',
    vatNumber: tenantBillingInfo.settings?.vatNumber || '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState({
    brand: 'Visa',
    cardNumber: '**** **** **** 1234',
    expiryDate: '12/2027',
    cardholderName: 'John Doe',
  });
  
  const invoices = [
    { id: '#INV-001', date: '2024-11-01', amount: '$19.00', status: 'Paid' },
    { id: '#INV-002', date: '2024-12-01', amount: '$19.00', status: 'Paid' },
    { id: '#INV-003', date: '2025-01-01', amount: '$19.00', status: 'Pending' },
  ];
  
  // Convert API plans data to the format expected by the UI
  const planDetails = {};
  if (plansData) {
    plansData.forEach(plan => {
      planDetails[plan.name] = {
        name: plan.displayName || plan.name,
        price: `$${plan.hasActiveDiscount ? plan.finalPrice : plan.price}`,
        period: `/${plan.interval?.toLowerCase() || 'month'}`,
        storage: plan.features?.maxStorage ? (plan.features.maxStorage < 0 ? 'Unlimited' : `${plan.features.maxStorage / (1024 ** 3)} GB`) : 'N/A',
        users: typeof plan.features?.maxUsers !== 'undefined' ? (plan.features.maxUsers < 0 ? 'Unlimited' : plan.features.maxUsers) : 'N/A',
        aiQueries: typeof plan.features?.aiQueries !== 'undefined' ? (plan.features.aiQueries < 0 ? 'Unlimited' : plan.features.aiQueries) : 'N/A',
        features: Object.entries(plan.features || {}).map(([key, value]) => `${key}: ${typeof value === 'number' && value < 0 ? 'Unlimited' : value}`),
      };
    });
  }
  
  // Default plan details if API data is not available
  if (Object.keys(planDetails).length === 0) {
    planDetails.Basic = { name: 'Basic', price: '$0', period: '/forever', storage: '1 GB', users: '1', aiQueries: '100' };
    planDetails.Pro = { name: 'Pro', price: '$19', period: '/month', storage: '100 GB', users: '10', aiQueries: '10,000' };
    planDetails.Enterprise = { name: 'Enterprise', price: '$99', period: '/month', storage: '1 TB', users: 'Unlimited', aiQueries: 'Unlimited' };
  }
  
  // Get current plan details from API if available, otherwise use the first plan as fallback
  const currentPlanDetails = plansData?.find(plan => plan.id === tenantBillingInfo.subscriptionPlanId) || plansData?.find(plan => plan.name === currentPlanInfo.name) || plansData?.[0] || {
    name: currentPlanInfo.name || 'Basic',
    displayName: currentPlanInfo.displayName || currentPlanInfo.name || 'Basic',
    price: currentPlanInfo.price || 0,
    interval: currentPlanInfo.interval || 'forever',
    features: currentPlanInfo.features || {
      storage: '1 GB',
      users: '1',
      aiQueries: '100'
    }
  };

  // Format the current plan details for display
  const formattedCurrentPlanDetails = {
    name: currentPlanDetails.displayName || currentPlanDetails.name,
    price: `$${currentPlanDetails.hasActiveDiscount ? currentPlanDetails.finalPrice : currentPlanDetails.price}`,

    
    period: `/${currentPlanDetails.interval?.toLowerCase() || 'month'}`,
    storage: currentPlanDetails.features?.maxStorage ? (currentPlanDetails.features.maxStorage < 0 ? 'Unlimited' : `${currentPlanDetails.features.maxStorage / (1024 ** 3)} GB`) : 'N/A',
    users: typeof currentPlanDetails.features?.maxUsers !== 'undefined' ? (currentPlanDetails.features.maxUsers < 0 ? 'Unlimited' : currentPlanDetails.features.maxUsers) : 'N/A',
    aiQueries: typeof currentPlanDetails.features?.aiQueries !== 'undefined' ? (currentPlanDetails.features.aiQueries < 0 ? 'Unlimited' : currentPlanDetails.features.aiQueries) : 'N/A',
  };

  const handleUpdateBillingInfo = (updatedInfo) => {
    setBillingInfo(updatedInfo);
    setShowBillingModal(false);
  };

  // Added function to handle payment method updates
  const handleUpdatePaymentMethod = (updatedPaymentMethod) => {
    // Format the card number for display
    const formattedCardNumber = updatedPaymentMethod.cardNumber.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    
    // Determine card brand
    let brand = 'Card';
    if (updatedPaymentMethod.cardNumber.startsWith('4')) brand = 'Visa';
    if (updatedPaymentMethod.cardNumber.startsWith('5') || updatedPaymentMethod.cardNumber.startsWith('2')) brand = 'MasterCard';
    if (updatedPaymentMethod.cardNumber.startsWith('3')) brand = 'American Express';
    
    setPaymentMethod({
      ...updatedPaymentMethod,
      cardNumber: formattedCardNumber,
      brand: brand
    });
    setShowPaymentModal(false);
  };

  const handleDownloadInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  const handlePlanChange = async (planId) => {
    try {
      await updateTenantPlan(planId);
      toast.success('Plan updated successfully');
      // Refetch billing information to update the current plan
      // We'll refetch by calling the query client invalidate
      await queryClient.invalidateQueries({ queryKey: ['tenantBillingInfo'] });
      await queryClient.invalidateQueries({ queryKey: ['personalizedBillingPlans'] });
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error(error.message || 'Failed to update plan');
    }
  };

  const handleChangePlan = () => {
    setActiveTab('upgrade-plan');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get card brand icon
  const getCardIcon = (brand) => {
    switch (brand) {
      case 'Visa':
        return (
          <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.7 1.3H2.3C1.6 1.3 1 1.9 1 2.6v18.8c0 .7.6 1.3 1.3 1.3h19.4c.7 0 1.3-.6 1.3-1.3V2.6c0-.7-.6-1.3-1.3-1.3zm-11.2 15.6c-.9 0-1.6-.3-2.2-.9-.6-.6-.9-1.4-.9-2.4v-1.4c0-.9.2-1.7.6-2.3.4-.6 1-.9 1.7-1.1.7-.2 1.7-.3 3-.3h1.3v1.3h-1.3c-.9 0-1.5.1-1.8.3-.3.2-.5.5-.5.8v1.4c0 .3.2.6.5.8.3.2.9.3 1.8.3h1.3v1.3h-1.3zm7.6-7.8c-.4-.2-.9-.3-1.5-.3-.6 0-1.1.1-1.5.3-.4.2-.7.5-1 .9-.3.4-.5.9-.5 1.5 0 .6.2 1.1.5 1.5.3.4.7.7 1 .9.3.2.7.3 1.1.3.4 0 .8-.1 1.2-.3.4-.2.7-.5 1-.9.3-.4.5-.9.5-1.5 0-.6-.2-1.1-.5-1.5-.3-.4-.7-.7-1-.9-.3-.2-.7-.3-1.1-.3zm0 2.6c-.3 0-.5-.1-.7-.3-.2-.2-.3-.4-.3-.7 0-.3.1-.5.3-.7.2-.2.4-.3.7-.3.3 0 .5.1.7.3.2.2.3.4.3.7 0 .3-.1.5-.3.7-.2.2-.4.3-.7.3z"/>
          </svg>
        );
      case 'MasterCard':
        return (
          <svg className="h-8 w-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.7 1.3H2.3C1.6 1.3 1 1.9 1 2.6v18.8c0 .7.6 1.3 1.3 1.3h19.4c.7 0 1.3-.6 1.3-1.3V2.6c0-.7-.6-1.3-1.3-1.3zm-11.2 15.6c-.9 0-1.6-.3-2.2-.9-.6-.6-.9-1.4-.9-2.4v-1.4c0-.9.2-1.7.6-2.3.4-.6 1-.9 1.7-1.1.7-.2 1.7-.3 3-.3h1.3v1.3h-1.3c-.9 0-1.5.1-1.8.3-.3.2-.5.5-.5.8v1.4c0 .3.2.6.5.8.3.2.9.3 1.8.3h1.3v1.3h-1.3c-.9 0-1.5.1-1.8.3-.3.2-.5.5-.5.8v1.4c0 .3.2.6.5.8.3.2.9.3 1.8.3h1.3v1.3h-1.3zm7.6-7.8c-.4-.2-.9-.3-1.5-.3-.6 0-1.1.1-1.5.3-.4.2-.7.5-1 .9-.3.4-.5.9-.5 1.5 0 .6.2 1.1.5 1.5.3.4.7.7 1 .9.3.2.7.3 1.1.3.4 0 .8-.1 1.2-.3.4-.2.7-.5 1-.9.3-.4.5-.9.5-1.5 0-.6-.2-1.1-.5-1.5-.3-.4-.7-.7-1-.9-.3-.2-.7-.3-1.1-.3zm0 2.6c-.3 0-.5-.1-.7-.3-.2-.2-.3-.4-.3-.7 0-.3.1-.5.3-.7.2-.2.4-.3.7-.3.3 0 .5.1.7.3.2.2.3.4.3.7 0 .3-.1.5-.3.7-.2.2-.4.3-.7.3z"/>
          </svg>
        );
      default:
        return (
          <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your subscription and billing information</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('my-plan')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-plan'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Plan
          </button>
          <button
            onClick={() => setActiveTab('billing-info')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'billing-info'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Billing Information
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Invoices
          </button>
          <button
            onClick={() => setActiveTab('upgrade-plan')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upgrade-plan'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upgrade Plan
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* My Plan Tab */}
        {activeTab === 'my-plan' && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
                  <div className="mt-2 flex items-center">
                    <span className="text-2xl font-bold text-gray-900">{currentPlanDetails.name}</span>
                    <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-light text-accent-contrast">
                      Current Plan
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {currentPlanDetails.price} {currentPlanDetails.period}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <button
                    type="button"
                    onClick={handleChangePlan}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:hover:bg-dark-bg-primary "
                  >
                    Upgrade
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-gray-50 rounded-lg p-4 dark:bg-surface">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-accent-light rounded-md p-2">
                      <svg className="h-6 w-6 text-accent-contrast" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-text-primary">Storage</h4>
                      <p className="text-lg font-semibold text-gray-900 dark:text-text-primary">{formattedCurrentPlanDetails.storage}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 dark:bg-surface">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-accent-light rounded-md p-2">
                      <svg className="h-6 w-6 text-accent-contrast" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-text-primary">Users</h4>
                      <p className="text-lg font-semibold text-gray-900 dark:text-text-primary">{formattedCurrentPlanDetails.users}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 dark:bg-surface">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-accent-light rounded-md p-2">
                      <svg className="h-6 w-6 text-accent-contrast" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-text-primary">AI Usage</h4>
                      <p className="text-lg font-semibold text-gray-900 dark:text-text-primary">{formattedCurrentPlanDetails.aiQueries}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Information Tab */}
        {activeTab === 'billing-info' && (
          <div>
            {/* Billing Information Card */}
            <div className="bg-white shadow sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Billing Information</h3>
                  <div className="mt-4 md:mt-0">
                    <button
                      type="button"
                      onClick={() => setShowBillingModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:hover:bg-dark-bg-primary "
                    >
                      Edit Billing Info
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <p className="mt-1 text-sm text-gray-900">{billingInfo.companyName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Billing Email</label>
                    <p className="mt-1 text-sm text-gray-900">{billingInfo.billingEmail}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Billing Address</label>
                    <p className="mt-1 text-sm text-gray-900">{billingInfo.billingAddress}</p>
                  </div>

                  {billingInfo.vatNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">VAT Number</label>
                      <p className="mt-1 text-sm text-gray-900">{billingInfo.vatNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
                  <div className="mt-4 md:mt-0">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:hover:bg-dark-bg-primary " 
                    >
                      Edit Payment Method
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getCardIcon(paymentMethod.brand)}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <span className="text-lg font-medium text-gray-900">{paymentMethod.brand}</span>
                        <span className="ml-2 text-sm text-gray-500">ending in</span>
                        <span className="ml-1 text-lg font-medium text-gray-900">
                          {paymentMethod.cardNumber.slice(-4)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Expires {paymentMethod.expiryDate}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Cardholder: {paymentMethod.cardholderName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Invoice History</h3>
              <div className="mt-6 flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 dark:bg-surface">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-text-secondary">
                              Invoice ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-text-secondary">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-text-secondary">
                              Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-text-secondary">
                              Status
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Download</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-surface dark:divide-border-color">
                          {invoices.map((invoice) => (
                            <tr key={invoice.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-text-primary">
                                {invoice.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-secondary">
                                {invoice.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-text-secondary">
                                {invoice.amount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                                  {invoice.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleDownloadInvoice(invoice)}
                                  className="text-accent hover:text-accent-dark"
                                >
                                  Download
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Plan Tab */}
        {activeTab === 'upgrade-plan' && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Choose Your Plan</h3>
              <p className="mt-1 text-sm text-gray-500">Select the plan that best fits your needs.</p>
            
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {plansLoading && (
                  <div className="col-span-full text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                    <p className="mt-2 text-gray-600">Loading plans...</p>
                  </div>
                )}
                {plansError && (
                  <div className="col-span-full text-center py-10">
                    <p className="text-red-600">Error loading plans. Please try again later.</p>
                  </div>
                )}
                {!plansLoading && !plansError && plansData?.map((plan) => (
                  <div 
                    key={plan.id} 
                    data-plan-name={plan.name}
                    className={`border rounded-lg p-6 ${currentPlanInfo.name === plan.name ? 'border-accent bg-accent-light ring-2 ring-accent ring-opacity-50' : 'border-gray-200'} transform hover:scale-105 transition-all duration-300`}
                  >
                    {currentPlanInfo.name === plan.name && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-light text-accent-contrast mb-4">
                        Current Plan
                      </span>
                    )}
                    <h4 className="text-xl font-bold text-gray-900">{plan.displayName || plan.name}</h4>
                    <p className="mt-4">
                      {plan.hasActiveDiscount && plan.originalPrice && plan.originalPrice !== plan.finalPrice ? (
                        <>
                          <span className="text-3xl font-extrabold text-gray-900">${plan.finalPrice.toFixed(2)}</span>
                          <span className="text-gray-500">/{plan.interval?.toLowerCase() || 'month'}</span>
                          <div className="mt-1">
                            <span className="text-sm text-gray-500 line-through">${plan.originalPrice}/{plan.interval?.toLowerCase() || 'month'}</span>
                            <span className="ml-2 text-sm text-green-600 font-medium">Save ${(Math.abs(plan.originalPrice - plan.finalPrice)).toFixed(2)}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl font-extrabold text-gray-900">${plan.price}</span>
                          <span className="text-gray-500">/{plan.interval?.toLowerCase() || 'month'}</span>
                        </>
                      )}
                    </p>
                    <ul className="mt-6 space-y-4">
                      {Object.entries(plan.features || {}).map(([key, value], index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-6 w-6 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="ml-3 text-gray-700">
                            {key}: {typeof value === 'number' && value < 0 ? 'Unlimited' : value}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleSelectPlan({
                        ...plan,
                        name: plan.name,
                        price: `$${plan.hasActiveDiscount ? plan.finalPrice : plan.price}`,
                        period: `/{plan.interval?.toLowerCase() || 'month'}`,
                      })}
                      className={`mt-8 w-full py-2 px-4 rounded-md text-sm font-medium ${
                        currentPlanInfo.name === plan.name
                          ? 'bg-gray-200 text-accent-dark cursor-not-allowed'
                          : 'bg-accent text-accent-contrast hover:bg-accent-dark'
                      }`}
                      disabled={currentPlanInfo.name === plan.name}
                    >
                      {currentPlanInfo.name === plan.name ? 'Current Plan' : 'Select Plan'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Billing Info Modal */}
      {showBillingModal && (
        <BillingInfoModal
          billingInfo={billingInfo}
          onUpdate={handleUpdateBillingInfo}
          onClose={() => setShowBillingModal(false)}
        />
      )}

      {/* Invoice Download Modal */}
      {showInvoiceModal && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

      {/* Plan Selection Modal */}
      {showPlanModal && (
        <PlanModal
          plan={selectedPlan}
          currentPlan={currentPlan}
          onClose={() => setShowPlanModal(false)}
          onPlanChange={() => {
            // Refetch billing information to update the current plan
            queryClient.invalidateQueries({ queryKey: ['tenantBillingInfo'] });
            queryClient.invalidateQueries({ queryKey: ['personalizedBillingPlans'] });
          }}
        />
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <PaymentMethodModal
          paymentMethod={paymentMethod}
          onUpdate={handleUpdatePaymentMethod}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default Billing;