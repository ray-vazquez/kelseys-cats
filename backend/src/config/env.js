export const env = {
  DB_URL: "mysql://root:root@localhost:3306/kelseys_cats",
  JWT_SECRET: process.env.JWT_SECRET || 'change_this_secret',
  ADOPTAPET_BASE_URL: process.env.ADOPTAPET_BASE_URL || '',
  ADOPTAPET_API_KEY: process.env.ADOPTAPET_API_KEY || ''
};
