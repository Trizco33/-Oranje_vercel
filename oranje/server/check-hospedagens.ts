import { createConnection } from 'mysql2/promise';
async function main() {
  const conn = await createConnection(process.env.DATABASE_URL!);
  const [rows] = await conn.query<any[]>(
    `SELECT id, name, address, lat, lng, dataPending, categoryId
     FROM places 
     WHERE name LIKE '%Hotel%' OR name LIKE '%Pousada%' OR name LIKE '%Loft%' 
        OR name LIKE '%Hospedagem%' OR name LIKE '%Suíte%' OR name LIKE '%Suite%'
        OR name LIKE '%Flores de Holambra%' OR name LIKE '%1948%' OR name LIKE '%Amsterdam%'
        OR name LIKE '%Onze%' OR name LIKE '%Rosa de Saron%' OR name LIKE '%Flipsen%'
     ORDER BY name`
  );
  await conn.end();
  console.log(JSON.stringify(rows, null, 2));
}
main().catch(console.error);
