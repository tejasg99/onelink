import "dotenv/config"
import { Pool } from "pg"
import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function setupRLS() {
    const pool = new Pool({
        connectionString: process.env.DIRECT_URL, // direct url for migrations
    })

    try {
        console.log("Setting up Row Level Security policies...")

        // Read the sql file
        const sqlPath = path.join(__dirname, "../prisma/rls-policies.sql")
        const sql = fs.readFileSync(sqlPath, "utf-8")

        // Execute the sql 
        await pool.query(sql)

        console.log("RLS Policies created successfully")

        // Verify that RLS is enabled
        const result = await pool.query(`
            SELECT tablename, rowsecurity
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename
        `)

        console.log("\n RLS Status:")
        console.table(result.rows)

        // Count policies
        const policyCount = await pool.query(`
            SELECT COUNT(*) as count
            FROM pg_policies
            WHERE schemaname = 'public'  
        `)

        console.log(`Total Policies created: ${policyCount.rows[0].count}`)
    } catch (error) {
        console.error("❌ Error setting up RLS:", error)
        throw error
    } finally {
        await pool.end()
    }
}

setupRLS()