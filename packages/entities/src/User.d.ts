export interface User {
    id: string;
    email: string;
    full_name: string;
    password_hash?: string;
    avatar_url?: string;
    created_at: string;
}
export declare class UserService {
    static me(): Promise<User>;
    static loginWithRedirect(redirectUrl?: string): Promise<void>;
    static logout(): Promise<void>;
    static isLoggedIn(): boolean;
}
