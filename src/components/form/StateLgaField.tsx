import { FieldValues, Path, UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { NIGERIA_STATES, getLgasByStateName } from "@/data/nigeria/index";

interface Props<T extends FieldValues & { state?: string; city?: string }> {
  form: UseFormReturn<T>;
}

export function StateLgaFields<
  T extends FieldValues & { state?: string; city?: string },
>({ form }: Props<T>) {
  const selectedState = form.watch("state" as Path<T>) as string | undefined;
  const lgas = selectedState ? getLgasByStateName(selectedState) : [];

  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField
        control={form.control}
        name={"state" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>State *</FormLabel>

            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue("city" as Path<T>, "" as any);
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
              </FormControl>

              <SelectContent>
                {NIGERIA_STATES.map((state) => (
                  <SelectItem key={state.id} value={state.name}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={"city" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Local Government *</FormLabel>

            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!selectedState}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedState ? "Select State first" : "Select LGA"
                    }
                  />
                </SelectTrigger>
              </FormControl>

              <SelectContent>
                {lgas.map((lga) => (
                  <SelectItem key={lga} value={lga}>
                    {lga}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default StateLgaFields;

