type AlertProps = {
  variant: "success" | "error";
  children: React.ReactNode;
};

export default function Alert({ variant, children }: AlertProps) {
  const styles =
    variant === "success"
      ? "bg-success-soft text-success border-success/30"
      : "bg-danger-soft text-danger border-danger/30";

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`mb-6 flex items-start gap-3 rounded-lg border p-4 text-sm font-medium ${styles}`}
    >
      <svg className="mt-0.5 h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        {variant === "success" ? (
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        ) : (
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        )}
      </svg>
      <div>{children}</div>
    </div>
  );
}
