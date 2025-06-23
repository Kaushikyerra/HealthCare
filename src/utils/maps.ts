const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAUZdfTdxFnRFwYmi0LYZDWf6R4MWP3uDY';

let isGoogleMapsScriptLoaded = false;
let googleMapsPromise: Promise<void> | null = null;

export const loadGoogleMapsScript = (): Promise<void> => {
  // If the script is loaded and the google object is available, we're good.
  if (isGoogleMapsScriptLoaded && window.google) {
    return Promise.resolve();
  }

  // If the script was marked as loaded, but the google object is gone, reset.
  // This can happen with some SPA navigations or hot module reloading.
  if (isGoogleMapsScriptLoaded && !window.google) {
    isGoogleMapsScriptLoaded = false;
    googleMapsPromise = null;
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isGoogleMapsScriptLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      googleMapsPromise = null; // Reset promise on error
      reject(new Error('Failed to load Google Maps script'));
    };
    
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}; 