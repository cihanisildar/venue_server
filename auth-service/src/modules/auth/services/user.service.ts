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
    public async createUserProfile(authUser: any, accessToken: string) {
        try {
            console.log('Sending request to create user profile');
            console.log(authUser);
            
            // Make the POST request to the user service to create a profile
            await axios.post(`${this.CORS_ORIGIN}/api/users/profile`, {
                id: authUser.id,
                email: authUser.email,
                username: authUser.username,
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Use the access token for authentication
                },
                withCredentials: true,
            });
        } catch (error) {
            // Assert error as AxiosError to access response data
            const axiosError = error as AxiosError;
            
            // Define a clearer error message structure
            const errorMessage = {
                message: "Failed to create user profile",
                reason: axiosError.response
                    ? `Server responded with status ${axiosError.response.status}: ${axiosError.response.data}`
                    : axiosError.request
                    ? "No response received from server"
                    : axiosError.message,
                statusCode: axiosError.response?.status || 500,
                endpoint: `${this.CORS_ORIGIN}/api/users/profile`
            };

            // Log the error details for debugging
            console.error('Error creating user profile:', errorMessage);

            // Rollback created user if profile creation fails
            await this.repository.deleteUser(authUser.id);
            throw new Error(JSON.stringify(errorMessage));
        }
    }
}
