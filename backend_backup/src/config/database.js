const { Sequelize } = require('sequelize');

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: process.env.NODE_ENV === 'production' ? console.log : false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'auth_db',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'password',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        dialectOptions: {
          ssl: process.env.DB_SSL === 'true' ? {
            require: true,
            rejectUnauthorized: false
          } : false
        }
      }
    );

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected Successfully!');

    // Sync database (creates tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database tables synchronized');
    }

  } catch (err) {
    console.error('❌ PostgreSQL Connection Error:', err.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check if PostgreSQL is running');
    console.log('2. Verify database credentials in .env');
    console.log('3. Ensure database exists: CREATE DATABASE auth_db;');
    console.log('4. Check PostgreSQL is accepting connections');
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };