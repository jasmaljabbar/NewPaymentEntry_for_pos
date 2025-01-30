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
    naming_series: "ACC-PAY-YYYY.-",
    posting_date: new Date().toISOString().split("T")[0],
    payment_type:"",
    company: "",
    mode_of_payment: "",
    party_type: "",
    party: "",
    party_balance:"",
    paid_to_account_currency:"AED",
    party_name: "",
    bank_account: "",
    party_bank_account: "",
    contact_person: "",
    contact_email: "",
    paid_from: "",
    paid_to: "",
    purchase_taxes_and_charges_template: "",
    paid_from_account_currency: "AED",
    paid_amount:"",
    received_amount:"",
    tax_withholding_category: "",
    project: "",
    cost_center: "",
    // not added
    // source_exchange_rate:"1000",
    // target_exchange_rate:"1000",
    // base_paid_amount:"1000",
    // base_received_amount:"1000",
  });

  const [partyTypes, setPartyTypes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [parties, setParties] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [accounts, setAccounts] = useState([]);
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

  const fetchOptions = useCallback(async (doctype, setter) => {
    try {
      const response = await axios.get(`${API.baseURL}resource/${doctype}`, {
        headers: API.headers,
      });
      setter(response.data.data?.map((item) => item.name) || []);
      if (doctype === "Account"){
        
      }
      
    } catch (error) {
      console.error(`Error fetching ${doctype}:`, error);
      setter([]);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
        
      await Promise.all([
        fetchOptions("Company", setCompany),
        fetchOptions("Party%20Type", setPartyTypes),
        fetchOptions("Mode%20of%20Payment", setPaymentModes),
        fetchOptions("Project", setProjects),
        fetchOptions("Cost%20Center", setCostCenters),
        fetchOptions("Account", setAccounts),
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
    
    // Convert to number if the field is "paid_amount" or any other numeric field
    const formattedValue = ["paid_amount", "received_amount"].includes(name) 
      ? parseFloat(value) || 0 
      : value;
  
    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
      ...(name === "paid_amount" && { received_amount: formattedValue }), 
    }));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log(formData);
        
      const response = await axios.post(
        `${API.baseURL}resource/Payment%20Entry`,
        formData,
        { headers: API.headers }
      );
      console.log("Success:", response.data);
       // Show success notification
        toast.success("Payment Entry submitted successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit Payment Entry. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-9xl mx-auto p-6">
      <div className="bg-white border rounded-lg p-6 shadow-md">
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
  );
};

export default PaymentEntryForm;