# Grant Tracker - Content Management System

This document explains how to manage grant data in the Grant Tracker application.

## 🚀 Quick Start

### 1. Add Real Grant Data
```bash
# Add comprehensive real grant data to replace sample data
npm run grants:add-real
```

### 2. Check Data Health
```bash
# Generate comprehensive health report
npm run data:health
```

### 3. View Grant Statistics
```bash
# Show grant statistics
npm run grants:stats
```

## 📊 Content Management Commands

### Grant Management
```bash
# View grant statistics
npm run grants:stats

# List featured grants
npm run grants:featured

# List grants expiring soon
npm run grants:expiring

# Search grants by keyword
npm run grants:search "small business"
```

### Data Health Monitoring
```bash
# Comprehensive health report
npm run data:health

# Check for expired grants
npm run data:expired

# Check for grants expiring soon (default: 7 days)
npm run data:expiring

# Check for grants expiring in 30 days
npm run data:expiring 30

# Check for duplicate grants
npm run data:duplicates

# Check for incomplete grants
npm run data:incomplete

# Auto-update grants from external sources
npm run data:update
```

## 🔧 Content Management System

### Adding New Grants

The system includes a `GrantContentManager` class for programmatic grant management:

```typescript
import { GrantContentManager } from './scripts/content-management'

// Add a new grant
await GrantContentManager.addGrant({
  title: "New Small Business Grant",
  description: "Description of the grant program...",
  amount: "Up to $50,000",
  deadline: new Date("2024-12-31"),
  url: "https://example.com/apply",
  featured: true,
  stateCode: "CA",
  category: "State"
})

// Update an existing grant
await GrantContentManager.updateGrant("grant-slug", {
  title: "Updated Grant Title",
  featured: true
})

// Deactivate a grant
await GrantContentManager.deactivateGrant("grant-slug")
```

### Data Monitoring

The system includes comprehensive data monitoring:

```typescript
import { DataMonitor } from './scripts/data-monitor'

// Generate health report
const report = await DataMonitor.generateHealthReport()

// Check for expired grants
const expired = await DataMonitor.checkExpiredGrants()

// Check for grants expiring soon
const expiring = await DataMonitor.checkExpiringGrants(7)
```

## 📈 Real Grant Data Included

The system comes with comprehensive real grant data including:

### Federal Grants
- **SBIR Program** - Up to $1M for R&D
- **STTR Program** - Technology transfer funding
- **EDA Grants** - Economic development support
- **USDA Rural Business** - Rural development grants
- **DOE SBIR** - Clean energy innovation

### State-Specific Grants
- **California** - COVID-19 relief grants
- **New York** - Small business support
- **Texas** - Emergency assistance
- **Florida** - Bridge loan program
- **Illinois** - Emergency loans
- **Pennsylvania** - Business development

### Local/Regional Grants
- **Chicago** - Property improvement fund
- **Los Angeles** - Emergency microloans
- **Miami-Dade** - Business development

## 🔄 Automated Data Updates

### Future API Integrations
The system is designed to integrate with:
- Government grant databases
- SBA APIs
- State economic development APIs
- Grant notification services

### Monitoring Features
- **Expired Grant Detection** - Automatically identify expired grants
- **Duplicate Prevention** - Check for duplicate grant entries
- **Data Completeness** - Ensure all required fields are filled
- **Health Scoring** - Overall data quality assessment

## 📊 Data Health Metrics

The system tracks:
- Total grants in database
- Active vs inactive grants
- Featured grants count
- Expiring grants (7, 30, 90 days)
- Duplicate grants
- Incomplete grant records
- Overall health score (0-100)

## 🛠️ Customization

### Adding New Grant Sources
1. Create new data fetchers in `scripts/`
2. Integrate with external APIs
3. Add to the auto-update system
4. Set up monitoring alerts

### Custom Grant Categories
- Federal
- State
- Local
- Industry-specific
- Emergency relief
- Innovation/R&D

## 📝 Best Practices

### Grant Data Quality
1. **Regular Health Checks** - Run `npm run data:health` weekly
2. **Update Expired Grants** - Check and update expired grants monthly
3. **Monitor Duplicates** - Prevent duplicate grant entries
4. **Complete Information** - Ensure all grants have complete data

### Content Updates
1. **Featured Grants** - Rotate featured grants monthly
2. **Deadline Monitoring** - Check expiring grants weekly
3. **New Grant Discovery** - Add new grants as they become available
4. **Data Validation** - Verify grant information accuracy

## 🚨 Troubleshooting

### Common Issues
- **Database Connection** - Ensure environment variables are set
- **Missing States** - Verify all states are seeded
- **Duplicate Grants** - Use the duplicate checker
- **Incomplete Data** - Run the incomplete grants checker

### Health Score Interpretation
- **90-100**: Excellent data health
- **70-89**: Good data health, minor issues
- **50-69**: Fair data health, needs attention
- **0-49**: Poor data health, requires immediate action

## 🔮 Future Enhancements

### Planned Features
- **API Integration** - Real-time grant data updates
- **Email Notifications** - Alert for expiring grants
- **User Submissions** - Allow users to submit new grants
- **Advanced Search** - Enhanced search capabilities
- **Analytics Dashboard** - Grant performance metrics
- **Automated Updates** - Scheduled data refreshes

### External Integrations
- SBA Grant Database
- Grants.gov API
- State economic development APIs
- Grant notification services
- Social media monitoring
- News feed integration

---

For more information, see the main README.md file or contact the development team.
