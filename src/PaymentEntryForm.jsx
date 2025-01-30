import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API } from './api';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { Alert, AlertDescription } from "@chakra-ui/alert"

export default function PaymentEntryForm() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    series: "ACC-PAY-YYYY.-",
    posting_date: new Date().toISOString().split("T")[0],
    payment_type: "receive",
    company: "",
    mode_of_payment: "",
    party_type: "",
    party: "",
    party_name: "",
    bank_account: "",
    party_bank_account: "",
    contact_person: "",
    contact_email: "",
    account_paid_from: "",
    account_paid_to: "",
    purchase_taxes_and_charges_template: "",
    paid_from_account_currency: "AED",
    tax_withholding_category: "",
    project: "",
    cost_center: "",
    party_balance: null,
    account_balance: null
  });
  // UI state
  const [isParty, setIsParty] = useState(false);
  const [isAccountSection, setIsAccountSection] = useState(false);
  const [isAccountPaid, setIsAccountPaid] = useState(false);
  const [isTaxesAndCharges, setIsTaxesAndCharges] = useState(false);
  const [isAccDimension, setIsAccDimension] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    initialData: false,
    partyData: false,
    bankAccounts: false,
    submission: false
  });
  
  // Update loading state handlers
  const setLoadingState = (key, value) => {
    setLoadingStates(prev => ({...prev, [key]: value}));
  };

  // Options state
  const [options, setOptions] = useState({
    partyTypes: [],
    company:[],
    projects: [],
    parties: [],
    costCenters: [],
    accounts: [],
    paymentModes: [],
    companyBankAccounts: [],
    partyContacts: [],
    purchaseTaxes: [],
    taxWithholding: [],
    partyBankAccounts: []
  });

  const fetchOptions = useCallback(async (doctype, optionKey) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API.baseURL}resource/${doctype}`, {
        headers: API.headers,
      });
      setOptions(prev => ({
        ...prev,
        [optionKey]: response.data.data?.map((item) => item.name) || []
      }));
      // console.log(response.data.data?.map((item) => item.name) || [])
      // console.log(response.data)
      
      
    } catch (error) {
      setError(`Error fetching ${doctype}: ${error.message}`);
      setOptions(prev => ({ ...prev, [optionKey]: [] }));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          fetchOptions("Company", "company"),
          fetchOptions("Party%20Type", "partyTypes"),
          fetchOptions("Mode%20of%20Payment", "paymentModes"),
          fetchOptions("Project", "projects"),
          fetchOptions("Cost%20Center", "costCenters"),
          fetchOptions("Account", "accounts"),
          fetchOptions("Purchase%20Taxes%20and%20Charges%20Template", "purchaseTaxes"),
          fetchOptions("Tax%20Withholding%20Category", "taxWithholding")
        ]);
      } catch (error) {
        setError("Failed to fetch initial data: " + error.message);
      }
    };
    fetchInitialData();
  }, [fetchOptions]);


  useEffect(() => {
    if (formData.party_type) {
      fetchOptions(formData.party_type, "parties");
    }
  }, [formData.party_type, fetchOptions]);

  const fetchBankOptions = useCallback(
    async (doctype, setter) => {
      try {
        // Ensure `party` field is valid
        if (!formData.party) {
          console.error("Party field is empty");
          setter([]);
          return;
        }
  
        // Define API parameters
        const params = {
          filters: JSON.stringify([["name", "=", formData.party]]), // Filtering by 'name'
          fields: JSON.stringify(["name"]),
        };
  
        // Fetch data from API
        const response = await axios.get(`${API.baseURL}resource/${doctype}`, {
          params,
          headers: API.headers,
        });
  
        // Extract matching names
        const matchingNames = response.data.data?.map((item) => item.name) || [];
        setter(matchingNames);
        
      } catch (error) {
        console.error(`Fetch error for ${doctype}:`, error);
        setter([]); // Reset state on error
      }
    },
    [formData.party]
  );
  


  const fetchBankAccounts = async () => {
    if (!formData.party) return;
    
    const params = {
      filters: JSON.stringify([["party", "=", formData.party]]),
      fields: JSON.stringify(["name"])
    };

    try {
      const response = await axios.get(`${API.baseURL}resource/Bank%20Account`, {
        params,
        headers: API.headers
      });
      setOptions(prev => ({
        ...prev,
        partyBankAccounts: response.data.data?.map(item => item.name) || []
      }));
    } catch (error) {
      setError(`Error fetching bank accounts: ${error.message}`);
    }
  };


  const fetchPartyContacts = async () => {
    if (!formData.party) return;
  
    const params = {
      filters: JSON.stringify([["name", "=", formData.party]]),
      fields: JSON.stringify(["email_id"]), 
    };
  
    try {
      const response = await axios.get(`${API.baseURL}resource/Contact`, {
        params,
        headers: API.headers
      });
      console.log(response.data?.map(item => item.name) || [],'.......')
      
  
      setOptions(prev => ({
        ...prev,
        partyContacts: response.data.data?.map(item => item.name) || []
      }));
    } catch (error) {
      setError(`Error fetching contacts: ${error.message}`);
    }
  };
  
  
  const fetchPartyBalance = async () => {
    if (!formData.party) return;
    
    try {
      const response = await axios.get(`${API.baseURL}resource/GL%20Entry`, {
        params: {
          filters: JSON.stringify([["party", "=", formData.party]]),
          fields: JSON.stringify(["debit", "credit"])
        },
        headers: API.headers
      });
      
      const balance = response.data.data?.reduce(
        (acc, entry) => acc + (entry.debit || 0) - (entry.credit || 0),
        0
      );
      
      setFormData(prev => ({
        ...prev,
        party_balance: balance
      }));
    } catch (error) {
      setError(`Error fetching party balance: ${error.message}`);
    }
  };

    // Fetch party-dependent data
    useEffect(() => {
    if (formData.party) {
      const fetchPartyData = async () => {
        setLoadingState('partyData', true);
        try {
          await Promise.all([
            fetchBankAccounts(),
            fetchPartyContacts(),
            fetchPartyBalance(),
            // If you need to fetch both company and party bank accounts:
            fetchBankOptions('Bank%20Account', (accounts) => 
              setOptions(prev => ({
                ...prev,
                companyBankAccounts: accounts
              }))
            ),
            fetchBankOptions('Bank%20Account', (accounts) => 
              setOptions(prev => ({
                ...prev,
                partyBankAccounts: accounts
              }))
            )
          ]);
        } catch (error) {
          setError('Error fetching party data: ' + error.message);
        } finally {
          setLoadingState('partyData', false);
        }
      };
      fetchPartyData();
    }
  }, [formData.party]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const required = [
      'series', 'posting_date', 'payment_type', 
      'company', 'party_type', 'account_paid_to'
    ];
    
    const missing = required.filter(field => !formData[field]);
    if (missing.length > 0) {
      setError(`Required fields missing: ${missing.join(', ')}`);
      return false;
    }
    return true;
  };
    // Handle checkbox change
    const handleCheckboxChange = () => {
      setIsCheckboxChecked((prev) => !prev);
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API.baseURL}resource/Payment%20Entry`,
        formData,
        { headers: API.headers }
      );
      // Show success message
      console.log("Payment entry created:", response.data);
    } catch (error) {
      setError(`Failed to submit payment entry: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-9xl mx-auto p-6">
      <div className="bg-white border rounded-lg shadow-md">
      {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
          <h2 className="text-2xl  font-semibold mb-6">Payment Entry</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type of Payment Section */}
            <div className="space-y-4">
            <div className="p-6">
              <h3 className="text-lg text-left font-medium">Type of Payment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="series" className="block text-sm font-medium text-left text-gray-700">
                    Series <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="series"
                    name="series"
                    value={formData.series}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md bg-indigo-50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="posting_date" className="block text-sm text-left font-medium text-gray-700">
                    Posting Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="posting_date"
                    name="posting_date"
                    value={formData.posting_date}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md bg-indigo-50"
                  />
                </div>
              </div>
              

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="payment_type" className="block text-sm font-medium text-left text-gray-700">
                    Payment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="payment_type"
                    name="payment_type"
                    value={formData.payment_type}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md bg-indigo-50"
                  >
                    <option value="receive">Receive</option>
                    <option value="pay">Pay</option>
                    <option value="internal transfer">Internal Transfer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="company" className="block text-sm text-left font-medium text-gray-700">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={options.company}
                    readOnly
                    className="w-full p-2 border rounded-md bg-indigo-50"
                  />
                </div>
              </div>
              

              <div className="flex justify-end">
                <div className="space-y-2 w-25/51">
                  <label htmlFor="mode_of_payment" className="block text-left text-sm font-medium text-gray-700">
                    Mode of Payment
                  </label>
                  <select
                    id="mode_of_payment"
                    name="mode_of_payment"
                    value={formData.mode_of_payment}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md bg-indigo-50"
                  >
                    <option value=""></option>
                    {options.paymentModes.map((mode)=>(
                      <option key={mode.name} value={mode.name}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              </div>

            </div>
            <hr />

           {/* Payment From/To Section */}
              <div className="flex p-6 justify-start space-x-6">
                {/* Left Column */}
                <div className="space-y-4 w-1/2">
                  <h3 className="text-lg text-left font-medium">Payment From / To</h3>
                  <div className="space-y-2">
                    <label htmlFor="party_type" className="block text-sm font-medium text-left text-gray-700">
                      Party Type
                    </label>
                    <select
                      id="party_type"
                      name="party_type"
                      value={formData.party_type}
                      onChange={(e) => {
                        handleChange(e);
                        setIsParty(!!e.target.value);
                      }}
                      className="w-full p-2 border rounded-md bg-indigo-50"
                    >
                      <option value="">Select Party Type</option>
                      {options.partyTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isParty && (
                    <>
                      {/* Party Section */}
                      <div className="space-y-2">
                        <label htmlFor="party" className="block text-sm font-medium text-left text-gray-700">
                          Party
                        </label>
                        <select
                          id="party"
                          name="party"
                          value={formData.party} // Sync the selected value
                          onChange={(e) => {
                            handleChange(e); // Update the form data
                            
                          }}
                          className="w-full p-2 border rounded-md bg-indigo-50"
                        >
                          {options.parties.map((party) => (
                            <option key={party} value={party}>
                              {party}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Party Name Section */}
                      <div className="space-y-2">
                        <label htmlFor="party_name" className="block text-sm font-medium text-left text-gray-700">
                          Party Name
                        </label>
                        <input
                          type="text"
                          id="party_name"
                          name="party_name"
                          value={formData.party}
                          onChange={(e) => setPartyName(e.target.value)} // Allow manual edits
                          className="w-full p-2 border rounded-md bg-indigo-50 text-gray-700"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Right Column */}
                {formData.party && (
                  <div className="space-y-4 pt-11 w-1/2">
                    <div className="space-y-2">
                      <label htmlFor="bank_account" className="block text-sm font-medium text-left text-gray-700">
                        Company Bank Account
                      </label>
                      <select
                          id="bank_account"
                          name="bank_account"
                          value={formData.bank_account} // Sync the selected value
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md bg-indigo-50"
                        >
                          {options.companyBankAccounts.map((party) => (
                            <option key={party} value={party}>
                              {party}
                            </option>
                          ))}
                        </select>
                     
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="party_bank_account" className="block text-sm font-medium text-left text-gray-700">
                        Party Bank Account
                      </label>
                      <select
                          id="party_bank_account"
                          name="party_bank_account"
                          value={formData.party_bank_account} // Sync the selected value
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md bg-indigo-50"
                        >
                          {options.partyBankAccounts.map((party) => (
                            <option key={party} value={party}>
                              {party}
                            </option>
                          ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="contact" className="block text-sm font-medium text-left text-gray-700">
                        Contact
                      </label>
                      <select
                          id="contact_person"
                          name="contact_person"
                          value={formData.contact_person} 
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md bg-indigo-50"
                        >
                          
                          {options.partyContacts.map((party) => (
                            <option key={party} value={party}>
                              {party}
                            </option>
                          ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="contact" className="block text-sm font-medium text-left text-gray-700">
                        Email
                      </label>
                      <input
                        type="text"
                        id="contact_emailv"
                        name="contact_email"
                        value={formData.contact_email}
                        readOnly
                        className="w-full p-2 border rounded-md text-gray-500 bg-indigo-50"
                      />
                    </div>
                  </div>
                )}
              </div>

            <hr />
            {/* Accounts Section */}
              <div className="space-y-4 p-6">
                <button
                  type="button"
                  onClick={() => setIsAccountSection((prev) => !prev)}
                  className="flex items-center space-x-2 text-sm"
                >
                  <h3 className="text-lg font-medium">Accounts</h3>
                  <span className="text-sm">
                    {isAccountSection ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  </span>
                </button>
                
                {isAccountSection && (
                  <div className="flex justify-start space-x-6">
                    {/* Left Column */}
                    {formData.party && (
                      <div className="space-y-4 w-1/2">
                      <div className="space-y-2">
                        <label htmlFor="party_balance" className="block text-sm font-medium text-left text-gray-700">
                          Party Balance
                        </label>
                        <input
                          type="text"
                          id="party_balance"
                          name="party_balance"
                          value={`${formData.party_balance}.00 د.إ`}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md bg-indigo-50 text-gray-700"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="account_paid_from" className="block text-sm font-medium text-left text-gray-700">
                          Account Paid From
                        </label>
                        <select
                          type="text"
                          id="account_paid_from"
                          name="account_paid_from"
                          value={options.accounts.acount_paid_from}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md bg-indigo-50 text-gray-700"
                        >
                          
                          {options.accounts.map((account) => (
                            <option key={account} value={account}>
                              {account}
                            </option>
                          ))}
                         </select>   
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="account_currency_from" className="block text-sm font-medium text-left text-gray-700">
                          Account Currency (From)
                        </label>
                        <input
                          type="text"
                          id="account_currency_from"
                          name="account_currency_from"
                          value={formData.paid_from_account_currency}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md bg-indigo-50 text-gray-700"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="account_balance_from" className="block text-sm font-medium text-left text-gray-700">
                          Account Balance (From)
                        </label>
                        <input
                          type="text"
                          id="account_balance_from"
                          name="account_balance_from"
                          value={`${formData.party_balance}.00 د.إ`}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md bg-indigo-50 text-gray-700"
                        />
                      </div>
                    </div>)}

                    {/* Right Column */}
                    <div className="space-y-4 w-1/2">
                      <div className="space-y-2">
                        <label htmlFor="account_paid_to" className="block text-left text-sm font-medium text-gray-700">
                          Account Paid To <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="account_paid_to"
                          name="account_paid_to"
                          value={formData.account_paid_to}
                          onChange={(e) => {
                            handleChange(e);
                            setIsAccDimension(!!e.target.value);
                          }}
                          className="w-full p-2 border rounded-md bg-indigo-50"
                        >
                          <option value="">Select account</option>
                          {options.accounts.map((account) => (
                            <option key={account} value={account}>
                              {account}
                            </option>
                          ))}
                        </select>
                      </div>

                      {isAccountPaid && (
                        <>
                          <div className="space-y-2">
                            <label htmlFor="account_currency_to" className="block text-left text-sm font-medium text-gray-700">
                              Account Currency (To) <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="account_currency_to"
                              name="account_currency_to"
                              value="AED"
                              readOnly
                              className="w-full p-2 border rounded-md bg-indigo-50"
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="account_balance_to" className="block text-left text-sm font-medium text-gray-700">
                              Account Balance (To)
                            </label>
                            <input
                              type="text"
                              id="account_balance_to"
                              name="account_balance_to"
                              value={"د.إ 0.00"}
                              readOnly
                              className="w-full p-2 border rounded-md bg-indigo-50"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            <hr />
            {/* Taxes and Charges Section */}
            {(formData.party_type === "Customer" | formData.party_type === "Supplier")&&
            <>
              <div className="space-y-4 p-6">
           
            <button
              onClick={() => setIsTaxesAndCharges((prev) => !prev)}
              className="flex items-center space-x-2 text-sm "
            >
              <h3 className="text-lg font-medium">Taxes and Charges</h3>
              <span className="text-sm">{isTaxesAndCharges? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
            </button>

                {isTaxesAndCharges&&(
                <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 justify-end">
                  <div className="space-y-2 ">
                    <label htmlFor="account_paid_to" className="block text-left text-sm font-medium text-gray-700">
                    Purchase Taxes and Charges Template
                    </label>
                    <select
                      id="purchase_taxes_and_charges_template"
                      name="purchase_taxes_and_charges_template"
                      value={formData.purchase_taxes_and_charges_template}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md bg-indigo-50"
                    >
                      {options.purchaseTaxes.map((mode) => (
                      <option key={mode.name} value={mode.name}>
                        {mode}
                      </option>
                    ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                  {/* Checkbox */}
                  <div>
                    <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={isCheckboxChecked}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                      Show Tax Withholding Category
                    </label>
                        </div>

                    {/* Conditional Div */}
                    {isCheckboxChecked && (
                      <div className="space-y-2">
                        <label
                          htmlFor="account_paid_to"
                          className="block text-left text-sm font-medium text-gray-700"
                        >
                          Tax Withholding Category
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="tax_withholding_category"
                          name="tax_withholding_category"
                          value={formData.account_paid_to}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md bg-indigo-50"
                        >
                          {options.taxWithholding.map((mode) => (
                            <option key={mode} value={mode}>
                              {mode}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                </div>
              </div>
              )}
            </div>
            <hr />
            </>
}

            {/* Accounting Dimensions Section */}
            <div className="space-y-4 p-6">
           
            <button
              onClick={() => setIsAccDimension((prev) => !prev)} 
              className="flex items-center space-x-2 text-sm "
            >
              <h3 className="text-lg font-medium">Accounting Dimensions</h3>
              <span className="text-sm">{isAccDimension ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
            </button>

                {isAccDimension &&(
                <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 justify-end">
                  <div className="space-y-2 ">
                    <label htmlFor="account_paid_to" className="block text-left text-sm font-medium text-gray-700">
                    Project 
                    </label>
                    <select
                      id="account_paid_to"
                      name="account_paid_to"
                      value={formData.account_paid_to}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md bg-indigo-50"
                    >
                      {options.projects.map((mode) => (
                      <option key={mode.name} value={mode.name}>
                        {mode}
                      </option>
                    ))}
                    </select>
                  </div>
                  <div className="space-y-2 ">
                    <label htmlFor="account_paid_to" className="block text-left text-sm font-medium text-gray-700">
                    Cost Center
                    </label>
                    <select
                      id="account_paid_to"
                      name="account_paid_to"
                      value={formData.account_paid_to}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md bg-indigo-50"
                    >
                      {options.costCenters.map((mode) => (
                      <option key={mode.name} value={mode.name}>
                        {mode}
                      </option>
                    ))}
                    </select>
                  </div>
              </div>
              )}
            </div>


            <hr />

            <div className="flex justify-end p-6">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit
              </button>
            </div>
          </form>
        
      </div>
    </div>
  )
}

