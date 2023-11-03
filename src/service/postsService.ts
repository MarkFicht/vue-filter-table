import type { IUser } from '@/interfaces/IUser';
import type { IPosts } from '@/interfaces/IPosts';
import RestApiService from './service';

const apiService = new RestApiService();

// ATM fake data from 'https://jsonplaceholder.typicode.com/'
// We can do simulation of acctions on GET

// -----------------------------------------------------------------------------------------------------
// GET all user list
export async function getAllUsers(): Promise<IUser[]> {
    return apiService.get('users', null);
}

// GET all posts
export async function getAllPosts(): Promise<IPosts[]> {
    return apiService.get(`posts`, null);
}

// GET single user
export async function getPostsByAuthor(userId: number): Promise<IPosts[]> {
    return apiService.get(`/users/${userId}/posts`, null);
}
