import "../styles/index.css";

interface InputGroupProps {
  label: string;
  placeholder?: string;
  type?: string;
}

export function InputGroup({ label, placeholder, type = "text" }: InputGroupProps) {
  return (
    <div className="input-group-field">
      <label className="form-label">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="form-input-text"
      />
    </div>
  );
}
