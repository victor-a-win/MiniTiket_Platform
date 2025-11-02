import { useDispatch, useSelector, useStore } from "react-redux";
import { AppStore, AppDispatch, RootState } from "./store";

// SSR-safe hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector = <TSelected>(
  selector: (state: RootState) => TSelected
): TSelected => {
  // Prevent Redux from running during SSR
  if (typeof window === "undefined") {
    // Return a default value that matches the expected type
    return undefined as TSelected;
  }
  return useSelector(selector);
};

export const useAppStore = () => useStore<AppStore>();
