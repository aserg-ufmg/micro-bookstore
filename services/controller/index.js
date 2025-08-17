const express = require('express');
const shipping = require('./shipping');
const inventory = require('./inventory');
const cors = require('cors');

const app = express();
app.use(cors());

/**
 * Return the store's product list via InventoryService
 */
app.get('/products', (req, res, next) => {
    inventory.SearchAllProducts(null, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json(data.products);
        }
    });
});

/**
 * Check the shipping freight/cost in the ShippingService
 */
app.get('/shipping/:zipcode', (req, res, next) => {
    shipping.GetShippingRate(
        {
            zipcode: req.params.zipcode,
        },
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({ error: 'something failed :(' });
            } else {
                res.json({
                    cep: req.params.zipcode,
                    value: data.value,
                });
            }
        }
    );
});

/**
 * Start the router
 */
app.listen(3000, () => {
    console.log('Controller Service running on http://127.0.0.1:3000');
});
