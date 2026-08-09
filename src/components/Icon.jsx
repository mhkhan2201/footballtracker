export default function Icon({ name, className = '', ...rest }) {
  return (
    <svg className={`icon ${className}`} aria-hidden="true" {...rest}>
      <use href={`#i-${name}`} />
    </svg>
  );
}
