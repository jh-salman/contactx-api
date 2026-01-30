import { Request } from 'express';

/**
 * Smart IP detection that works in both development and production
 * Automatically handles localhost, local network, and public IPs
 */
export const getClientIP = (req: Request): string => {
  // Priority order for IP detection
  const sources = [
    req.headers['x-forwarded-for'] as string,
    req.headers['x-real-ip'] as string,
    req.ip,
    req.socket.remoteAddress,
    req.connection?.remoteAddress,
  ];
  
  // Find first available IP
  let ip = '';
  for (const source of sources) {
    if (source) {
      // Handle comma-separated IPs (from proxies/load balancers)
      const ips = source.split(',').map(i => i.trim());
      const firstIP = ips[0];
      if (firstIP) {
        ip = firstIP; // Take first IP
        break;
      }
    }
  }
  
  if (!ip) {
    ip = 'unknown';
  }
  
  return ip;
};

/**
 * Check if IP is local/private (can't geolocate)
 */
export const isLocalIP = (ip: string): boolean => {
  if (!ip || ip === 'unknown') return true;
  
  return (
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.20.') ||
    ip.startsWith('172.21.') ||
    ip.startsWith('172.22.') ||
    ip.startsWith('172.23.') ||
    ip.startsWith('172.24.') ||
    ip.startsWith('172.25.') ||
    ip.startsWith('172.26.') ||
    ip.startsWith('172.27.') ||
    ip.startsWith('172.28.') ||
    ip.startsWith('172.29.') ||
    ip.startsWith('172.30.') ||
    ip.startsWith('172.31.')
  );
};
