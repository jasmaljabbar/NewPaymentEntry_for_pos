import SelectField from "./SelectField";

const AccountingDimensionsSection = ({ formData, handleChange, projects, costCenters }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SelectField
        label="Project"
        name="project"
        value={formData.project}
        onChange={handleChange}
        options={projects}
      />
      <SelectField
        label="Cost Center"
        name="cost_center"
        value={formData.cost_center}
        onChange={handleChange}
        options={costCenters}
      />
    </div>
  </div>
);

export default AccountingDimensionsSection;