import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API } from "../api";
import Section from "../components/Section";
import PaymentTypeSection from "../components/PaymentTypeSection";
import PaymentFromToSection from "../components/PaymentFromToSection";
import AccountsSection from "../components/AccountsSection";
import TaxesAndChargesSection from "../components/TaxesAndChargesSection";
import AccountingDimensionsSection from "../components/AccountingDimensionsSection";
import InputField from "../components/InputField";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";


const PaymentEntryForm = () => {
    const [formData, setFormData] = useState({
        docstatus: 0,
        doctype: "Payment Entry",
        name: "new-payment-entry-" + Math.random().toString(36).substring(2),
        __islocal: 1,
        __unsaved: 1,
        owner: "jasmaljabbar24@gmail.com", // Should be dynamic based on logged in user
        naming_series: "ACC-PAY-.YYYY.-",
        payment_type: "",
        payment_order_status: "Initiated",
        posting_date: new Date().toISOString().split("T")[0],
        company: "Cloud Native IT Solutions (Demo)",
        book_advance_payments_in_separate_party_account: 0,
        reconcile_on_advance_payment_date: 0,
        paid_from_account_currency: "AED",
        paid_to_account_currency: "AED",
        references: [],
        apply_tax_withholding_amount: 0,
        taxes: [],
        deductions: [],
        status: "Draft",
        custom_remarks: 0,
        is_opening: "No",
        letter_head: "CNIT",
        source_exchange_rate: 1,
        target_exchange_rate: 1,
        mode_of_payment: "",
        paid_to: "",
        paid_to_account_type: "",
        paid_to_account_balance: 0,
        base_received_amount: 0,
        unallocated_amount: 0,
        difference_amount: 0,
        party_type: "",
        party: "",
        paid_from: "",
        paid_from_account_balance: 0,
        party_balance: 0,
        party_name: "",
        paid_from_account_type: "",
        contact_person: "",
        contact_email: "",
        paid_amount: 0,
        base_paid_amount: 0,
        received_amount: 0,
        total_allocated_amount: 0,
        base_total_allocated_amount: 0
      });
    
      const [docName, setDocName] = useState(null);
      const [formState, setFormState] = useState('draft');
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState(null);

  const [partyTypes, setPartyTypes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [parties, setParties] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [accountsfrom, setAccountsfrom] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [company, setCompany] = useState([]);
  const [purchaseTaxes, setPurchaseTaxes] = useState([]);
  const [taxWithholding, setTaxWithholding] = useState([]);
  const [partyBalance, setPartyBalance] = useState(null);
  const [companyBankAccounts, setCompanyBankAccounts] = useState([]);
  const [partyBankAccounts, setPartyBankAccounts] = useState([]);
  const [partyContacts, setPartyContacts] = useState([]);
  const [contactEmail, setContactEmail] = useState("");

  const [isParty, setIsParty] = useState(false);
  const [isAccountSection, setIsAccountSection] = useState(false);
  const [isAccountPaid, setIsAccountPaid] = useState(false);
  const [isTaxesAndCharges, setIsTaxesAndCharges] = useState(false);
  const [isAccDimension, setIsAccDimension] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [paymentEntryName, setPaymentEntryName] = useState(null);



  const fetchOptions = useCallback(async (doctype, setter) => {
    try {
      let filters = [];
  
      if (doctype === "Account") {
        if (setter === setAccounts) {
          filters = [
            ["account_type", "in", ["Bank", "Cash"]],
            ["is_group", "=", 0],
            ["company", "=", "Cloud Native IT Solutions (Demo)"],
          ];
        } else if (setter === setAccountsfrom) {
          filters = [
            ["account_type", "in", ["Receivable"]],
            ["is_group", "=", 0],
            ["company", "=", "Cloud Native IT Solutions (Demo)"],
          ];
        }
      }
  
      const response = await axios.get(`${API.baseURL}resource/${doctype}`, {
        params: filters.length ? { filters: JSON.stringify(filters) } : {},
        headers: API.headers,
      });
  
      setter(response.data.data?.map((item) => item.name) || []);
    } catch (error) {
      console.error(`Error fetching ${doctype}:`, error);
      setter([]);
    }
  }, [API.baseURL, API.headers]);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        fetchOptions("Company", setCompany),
        fetchOptions("Party%20Type", setPartyTypes),
        fetchOptions("Mode%20of%20Payment", setPaymentModes),
        fetchOptions("Project", setProjects),
        fetchOptions("Cost%20Center", setCostCenters),
        fetchOptions("Account", setAccounts),
        fetchOptions("Account", setAccountsfrom),
        fetchOptions("Purchase%20Taxes%20and%20Charges%20Template", setPurchaseTaxes),
        fetchOptions("Tax%20Withholding%20Category", setTaxWithholding),
      ]);
    };
    fetchInitialData();
  }, [fetchOptions]);
  

  useEffect(() => {
    if (company.length > 0) {
      setFormData((prev) => ({ ...prev, company: company[0] }));
    }
  }, [company]);

  useEffect(() => {
    if (formData.party_type) {
      fetchOptions(formData.party_type, setParties);
    }
  }, [formData.party_type, fetchOptions]);
  

  useEffect(() => {
    if (formData.party) {
      const fetchPartyData = async () => {
        await Promise.all([
          fetchOptions(`Bank%20Account?filters=[["party","=","${formData.party}"]]`, setCompanyBankAccounts),
          fetchOptions(`Bank%20Account?filters=[["party","=","${formData.party}"]]`, setPartyBankAccounts),
          fetchOptions(`Contact?filters=[["name","=","${formData.party}"]]`, setPartyContacts),
        ]);
      };
      formData.party_name = formData.party
      fetchPartyData();
    }
  }, [formData.party, fetchOptions]);

  useEffect(() => {
    if (formData.contact_person) {
      const fetchEmail = async () => {
        try {
          const response = await axios.get(`${API.baseURL}resource/Contact`, {
            params: {
              filters: JSON.stringify([["name", "=", formData.contact_person]]),
              fields: JSON.stringify(["email_id"]),
            },
            headers: API.headers,
          });
          const email = response.data.data?.[0]?.email_id || "";
          setContactEmail(email);
          formData.contact_email= email
        } catch (error) {
          console.error("Error fetching email:", error);
          setContactEmail("");
        }
      };
      fetchEmail();
    }
  }, [formData.contact_person]);


  useEffect(() => {
    const fetchPartyBalance = async () => {
      if (!formData.party || !formData.party_type) {
        setPartyBalance(null);
        return;
      }

      try {
        // First, get all GL entries for the party
        const response = await axios.get(`${API.baseURL}resource/GL Entry`, {
          params: {
            filters: JSON.stringify([
              ["party", "=", formData.party],
              ["docstatus", "=", 1], // Only consider submitted documents
              ["is_cancelled", "=", 0] // Exclude cancelled entries
            ]),
            fields: JSON.stringify(["posting_date", "debit", "credit", "party"]),
            limit_page_length: 1000 // Increase if you have more entries
          },
          headers: API.headers
        });

        if (!response.data.data || !Array.isArray(response.data.data)) {
          console.error("Invalid response format:", response.data);
          setPartyBalance(0);
          return;
        }

        // Calculate the running balance
        const balance = response.data.data.reduce((acc, entry) => {
          const debit = parseFloat(entry.debit || 0);
          const credit = parseFloat(entry.credit || 0);
          
          // For receivable accounts (Customer), positive balance means customer owes money
          // For payable accounts (Supplier), positive balance means we owe money
          if (formData.party_type === "Customer") {
            return acc + (debit - credit);
          } else if (formData.party_type === "Supplier") {
            return acc + (credit - debit);
          }
          return acc;
        }, 0);

        // Round to 2 decimal places
        const roundedBalance = Math.round(balance * 100) / 100;
        console.log(`Calculated balance for ${formData.party}: ${roundedBalance}`);
        setPartyBalance(roundedBalance);
        formData.party_balance = roundedBalance;
        

      } catch (error) {
        console.error("Error fetching party balance:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
        }
        setPartyBalance(null);
      }
    };

    fetchPartyBalance();
  }, [formData.party, formData.party_type]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    // Handle numeric fields
    const numericFields = [
      'paid_amount', 'received_amount', 'base_paid_amount', 
      'base_received_amount', 'unallocated_amount'
    ];
    
    if (numericFields.includes(name)) {
      const numValue = parseFloat(value) || 0;
      formattedValue = numValue;
      
      // Update related amount fields
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
        base_paid_amount: numValue,
        base_received_amount: numValue,
        unallocated_amount: numValue,
        received_amount: numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }

    // Special handling for party selection
    if (name === 'party') {
      setFormData(prev => ({
        ...prev,
        party: value,
        party_name: value
      }));
    }
  };
  

  const saveDocument = async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      // Format the document data
      const docData = {
        docstatus: 0,
        doctype: "Payment Entry",
        name: "new-payment-entry-" + Math.random().toString(36).substring(2),
        __islocal: 1,
        __unsaved: 1,
        owner: formData.owner,
        naming_series: "ACC-PAY-.YYYY.-",
        payment_type: formData.payment_type,
        payment_order_status: "Initiated",
        posting_date: formData.posting_date,
        company: formData.company,
        mode_of_payment: formData.mode_of_payment,
        party_type: formData.party_type,
        party: formData.party,
        party_name: formData.party_name,
        contact_person: formData.contact_person || "",
        contact_email: formData.contact_email || "",
        paid_from: formData.paid_from,
        paid_to: formData.paid_to,
        paid_amount: parseFloat(formData.paid_amount) || 0,
        received_amount: parseFloat(formData.paid_amount) || 0,
        base_paid_amount: parseFloat(formData.paid_amount) || 0,
        base_received_amount: parseFloat(formData.paid_amount) || 0,
        paid_from_account_currency: "AED",
        paid_to_account_currency: "AED",
        source_exchange_rate: 1,
        target_exchange_rate: 1,
        references: [],
        deductions: [],
        status: "Draft",
        letter_head: "CNIT",
        total_allocated_amount: 0,
        base_total_allocated_amount: 0,
        unallocated_amount: parseFloat(formData.paid_amount) || 0,
        cost_center: formData.cost_center,
        project: formData.project,
        purchase_taxes_and_charges_template: formData.purchase_taxes_and_charges_template,
        apply_tax_withholding_amount: 0,
        custom_remarks: 0,
        is_opening: "No",
        taxes: [],
        paid_from_account_balance: 0,
        paid_to_account_balance: 0,
        party_balance: 0,
        difference_amount: 0,
        reconcile_on_advance_payment_date: 0,
        book_advance_payments_in_separate_party_account: 0,
      };
  
      // Convert the doc object to a JSON string
      const docString = JSON.stringify(docData);
  
      // Debug log
      console.log("Sending payload with stringified doc:", {
        doc: docString,
        action: "Save",
      });
  
      const response = await fetch(
        "https://demo.cloudnativeits.com/api/method/frappe.desk.form.save.savedocs",
        {
          method: "POST",
          headers: {
            ...API.headers,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doc: docString, // Send the doc as a JSON string
            action: "Save",
          }),
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Save error response:", errorText);
        toast.error(`Failed to save document: ${errorText}`);
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }
  
      const data = await response.json();
      console.log("Save response:", data);
  
      if (data.docs && data.docs[0]) {
        setDocName(data.docs[0].name);
        setFormState("saved");
        toast.success("Document saved successfully!");
      } else {
        toast.error("Failed to save document. Please try again.");
        throw new Error("Failed to get document name from response");
      }
    } catch (error) {
      console.error("Final error:", error);
      toast.error(error.message || "Failed to save document. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const requiredFields = {
      payment_type: 'Payment Type',
      party_type: 'Party Type',
      party: 'Party',
      paid_from: 'Paid From Account',
      paid_to: 'Paid To Account',
      paid_amount: 'Amount'
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
    }

    // Validate amount
    if (parseFloat(formData.paid_amount) <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Validate account currency matches
    if (formData.paid_from_account_currency !== formData.paid_to_account_currency) {
      throw new Error('Account currencies must match');
    }
  };

    // Function to check if document has references
    const checkReferences = async () => {
        try {
          const response = await fetch('https://demo.cloudnativeits.com/api/method/erpnext.accounts.doctype.unreconcile_payment.unreconcile_payment.doc_has_references', {
            method: 'POST',
            headers: API.headers,
            body: JSON.stringify({
              doctype: 'Payment Entry',
              docname: docName
            })
          });
          
          const data = await response.json();
          return data.message; // Usually returns boolean indicating if references exist
        } catch (error) {
          throw new Error('Failed to check references: ' + error.message);
        }
      };


      const fetchLatestDocument = async (doctype, docname) => {
        try {
          const response = await fetch(
            `${API.baseURL}resource/${doctype}/${docname}`,
            {
              method: "GET",
              headers: API.headers,
            }
          );
      
          if (!response.ok) {
            throw new Error(`Failed to fetch document: ${response.statusText}`);
          }
      
          const data = await response.json();
          return data.data;
        } catch (error) {
          console.error("Error fetching latest document:", error);
          throw error;
        }
      };

       // Function to submit document
       const submitDocument = async () => {
        setIsLoading(true);
        setError(null);
      
        try {
          // Validate that the document has been saved and has a name
          if (!docName) {
            toast.error("Document must be saved before submission.");
            throw new Error("Document must be saved before submission.");
          }
      
          // Fetch the latest version of the document
          const latestDocument = await fetchLatestDocument("Payment Entry", docName);
      
          // Prepare the payload for submission
          const submitPayload = {
            doc: JSON.stringify({
              ...latestDocument, // Use the latest document data
              docstatus: 1, // Set docstatus to 1 for submission
            }),
            action: "Submit", // Action must be "Submit"
          };
      
          // Debug log
          console.log("Submitting document with payload:", submitPayload);
      
          // Call the savedocs API to submit the document
          const submitResponse = await fetch(
            "https://demo.cloudnativeits.com/api/method/frappe.desk.form.save.savedocs",
            {
              method: "POST",
              headers: {
                ...API.headers,
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(submitPayload),
            }
          );
      
          // Check if the response is OK
          if (!submitResponse.ok) {
            const errorText = await submitResponse.text();
            console.error("Submit error response:", errorText);
            toast.error(`Failed to submit document: ${errorText}`);
            throw new Error(`Server responded with ${submitResponse.status}: ${errorText}`);
          }
      
          // Parse the response
          const submitData = await submitResponse.json();
          console.log("Submit response:", submitData);
      
          // Check if the document was successfully submitted
          if (submitData.docs && submitData.docs[0]) {
            setFormState("submitted");
            toast.success("Document submitted successfully!");
          } else {
            toast.error("Failed to submit document. Please try again.");
            throw new Error("Failed to submit document. Check server logs for details.");
          }
        } catch (error) {
          console.error("Error submitting document:", error);
          toast.error(error.message || "Failed to submit document. Check console for details.");
        } finally {
          setIsLoading(false);
        }
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
      
        try {
          validateForm();
      
          if (formState === "draft") {
            await saveDocument();
          } else if (formState === "saved") {
            await submitDocument();
          }
        } catch (error) {
          console.error("Form submission error:", error);
          toast.error(error.message || "Form submission failed. Please check the form and try again.");
        }
      };
  return (
    <div className="w-full max-w-9xl bg-fuchsia-50 p-16 mx-auto">
        <div className="max-w-6xl mx-auto bg-fixed border-0 rounded-lg bg-fuchsia-50 p-6 shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Payment Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentTypeSection formData={formData} handleChange={handleChange} paymentModes={paymentModes} />
         
            <PaymentFromToSection
              formData={formData}
              handleChange={handleChange}
              partyTypes={partyTypes}
              parties={parties}
              isParty={isParty}
              setIsParty={setIsParty}
              companyBankAccounts={companyBankAccounts}
              partyBankAccounts={partyBankAccounts}
              partyContacts={partyContacts}
              contactEmail={contactEmail}
            />
 
          <Section title="Accounts" isOpen={isAccountSection} toggleOpen={() => setIsAccountSection(!isAccountSection)}>
            <AccountsSection
              formData={formData}
              handleChange={handleChange}
              accounts={accounts}
              accountsFrom={accountsfrom}
              partyBalance={partyBalance}
              isAccountPaid={isAccountPaid}
              setIsAccountPaid={setIsAccountPaid}
            />
          </Section>

          {(formData.party && formData.mode_of_payment) &&(
            <>
            
            <h3 className="text-lg text-left font-medium">Amount / To</h3>
            <div className="flex justify-start">
            <InputField
                className="w-1/2"
                label="Paid Amount (AED)"
                type="text"
                name="paid_amount"
                
                value={formData.paid_amount}
                onChange={handleChange}
                required
            />
            </div>
            </>
            )}

          {(formData.party_type === "Customer" || formData.party_type === "Supplier") && (
            <Section title="Taxes and Charges" isOpen={isTaxesAndCharges} toggleOpen={() => setIsTaxesAndCharges(!isTaxesAndCharges)}>
              <TaxesAndChargesSection
                formData={formData}
                handleChange={handleChange}
                purchaseTaxes={purchaseTaxes}
                taxWithholding={taxWithholding}
                isCheckboxChecked={isCheckboxChecked}
                setIsCheckboxChecked={setIsCheckboxChecked}
              />
            </Section>
          )}
          <Section title="Accounting Dimensions" isOpen={isAccDimension} toggleOpen={() => setIsAccDimension(!isAccDimension)}>
            <AccountingDimensionsSection
              formData={formData}
              handleChange={handleChange}
              projects={projects}
              costCenters={costCenters}
            />
          </Section>

            <div className="flex justify-end space-x-4">
                <button 
                    type="submit" 
                    disabled={isLoading || formState === 'submitted'}
                    className="w-32 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Processing...' : 
                    formState === 'draft' ? 'Save' :
                    formState === 'saved' ? 'Submit' : 'Submitted'}
                </button>
                </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentEntryForm;