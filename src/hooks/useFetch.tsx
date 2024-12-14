import { useState, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useFetchArray<T>(url: string, options?: RequestInit) {
  const [state, setState] = useState<FetchState<T[]>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    let isMounted = true; // Evita actualizaciones del estado si el componente se desmonta

    const fetchData = async () => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const json: T[] = await response.json();
        if (isMounted) {
          setState({ data: json, loading: false, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setState({ data: null, loading: false, error: (error as Error).message });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup para evitar fugas de memoria
    };
  }, [url, options]);

  return state;
}

export default useFetchArray;