import React from "react";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const useSearchPostcode = () => {
  const [suggestions, setSuggestions] = React.useState([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const timeoutRef = React.useRef(null);

  // Load Google Maps JavaScript API
  React.useEffect(() => {
    if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        console.log('Google Maps API loaded');
      };

      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };
    }
  }, []);

  const searchAddress = React.useCallback(async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return [];
    }

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn('Google Maps API not loaded yet');
      setSuggestions([]);
      return [];
    }

    try {
      const service = new window.google.maps.places.AutocompleteService();
      const request = {
        input: query,
        types: ['address']
      };

      return new Promise((resolve) => {
        service.getPlacePredictions(request, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            // Transform Google response to match our expected format
            const transformedSuggestions = predictions.map(prediction => ({
              place_id: prediction.place_id,
              display_name: prediction.description,
              description: prediction.description,
              structured_formatting: prediction.structured_formatting
            }));
            setSuggestions(transformedSuggestions);
            resolve(transformedSuggestions);
          } else {
            console.error('Google Places Autocomplete error:', status);
            setSuggestions([]);
            resolve([]);
          }
        });
      });
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setSuggestions([]);
      return [];
    }
  }, []);

  const handleAddressInputChange = React.useCallback(
    async (value, onAddressChange) => {
      onAddressChange(value);
      setShowSuggestions(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Call search immediately to avoid loading feeling
      await searchAddress(value);
    },
    [searchAddress]
  );

  const handleSuggestionSelect = React.useCallback(
    async (suggestion, onAddressChange, onPostcodeChange, onLatChange, onLonChange) => {
      const displayName = suggestion.display_name;

      let postcode = "";
      let lat = null;
      let lon = null;

      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.warn('Google Maps API not loaded yet');
        onAddressChange(displayName);
        onPostcodeChange(postcode);
        onLatChange(lat);
        onLonChange(lon);
        setSuggestions([]);
        setShowSuggestions(false);
        return { postcode, lat, lon };
      }

      try {
        // Create a dummy map and service for place details
        const map = new window.google.maps.Map(document.createElement('div'));
        const service = new window.google.maps.places.PlacesService(map);

        const request = {
          placeId: suggestion.place_id,
          fields: ['address_components', 'geometry']
        };

        return new Promise((resolve) => {
          service.getDetails(request, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
              const addressComponents = place.address_components;
              const postalCodeComponent = addressComponents.find(component =>
                component.types.includes('postal_code')
              );
              postcode = postalCodeComponent ? postalCodeComponent.long_name : "";

              lat = place.geometry.location.lat();
              lon = place.geometry.location.lng();
            } else {
              console.error('Google Place Details error:', status);
            }

            onAddressChange(displayName);
            onPostcodeChange(postcode);
            onLatChange(lat);
            onLonChange(lon);
            setSuggestions([]);
            setShowSuggestions(false);
            resolve({ postcode, lat, lon });
          });
        });
      } catch (error) {
        console.error("Error fetching place details:", error);
        onAddressChange(displayName);
        onPostcodeChange(postcode);
        onLatChange(lat);
        onLonChange(lon);
        setSuggestions([]);
        setShowSuggestions(false);
        return { postcode, lat, lon };
      }
    },
    []
  );

  const handleBlur = React.useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  return {
    suggestions,
    showSuggestions,
    handleAddressInputChange,
    handleSuggestionSelect,
    handleBlur,
  };
};

export default useSearchPostcode;
