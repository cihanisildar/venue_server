import { Response, NextFunction, RequestHandler } from 'express';
import { config } from '../../../config';
import { AuthenticatedRequest } from '../interfaces/auth.interface';

export const validateGatewayRequest: RequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const gatewaySecret = req.header('X-Gateway-Secret');

  if (config.env === 'development') { // TODO: Remove this before deployment, Test purposes
    req.user = {
      userId: '1',
      email: 'test@example.com',
      role: 'user',
      reliabilityScore: 100
    };
    next();
    return; 
  }
  
  if (gatewaySecret !== config.gateway.secret) {
    res.status(401).json({ 
      message: 'Unauthorized - Direct access not allowed' 
    });
    return;
  }
  
  const userId = req.header('X-User-Id');
  if (!userId) {
    res.status(401).json({ 
      message: 'Unauthorized - User ID required' 
    });
    return;
  }

  req.user = {
    userId,
    email: req.header('X-User-Email'),
    role: req.header('X-User-Role'),
    reliabilityScore: req.header('X-User-Reliability-Score') 
      ? Number(req.header('X-User-Reliability-Score')) 
      : undefined
  };

  next();
};