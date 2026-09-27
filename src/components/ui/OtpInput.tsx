import Input, { InputProps } from "./Input";

interface OtpInputProps extends InputProps {
  email?: string;
}

export function OtpInput({ email, ...props }: OtpInputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={props.id}
        className="block text-sm font-medium text-text-main pl-1"
      >
        Verification code
      </label>
      <Input
        {...props}
        maxLength={6}
        className={`py-3 tracking-widest text-center text-lg font-mono ${props.className || ""}`}
        placeholder="000000"
      />
      {email && (
        <p className="mt-2 text-xs text-text-muted text-center">
          Sent to {email}
        </p>
      )}
    </div>
  );
}
