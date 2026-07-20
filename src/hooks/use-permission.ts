import { useStore } from "@/hooks/use-store";

export function usePermission() {
  const { can } = useStore();

  const canAny = (permissions: string[]) => permissions.some(can);
  const canAll = (permissions: string[]) => permissions.every(can);

  return { can, canAny, canAll };
}
