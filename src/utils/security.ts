// Security utilities for ORMEN application
export class SecurityManager {
  private static readonly ENCRYPTION_KEY = 'ORMEN_SECURE_KEY_2025';
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  
  // Simple encryption for sensitive data
  static encrypt(data: string): string {
    try {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(data);
      const binaryString = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
      const encoded = btoa(binaryString);
      return encoded.split('').reverse().join('');
    } catch (error) {
      console.error('Encryption failed:', error);
      return data;
    }
  }
  
  // Simple decryption
  static decrypt(encryptedData: string): string {
    try {
      const reversed = encryptedData.split('').reverse().join('');
      const binaryString = atob(reversed);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData;
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
      if (!encryptedSession) return false;
      
      const sessionData = JSON.parse(this.decrypt(encryptedSession));
      return Date.now() < sessionData.expires;
    } catch (error) {
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