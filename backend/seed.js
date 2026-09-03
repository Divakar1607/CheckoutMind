const db = require('./db');

const seedData = () => {
    console.log("Seeding database...");
    
    // Clear existing
    db.exec(`
        DELETE FROM products;
        DELETE FROM agent_logs;
        DELETE FROM sessions;
    `);

    // Products
    const insertProduct = db.prepare('INSERT INTO products (name, price, stock, image, description, category, rating, reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    
    insertProduct.run(
        'Fjallraven Foldsack Backpack', 
        1499, 
        25, 
        'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png', 
        'Your perfect pack for everyday use and walks in the forest.', 
        'Accessories', 
        4.8, 120
    );
    insertProduct.run(
        'Mens Casual Premium T-Shirt', 
        699, 
        50, 
        'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png', 
        'Slim-fitting style, contrast raglan long sleeve, lightweight & soft fabric.', 
        'Clothing', 
        4.5, 89
    );
    insertProduct.run(
        'Mens Cotton Jacket', 
        2499, 
        15, 
        'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png', 
        'Great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions.', 
        'Clothing', 
        4.7, 51
    );
    insertProduct.run(
        'Solid Gold Petite Micropave', 
        5999, 
        8, 
        'https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_t.png', 
        'Satisfaction Guaranteed. Return or exchange any order within 30 days.', 
        'Jewelery', 
        4.9, 215
    );
    insertProduct.run(
        'WD 2TB External Hard Drive', 
        4599, 
        40, 
        'https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_t.png', 
        'USB 3.0 and USB 2.0 Compatibility. Fast data transfers.', 
        'Electronics', 
        4.8, 412
    );
    insertProduct.run(
        'Samsung 49-Inch Curved Monitor', 
        29999, 
        5, 
        'https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_t.png', 
        '49 INCH SUPER ULTRAWIDE 32:9 CURVED GAMING MONITOR with dual 27 inch screen side by side.', 
        'Electronics', 
        4.6, 312
    );

    // Add some mock agent logs for the dashboard
    const insertLog = db.prepare('INSERT INTO agent_logs (session_id, trigger_event, context, reasoning, action_type, action_payload, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    // Log 1: Idle nudge
    insertLog.run(
        'sess_123',
        'idle_30s',
        JSON.stringify({ cartValue: 29999, items: ['Samsung 49-Inch Curved Monitor'] }),
        'User added high-ticket item but has been idle. Stock is low (5 left). A scarcity nudge is appropriate.',
        'nudge',
        JSON.stringify({ message: "Only 5 left in stock! Complete your order before they sell out." }),
        new Date(Date.now() - 3600000).toISOString()
    );

    // Log 2: Checkout hesitation with discount
    insertLog.run(
        'sess_456',
        'checkout_hesitation_60s',
        JSON.stringify({ cartValue: 4599, items: ['WD 2TB External Hard Drive'] }),
        'User reached checkout but hesitated for 60s. Offering a 5% discount to secure the sale.',
        'discount',
        JSON.stringify({ code: "SAVE5", percentage: 5, message: "We noticed you're thinking about it. Here's 5% off!" }),
        new Date(Date.now() - 1800000).toISOString()
    );

    console.log("Database seeded successfully!");
};

seedData();
