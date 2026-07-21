import { TextInput } from "@/components/form/text-input";
import { SelectInput } from "@/components/form/select-input";
import { useEffect } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
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
      <SelectInput
        form={form}
        name={"state" as Path<T>}
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
    </div>
  );
}

export default StateLgaFields;