import dbClient from '../utils/db.js';

const product = new dbClient.con.Schema(
    {
        productname: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        sku: {
            type: String,
            required: true
        },
        brand: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        subcategory: {
            type: String
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        minStockLevel: {
            type: Number
        },
        maxStockLevel: {
            type: Number
        },
        reorderLevel: {
            type: Number
        },
        images: {
            type: [String]
        },
        videos: {
            type: [String]
        },
        size: {
            type: String
        },
        color: {
            type: String
        },
        material: {
            type: String
        },
        style: {
            type: String
        },
        weight: {
            type: Number
        },
        dimensions: {
            type: String
        },
        shippingWeight: {
            type: Number
        },
        shippingDimensions: {
            type: String
        },
        shippingClass: {
            type: String
        },
        shippingMethods: {
            type: [String]
        },
        relatedProducts: {
            type: [String]
        },
        reviews: {
            type: [
                {
                    user: String,
                    comment: String,
                    rating: Number
                }
            ]
        },
        addedOn: {
            type: Date,
            default: Date.now()
        },
        updatedAt: {
            type: Date,
            default: Date.now()
        }
    }
);
const Product = dbClient.con.model('products', product);
Product.createIndexes({productname: 'text', brand: 'text', category: 'text'});
Product.on('index', function (err) {
    if (err) {
        console.error(err);
    }
});

export default Product;
