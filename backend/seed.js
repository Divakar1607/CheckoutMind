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
    
    insertProduct.run('Wireless Noise-Canceling Headphones', 2499, 5, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 'Premium sound quality with active noise cancellation.', 'Electronics', 4.9, 124);
    insertProduct.run('Ergonomic Office Chair', 4999, 12, 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&auto=format&fit=crop&q=80', 'Supportive mesh back and adjustable height for all-day comfort.', 'Furniture', 4.8, 89);
    insertProduct.run('Mechanical Keyboard', 1999, 20, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80', 'Tactile switches with customizable RGB backlighting.', 'Electronics', 4.7, 51);
    insertProduct.run('Minimalist Smartwatch', 3499, 8, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', 'Track your fitness and notifications in style.', 'Accessories', 4.9, 215);
    insertProduct.run('Ceramic Coffee Mug', 399, 15, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&auto=format&fit=crop&q=80', 'Keeps your coffee hot exactly the way you like it.', 'Home', 4.5, 31);
    insertProduct.run('Water Bottle', 499, 50, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80', 'Double-wall vacuum insulated stainless steel bottle.', 'Home', 4.9, 342);

    // Add some mock agent logs for the dashboard
    const insertLog = db.prepare('INSERT INTO agent_logs (session_id, trigger_event, context, reasoning, action_type, action_payload, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    // Log 1: Idle nudge
    insertLog.run(
        'sess_123',
        'idle_30s',
        JSON.stringify({ cartValue: 2499, items: ['Wireless Noise-Canceling Headphones'] }),
        'User added item but has been idle. Stock is low (5 left). A scarcity nudge is appropriate.',
        'nudge',
        JSON.stringify({ message: "Only 5 left in stock! Complete your order before they sell out." }),
        new Date(Date.now() - 3600000).toISOString()
    );

    // Log 2: Checkout hesitation with discount
    insertLog.run(
        'sess_456',
        'checkout_hesitation_60s',
        JSON.stringify({ cartValue: 4999, items: ['Ergonomic Office Chair'] }),
        'User reached checkout but hesitated for 60s. Cart value is decent. Offering a 10% discount to secure the sale.',
        'discount',
        JSON.stringify({ code: "SAVE10", percentage: 10, message: "We noticed you're thinking about it. Here's 10% off!" }),
        new Date(Date.now() - 1800000).toISOString()
    );

    console.log("Database seeded successfully!");
};

seedData();
