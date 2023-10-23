import dbClient from '../utils/db.js';
import { Types } from 'mongoose';

const fileSchema = new dbClient.con.Schema({
    productId: {
        type: Types.ObjectId,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    filepath: {
        type: String,
        required: true
    }
});

const File = dbClient.con.model('files', fileSchema);
File.createIndexes({ productId: 1});
File.on('index', function (err) {
    if (err) {
        console.error('Indexes could not be created:', err);
    } else {
        console.log('All indexes have been created');
    }
});

export default File;
