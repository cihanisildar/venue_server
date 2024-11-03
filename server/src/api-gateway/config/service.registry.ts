export class ServiceRegistry {
    private static instance: ServiceRegistry;
    private services: Map<string, string>;
  
    private constructor() {
      this.services = new Map();
      this.initializeServices();
    }
  
    private initializeServices(): void {
      // Initialize service URLs from environment variables or configuration
      this.services.set('auth', process.env.AUTH_SERVICE_URL || 'http://localhost:3001');
      this.services.set('user', process.env.USER_SERVICE_URL || 'http://localhost:3002');
      this.services.set('venue', process.env.VENUE_SERVICE_URL || 'http://localhost:3003');
    }
  
    public static getInstance(): ServiceRegistry {
      if (!ServiceRegistry.instance) {
        ServiceRegistry.instance = new ServiceRegistry();
      }
      return ServiceRegistry.instance;
    }
  
    public getServiceUrl(serviceName: string): string {
      const url = this.services.get(serviceName);
      if (!url) {
        throw new Error(`Service ${serviceName} not found in registry`);
      }
      return url;
    }
  }