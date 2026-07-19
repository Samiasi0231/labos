import { Button, type ButtonProps } from "@/components/ui/button";
import { usePermission } from "@/hooks/use-permission";

interface PrimaryButtonProps extends ButtonProps {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

interface PermissionButtonProps extends ButtonProps {
  permission: string | string[];
  matchAll?: boolean;
  fallback?: "disable" | "hide";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Spinner = () => (
  <span className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
);

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

export function PermissionButton({
  permission,
  matchAll = false,
  fallback = "disable",
  ...rest
}: PermissionButtonProps) {
  const { can, canAny, canAll } = usePermission();

  const permitted = Array.isArray(permission)
    ? matchAll
      ? canAll(permission)
      : canAny(permission)
    : can(permission);

  if (!permitted && fallback === "hide") return null;

  return <PrimaryButton disabled={!permitted} {...rest} />;
}

export default PrimaryButton;
