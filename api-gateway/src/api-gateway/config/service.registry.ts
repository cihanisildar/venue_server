export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, string>;

  private constructor() {
    console.log('🔧 Initializing ServiceRegistry');
    this.services = new Map();
    this.initializeServices();
  }

  private initializeServices(): void {
    // Initialize service URLs from environment variables or configuration
    this.services.set('auth', process.env.AUTH_SERVICE_URL || 'http://localhost:3001');
    this.services.set('user', process.env.USER_SERVICE_URL || 'http://localhost:3002');
    this.services.set('venue', process.env.VENUE_SERVICE_URL || 'http://localhost:3003');

    // Log all initialized services
    console.log('📍 Initialized services:', 
      Object.fromEntries(this.services.entries())
    );
  }

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  public getServiceUrl(serviceName: string): string {
    const url = this.services.get(serviceName);
    console.log(`🔍 Getting URL for service "${serviceName}":`, url);
    
    if (!url) {
      console.error(`❌ Service "${serviceName}" not found in registry`);
      throw new Error(`Service ${serviceName} not found in registry`);
    }
    return url;
  }
}