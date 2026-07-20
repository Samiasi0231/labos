import { useCallback, useMemo, useState } from "react";
import countriesData from "@/lib/data/countries.json";
import statesData from "@/lib/data/states.json";
import citiesData from "@/lib/data/cities.json";

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

interface CityOption {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
}

type CountryStatesEntry = {
  id: number;
  states: StateOption[];
};

type CountryCitiesEntry = {
  id: number;
  states: {
    id: number;
    cities: CityOption[];
  }[];
};

const countries = countriesData as Country[];
const statesByCountry = statesData as CountryStatesEntry[];
const citiesByCountry = citiesData as CountryCitiesEntry[];

function getStatesForCountry(countryId: number): StateOption[] {
  return statesByCountry.find((entry) => entry.id === countryId)?.states ?? [];
}

function getCitiesForState(countryId: number, stateId: number): CityOption[] {
  const countryEntry = citiesByCountry.find((entry) => entry.id === countryId);
  return (
    countryEntry?.states.find((state) => state.id === stateId)?.cities ?? []
  );
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

  const fetchLgas = useCallback(
    (state: string) => {
      if (!state) {
        setLgas([]);
        return;
      }

      const stateEntry = getStatesForCountry(countryId).find(
        (s) => s.name === state,
      );

      if (!stateEntry) {
        setLgas([]);
        return;
      }

      const cities = getCitiesForState(countryId, stateEntry.id).map(
        (city) => city.name,
      );

      setLgas(cities);
    },
    [countryId],
  );

  return {
    countries: countryList,
    states,
    lgas,
    fetchLgas,
  };
}