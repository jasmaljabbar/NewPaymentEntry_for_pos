import InputField from "./InputField";
import SelectField from "./SelectField";

const AccountsSection = ({ formData, handleChange, accounts, partyBalance, isAccountPaid, setIsAccountPaid }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Section */}
      {formData.party && (
        <div className="space-y-4">
        
        <InputField
          label="Party Balance"
          type="text"
          name="party_balance"
          value={`${partyBalance}.00 د.إ`}
          readOnly
        />
        <SelectField
          label="Account Paid From"
          name="paid_from"
          value={formData.paid_from}
          onChange={handleChange}
          options={accounts}
          required
        />
        <InputField
          label="Account Currency (From)"
          type="text"
          name="paid_from_account_currency"
          value={formData.paid_from_account_currency}
          readOnly
        />
        <InputField
        label="Account Balance (From)"
        type="text"
        name="account_balance_from"
        value={`${partyBalance}.00 د.إ`}
        readOnly
      />
      </div>)}

      {/* Right Section */}
      <div className="space-y-4">
        
        <SelectField
          label="Account Paid To"
          name="paid_to"
          value={formData.paid_to}
          onChange={(e) => {
            handleChange(e);
            setIsAccountPaid(!!e.target.value);
          }}
          options={accounts}
          required
        />
        {isAccountPaid && (
          <>
            <InputField
              label="Account Currency (To)"
              type="text"
              name="paid_to_account_currency"
              value={formData.paid_to_account_currency}
              readOnly
            />
            <InputField
              label="Account Balance (To)"
              type="text"
              name="account_balance_to"
              value="د.إ 0.00"
              readOnly
            />
          </>
        )}
      </div>
    </div>
  </div>
);

export default AccountsSection;