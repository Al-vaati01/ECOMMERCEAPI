import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class DbClient {
  constructor() {
    this.con = mongoose;

    const host = 'db' || process.env.DB_HOST;
    const port = process.env.DB_PORT || 27018;
    const database = process.env.DB_DATABASE || console.error('Database env variable not set');

    this.url = `mongodb://${host}:${port}/${database}`;
    this.connectDb(this.url);
    this.alive;
  }

  async connectDb(url) {
    try {
      await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }).then(() => {
        console.log('Connection to DB succeeded:');
        this.alive = true;
      }).catch((error) => {
        console.error('Connection to DB failed:', error);
        this.alive = false;
      });
    } catch (error) {
      console.error('Error connecting to MongoDB', error);
      return false;
    }
  }

  async isAlive() {
    const check = setTimeout(() => {
      try{
        if (this.alive) {
          return true;
        } else {
          return false;
        }
      }finally{
        clearTimeout(check);
      }
    }, 1000);
  }
}

const dbClient = new DbClient();
export default dbClient;
