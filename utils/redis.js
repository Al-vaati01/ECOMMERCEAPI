// #!/usr/bin/node
// import { promisify } from 'util';
// import redis from 'redis';
// import { exec } from 'child_process';
// import {existsSync} from 'fs';


// class RedisClient {
//   constructor() {
//     try {
//       this.client = redis.createClient(
//         {
//           host: process.env.REDIS_HOST || 'localhost',
//           port: process.env.REDIS_PORT || 6379,
//         }
//       );
//       this.connectRedis();
//       this.client.on('connect', () => {
//         console.log('redis is live');
//       });
//       this.client.on('error', (error) => {
//         const path = '/usr/src/app/run.sh';
//         if (existsSync(path)) {
//           try{
//             exec(`bash ${path}`, (error, stdout, stderr) => {
//               if (error) {
//                 console.error(`Exec Error: ${error.message}`);
//                 return;
//               }
//               console.log(`Script output: ${stdout}`);
//               console.error(`Script errors: ${stderr}`);
//             });
//           }catch(error){
//             console.error('FILE NOT EXEC ERROR -->:', error);
//           }
//         }
//         console.error('REDIS ERROR -->:', error);
//       });
//     } catch (error) {
//       console.error('REDIS ERROR -->:', error);
//     }
//   }
//   async connectRedis() {
//     await this.client.connect();
//   }
//   async get(key) {
//     return await this.client.get.bind(this.client)(key);
//   }

//   async set(key, value, duration) {
//     await promisify(this.client.set).bind(this.client)(key, value, 'EX', duration);
//   }

//   async del(key) {
//     await promisify(this.client.del).bind(this.client)(key);
//   }

//   async hset(hashKey, key, value) {
//     await promisify(this.client.hSet).bind(this.client)(hashKey, key, value);
//   }
//   async hgetAll(hashKey) {
//     const value = await promisify(this.client.hGetAll).bind(this.client)(hashKey);
//     return value;
//   }
// }

// const redisClient = new RedisClient();
// export default redisClient;