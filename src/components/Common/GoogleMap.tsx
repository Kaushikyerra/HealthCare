import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Phone, Globe } from 'lucide-react';
import { User } from '../../types';
import { loadGoogleMapsScript } from '../../utils/maps';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface GoogleMapProps {
  location?: Location; // Single location (for backward compatibility)
  doctorName?: string;
  darkMode?: boolean;
  className?: string;
  doctors?: User[]; // Multiple doctors
  selectedDoctor?: User | null;
  onDoctorSelect?: (doctor: User) => void;
  userLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  showUserLocation?: boolean;
}

declare global {
  interface Window {
    google: any;
  }
}

export const GoogleMap: React.FC<GoogleMapProps> = ({ 
  location, 
  doctorName, 
  darkMode = false,
  className = "",
  doctors = [],
  selectedDoctor,
  onDoctorSelect,
  userLocation,
  showUserLocation = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = 'AIzaSyAUZdfTdxFnRFwYmi0LYZDWf6R4MWP3uDY';

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        initializeMap();
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load Google Maps');
        setIsLoading(false);
      });

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      try {
        // Determine center position
        let centerPosition;
        if (selectedDoctor && selectedDoctor.latitude && selectedDoctor.longitude) {
          centerPosition = { lat: selectedDoctor.latitude, lng: selectedDoctor.longitude };
        } else if (userLocation && showUserLocation) {
          centerPosition = { lat: userLocation.latitude, lng: userLocation.longitude };
        } else if (location) {
          centerPosition = { lat: location.latitude, lng: location.longitude };
        } else if (doctors.length > 0) {
          // Center on first doctor with location
          const firstDoctorWithLocation = doctors.find(d => d.latitude && d.longitude);
          if (firstDoctorWithLocation) {
            centerPosition = { lat: firstDoctorWithLocation.latitude, lng: firstDoctorWithLocation.longitude };
          } else {
            centerPosition = { lat: 39.8283, lng: -98.5795 }; // US center
          }
        } else {
          centerPosition = { lat: 39.8283, lng: -98.5795 }; // US center
        }

        // Create map
        const newMap = new window.google.maps.Map(mapRef.current, {
          center: centerPosition,
          zoom: doctors.length > 1 ? 10 : 15,
          styles: darkMode ? getDarkMapStyle() : [],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const newMarkers: any[] = [];

        // Add user location marker if available
        if (userLocation && showUserLocation) {
          const userMarker = new window.google.maps.Marker({
            position: { lat: userLocation.latitude, lng: userLocation.longitude },
            map: newMap,
            title: 'Your Location',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#10B981"/>
                  <circle cx="16" cy="16" r="8" fill="white"/>
                  <circle cx="16" cy="16" r="4" fill="#10B981"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 32),
            }
          });

          const userInfoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="margin: 0 0 4px 0; font-weight: 600; color: #1F2937;">Your Location</h3>
                <p style="margin: 0; color: #6B7280; font-size: 14px;">
                  ${userLocation.address || `${userLocation.latitude}, ${userLocation.longitude}`}
                </p>
              </div>
            `
          });

          userMarker.addListener('click', () => {
            userInfoWindow.open(newMap, userMarker);
          });

          newMarkers.push(userMarker);
        }

        // Add doctor markers
        doctors.forEach((doctor) => {
          if (doctor.latitude && doctor.longitude) {
            const isSelected = selectedDoctor?.id === doctor.id;
            
            const doctorMarker = new window.google.maps.Marker({
              position: { lat: doctor.latitude, lng: doctor.longitude },
              map: newMap,
              title: doctor.name,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="${isSelected ? '#EF4444' : '#3B82F6'}"/>
                    <circle cx="16" cy="16" r="8" fill="white"/>
                    <circle cx="16" cy="16" r="4" fill="${isSelected ? '#EF4444' : '#3B82F6'}"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(32, 32),
                anchor: new window.google.maps.Point(16, 32),
              }
            });

            const doctorInfoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; max-width: 200px;">
                  <h3 style="margin: 0 0 4px 0; font-weight: 600; color: #1F2937;">${doctor.name}</h3>
                  <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 14px;">${doctor.specialization || 'Doctor'}</p>
                  <p style="margin: 0; color: #6B7280; font-size: 12px;">
                    ${doctor.address || ''}${doctor.city ? `, ${doctor.city}` : ''}${doctor.state ? `, ${doctor.state}` : ''}
                  </p>
                  ${doctor.rating ? `<p style="margin: 4px 0 0 0; color: #059669; font-size: 12px;">⭐ ${doctor.rating}</p>` : ''}
                </div>
              `
            });

            doctorMarker.addListener('click', () => {
              doctorInfoWindow.open(newMap, doctorMarker);
              if (onDoctorSelect) {
                onDoctorSelect(doctor);
              }
            });

            newMarkers.push(doctorMarker);
          }
        });

        // Add single location marker (for backward compatibility)
        if (location && location.latitude && location.longitude && !doctors.length) {
          const locationMarker = new window.google.maps.Marker({
            position: { lat: location.latitude, lng: location.longitude },
            map: newMap,
            title: doctorName || 'Location',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#3B82F6"/>
                  <circle cx="16" cy="16" r="8" fill="white"/>
                  <circle cx="16" cy="16" r="4" fill="#3B82F6"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 32),
            }
          });

          const locationInfoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="margin: 0 0 4px 0; font-weight: 600; color: #1F2937;">${doctorName || 'Location'}</h3>
                <p style="margin: 0; color: #6B7280; font-size: 14px;">
                  ${location.address || 'Location'}${location.city ? `, ${location.city}` : ''}${location.state ? `, ${location.state}` : ''}
                </p>
              </div>
            `
          });

          locationMarker.addListener('click', () => {
            locationInfoWindow.open(newMap, locationMarker);
          });

          newMarkers.push(locationMarker);
        }

        setMap(newMap);
        setMarkers(newMarkers);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to initialize map');
        setIsLoading(false);
      }
    };

    return () => {
      // Cleanup markers
      markers.forEach(marker => {
        if (marker) {
          marker.setMap(null);
        }
      });
    };
  }, [location, doctorName, darkMode, doctors, selectedDoctor, userLocation, showUserLocation]);

  const getDarkMapStyle = () => [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }]
    }
  ];

  const getDirections = () => {
    if (!location) return;
    
    const { latitude, longitude } = location;
    const address = [location.address, location.city, location.state, location.zipCode, location.country]
      .filter(Boolean)
      .join(', ');
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address || `${latitude},${longitude}`)}`;
    window.open(url, '_blank');
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      } ${className}`}>
        <div className="text-center">
          <MapPin className={`h-8 w-8 mx-auto mb-2 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      } ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Loading map...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg overflow-hidden border"
        style={{ minHeight: '256px' }}
      />
      
      {/* Location Details - Only show for single location */}
      {location && !doctors.length && (
        <div className={`p-4 rounded-lg border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`font-semibold mb-1 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {doctorName || 'Doctor'} Location
              </h4>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {location.address}
                {location.city && `, ${location.city}`}
                {location.state && `, ${location.state}`}
                {location.zipCode && ` ${location.zipCode}`}
                {location.country && `, ${location.country}`}
              </p>
            </div>
            
            <button
              onClick={getDirections}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                darkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Navigation className="h-4 w-4" />
              <span>Directions</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};