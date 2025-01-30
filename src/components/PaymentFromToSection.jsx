import SelectField from "./SelectField";
import InputField from "./InputField";

const PaymentFromToSection = ({
  formData,
  handleChange,
  partyTypes,
  parties,
  isParty,
  setIsParty,
  companyBankAccounts,
  partyBankAccounts,
  partyContacts,
  contactEmail,
}) => (
  <div className="flex p-6 justify-start space-x-6">
    {/* Left Column */}
    <div className="space-y-4 w-1/2">
      <h3 className="text-lg text-left font-medium">Payment From / To</h3>
      <SelectField
        label="Party Type"
        name="party_type"
        value={formData.party_type}
        onChange={(e) => {
          handleChange(e);
          setIsParty(!!e.target.value);
        }}
        options={partyTypes}
      />
      {formData.party_type && (
        <>
          <SelectField
            label="Party"
            name="party"
            value={formData.party}
            onChange={handleChange}
            options={parties}
          />
          <InputField
            label="Party Name"
            type="text"
            name="party_name"
            value={formData.party}
            onChange={handleChange}
          />
        </>
      )}
    </div>

    {/* Right Column */}
    {formData.party && (
      <div className="space-y-4 pt-11 w-1/2">
        <SelectField
          label="Company Bank Account"
          name="bank_account"
          value={formData.bank_account}
          onChange={handleChange}
          options={companyBankAccounts}
        />
        <SelectField
          label="Party Bank Account"
          name="party_bank_account"
          value={formData.party_bank_account}
          onChange={handleChange}
          options={partyBankAccounts}
        />
        <SelectField
          label="Contact"
          name="contact_person"
          value={formData.contact_person}
          onChange={handleChange}
          options={partyContacts}
        />
        <InputField
          label="Email"
          type="text"
          name="contact_email"
          value={formData.contact_email}
          readOnly
          className="text-gray-500"
        />
      </div>
    )}
  </div>
);

export default PaymentFromToSection;