<<<<<<< HEAD
import { TextInput } from "@/components/form/text-input";
import { SelectInput } from "@/components/form/select-input";
import { useEffect } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { useNigeriaLocation } from "@/hooks/use-ng-location";
=======
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
>>>>>>> origin/main

interface Props<T extends FieldValues & { state?: string; city?: string }> {
  form: UseFormReturn<T>;
}

export function StateLgaFields<
  T extends FieldValues & { state?: string; city?: string },
>({ form }: Props<T>) {
<<<<<<< HEAD
  const { states, lgas, fetchLgas } = useNigeriaLocation();

  const selectedState = form.watch("state" as Path<T>);

  useEffect(() => {
    if (selectedState) {
      fetchLgas(selectedState as string);
    }
  }, [selectedState]);
=======
  const selectedState = form.watch("state" as Path<T>) as string | undefined;
  const lgas = selectedState ? getLgasByStateName(selectedState) : [];
>>>>>>> origin/main

  return (
    <div className="grid grid-cols-2 gap-3">
      <SelectInput
        form={form}
        name={"state" as Path<T>}
<<<<<<< HEAD
        label="State *"
        placeholder="Select State"
        options={states.map((state) => ({ label: state, value: state }))}
        onValueChange={() => form.setValue("city" as Path<T>, "" as any)}
      />

      {lgas.length > 0 ? (
        <SelectInput
          form={form}
          name={"city" as Path<T>}
          label="Local Government *"
          placeholder={!selectedState ? "Select State first" : "Select LGA"}
          disabled={!selectedState}
          options={lgas.map((lga) => ({ label: lga, value: lga }))}
        />
      ) : (
        <TextInput
          form={form}
          name={"city" as Path<T>}
          label="Local Government *"
          placeholder={!selectedState ? "Select State first" : "Enter LGA"}
          disabled={!selectedState}
        />
      )}
=======
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
>>>>>>> origin/main
    </div>
  );
}

<<<<<<< HEAD
export default StateLgaFields;
=======
export default StateLgaFields;

>>>>>>> origin/main
