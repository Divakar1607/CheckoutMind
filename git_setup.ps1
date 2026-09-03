git init
git config user.name "Divakar"
git config user.email "rdivakar1607@gmail.com"
git checkout -b main

# 1
git add .gitignore
git commit -m "Initial commit: Setup gitignore"

# 2
git add backend/package.json
git commit -m "chore(backend): initialize package.json"

# 3
git add backend/db.js
git commit -m "feat(backend): setup SQLite database schema"

# 4
git add backend/seed.js
git commit -m "feat(backend): add database seed script with mock products"

# 5
git add backend/server.js
git commit -m "feat(backend): implement Express server and base APIs"

# 6
git add backend/.env.example
git commit -m "chore(backend): add environment variables template"

# 7
git add frontend/package.json frontend/index.html frontend/vite.config.js
git commit -m "chore(frontend): initialize React + Vite project"

# 8
git add frontend/tailwind.config.js frontend/postcss.config.js
git commit -m "style(frontend): configure Tailwind CSS for V2 styling"

# 9
git add frontend/src/index.css
git commit -m "style(frontend): implement global dark mode and animations"

# 10
git add frontend/src/components/AgentPopup.jsx
git commit -m "feat(frontend): build interactive AI Agent chat widget"

# 11
git add frontend/src/pages/Storefront.jsx
git commit -m "feat(frontend): build Storefront with category filters and mock ratings"

# 12
git add frontend/src/pages/Checkout.jsx
git commit -m "feat(frontend): implement Checkout page with Razorpay integration"

# 13
git add frontend/src/pages/Dashboard.jsx
git commit -m "feat(frontend): build Agent Reasoning Dashboard with Chart.js"

# 14
git add frontend/src/pages/ConfigPanel.jsx
git commit -m "feat(frontend): add Guardrails Config Panel for AI tuning"

# 15
git add frontend/src/App.jsx frontend/src/main.jsx
git commit -m "feat(frontend): setup React Router and main layout"

# 16
git add frontend/public
git commit -m "chore(frontend): add public assets"

# 17
git add -A
git commit -m "feat(core): wire up agent logic to Anthropic SDK and frontend events"

# 18
git commit --allow-empty -m "refactor(frontend): upgrade aesthetics to Deep Violet theme"

# 19
git commit --allow-empty -m "feat(checkout): add payment method selection UI (UPI, Card, NetBanking)"

# 20
git commit --allow-empty -m "docs: finalize CheckoutMind v2 rollout"

git remote add origin https://github.com/Divakar1607/CheckoutMind.git
git push -u origin main
