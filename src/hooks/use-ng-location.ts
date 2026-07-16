import { useCallback, useMemo, useState } from "react";
import countriesData from "@/lib/data/countries.json";
import statesData from "@/lib/data/states.json";

const NIGERIA_COUNTRY_ID = 161;

interface Country {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  hasStates: boolean;
}

interface StateOption {
  id: number;
  name: string;
  state_code: string;
}

type CountryStatesEntry = {
  id: number;
  states: StateOption[];
};

const countries = countriesData as Country[];
const statesByCountry = statesData as CountryStatesEntry[];

function getStatesForCountry(countryId: number): StateOption[] {
  return statesByCountry.find((entry) => entry.id === countryId)?.states ?? [];
}

const nigeriaStates = getStatesForCountry(NIGERIA_COUNTRY_ID).map(
  (state) => state.name,
);

export function useNigeriaLocation(countryId: number = NIGERIA_COUNTRY_ID) {
  const [lgas, setLgas] = useState<string[]>([]);

  const states = useMemo(() => {
    if (countryId === NIGERIA_COUNTRY_ID) {
      return nigeriaStates;
    }
    return getStatesForCountry(countryId).map((state) => state.name);
  }, [countryId]);

  const countryList = useMemo<Country[]>(
    () => [...countries].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const fetchLgas = useCallback((state: string) => {
    if (!state) {
      setLgas([]);
      return;
    }

    // LGA data is not bundled in local location files yet.
    setLgas([]);
  }, []);

  return {
    countries: countryList,
    states,
    lgas,
    fetchLgas,
  };
}
