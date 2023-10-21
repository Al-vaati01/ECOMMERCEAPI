import Product from '../schema/Product.js';
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
            const product = await Product.create({
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
            const id = product._id.toString();
            const name = product.productname;
            return res.status(201).json({
                status: 'success',
                data: { id, name },
                message: 'Product created successfully'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'server error' });
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
            res.status(500).json({ success: false, error: 'server error',message:'Product not updated' });
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
            res.status(500).json({ success: false, error: 'server error' });
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
