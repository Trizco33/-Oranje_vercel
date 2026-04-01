-- Add default admin user if not exists
INSERT INTO users (openId, email, name, role, lastSignedIn)
SELECT 'admin-owner', 'admin@oranjeapp.com.br', 'Admin Oranje', 'admin', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@oranjeapp.com.br' OR openId = 'admin-owner'
);
