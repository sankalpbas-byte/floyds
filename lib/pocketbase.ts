// DEPRECATED: We are now using Cloudflare D1 via functions/api
// Keeping for backward compatibility reference during migration
import PocketBase from 'pocketbase';

const PB_URL = 'https://floyds-restaurant.pockethost.io';
export const pb = new PocketBase(PB_URL);

export const isPocketBaseActive = async () => {
    try {
        await pb.health.check();
        return true;
    } catch (e) {
        return false;
    }
};