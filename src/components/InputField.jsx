const InputField = ({ label, type, name, value, onChange, required, readOnly, className = "" }) => (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-left text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border rounded-md bg-indigo-50 ${className}`}
        required={required}
        readOnly={readOnly}
      />
    </div>
  );
  
  export default InputField;