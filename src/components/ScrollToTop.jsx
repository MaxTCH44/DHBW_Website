import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * A silent utility component that monitors React Router's location.
 * Since Single Page Applications (SPAs) do not naturally reset the scroll position 
 * when navigating between pages, this hook forces the window to scroll back to the top 
 * every time the route changes.
 */
export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}