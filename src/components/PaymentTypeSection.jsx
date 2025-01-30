import InputField from "./InputField";
import SelectField from "./SelectField";

const PaymentTypeSection = ({ formData, handleChange, paymentModes }) => (
  <div className="space-y-4">
    <h3 className="text-lg text-left font-medium">Type of Payment</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Series"
        type="text"
        name="naming_series"
        value={formData.naming_series}
        onChange={handleChange}
        required
      />
      <InputField
        label="Posting Date"
        type="date"
        name="posting_date"
        value={formData.posting_date}
        onChange={handleChange}
        required
      />
      <SelectField
        label="Payment Type"
        name="payment_type"
        value={formData.payment_type}
        onChange={handleChange}
        options={["Receive", "Pay", "Internal Transfer"]}
        required
      />
      <InputField
        label="Company"
        type="text"
        name="company"
        value={formData.company}
        readOnly
      />
      <SelectField
        label="Mode of Payment"
        name="mode_of_payment"
        value={formData.mode_of_payment}
        onChange={handleChange}
        options={paymentModes}
      />
    </div>
  </div>
);

export default PaymentTypeSection;