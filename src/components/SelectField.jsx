const SelectField = ({ label, name, value, onChange, options, required, className = "" }) => (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-left text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border rounded-md bg-indigo-50 ${className}`}
        required={required}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
  
  export default SelectField;