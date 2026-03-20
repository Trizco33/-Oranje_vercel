import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop - Scrolls to top on every route change.
 * Must be placed inside <BrowserRouter>.
 * This fixes the critical bug where navigating to a new page
 * kept the scroll position from the previous page.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
