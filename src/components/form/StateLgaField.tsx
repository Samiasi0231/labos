import { Input } from "@/components/ui/input";
import { useEffect } from "react";
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

import { useNigeriaLocation } from "@/hooks/use-ng-location";

interface Props<T extends FieldValues & { state?: string; city?: string }> {
  form: UseFormReturn<T>;
}

export function StateLgaFields<
  T extends FieldValues & { state?: string; city?: string },
>({ form }: Props<T>) {
  const { states, lgas, fetchLgas } = useNigeriaLocation();

  const selectedState = form.watch("state" as Path<T>);

  useEffect(() => {
    if (selectedState) {
      fetchLgas(selectedState as string);
    }
  }, [selectedState]);

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
                  <SelectValue
                    placeholder="Select State"
                  />
                </SelectTrigger>
              </FormControl>

              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
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

            {lgas.length > 0 ? (
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
            ) : (
              <FormControl>
                <Input
                  placeholder={
                    !selectedState ? "Select State first" : "Enter LGA"
                  }
                  disabled={!selectedState}
                  {...field}
                />
              </FormControl>
            )}

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default StateLgaFields;
