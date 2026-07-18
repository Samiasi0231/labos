import { Button, type ButtonProps } from "@/components/ui/button";

const Spinner = () => (
  <span className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
);

interface PrimaryButtonProps extends ButtonProps {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function PrimaryButton({
  isLoading,
  disabled,
  leftIcon,
  rightIcon,
  children,
  ...rest
}: PrimaryButtonProps) {
  return (
    <Button disabled={isLoading || disabled} {...rest}>
      {
        (leftIcon || isLoading) &&
          isLoading ? <Spinner /> : leftIcon
      }
      {children}
      {rightIcon && rightIcon}
    </Button>
  );
}

export default PrimaryButton;
