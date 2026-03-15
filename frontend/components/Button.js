export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60";

  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500",
    subtle:
      "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus:ring-indigo-300",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300"
  };

  const styles = `${base} ${variants[variant]} ${className}`;

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}

