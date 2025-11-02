import { useDispatch, useSelector, useStore } from "react-redux";
import { AppStore, AppDispatch, RootState } from "./store";

// SSR-safe hooks
export const useAppDispatch = () => {
  if (typeof window === "undefined") {
    return (() => {}) as any;
  }
  return useDispatch<AppDispatch>();
};

export const useAppSelector = <TSelected>(
  selector: (state: RootState) => TSelected
): TSelected => {
  if (typeof window === "undefined") {
    return undefined as TSelected;
  }
  return useSelector(selector);
};

export const useAppStore = () => {
  if (typeof window === "undefined") {
    return undefined as unknown as AppStore;
  }
  return useStore<AppStore>();
};
