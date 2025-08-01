// Input validation utilities for security
export class InputValidator {
  // Sanitize string input to prevent XSS
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes that could break HTML attributes
      .trim()
      .substring(0, 1000); // Limit length
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Validate UUID format
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Validate match name
  static validateMatchName(name: string): { isValid: boolean; error?: string } {
    const sanitized = this.sanitizeString(name);
    if (sanitized.length === 0) {
      return { isValid: false, error: 'Match name is required' };
    }
    if (sanitized.length < 3) {
      return { isValid: false, error: 'Match name must be at least 3 characters' };
    }
    if (sanitized.length > 100) {
      return { isValid: false, error: 'Match name must be less than 100 characters' };
    }
    return { isValid: true };
  }

  // Validate team name
  static validateTeamName(name: string): { isValid: boolean; error?: string } {
    const sanitized = this.sanitizeString(name);
    if (sanitized.length === 0) {
      return { isValid: false, error: 'Team name is required' };
    }
    if (sanitized.length < 2) {
      return { isValid: false, error: 'Team name must be at least 2 characters' };
    }
    if (sanitized.length > 50) {
      return { isValid: false, error: 'Team name must be less than 50 characters' };
    }
    return { isValid: true };
  }

  // Validate URL (for video URLs, etc.)
  static isValidURL(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  // Rate limiting helper (simple in-memory implementation)
  private static rateLimitMap = new Map<string, { count: number; lastReset: number }>();
  
  static checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(identifier);
    
    if (!record || (now - record.lastReset) > windowMs) {
      this.rateLimitMap.set(identifier, { count: 1, lastReset: now });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }
}