// Security utilities for ORMEN application
export class SecurityManager {
  private static readonly ENCRYPTION_KEY = 'ORMEN_SECURE_KEY_2025';
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  
  // Simple encryption for sensitive data
  static encrypt(data: string): string {
    try {
      const encoded = btoa(unescape(encodeURIComponent(data)));
      return encoded.split('').reverse().join('');
    } catch (error) {
      console.error('Encryption failed:', error);
      return data;
    }
  }
  
  // Simple decryption
  static decrypt(encryptedData: string): string {
    try {
      // More robust error handling for decryption
      if (!encryptedData || encryptedData.trim() === '') return '';
      
      const reversed = encryptedData.split('').reverse().join('');
      const decoded = atob(reversed);
      
      return decodeURIComponent(escape(decoded));
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }
  
  // Session management
  static createSession(): void {
    const sessionData = {
      timestamp: Date.now(),
      userId: 'ORMEN_USER',
      expires: Date.now() + this.SESSION_TIMEOUT
    };
    
    localStorage.setItem('ormen_session', this.encrypt(JSON.stringify(sessionData)));
  }
  
  static validateSession(): boolean {
    try {
      const encryptedSession = localStorage.getItem('ormen_session');
      if (!encryptedSession || encryptedSession.trim() === '') {
        // Clear invalid session data
        localStorage.removeItem('ormen_session');
        return false;
      }
      
      const decryptedData = this.decrypt(encryptedSession);
      if (!decryptedData || decryptedData.trim() === '') {
        // Clear corrupted session data
        localStorage.removeItem('ormen_session');
        return false;
      }
      
      try {
        const sessionData = JSON.parse(decryptedData);
        if (!sessionData || !sessionData.expires) {
          localStorage.removeItem('ormen_session');
          return false;
        }
        
        return Date.now() < sessionData.expires;
      } catch (jsonError) {
        console.error('Failed to parse session JSON:', jsonError);
        localStorage.removeItem('ormen_session');
        return false;
      }
      
    } catch (error) {
      console.error('Session validation failed:', error);
      localStorage.removeItem('ormen_session');
      return false;
    }
  }
  
  static extendSession(): void {
    try {
      const encryptedSession = localStorage.getItem('ormen_session');
      if (!encryptedSession) return;
      
      const sessionData = JSON.parse(this.decrypt(encryptedSession));
      sessionData.expires = Date.now() + this.SESSION_TIMEOUT;
      
      localStorage.setItem('ormen_session', this.encrypt(JSON.stringify(sessionData)));
    } catch (error) {
      console.error('Session extension failed:', error);
    }
  }
  
  static clearSession(): void {
    localStorage.removeItem('ormen_session');
  }
  
  // Input sanitization
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
  
  // Password strength validation
  static validatePassword(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Şifre en az 8 karakter olmalı' };
    }
    
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Şifre en az bir büyük harf içermeli' };
    }
    
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Şifre en az bir küçük harf içermeli' };
    }
    
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Şifre en az bir rakam içermeli' };
    }
    
    return { isValid: true, message: 'Şifre güçlü' };
  }
  
  // Rate limiting for login attempts
  static checkRateLimit(identifier: string): boolean {
    const key = `rate_limit_${identifier}`;
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    
    // Remove old attempts
    const recentAttempts = attempts.filter((timestamp: number) => timestamp > fiveMinutesAgo);
    
    // Check if too many attempts
    if (recentAttempts.length >= 5) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    localStorage.setItem(key, JSON.stringify(recentAttempts));
    
    return true;
  }
  
  // Generate secure random ID
  static generateSecureId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Hash function for data integrity
  static async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Verify data integrity
  static async verifyDataIntegrity(data: string, expectedHash: string): Promise<boolean> {
    const actualHash = await this.hashData(data);
    return actualHash === expectedHash;
  }
}

// Security middleware for API calls
export const securityMiddleware = {
  beforeRequest: (config: any) => {
    // Add security headers
    config.headers = {
      ...config.headers,
      'X-Requested-With': 'XMLHttpRequest',
      'X-ORMEN-Client': 'V1',
      'X-Timestamp': Date.now().toString()
    };
    
    // Extend session on API calls
    SecurityManager.extendSession();
    
    return config;
  },
  
  afterResponse: (response: any) => {
    // Check for security-related response headers
    if (response.headers['x-session-expired']) {
      SecurityManager.clearSession();
      window.location.reload();
    }
    
    return response;
  }
};