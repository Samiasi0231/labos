import { useEffect, useState } from "react";

export function useNigeriaLocation() {
  const [states, setStates] = useState<string[]>([]);
  const [lgas, setLgas] = useState<string[]>([]);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);

      try {
        const res = await fetch(
          "https://nga-states-lga.onrender.com/fetch"
        );

        const data = await res.json();

        setStates(
          data.map((item: any) => item.state ?? item)
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  const fetchLgas = async (state: string) => {
    if (!state) {
      setLgas([]);
      return;
    }

    setLoadingLgas(true);

    try {
      const res = await fetch(
        `https://nga-states-lga.onrender.com/?state=${state}`
      );

      const data = await res.json();

      setLgas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingLgas(false);
    }
  };

  return {
    states,
    lgas,
    loadingStates,
    loadingLgas,
    fetchLgas,
  };
}