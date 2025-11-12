// Google Analytics utility
export const initGA = (trackingId) => {
  // Use provided ID or default to the app's tracking ID
  const gaId = trackingId || 'G-66L576FZZX';
  
  if (!gaId || gaId === 'G-XXXXXXXXXX') {
    console.log('Google Analytics: No tracking ID provided');
    return;
  }

  // Load Google Analytics script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', gaId);
};

export const trackEvent = (action, category, label, value) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

export const trackPageView = (path) => {
  if (window.gtag) {
    window.gtag('config', process.env.REACT_APP_GA_TRACKING_ID || 'G-66L576FZZX', {
      page_path: path
    });
  }
};

