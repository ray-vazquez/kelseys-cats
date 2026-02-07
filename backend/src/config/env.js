export const env = {
  DB_URL: process.env.DB_URL || "mysql://root:root@localhost:3306/kelseys_cats",
  JWT_SECRET: process.env.JWT_SECRET || 'change_this_secret',
  
  // Legacy Adopt-a-Pet (deprecated)
  ADOPTAPET_BASE_URL: process.env.ADOPTAPET_BASE_URL || '',
  ADOPTAPET_API_KEY: process.env.ADOPTAPET_API_KEY || '',
  
  // Petfinder API (current integration)
  PETFINDER_API_KEY: process.env.PETFINDER_API_KEY || '',
  PETFINDER_SECRET: process.env.PETFINDER_SECRET || ''
};
