const { Client } = require('pg');
require('dotenv').config();

(async () => {
  const url = process.env.DATABASE_URL || 'postgresql://app:app@127.0.0.1:5432/v5';
  try {
    const client = new Client({ connectionString: url });
    await client.connect();

    const who = await client.query('SELECT current_user;');
    const roles = await client.query("SELECT 1 FROM pg_roles WHERE rolname = 'app'");
    if (!roles.rowCount) {
      // In local/dev, accept missing role without failing if we lack perms
      if (process.env.CI || process.env.HEALTH_STRICT) {
        console.log('UNHEALTHY role "app" does not exist');
        await client.end();
        process.exit(1);
      } else {
        try {
          await client.query("DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app') THEN CREATE ROLE app LOGIN PASSWORD 'app'; END IF; END $$;");
        } catch (e) {
          console.log('WARNING could not ensure role app:', e.message || String(e));
        }
      }
    }

    const schemaOwner = await client.query(`
      SELECT nspname, pg_catalog.pg_get_userbyid(nspowner) AS owner
      FROM pg_namespace WHERE nspname='public'
    `);

    console.log('HEALTHY',
      `user=${who.rows[0].current_user}`,
      `db=${(new URL(url)).pathname.slice(1)}`,
      `schema_owner=${schemaOwner.rows?.[0]?.owner || 'unknown'}`
    );
    await client.end();
    process.exit(0);
  } catch (err) {
    console.log('UNHEALTHY', err.message || String(err));
    process.exit(1);
  }
})();
