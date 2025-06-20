export function Button({ children, onClick, variant = 'primary' }) {
  const base = 'px-4 py-2 rounded-xl font-semibold';
  const styles = variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black';
  return <button onClick={onClick} className={\`\${base} \${styles}\`}>{children}</button>;
}