export function Textarea({ value, onChange, placeholder }) {
  return <textarea
    className="w-full p-2 border border-gray-300 rounded-xl min-h-[100px]"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
  />;
}