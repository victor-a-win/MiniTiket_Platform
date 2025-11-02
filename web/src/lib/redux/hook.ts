import { useDispatch, useSelector, useStore } from "react-redux";
import { AppStore, AppDispatch, RootState } from "./store";

// SSR-safe hooks
export const useAppDispatch = () => {
  if (typeof window === "undefined") {
    return (() => {}) as AppDispatch;
  }
  return useDispatch<AppDispatch>();
};

export const useAppSelector = <TSelected>(
  selector: (state: RootState) => TSelected
): TSelected => {
  if (typeof window === "undefined") {
    // Return a safe default value that matches the expected type
    return undefined as TSelected;
  }

  try {
    return useSelector(selector);
  } catch (error) {
    console.error("Redux selector error:", error);
    return undefined as TSelected;
  }
};

export const useAppStore = () => {
  if (typeof window === "undefined") {
    return undefined as unknown as AppStore;
  }
  return useStore<AppStore>();
};
