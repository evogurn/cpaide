import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getAllBillingPlans, upsertBillingPlan, deleteBillingPlan, updateTenantPricing, getTenantBillingInfo } from '../../services/adminService.js';
import { getAllTenants } from '../../services/adminService.js';
import { toast } from 'sonner';

const BillingManagement = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const queryClient = useQueryClient();
  
  // Fetch billing plans and tenants using react-query
  const {
    data: billingPlansData,
    isLoading: plansLoading,
    isError: plansError,
    refetch: refetchPlans
  } = useQuery({
    queryKey: ['billingPlans'],
    queryFn: () => getAllBillingPlans({ page: 1, limit: 100 }), // Get all plans
    onError: (error) => {
      toast.error(`Failed to load billing plans: ${error.message}`);
    },
  });
  
  const billingPlans = billingPlansData?.plans || [];
  
  const {
    data: tenantData = [],
    isLoading: tenantsLoading,
    isError: tenantsError,
    refetch: refetchTenants
  } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => getAllTenants({ page: 1, limit: 100 }), // Get all tenants
    select: (data) => {
      // Transform tenant data for billing display
      return (data.tenants || []).map(tenant => ({
        id: tenant.id,
        name: tenant.name,
        email: tenant.users?.[0]?.email || 'N/A',
        plan: tenant.subscriptionPlan?.name || 'No Plan',
        status: tenant.status.toLowerCase(),
        discount: tenant.discountPercent || 0,
        nextBilling: tenant.nextBillingDate || 'N/A',
        amount: tenant.subscriptionPlan?.price || 0,
        lastPayment: tenant.lastPaymentDate || 'N/A',
        ...tenant
      }));
    },
    onError: (error) => {
      toast.error(`Failed to load tenants: ${error.message}`);
    },
  });

  const handleAddPlan = () => {
    setSelectedPlan(null);
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  const handleEditTenant = (tenant) => {
    setSelectedTenant(tenant);
    setShowTenantModal(true);
  };

  const handleApplyDiscount = (tenantId, discount) => {
    // This will be handled through the updateTenantPricing mutation
  };

  const openPlanModal = (plan = null) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  const closePlanModal = () => {
    setShowPlanModal(false);
    setSelectedPlan(null);
  };

  const openTenantModal = (tenant = null) => {
    setSelectedTenant(tenant);
    setShowTenantModal(true);
  };

  const closeTenantModal = () => {
    setShowTenantModal(false);
    setSelectedTenant(null);
  };

  const filteredTenants = tenantData.filter(tenant => {
    return tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Plan mutations
  const createPlanMutation = useMutation({
    mutationFn: (planData) => upsertBillingPlan(planData),
    onSuccess: () => {
      toast.success('Billing plan created successfully');
      queryClient.invalidateQueries({ queryKey: ['billingPlans'] });
      closePlanModal();
    },
    onError: (error) => {
      toast.error(`Failed to create plan: ${error.message}`);
    },
  });
  
  const updatePlanMutation = useMutation({
    mutationFn: (planData) => upsertBillingPlan(planData),
    onSuccess: () => {
      toast.success('Billing plan updated successfully');
      queryClient.invalidateQueries({ queryKey: ['billingPlans'] });
      closePlanModal();
    },
    onError: (error) => {
      toast.error(`Failed to update plan: ${error.message}`);
    },
  });
  
  const deletePlanMutation = useMutation({
    mutationFn: (planId) => deleteBillingPlan(planId),
    onSuccess: () => {
      toast.success('Billing plan deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['billingPlans'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete plan: ${error.message}`);
    },
  });
  
  // Tenant pricing mutation
  const updateTenantPricingMutation = useMutation({
    mutationFn: ({ tenantId, pricingData }) => updateTenantPricing(tenantId, pricingData),
    onSuccess: () => {
      toast.success('Tenant pricing updated successfully');
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      closeTenantModal();
    },
    onError: (error) => {
      toast.error(`Failed to update tenant pricing: ${error.message}`);
    },
  });
  
  const [featureCount, setFeatureCount] = useState(1);
  
  // Update feature count when selectedPlan changes
  useEffect(() => {
    if (selectedPlan && selectedPlan.features) {
      const count = Math.max(Object.keys(selectedPlan.features).length, 1);
      setFeatureCount(count);
    } else {
      setFeatureCount(1);
    }
  }, [selectedPlan]);
  
  const addFeature = () => {
    setFeatureCount(prev => prev + 1);
  };
  
  const removeFeature = (e, index) => {
    e.preventDefault();
    if (featureCount > 1) {
      setFeatureCount(prev => prev - 1);
    }
  };
  
  const handleSavePlan = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Build features object from key-value pairs
    const features = {};
    
    // Find all feature fields in the form
    let i = 0;
    while (true) {
      const key = formData.get(`feature-key-${i}`);
      const value = formData.get(`feature-value-${i}`);
      
      // If no key field exists, we've reached the end
      if (key === null || key === undefined) {
        break;
      }
      
      // Only add to features if key exists
      if (key) {
        // Try to parse as number, otherwise keep as string
        let parsedValue;
        if (value === undefined || value === null) {
          parsedValue = ""; // Set to empty string if value is blank
        } else {
          parsedValue = isNaN(value) || value === '' ? value : parseFloat(value);
        }
        features[key] = parsedValue;
      }
      
      i++;
    }
    
    const planData = {
      id: selectedPlan?.id, // Include ID if editing
      name: formData.get('name'),
      displayName: formData.get('displayName') || formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      currency: 'USD',
      interval: 'MONTHLY', // Default to monthly
      features: features,
      limits: {}, // Default limits
      isActive: true,
    };
    
    if (selectedPlan?.id) {
      updatePlanMutation.mutate(planData);
    } else {
      createPlanMutation.mutate(planData);
    }
  };

  
  const handleSaveTenantPricing = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const pricingData = {
      discountPercent: formData.get('discountPercent') ? parseFloat(formData.get('discountPercent')) : undefined,
      discountFixedAmount: formData.get('discountFixedAmount') ? parseFloat(formData.get('discountFixedAmount')) : undefined,
      discountExpiry: formData.get('discountExpiry') || undefined,
    };
    
    updateTenantPricingMutation.mutate({
      tenantId: selectedTenant.id,
      pricingData
    });
  };
  
  const handleDeletePlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this billing plan? This action cannot be undone.')) {
      deletePlanMutation.mutate(planId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
            Billing Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
            Manage billing plans and tenant subscriptions
          </p>
        </div>
      </div>

      {/* Plans Section */}
      <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
              Billing Plans
            </h3>
            <button 
              onClick={handleAddPlan}
              className="bg-accent hover:bg-accent-dark text-accent-contrast px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {billingPlans.map((plan) => (
              <div key={plan.id} className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-6 border border-gray-200 dark:border-dark-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                      {plan.displayName || plan.name}
                    </h4>
                    <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">
                      {plan.description}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditPlan(plan)}
                      className="text-accent hover:text-accent-dark"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeletePlan(plan.id)}
                      disabled={deletePlanMutation.isLoading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-500 dark:text-dark-text-secondary">/month</span>
                  </div>
                </div>
                
                <ul className="mt-4 space-y-2">
                  {Object.entries(plan.features).map(([key, value], index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600 dark:text-dark-text-primary">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {key}: {typeof value === 'number' && value < 0 ? 'Unlimited' : value}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      {/* Tenant Billing Section */}
      <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
              Tenant Billing
            </h3>
            <div className="w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                      Next Billing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-bg-primary dark:divide-dark-border">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                          {tenant.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
                          {tenant.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                        {tenant.plan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                        {tenant.discount}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary font-medium">
                        ${Number(tenant.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                        {tenant.nextBilling}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tenant.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {tenant.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleEditTenant(tenant)}
                          className="text-accent hover:text-accent-dark mr-3"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* Payment History Section */}
      <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
            Payment History
          </h3>
          
          <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-bg-primary dark:divide-dark-border">
                  <tr className="hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                        ABC Construction
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                      Pro
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary font-medium">
                      $71.10
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                      2024-12-15
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-accent hover:text-accent-dark">
                        Download
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                        XYZ Builders
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                      Basic
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary font-medium">
                      $29.00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                      2024-12-20
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-accent hover:text-accent-dark">
                        Download
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                        Tech Construction
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                      Enterprise
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary font-medium">
                      $189.05
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                      2024-11-05
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        Failed
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-accent hover:text-accent-dark">
                        Retry
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
      </div>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-4">
                {selectedPlan ? 'Edit Billing Plan' : 'Create New Billing Plan'}
              </h3>
              
              <form onSubmit={handleSavePlan}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedPlan?.name || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      defaultValue={selectedPlan?.displayName || selectedPlan?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Price per Month ($)
                    </label>
                    <input
                      type="number"
                      name="price"
                      defaultValue={selectedPlan?.price || ''}
                      step="0.01"
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      defaultValue={selectedPlan?.description || ''}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Features
                    </label>
                    <div id="features-container">
                      {Array.from({ length: featureCount }).map((_, index) => {
                        // Get the key and value for this index if editing an existing plan
                        const existingFeatures = selectedPlan?.features ? Object.entries(selectedPlan.features) : [];
                        const featureKey = existingFeatures[index] ? existingFeatures[index][0] : '';
                        const featureValue = existingFeatures[index] ? existingFeatures[index][1] : '';
                        
                        return (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              name={`feature-key-${index}`}
                              defaultValue={featureKey}
                              placeholder="Feature name"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                            />
                            <input
                              type="text"
                              name={`feature-value-${index}`}
                              defaultValue={featureValue}
                              placeholder="Value"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                            />
                            {featureCount > 1 && (
                              <button
                                type="button"
                                onClick={(e) => removeFeature(e, index)}
                                className="px-3 py-2 bg-red-500 text-white rounded-md"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="mt-2 px-4 py-2 bg-accent text-accent-contrast rounded-md text-sm font-medium"
                    >
                      Add Feature
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closePlanModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:hover:bg-dark-bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createPlanMutation.isLoading || updatePlanMutation.isLoading}
                    className="px-4 py-2 text-sm font-medium text-accent-contrast bg-accent hover:bg-accent-dark rounded-md disabled:opacity-50"
                  >
                    {createPlanMutation.isLoading || updatePlanMutation.isLoading ? 'Saving...' : (selectedPlan ? 'Update Plan' : 'Create Plan')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Modal */}
      {showTenantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-4">
                Customize Tenant Billing
              </h3>
              
              <form onSubmit={handleSaveTenantPricing}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Tenant: {selectedTenant?.name}
                    </label>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                      {selectedTenant?.email}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Current Plan
                    </label>
                    <select 
                      name="planId"
                      defaultValue={selectedTenant?.subscriptionPlanId || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                    >
                      <option value="">Select a plan</option>
                      {billingPlans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.displayName || plan.name} - ${plan.price}/month
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      name="discountPercent"
                      step="0.01"
                      min="0"
                      max="100"
                      defaultValue={selectedTenant?.discountPercent || ''}
                      placeholder="e.g., 10 for 10% discount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Fixed Discount Amount ($)
                    </label>
                    <input
                      type="number"
                      name="discountFixedAmount"
                      step="0.01"
                      min="0"
                      defaultValue={selectedTenant?.discountFixedAmount || ''}
                      placeholder="Fixed discount amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Discount Expiry Date
                    </label>
                    <input
                      type="date"
                      name="discountExpiry"
                      defaultValue={selectedTenant?.discountExpiry ? new Date(selectedTenant.discountExpiry).toISOString().split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeTenantModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:hover:bg-dark-bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateTenantPricingMutation.isLoading}
                    className="px-4 py-2 text-sm font-medium text-accent-contrast bg-accent hover:bg-accent-dark rounded-md disabled:opacity-50"
                  >
                    {updateTenantPricingMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;