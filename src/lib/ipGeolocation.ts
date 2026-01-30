import axios from 'axios';
import { isLocalIP } from './getClientIP';

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

// Simple in-memory cache
const locationCache = new Map<string, { data: LocationData; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get location from IP - Works in both dev and production
 * - Development/local IP: Tries to detect from request headers/timezone first
 * - Production/public IP: Returns real location from API
 */
export const getLocationFromIP = async (
  ip: string, 
  req?: any // Optional request object for header detection
): Promise<LocationData | null> => {
  try {
    // Handle invalid IP
    if (!ip || ip === 'unknown') {
      console.log('⚠️ Invalid IP, trying to detect from request headers');
      return detectLocationFromRequest(req);
    }

    // Check if local IP
    if (isLocalIP(ip)) {
      console.log('🏠 Local IP detected:', ip, '- Trying to detect from request headers');
      // Try to detect from request headers first (timezone, accept-language, etc.)
      const headerLocation = detectLocationFromRequest(req);
      if (headerLocation) {
        return headerLocation;
      }
      // If header detection fails, use fallback
      return getFallbackLocation();
    }

    // Extract real IP if behind proxy
    const realIP = ip.split(',')[0]?.trim() || ip.trim();

    // Check cache first
    const cached = locationCache.get(realIP);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ Using cached location for IP:', realIP);
      return cached.data;
    }

    // Fetch from API (ip-api.com - free tier: 45 requests/minute)
    try {
      const response = await axios.get(
        `http://ip-api.com/json/${realIP}?fields=status,country,city,lat,lon`,
        {
          timeout: 5000, // 5 second timeout
        }
      );

      if (response.data.status === 'success') {
        const locationData: LocationData = {
          latitude: response.data.lat,
          longitude: response.data.lon,
          city: response.data.city || '',
          country: response.data.country || '',
        };

        // Cache the result
        locationCache.set(realIP, {
          data: locationData,
          timestamp: Date.now(),
        });

        console.log('✅ Location fetched from API for IP:', realIP, locationData);
        return locationData;
      }
    } catch (apiError: any) {
      // Handle rate limit or API errors
      if (apiError.response?.status === 429) {
        console.warn('⚠️ Rate limit exceeded, checking cache...');
        // Return cached data if available, even if expired
        const cached = locationCache.get(realIP);
        if (cached) {
          console.log('✅ Returning expired cache due to rate limit');
          return cached.data;
        }
      }
      
      console.error('❌ IP geolocation API error:', apiError.message);
      // Fallback to default location on API error
      return getFallbackLocation();
    }

    // API returned unsuccessful response
    console.log('⚠️ API returned unsuccessful response, using fallback');
    return getFallbackLocation();
  } catch (error: any) {
    console.error('❌ IP geolocation error:', error.message);
    // Always return fallback location instead of null
    return getFallbackLocation();
  }
};

/**
 * Detect location from request headers (timezone, accept-language, etc.)
 * Works for localhost when real IP geolocation is not available
 */
const detectLocationFromRequest = (req?: any): LocationData | null => {
  if (!req) return null;

  try {
    // Method 1: Try to get from timezone header (if client sends it)
    const timezone = req.headers['x-timezone'] || req.headers['timezone'];
    if (timezone) {
      const location = getLocationFromTimezone(timezone);
      if (location) {
        console.log('✅ Location detected from timezone:', timezone, location);
        return location;
      }
    }

    // Method 2: Try to get from accept-language header
    const acceptLanguage = req.headers['accept-language'];
    if (acceptLanguage) {
      const location = getLocationFromLanguage(acceptLanguage);
      if (location) {
        console.log('✅ Location detected from language:', acceptLanguage, location);
        return location;
      }
    }

    // Method 3: Try to get from custom headers (if frontend sends)
    const city = req.headers['x-city'] || req.headers['city'];
    const country = req.headers['x-country'] || req.headers['country'];
    if (city || country) {
      console.log('✅ Location detected from custom headers:', { city, country });
      return {
        latitude: 0, // Unknown coordinates
        longitude: 0,
        city: city || '',
        country: country || '',
      };
    }

    return null;
  } catch (error) {
    console.error('Error detecting location from request:', error);
    return null;
  }
};

/**
 * Get location from timezone (e.g., "Asia/Dhaka" -> "Dhaka, Bangladesh")
 */
const getLocationFromTimezone = (timezone: string): LocationData | null => {
  const timezoneMap: { [key: string]: { city: string; country: string; lat: number; lon: number } } = {
    'Asia/Dhaka': { city: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lon: 90.4125 },
    'Asia/Kolkata': { city: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
    'Asia/Karachi': { city: 'Karachi', country: 'Pakistan', lat: 24.8607, lon: 67.0011 },
    'America/New_York': { city: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
    'America/Los_Angeles': { city: 'Los Angeles', country: 'United States', lat: 34.0522, lon: -118.2437 },
    'Europe/London': { city: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
    // Add more timezones as needed
  };

  const location = timezoneMap[timezone];
  if (location) {
    return {
      latitude: location.lat,
      longitude: location.lon,
      city: location.city,
      country: location.country,
    };
  }

  return null;
};

/**
 * Get country from accept-language header (e.g., "en-BD" -> "Bangladesh")
 */
const getLocationFromLanguage = (acceptLanguage: string): LocationData | null => {
  // Extract country code from language (e.g., "en-BD" or "bn-BD")
  const match = acceptLanguage.match(/-([A-Z]{2})/i);
  if (!match || !match[1]) return null;

  const countryCode = match[1].toUpperCase();
  
  const countryMap: { [key: string]: { country: string; city: string } } = {
    'BD': { country: 'Bangladesh', city: 'Dhaka' },
    'IN': { country: 'India', city: 'Mumbai' },
    'PK': { country: 'Pakistan', city: 'Karachi' },
    'US': { country: 'United States', city: 'New York' },
    'GB': { country: 'United Kingdom', city: 'London' },
    // Add more countries as needed
  };

  const location = countryMap[countryCode];
  if (location) {
    return {
      latitude: 0, // Unknown coordinates, but we have city/country
      longitude: 0,
      city: location.city,
      country: location.country,
    };
  }

  return null;
};

/**
 * Fallback location - Used when all detection methods fail
 * Can be customized based on your default location
 */
export const getFallbackLocation = (): LocationData => {
  // Default to Dhaka, Bangladesh (or change to your default location)
  const fallback: LocationData = {
    latitude: 0, // Unknown coordinates
    longitude: 0,
    city: 'Dhaka',
    country: 'Bangladesh',
  };
  
  // Or use environment variable for default location
  if (process.env.DEFAULT_CITY && process.env.DEFAULT_COUNTRY) {
    return {
      latitude: parseFloat(process.env.DEFAULT_LATITUDE || '0'),
      longitude: parseFloat(process.env.DEFAULT_LONGITUDE || '0'),
      city: process.env.DEFAULT_CITY,
      country: process.env.DEFAULT_COUNTRY,
    };
  }
  
  console.log('📍 Using fallback location:', fallback);
  return fallback;
};

// Optional: Clear old cache entries periodically (every hour)
setInterval(() => {
  const now = Date.now();
  let cleared = 0;
  for (const [ip, value] of locationCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      locationCache.delete(ip);
      cleared++;
    }
  }
  if (cleared > 0) {
    console.log(`🧹 Cleared ${cleared} expired cache entries`);
  }
}, 60 * 60 * 1000); // Clean every hour

// Export cache stats for monitoring (optional)
export const getCacheStats = () => {
  return {
    size: locationCache.size,
    entries: Array.from(locationCache.entries()).map(([ip, value]) => ({
      ip,
      cachedAt: new Date(value.timestamp).toISOString(),
      ageHours: (Date.now() - value.timestamp) / (60 * 60 * 1000),
    })),
  };
};