import axios, { AxiosError } from 'axios';
import { AuthRepository } from '../repositories/auth.repository';

export class UserService {
    private repository: AuthRepository;
    private readonly CORS_ORIGIN = process.env.CORS_ORIGIN;

    constructor() {
        // Initialize the repository instance
        this.repository = new AuthRepository();
    }

    // Accepts access token as a parameter and ensures the request is sent to the correct endpoint
    public async createUserProfile(authUser: any) {
        try {
          console.log("Sending request to create user profile", authUser);
      
          await axios.post(
            `${process.env.USER_SERVICE_URL}/profile`, // Directly call user-service
            {
              id: authUser.id,
              email: authUser.email,
              username: authUser.username,
            },
            {
              headers: {
                "X-Internal-Secret": process.env.INTERNAL_SECRET, // Include shared secret
              },
            }
          );
        } catch (error) {
          const axiosError = error as AxiosError;
      
          console.error("Failed to create user profile:", {
            status: axiosError.response?.status || 500,
            message: axiosError.response?.data || "No response from server",
          });
      
          // Rollback created user if profile creation fails
          await this.repository.deleteUser(authUser.id);
          throw new Error("User profile creation failed");
        }
      }
}
