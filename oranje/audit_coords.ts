import mysql from 'mysql2/promise';
async function main() {
  const conn = await mysql.createConnection('mysql://root:rccLSfGsRaKkpPhOmXeYcxkajbQItFcD@ballast.proxy.rlwy.net:44746/railway');
  const [rows] = await conn.execute(`
    SELECT id, name, lat, lng, address, shortDesc
    FROM places 
    WHERE name IN (
      'Casa Bela Restaurante',
      'Martin Holandesa Confeitaria e Restaurante',
      'De Immigrant Gastro Café',
      'De Immigrant Restaurante Garden',
      'Don Hamburgo',
      'Shellter Hotel'
    )
    ORDER BY name
  `) as any[];
  (rows as any[]).forEach((r: any) => {
    console.log(`\n[id=${r.id}] ${r.name}`);
    console.log(`  endereço: ${r.address}`);
    console.log(`  lat: ${r.lat}`);
    console.log(`  lng: ${r.lng}`);
    console.log(`  link: https://maps.google.com/?q=${r.lat},${r.lng}`);
  });
  await conn.end();
}
main().catch(console.error);
