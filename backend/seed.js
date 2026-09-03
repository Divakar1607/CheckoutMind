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
        'Sony WH-1000XM5 Headphones', 
        29999, 
        5, 
        'https://m.media-amazon.com/images/I/61vJtKbAssL._AC_SL1500_.jpg', 
        'Industry-leading noise cancellation and premium audio quality.', 
        'Electronics', 
        4.9, 1240
    );
    insertProduct.run(
        'Herman Miller Aeron Chair', 
        124999, 
        3, 
        'https://m.media-amazon.com/images/I/71Yy8v622uL._AC_SL1500_.jpg', 
        'The benchmark for ergonomic seating in the office.', 
        'Furniture', 
        4.8, 890
    );
    insertProduct.run(
        'Keychron K2 Wireless Keyboard', 
        8500, 
        20, 
        'https://m.media-amazon.com/images/I/61NlVxt09TL._AC_SL1500_.jpg', 
        'A tactile mechanical keyboard with customizable RGB backlighting.', 
        'Electronics', 
        4.7, 510
    );
    insertProduct.run(
        'Apple Watch Ultra 2', 
        89900, 
        8, 
        'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/watch-ultra2-titanium-ocean-blue-nc-cell-202309?wid=800&hei=800&fmt=jpeg', 
        'The most rugged and capable Apple Watch ever.', 
        'Accessories', 
        4.9, 2156
    );
    insertProduct.run(
        'DJI Mini 3 Pro Drone', 
        85990, 
        4, 
        'https://m.media-amazon.com/images/I/61KqA-l6i4L._AC_SL1500_.jpg', 
        'Sub-249g folding camera drone with 4K HDR video.', 
        'Electronics', 
        4.8, 412
    );
    insertProduct.run(
        'Ember Smart Coffee Mug', 
        12999, 
        15, 
        'https://m.media-amazon.com/images/I/61x0x1R-q-L._AC_SL1500_.jpg', 
        'Keeps your coffee hot exactly the way you like it.', 
        'Home', 
        4.5, 312
    );

    // Add some mock agent logs for the dashboard
    const insertLog = db.prepare('INSERT INTO agent_logs (session_id, trigger_event, context, reasoning, action_type, action_payload, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    // Log 1: Idle nudge
    insertLog.run(
        'sess_123',
        'idle_30s',
        JSON.stringify({ cartValue: 29999, items: ['Sony WH-1000XM5 Headphones'] }),
        'User added high-ticket item but has been idle. Stock is low (5 left). A scarcity nudge is appropriate.',
        'nudge',
        JSON.stringify({ message: "Only 5 left in stock! Complete your order before they sell out." }),
        new Date(Date.now() - 3600000).toISOString()
    );

    // Log 2: Checkout hesitation with discount
    insertLog.run(
        'sess_456',
        'checkout_hesitation_60s',
        JSON.stringify({ cartValue: 89900, items: ['Apple Watch Ultra 2'] }),
        'User reached checkout but hesitated for 60s. Cart value is extremely high. Offering a 5% discount to secure the sale.',
        'discount',
        JSON.stringify({ code: "PREMIUM5", percentage: 5, message: "We noticed you're thinking about it. Here's 5% off!" }),
        new Date(Date.now() - 1800000).toISOString()
    );

    console.log("Database seeded successfully!");
};

seedData();
