export function Input({ value, onChange, placeholder, name }) {
  return <input
    className="w-full p-2 border border-gray-300 rounded-xl"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    name={name}
  />;
}