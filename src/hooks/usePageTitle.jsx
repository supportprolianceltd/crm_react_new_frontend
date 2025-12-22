import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const formatTitle = (path) => {
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length === 0) return 'Home';
  
  return segments
    .map(segment => 
      segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
    )
    .join(' | ');
};

const usePageTitle = (pageTitle = null, siteName = 'CRM') => {
  const location = useLocation();

  useEffect(() => {
    const urlTitle = formatTitle(location.pathname);
    const finalTitle = pageTitle ? `${urlTitle} | ${pageTitle}` : urlTitle;
    
    document.title = `${siteName} | ${finalTitle}`;
  }, [location.pathname, siteName, pageTitle]);
};

export default usePageTitle;