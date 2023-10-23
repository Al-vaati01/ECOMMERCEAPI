import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import File from '../schema/File.js';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/productImages';

class FilesController {
    static async saveFile(req, res) {
        try {
            const { images } = req.body;
            const { productId } = req.body;
            const { productname } = req.body;
            const sizes = [500, 250, 100];
            if (!images) {
                return;
            }
            if (!productId) {
                return;
            }
            if (!productname) {
                return;
            }
            const productFolder = path.join(FOLDER_PATH, productname);
            const filename = `${productname}_${uuidv4()}`;
            const filepath = path.join(productFolder, filename)
            const base64Data = images.replace(/^data:image\/png;base64,/, ''); // Remove "data:image/png;base64," prefix
            if (!fs.existsSync(productFolder)) {
                fs.mkdirSync(productFolder, { recursive: true });
            }
            //save image to local storage and create thumbnails
            fs.writeFileSync(`${filepath}.png`, base64Data, 'base64');
            const files = [];
            //use thunmbnail generator to create thumbnails
            for (const size of sizes) {
                const thumbnail = `${filepath}_${size}.png`;
                await sharp(`${filepath}.png`)
                    .resize(size, size)
                    .toFile(thumbnail);
                files.push(thumbnail);
            }
            //save image to database
            const file = new File({
                productId,
                filename,
                filepath,
                fileType: mime.lookup(`${filepath}.png`)
            });
            await file.save();
            return files;

        } catch (error) {
            console.error(error);
        }
    }
}

export default FilesController;
