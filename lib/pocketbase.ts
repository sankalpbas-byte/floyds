import PocketBase from 'pocketbase';

// Replace with your actual PocketBase URL
const PB_URL = 'https://floyds-restaurant.pockethost.io';
export const pb = new PocketBase(PB_URL);

// Simple helper to check if we are connected (can be used in AppContext)
export const isPocketBaseActive = async () => {
    try {
        await pb.health.check();
        return true;
    } catch (e) {
        return false;
    }
};
