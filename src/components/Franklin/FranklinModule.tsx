"use client";

import FranklinSearch from "./FranklinSearch";
import FranklinResults from "./FranklinResults";
import { useFranklin, type OpticaTop } from "./hooks/useFranklin";

interface FranklinModuleProps {
  opticas: OpticaTop[];
  opticasRanking: OpticaTop[];
  sugerencias?: string[];
}

export default function FranklinModule({
  opticas,
  opticasRanking,
  sugerencias,
}: FranklinModuleProps) {
  const {
    query,
    setQuery,
    state,
    messages,
    results,
    summary,
    processQuery,
    reset,
    resultsRef,
  } = useFranklin({ opticas, opticasRanking });

  return (
    <>
      <FranklinSearch
        query={query}
        setQuery={setQuery}
        onSearch={processQuery}
        isThinking={state === "thinking"}
        sugerencias={sugerencias}
      />
      <FranklinResults
        state={state}
        messages={messages}
        results={results}
        summary={summary}
        onReset={reset}
        resultsRef={resultsRef}
      />
    </>
  );
}