# ROI Staking Calculator

A professional, dynamic ROI staking calculator with a powerful admin panel for managing investment tiers and marketing campaigns.

## 🌟 Features

- **Dynamic Configuration**: Admin panel to modify tiers, bonuses, and packages without code changes
- **5-Tier System**: Flexible tier structure with customizable ROI ranges
- **USD Package Management**: Configure investment packages with token conversions
- **Campaign Management**: Export/import configurations for A/B testing and seasonal campaigns
- **WordPress Integration**: Easy iframe embedding for WordPress sites
- **Real-time Updates**: Changes in admin panel reflect immediately on the calculator
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## 🚀 Live Demo

- **Public Calculator**: [https://test2025nov.abacusai.app](https://test2025nov.abacusai.app)
- **Admin Panel**: [https://test2025nov.abacusai.app/admin](https://test2025nov.abacusai.app/admin)

## 📋 Prerequisites

- Node.js 18+ 
- Yarn package manager

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/roi-staking-calculator.git
cd roi-staking-calculator/nextjs_space

# Install dependencies
yarn install

# Create environment file
cp .env.example .env

# Edit .env and set your admin password
# ADMIN_PASSWORD=your_secure_password_here

# Run development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the calculator.

## 🔐 Admin Panel

### Accessing the Admin Panel

1. Navigate to `/admin` on your deployed app
2. Enter the admin password (default: `admin123` - **change this!**)
3. Configure tiers, packages, and campaigns

### Admin Features

#### Tier Configuration
- Edit tier names (e.g., NexEconomy, NexComfort, NexXL, NexLuxury, NexPartner)
- Set token ranges (min/max)
- Configure base bonus percentages
- Adjust proportional multipliers
- Set ROI boundaries (min/max)
- Customize tier colors
- Add special descriptions

#### USD Package Management
- Define USD investment amounts
- Set corresponding token amounts
- Add or remove packages as needed

#### Campaign Management
- **Export**: Download current configuration as JSON
- **Import**: Upload a saved configuration
- **Reset**: Restore to default settings

## 🌐 WordPress Integration

### Embed Code

Add this to any WordPress page or post:

```html
<iframe 
    src="https://test2025nov.abacusai.app" 
    width="100%" 
    height="1800px" 
    frameborder="0"
    style="border:none; border-radius:8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
</iframe>
```

### WordPress Instructions

1. Log into WordPress admin
2. Create/edit a page
3. Add a "Custom HTML" block
4. Paste the iframe code
5. Publish!

## 📊 ROI Calculation Formula

```
Total Bonus = Base Bonus (A) + (Tokens / Max Tokens in Tier) × Proportional Multiplier (B)
Final ROI = min(max(Total Bonus, Min ROI), Max ROI)
```

### Example Calculation

**Tier 2 (NexComfort)** with 200,000 tokens:
- Base Bonus (A) = 1%
- Proportional Multiplier (B) = 5
- Token Range: 100,001 - 350,000
- Calculation:
  - Total Bonus = 1 + (200,000 / 350,000) × 5 = 3.86%
  - Capped at Max ROI = 2.75% ✅

## 📁 Project Structure

```
roi_staking_calculator/
└── nextjs_space/
    ├── app/
    │   ├── admin/              # Admin panel page
    │   ├── api/
    │   │   ├── admin/          # Admin API routes
    │   │   └── config/         # Public config API
    │   ├── layout.tsx          # Root layout
    │   └── page.tsx            # Main calculator page
    ├── components/
    │   ├── roi-calculator.tsx  # Main calculator component
    │   ├── tier-table.tsx      # Tier comparison table
    │   └── ui/                 # Reusable UI components
    ├── lib/
    │   ├── calculations.ts     # ROI calculation logic
    │   ├── config-context.tsx  # Configuration context
    │   └── constants.ts        # Static constants
    ├── data/
    │   ├── default-config.json # Default configuration
    │   └── config.json         # Active configuration (created at runtime)
    └── public/                 # Static assets
```

## 🔒 Security

### Admin Password

**⚠️ IMPORTANT**: Change the default admin password immediately!

```bash
# In .env file
ADMIN_PASSWORD=your_very_secure_password_here
```

### Best Practices

1. Use a strong, unique password (min 16 characters)
2. Don't commit `.env` to version control
3. Backup configurations regularly using Export feature
4. Limit admin access to trusted team members only

## 🚀 Deployment

The app is configured for deployment on Abacus.AI platform but can be deployed anywhere that supports Next.js:

- Vercel
- Netlify
- AWS Amplify
- Google Cloud Run
- Self-hosted with PM2

### Environment Variables

Ensure these are set in your deployment environment:

```
ADMIN_PASSWORD=your_secure_password
```

## 🎯 Use Cases

### Marketing Campaigns

1. **Conservative Campaign**: Lower ROI ranges to attract cautious investors
2. **Aggressive Campaign**: Higher ROI to attract risk-takers
3. **VIP Campaign**: Enhanced Tier 5 with exclusive benefits

### A/B Testing

1. Export "Version A" configuration
2. Create and test "Version B"
3. Compare conversion rates
4. Import the winning version

### Seasonal Promotions

1. Export standard configuration
2. Create "Holiday Special" with boosted bonuses
3. Run promotion
4. Reset to standard after campaign

## 🛠️ Built With

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Lucide Icons** - Icon library

## 📝 Configuration Schema

### Tier Object

```typescript
{
  id: number;
  name: string;
  minTokens: number;
  maxTokens: number | null;
  baseBonus: number;
  proportionalMultiplier: number;
  minROI: number;
  maxROI: number;
  threshold: number | null;
  color: string;  // Hex color code
  description: string | null;
}
```

### USD Package Object

```typescript
{
  usd: number;
  tokens: number;
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 📧 Support

For support, please contact your development team or open an issue on GitHub.

## 🎉 Acknowledgments

- Built with ❤️ for modern token staking platforms
- Designed for easy customization and campaign management
- Optimized for conversion and user experience
