# Small Business Grant Tracker

A production-ready Next.js 14 application for tracking small business grants across all 50 states. Built with TypeScript, Prisma, Supabase, and optimized for AdSense monetization.

## 🚀 Features

- **50 States Coverage**: Complete database of all US states with grant programs
- **SEO Optimized**: JSON-LD schemas, meta tags, sitemaps, and RSS feeds
- **AdSense Ready**: Integrated ad slots with CLS-safe layout
- **Database Backed**: Prisma + Supabase Postgres for scalable data management
- **Static Generation**: ISR caching for fast performance
- **Mobile Responsive**: TailwindCSS with modern design

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Supabase Postgres
- **ORM**: Prisma
- **Deployment**: Vercel
- **Monetization**: Google AdSense

## 📦 Quick Start

### 1. Clone and Install

```bash
cd grant-tracker
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your database URL from Settings > Database
3. Copy `env.example` to `.env.local` and fill in your credentials:

```bash
cp env.example .env.local
```

### 3. Configure Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@db.supabase.co:5432/postgres"

# Site
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NEXT_PUBLIC_SITE_NAME="Small Business Grant Tracker"

# AdSense (optional for development)
NEXT_PUBLIC_ADSENSE_CLIENT="ca-pub-xxxxxxxxxx"
NEXT_PUBLIC_ADSENSE_ENABLED="true"
```

### 4. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with all 50 states and sample programs
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🗄 Database Schema

### States
- All 50 US states with population data
- SEO-friendly slugs and descriptions
- Relationship to programs

### Programs
- Grant title, description, amount, deadline
- Application URL and featured status
- SEO meta fields
- State relationship

### FAQs
- Question/answer pairs for rich snippets
- Ordering and active status

## 📄 Pages Structure

```
/                    # Home page with state grid
/state               # All states listing
/state/[state]       # State-specific grants
/program/[slug]      # Individual grant details
/faq                 # FAQ page with schema
/about               # About page
/contact             # Contact page
/privacy             # Privacy policy
/terms               # Terms of service
/sitemap.xml         # Dynamic sitemap
/rss.xml             # RSS feed
/robots.txt          # SEO robots file
/ads.txt             # AdSense verification
```

## 🎯 AdSense Integration

### Ad Slots
- **In-content ads**: After every 3rd program
- **Sticky sidebar**: Desktop-only sidebar ads
- **Mid-content**: Strategic placement in articles

### AdSense Setup
1. Apply for AdSense at [google.com/adsense](https://google.com/adsense)
2. Add your publisher ID to environment variables
3. Replace ad slot IDs in components
4. Test with `NEXT_PUBLIC_ADSENSE_ENABLED="true"`

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure `DATABASE_URL` is set correctly

3. **Database Setup**
   ```bash
   # Run migrations
   vercel env pull .env.local
   npm run db:push
   npm run db:seed
   ```

### Custom Domain
- Add your domain in Vercel dashboard
- Update `NEXT_PUBLIC_SITE_URL` in environment variables
- Update DNS settings as instructed

## 📈 SEO Optimization

### Built-in SEO Features
- **Meta Tags**: Dynamic titles and descriptions
- **JSON-LD**: FAQ, Article, and Breadcrumb schemas
- **Sitemaps**: Auto-generated from database
- **RSS Feeds**: Latest program updates
- **Canonical URLs**: Proper URL structure

### SEO Checklist
- [ ] Add your domain to Google Search Console
- [ ] Submit sitemap: `yoursite.com/sitemap.xml`
- [ ] Verify robots.txt: `yoursite.com/robots.txt`
- [ ] Test structured data with Google's Rich Results Test

## 💰 Monetization Strategy

### AdSense Approval Requirements
- [ ] 30+ high-quality pages (✅ Built-in)
- [ ] About, Contact, Privacy, Terms pages (✅ Included)
- [ ] Original, valuable content (✅ Grant database)
- [ ] Professional design (✅ TailwindCSS)
- [ ] Mobile-responsive (✅ Responsive design)

### Revenue Projections
- **Target**: 30k-50k monthly pageviews by Day 90
- **CPM**: ~$60 for business/finance content
- **Monthly Revenue**: $1,800-$3,000

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema changes
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

### Adding New Programs
```typescript
// Add to seed.ts or create admin interface
await prisma.program.create({
  data: {
    title: "New Grant Program",
    slug: "new-grant-program",
    description: "Program description...",
    amount: "Up to $50,000",
    deadline: new Date("2024-12-31"),
    url: "https://apply-here.com",
    stateId: "state-id",
    featured: false,
    active: true
  }
})
```

## 📊 Analytics Setup

### Google Analytics 4
1. Create GA4 property
2. Add tracking code to `app/layout.tsx`
3. Set up conversion tracking for grant applications

### Search Console
1. Verify domain ownership
2. Submit sitemap
3. Monitor search performance

## 🎨 Customization

### Styling
- Modify `tailwind.config.ts` for brand colors
- Update `styles/globals.css` for custom styles
- Replace default OG image in `public/og-default.png`

### Content
- Update site name in environment variables
- Modify seed data for your target audience
- Add your own grant programs

## 📞 Support

For questions or issues:
- Check the [FAQ page](/faq)
- Review the [documentation](https://nextjs.org/docs)
- Contact: [support@granttracker.com](mailto:support@granttracker.com)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Ready to launch your grant tracker?** Follow the setup instructions above and you'll have a production-ready application in minutes!


# granttrackers
