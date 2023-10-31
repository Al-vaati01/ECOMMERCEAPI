import Product from '../schema/Product.js';
import FilesController from './FileController.js';
class ProductController {
    static async createProduct(req, res) {
        try {
            const {
                productname,
                description,
                sku,
                brand,
                category,
                subcategory,
                price,
                quantity,
                minStockLevel,
                maxStockLevel,
                reorderLevel,
                images,
                videos,
                size,
                color,
                material,
                style,
                weight,
                dimensions,
                shippingWeight,
                shippingDimensions,
                shippingClass,
                shippingMethods,
                relatedProducts,
                reviews
            } = req.body;
            if (!productname || !description || !sku || !brand || !category || !price || !quantity) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Please fill all required fields'
                });
            }
            const productExist = await Product.findOne({ sku: sku });
            if (productExist) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Product already exists'
                });
            };
            const product = new Product({
                productname,
                description,
                sku,
                brand,
                category,
                subcategory,
                price,
                quantity,
                minStockLevel,
                maxStockLevel,
                reorderLevel,
                images,
                videos,
                size,
                color,
                material,
                style,
                weight,
                dimensions,
                shippingWeight,
                shippingDimensions,
                shippingClass,
                shippingMethods,
                relatedProducts,
                reviews
            });
            if (images) {
                const files = await FilesController.saveFile(req, res);
                product.images = files;
            }
            await product.save();
            const id = product._id.toString();
            req.body.productId = id;
            await FilesController.saveFile(req, res);
            const name = product.productname;
            return res.status(201).json({
                status: 'success',
                data: { id, name },
                message: 'Product created successfully'
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'server error' });
        }
    }

    static async updateProduct(req, res) {
        try {
            const productId = req.params.productId;
            const product = await Product.findByIdAndUpdate(productId, req.body, { new: true });
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
            return res.status(200).json({ success: true, data: [product._id, product.productname, {message: 'Product updated successfully'} ]});
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: 'server error',message:'Product not updated' });
        }
    }

    static async deleteProduct(req, res) {
        try {
            const productId = req.params.productId;
            const product = await Product.findByIdAndDelete(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
            return res.status(200).json({ success: true, message: `${product.productname} deleted successfully` });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: 'server error' });
        }
    }
    static async getAllProducts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 20;

            const products = await Product.find({}, {__v: 0 }).limit(limit).skip((page - 1) * limit);
            const results = {};
            if (products.length < limit) {
                results.next = null;
            } else {
                results.next = {
                    page: page + 1,
                };
            }
            if (page > 1) {
                results.previous = {
                    page: page - 1,
                };
            }
            results.results = products;
            return res.status(200).json({ success: true, data: results });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: 'server error' });
        }
    }

    static getAllOrders(req, res) {
        // implementation
    }

    static getOrderById(req, res) {
        // implementation
    }

    static updateOrderStatus(req, res) {
        // implementation
    }
}

export default ProductController;
