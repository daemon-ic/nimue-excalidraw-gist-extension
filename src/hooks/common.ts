import { useState } from "react";

export function useInput(
  initialValue = "",
) {
  const [enteredValue, setEnteredValue] = useState(initialValue);

  function onChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setEnteredValue(event?.target?.value);
  }

  function reset() {
    setEnteredValue("");
  }

  return {
    value: enteredValue,
    onChange,
    reset,
  };
}


export function useLoader(startState = false) {
  const [isLoading, setIsLoading] = useState(startState);

  function start() {
    setIsLoading(true);
  }

  function stop() {
    setIsLoading(false);
  }

  return { isLoading, start, stop };
}
