# SHORA Institute - Detailed Cost Breakdown

## 💰 WHAT COSTS MONEY vs FREE

---

## 🆓 **COMPLETELY FREE (No Cost Ever)**

### 1. **React + Vite** ✅
- **Cost**: $0
- **What you have**: Frontend framework
- **Free forever**: Open source

### 2. **Lucide React** ✅
- **Cost**: $0
- **What you have**: SVG icons
- **Free forever**: MIT licensed

### 3. **React Router** ✅
- **Cost**: $0
- **What you have**: Navigation
- **Free forever**: Open source

### 4. **GitHub** ✅
- **Cost**: $0
- **What you have**: Code repository
- **Free tier**: Unlimited public/private repos

---

## 🎁 **FREE TIERS (Generous - Start Free, Scale Later)**

### 1. **Vercel** (Frontend Hosting) ✅ CURRENT
```
FREE TIER (Hobby):
✅ Unlimited deployments
✅ 100GB bandwidth/month
✅ Automatic HTTPS
✅ Preview deployments
✅ Analytics (basic)

PAID (Pro): $20/month
- 1TB bandwidth
- Advanced analytics
- Team collaboration
- Priority support

WHEN TO UPGRADE: ~5,000 monthly visitors
```

### 2. **Supabase** (Backend + Database)
```
FREE TIER:
✅ 500MB database
✅ 1GB file storage
✅ 50,000 monthly active users
✅ 2GB bandwidth
✅ Authentication included
✅ Realtime subscriptions

PAID (Pro): $25/month
- 8GB database
- 100GB file storage
- 250,000 monthly active users
- 50GB bandwidth
- No project pausing
- Daily backups

WHEN TO UPGRADE: 50,000+ users or 500MB+ data
```

### 3. **Netlify** (Alternative Hosting)
```
FREE TIER:
✅ 100GB bandwidth/month
✅ Automatic HTTPS
✅ Forms (100/month)
✅ Functions (125k invocations)

PAID: $19/month
```

### 4. **Render** (Backend Hosting Alternative)
```
FREE TIER:
✅ 750 hours/month (enough for 1 service 24/7)
✅ 512MB RAM
✅ Automatic deploys
⚠️ Goes to sleep after 15 min inactivity

PAID: $7/month (always on)
```

### 5. **Railway** (Backend Hosting)
```
FREE TRIAL:
✅ $5 free credits/month
✅ Can run small services

PAID: Pay per usage (~$5-20/month)
```

### 6. **Cloudflare** (CDN + DNS)
```
FREE TIER:
✅ Unlimited bandwidth (CDN)
✅ DDoS protection
✅ DNS management
✅ SSL certificates
✅ R2 Storage (10GB free)

PAID: R2 is $0.015/GB/month (very cheap)
```

---

## 💳 **PAID SERVICES (Required for Production)**

### 1. **Video Hosting** 💰 REQUIRED

#### Option A: **Mux** (Recommended)
```
PRICING:
- Video Storage: $0.05/GB/month
- Streaming: $0.01/GB delivered
- Live Streaming: $0.015/min

EXAMPLE COSTS:
100 videos (50GB total) = $2.50/month storage
10,000 views (500GB) = $5/month streaming
---
MONTHLY: ~$10-50 for 1,000 students
```

#### Option B: **Cloudflare Stream**
```
PRICING:
- $1/1,000 minutes stored
- $1/1,000 minutes delivered

EXAMPLE:
100 hours of video = $6/month storage
10,000 views = $10/month streaming
---
MONTHLY: ~$15-30 for 1,000 students
```

#### Option C: **AWS S3 + CloudFront** (DIY)
```
PRICING:
- S3 Storage: $0.023/GB
- CloudFront: $0.085/GB (first 10TB)

EXAMPLE:
50GB videos = $1.15/month
500GB streaming = $42.50/month
---
MONTHLY: ~$40-100 (cheaper at scale)
```

#### Option D: **Bunny CDN** (Cheapest)
```
PRICING:
- Storage: $0.01/GB/month
- Bandwidth: $0.01/GB

EXAMPLE:
50GB videos = $0.50/month
500GB streaming = $5/month
---
MONTHLY: ~$5-10 (best price)
⚠️ Less features than Mux
```

### 2. **Payment Processing** 💳 REQUIRED

#### **Stripe** (Recommended)
```
PRICING:
- 3.4% + RWF 100 per transaction (Rwanda)
- 2.9% + $0.30 (International)
- No monthly fee
- Subscriptions included

EXAMPLE:
100 students × RWF 10,000 = RWF 1,000,000
Stripe fee: ~RWF 34,100 (3.4%)
---
COST: Only pay when you earn
```

#### **Flutterwave** (African Alternative)
```
PRICING:
- 3.8% per transaction (local cards)
- 3.8% + RWF 100 (international)

EXAMPLE:
Same revenue: RWF 1,000,000
Flutterwave fee: ~RWF 38,100
---
COST: Slightly higher than Stripe
```

### 3. **Email Service** 📧 REQUIRED

#### **Resend** (Recommended)
```
FREE TIER:
✅ 3,000 emails/month
✅ 100 emails/day

PAID: $20/month
- 50,000 emails/month
- Unlimited domains

WHEN TO UPGRADE: 100+ daily emails
```

#### **SendGrid**
```
FREE TIER:
✅ 100 emails/day

PAID: $15/month
- 50,000 emails/month
```

#### **Postmark**
```
PRICING:
- $10/month = 10,000 emails
- Very reliable
```

### 4. **Authentication** 🔐 (Optional - Supabase has free auth)

#### **Clerk** (Premium Option)
```
FREE TIER:
✅ 10,000 monthly active users
✅ Email + password
✅ Social logins

PAID: $25/month
- 10,000 MAU included
- $0.02 per extra user
```

#### **Auth0**
```
FREE TIER:
✅ 7,500 monthly active users
✅ Social logins

PAID: $35/month (enterprise features)
```

### 5. **Search** 🔍 (Optional - Can use PostgreSQL initially)

#### **Meilisearch Cloud**
```
PAID: Starting at $20/month
- 1M documents
- 10GB storage

SELF-HOST: FREE
- Host on Railway/Render
```

#### **Algolia**
```
FREE TIER:
✅ 10,000 searches/month
✅ 10,000 records

PAID: $1/1,000 searches
- Expensive at scale
```

### 6. **Monitoring** 📊 (Recommended)

#### **Sentry** (Error Tracking)
```
FREE TIER:
✅ 5,000 errors/month
✅ 1 user

PAID: $26/month
- 50,000 errors
- Team features
```

#### **PostHog** (Analytics)
```
FREE TIER:
✅ 1M events/month
✅ All features

PAID: $0.00031/event after 1M
```

### 7. **Domain & SSL** 🌐 REQUIRED

```
DOMAIN: $10-15/year
- .com, .rw, .co.rw

SSL CERTIFICATE: FREE
- Let's Encrypt (via Vercel/Cloudflare)
```

---

## 📊 **TOTAL COST BREAKDOWN**

### **OPTION 1: Minimal Cost MVP (Start for FREE)**

```
✅ Frontend (Vercel Free): $0
✅ Backend (Supabase Free): $0
✅ Database (Supabase): $0
✅ Authentication (Supabase): $0
✅ File Storage (Supabase): $0
💰 Video Hosting (Bunny CDN): $5-10/month
💰 Payments (Stripe): 3.4% of revenue only
✅ Email (Resend Free): $0 (up to 3,000/month)
✅ Domain: $12/year
✅ CDN (Cloudflare): $0

MONTHLY TOTAL: $5-15 for 0-1,000 users
STARTUP COST: $12 (domain only!)
```

### **OPTION 2: Professional Setup**

```
💰 Frontend (Vercel Pro): $20/month
💰 Backend (Supabase Pro): $25/month
💰 Video (Mux): $30-100/month
💰 Payments (Stripe): 3.4% of revenue
💰 Email (Resend): $20/month
💰 Monitoring (Sentry): $26/month
💰 Domain: $12/year

MONTHLY TOTAL: $120-200 for 1,000-10,000 users
```

### **OPTION 3: Scale-Ready (10,000+ users)**

```
💰 Hosting: $200/month
💰 Database: $100/month
💰 Video CDN: $500/month
💰 Email: $50/month
💰 Search: $50/month
💰 Monitoring: $100/month
💰 Payments: 3.4% of revenue

MONTHLY TOTAL: $1,000+ for 10,000+ users
```

---

## 🎯 **MY RECOMMENDATION: Start with FREE/CHEAP Option**

### **Phase 1: MVP (0-1,000 users) - ALMOST FREE**

```javascript
// Use FREE tiers:
Frontend: Vercel (Free) ✅ $0
Backend: Supabase (Free) ✅ $0
Video: Bunny CDN 💰 $10/month
Payments: Stripe 💳 3.4% only
Email: Resend (Free) ✅ $0
Domain: $12/year

TOTAL: ~$10-15/month + 3.4% transaction fees
STARTUP: $12 domain only!
```

### **When to Upgrade:**

1. **Vercel → Pro ($20/month)**: When you hit 5,000+ monthly visitors
2. **Supabase → Pro ($25/month)**: When you need more than 500MB database
3. **Video → Mux**: When you want better analytics and features
4. **Email → Paid**: When sending 100+ emails/day

---

## 💡 **COST-SAVING TIPS**

### 1. **Use Free Tiers Smartly**
```
✅ Start with Supabase Free (50,000 MAU!)
✅ Use Vercel Free (good for 5,000 visitors)
✅ Cloudflare CDN is always free
✅ Resend gives 3,000 emails/month free
```

### 2. **Video Optimization**
```
✅ Compress videos before upload
✅ Use adaptive streaming (saves bandwidth)
✅ CDN caching (Bunny or Cloudflare)
✅ Consider YouTube private videos (FREE!)
```

### 3. **Email Optimization**
```
✅ Use transactional emails only
✅ Batch notifications
✅ Resend free tier = 3,000 emails/month
```

### 4. **Payment Processing**
```
✅ Stripe has no monthly fee
✅ Only pay when you earn
✅ 3.4% is industry standard
```

---

## 🚀 **RECOMMENDED START: $12 Total!**

### **What You Can Build for FREE:**

```
1. Deploy frontend on Vercel (Free)
2. Use Supabase (Free tier)
3. Store videos on Supabase (1GB free)
   OR use YouTube private videos (Free!)
4. Use Stripe (Free, only % of sales)
5. Send emails via Resend (3,000/month free)
6. Use Cloudflare CDN (Free)

TOTAL MONTHLY: $0
ONE-TIME: $12 (domain)
```

### **When You Get Your First 100 Paying Students:**

```
Revenue: 100 × RWF 10,000 = RWF 1,000,000
Stripe Fees: RWF 34,100 (3.4%)
Infrastructure: RWF 7,500 (~$10)
---
NET PROFIT: RWF 958,400 (~96%!)
```

---

## 📈 **SCALING COSTS (Monthly)**

| Users | Infrastructure | Video | Total | Revenue (if RWF 10k/user) |
|-------|---------------|-------|-------|--------------------------|
| 100   | $0-10        | $5    | $15   | RWF 1M (~$1,300)        |
| 1,000 | $45          | $30   | $75   | RWF 10M (~$13,000)      |
| 10,000| $200         | $300  | $500  | RWF 100M (~$130,000)    |

**Profit Margin**: ~95-97% (after platform costs + payment fees)

---

## ✅ **FINAL ANSWER: START WITH ~$12-25**

### **Absolute Minimum (First Month):**
- Domain: $12 (one-time)
- Everything else: FREE

### **Recommended Starter:**
- Domain: $12/year
- Bunny CDN Video: $10/month
- Everything else: FREE tiers
**Total: ~$22 first month, then $10/month**

### **When to Invest More:**
- After 100+ paying students
- When free tiers are exceeded
- When you want premium features
- Reinvest profit into infrastructure

---

## 🎯 **ACTION PLAN:**

1. **Week 1**: Keep Vercel Free ✅
2. **Week 2**: Set up Supabase Free ✅
3. **Week 3**: Buy domain ($12)
4. **Week 4**: Set up Bunny CDN ($10/month)
5. **Week 5**: Integrate Stripe (free, % only)
6. **Week 6**: Launch with $22 investment!

**You can literally start a Coursera competitor for $12!** 🚀

---

Need help setting up any of these services? I can guide you through:
1. Supabase setup (FREE)
2. Video hosting decision (Bunny vs Mux vs YouTube)
3. Stripe integration (FREE until you earn)
4. Domain purchase and setup

What would you like to tackle first? 💪
