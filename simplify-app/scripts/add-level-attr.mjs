import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT + '/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function main() {
    try {
        await databases.createStringAttribute(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_BOOKS_COLLECTION_ID,
            'level',
            50, // size
            false // required
        );
        console.log('Successfully created level attribute!');
    } catch (error) {
        console.error('Error creating level attribute:', error.message);
    }
}

main();
