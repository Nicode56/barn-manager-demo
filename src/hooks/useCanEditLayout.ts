import { useDemoAuth } from "../contexts/DemoAuthContext";
import { useIsDesktop } from "./useIsDesktop";

/**
 * Single source of truth for whether the current user can edit the farm/barn
 * map: must be a manager AND on desktop. Staff and clients are always
 * view-only, regardless of screen size.
 *
 * NOTE: this currently reads from DemoAuthProvider. When real auth lands,
 * only this hook's internals need to change — everything consuming
 * `canEditLayout` (FarmLayoutBuilder, LocationCanvas, LocationShape,
 * MapAnnotation) stays the same.
 */
export const useCanEditLayout = (): boolean => {
  const { user } = useDemoAuth();
  const isDesktop = useIsDesktop();

  const isManager = user?.role === "manager";

  return isManager && isDesktop;
};