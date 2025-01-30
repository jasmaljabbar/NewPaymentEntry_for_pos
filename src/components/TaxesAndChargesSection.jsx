import SelectField from "./SelectField";

const TaxesAndChargesSection = ({ formData, handleChange, purchaseTaxes, taxWithholding, isCheckboxChecked, setIsCheckboxChecked }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SelectField
        label="Purchase Taxes and Charges Template"
        name="purchase_taxes_and_charges_template"
        value={formData.purchase_taxes_and_charges_template}
        onChange={handleChange}
        options={purchaseTaxes}
      />
      {isCheckboxChecked && (
        <SelectField
          label="Tax Withholding Category"
          name="tax_withholding_category"
          value={formData.tax_withholding_category}
          onChange={handleChange}
          options={taxWithholding}
        />
      )}
    </div>
    <div>
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          checked={isCheckboxChecked}
          onChange={() => setIsCheckboxChecked(!isCheckboxChecked)}
          className="mr-2"
        />
        Show Tax Withholding Category
      </label>
    </div>
  </div>
);

export default TaxesAndChargesSection;