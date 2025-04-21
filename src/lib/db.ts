import { Pool } from 'pg';

// Create a new pool using the DATABASE_URL environment variable
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
    const client = await pool.connect();
    try {
        // console.log('Executing query:', text, params); // Debug log
        const result = await client.query(text, params);
        // console.log('Query result:', result.rows); // Debug log
        return result;
    } catch (error) {
        // console.error('Query error:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Initialize the database tables if they don't exist
export async function initializeDatabase() {
    try {
        // console.log('Initializing database...'); // Debug log
        // Create Playlist table
        await query(`
            CREATE TABLE IF NOT EXISTS "Playlist" (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL
            );
        `);

        // Create Video table
        await query(`
            CREATE TABLE IF NOT EXISTS "Video" (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                url VARCHAR(255) NOT NULL,
                "playlistId" INTEGER REFERENCES "Playlist"(id) ON DELETE CASCADE
            );
        `);
        // console.log('Database initialized successfully'); // Debug log
    } catch (error) {
        // console.error('Error initializing database:', error);
        throw error;
    }
}

// Server action to ensure database is initialized
export async function ensureDatabaseInitialized() {
    try {
        // console.log('Checking database initialization...'); // Debug log
        // Check if tables exist
        const result = await query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'Playlist'
            );
        `);

        if (!result.rows[0].exists) {
            // console.log('Tables do not exist, initializing...'); // Debug log
            await initializeDatabase();
        } else {
            // console.log('Tables already exist'); // Debug log
        }
    } catch (error) {
        // console.error('Error checking database initialization:', error);
        throw error;
    }
}