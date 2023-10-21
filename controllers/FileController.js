import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';

const path = require('path');
const fs = require('fs');
const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
   
}

export default FilesController;
module.exports = FilesController;