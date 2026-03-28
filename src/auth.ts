// src/auth.ts — Shared auth helpers used across all components
export interface User {
    name: string;
    email: string;
    password: string;
}

export const getUsers = (): User[] => {
    try {
        const parsed = JSON.parse(localStorage.getItem('mm_users') || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const saveUsers = (users: User[]): void =>
    localStorage.setItem('mm_users', JSON.stringify(users));

export const getSession = (): boolean =>
    localStorage.getItem('isAuthenticated') === 'true';

export const getUserEmail = (): string =>
    localStorage.getItem('userEmail') || '';

export const getUserName = (): string =>
    localStorage.getItem('userName') || getUserEmail();

export const clearSession = (): void => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
};
