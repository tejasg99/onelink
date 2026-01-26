import { Pool } from "pg"

export async function verifyRLSStatus() {
    const pool = new Pool({
        connectionString: process.env.DIRECT_URL,
    })

    try {
        // Check RLS status
        const rlsStatus = await pool.query(`
        SELECT 
            tablename,
            rowsecurity as rls_enabled
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
        `)

        // Check policy count per table
        const policyCount = await pool.query(`
        SELECT 
            tablename,
            COUNT(*) as policy_count
        FROM pg_policies 
        WHERE schemaname = 'public'
        GROUP BY tablename
        ORDER BY tablename
        `)

        const rlsMap = new Map(
            rlsStatus.rows.map((r) => [r.tablename, r.rls_enabled])
        )

        const policyMap = new Map(
            policyCount.rows.map((r) => [r.tablename, parseInt(r.policy_count)])
        )

        const tables = [
            "users",
            "accounts",
            "sessions",
            "verification_tokens",
            "onelinks",
            "text_contents",
            "code_contents",
            "file_contents",
            "bio_links",
        ]

        const status = tables.map((table) => ({
            table,
            rls_enabled: rlsMap.get(table) ?? false,
            policy_count: policyMap.get(table) ?? 0,
        }))

        const allEnabled = status.every((s) => s.rls_enabled)
        const allHavePolicies = status.every((s) => s.policy_count > 0)

        return {
            status,
            healthy: allEnabled && allHavePolicies,
            summary: {
                tablesWithRLS: status.filter((s) => s.rls_enabled).length,
                totalTables: status.length,
                totalPolicies: status.reduce((acc, s) => acc + s.policy_count, 0)
            }
        }
    } finally {
        await pool.end()
    }
}