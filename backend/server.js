const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const { Anthropic } = require('@anthropic-ai/sdk');
const db = require('./db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});

// Mock Razorpay initialization
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

// Products API
app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
});

// Config API
app.get('/api/config', (req, res) => {
    const configs = db.prepare('SELECT * FROM config').all();
    const configMap = {};
    configs.forEach(c => configMap[c.key] = c.value);
    res.json(configMap);
});

app.put('/api/config', (req, res) => {
    const { key, value } = req.body;
    const stmt = db.prepare(`
        INSERT INTO config (key, value) VALUES (?, ?) 
        ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `);
    stmt.run(key, value);
    res.json({ success: true });
});

// Logs API for Dashboard
app.get('/api/agent/logs', (req, res) => {
    const logs = db.prepare('SELECT * FROM agent_logs ORDER BY timestamp DESC').all();
    res.json(logs);
});

// Checkout API (Razorpay dummy)
app.post('/api/checkout', async (req, res) => {
    const { amount, currency = 'INR' } = req.body;
    
    try {
        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id_here') {
            const order = await razorpay.orders.create({
                amount: amount * 100, // in paise
                currency,
                receipt: 'receipt_' + Math.random().toString(36).substring(7),
            });
            res.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
        } else {
            // Mock response if no real keys
            res.json({
                id: 'order_dummy_' + Date.now(),
                amount: amount * 100,
                currency: 'INR',
                mock: true
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Agent Event Processing
app.post('/api/agent/event', async (req, res) => {
    const { sessionId, eventType, context } = req.body;

    try {
        // Fetch current configs for guardrails
        const configs = db.prepare('SELECT * FROM config').all();
        const guardrails = {};
        configs.forEach(c => guardrails[c.key] = c.value);

        // System prompt for the agent
        const systemPrompt = `You are CheckoutMind, an autonomous AI agent integrated into an e-commerce platform.
Your goal is to increase conversions, reduce cart abandonment, and maximize revenue while providing excellent user experience.
You receive events about user behavior (e.g., idle on product page, checkout hesitation, product_qa, wishlist_check, post_purchase).
You must decide whether to take an action, and provide your reasoning.

Current Guardrails set by the store owner:
- Max discount allowed: ${guardrails.max_discount_percentage}%
- Agent Tone: ${guardrails.agent_tone}
- Enabled for abandonment: ${guardrails.enabled_for_abandonment}

You must respond in valid JSON format with the following structure:
{
    "reasoning": "Detailed explanation of why you are taking this action.",
    "action_type": "none" | "nudge" | "discount" | "email" | "qa_answer" | "wishlist_alert" | "upsell_suggestion",
    "action_payload": {
        "message": "The message to display or send (or the answer to the QA, or the upsell suggestion)",
        "discount_percentage": 10 // only if action_type is discount
    }
}
Do not include any other text besides the JSON.`;

        let userPrompt = `Event: ${eventType}\nContext: ${JSON.stringify(context)}`;

        let agentDecision = null;

        // Call Claude if we have a real key, otherwise mock it for demo if key is missing/dummy
        if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key') {
            const message = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 1024,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7
            });
            
            try {
                // Extract JSON from response
                const responseText = message.content[0].text;
                const jsonStr = responseText.substring(responseText.indexOf('{'), responseText.lastIndexOf('}') + 1);
                agentDecision = JSON.parse(jsonStr);
            } catch (e) {
                console.error("Failed to parse Claude response as JSON", e);
                agentDecision = {
                    reasoning: "Failed to parse AI response. Fallback to default action.",
                    action_type: "none",
                    action_payload: {}
                };
            }
        } else {
            // Mock reasoning if no API key
            console.log("No Anthropic Key, using mock reasoning.");
            if (eventType === 'idle_30s') {
                agentDecision = {
                    reasoning: "User is idle. A small nudge using the configured tone might help.",
                    action_type: "nudge",
                    action_payload: { message: `Don't miss out! Get it now.` }
                };
            } else if (eventType === 'checkout_hesitation_60s') {
                agentDecision = {
                    reasoning: `User is hesitating at checkout. Cart value is high. I will offer a ${Math.min(10, parseInt(guardrails.max_discount_percentage))}% discount.`,
                    action_type: "discount",
                    action_payload: { message: `Complete your purchase now for a discount!`, discount_percentage: Math.min(10, parseInt(guardrails.max_discount_percentage)) }
                };
            } else if (eventType === 'product_qa') {
                agentDecision = {
                    reasoning: `User asked a question about ${context.productName}.`,
                    action_type: "qa_answer",
                    action_payload: { message: `Based on the product details, this item is highly recommended for its quality and durability. Let me know if you need more details!` }
                };
            } else if (eventType === 'wishlist_check') {
                agentDecision = {
                    reasoning: `User checked their wishlist. Simulating a stock alert for engagement.`,
                    action_type: "wishlist_alert",
                    action_payload: { message: `One of your wishlisted items is running low on stock! Grab it before it's gone.` }
                };
            } else if (eventType === 'post_purchase') {
                agentDecision = {
                    reasoning: `User completed a purchase. Suggesting a complementary item to increase customer lifetime value.`,
                    action_type: "upsell_suggestion",
                    action_payload: { message: `Thanks for your purchase! We think you'll also love this related product to go with your new order.` }
                };
            } else {
                agentDecision = { reasoning: "No action needed.", action_type: "none", action_payload: {} };
            }
        }

        // Log the decision
        db.prepare(`
            INSERT INTO agent_logs (session_id, trigger_event, context, reasoning, action_type, action_payload)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            sessionId || 'anon',
            eventType,
            JSON.stringify(context),
            agentDecision.reasoning,
            agentDecision.action_type,
            JSON.stringify(agentDecision.action_payload)
        );

        res.json(agentDecision);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
