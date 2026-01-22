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

    // Sync database (creates/updates tables) - made opt-in to avoid risky automatic ALTERs
    // Enable by setting DB_SYNC=true in your environment (development only).
    if (process.env.DB_SYNC === 'true') {
      try {
        await sequelize.sync({ alter: true });
        console.log('✅ Database tables synchronized');
      } catch (syncErr) {
        console.error('❌ Database sync error:', syncErr.message);
        // Detect common Postgres enum migration problem and give actionable guidance
        if (syncErr.message && syncErr.message.includes('cannot be cast automatically to type')) {
          console.log('\n⚠️  Detected enum migration issue. Sequelize cannot automatically alter existing column to a Postgres enum type.');
          console.log('Recommended fixes:');
          console.log('  - Create the enum type manually and ALTER the column to use it;');
          console.log('  - Or drop and recreate the affected table(s) if safe (destructive);');
          console.log('  - Or avoid using `sequelize.sync({ alter: true })` for enum changes and use proper SQL migrations instead.');
        }
        throw syncErr;
      }
    } else {
      console.log('ℹ️  Database sync skipped. To enable automatic schema sync (development only) set DB_SYNC=true');
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