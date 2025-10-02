# Disaster Recovery Runbook

## Emergency Database Restore Procedure

### Prerequisites
- Supabase project with PITR (Point-in-Time Recovery) enabled
- Access to Supabase dashboard
- Deployment platform access (Vercel/Netlify)
- Database connection strings

### Step 1: Freeze Deployments
```bash
# Vercel
vercel --prod --confirm

# Or pause automatic deployments in dashboard
```

### Step 2: Restore Database
1. Go to Supabase Dashboard → Database → Backups
2. Select "Point-in-Time Recovery"
3. Choose restore timestamp (before the incident)
4. Confirm restore operation
5. Wait for restore completion (usually 5-15 minutes)

### Step 3: Update Connection Strings
Update your production environment variables:
```bash
# Update DATABASE_URL to point to restored database
DATABASE_URL="postgresql://postgres:password@restored-host:5432/postgres?sslmode=require"
```

### Step 4: Run Health Suite
```bash
# Test database connection
curl -X GET https://yourdomain.com/api/health

# Run data integrity checks
curl -X GET https://yourdomain.com/api/cron/recalc-metrics

# Verify application functionality
curl -X GET https://yourdomain.com/
```

### Step 5: Resume Traffic
1. Verify all health checks pass
2. Monitor application logs
3. Resume normal operations
4. Update team on resolution

## Prevention Checklist

### Daily
- [ ] Automated backups enabled
- [ ] Health checks running
- [ ] Monitoring alerts configured

### Weekly
- [ ] Test restore procedure
- [ ] Review backup retention
- [ ] Update runbook if needed

### Monthly
- [ ] Disaster recovery drill
- [ ] Backup verification
- [ ] Documentation review

## Emergency Contacts
- **Database Issues**: Supabase Support
- **Deployment Issues**: Vercel/Netlify Support
- **Application Issues**: Development Team

## Recovery Time Objectives
- **RTO (Recovery Time Objective)**: 30 minutes
- **RPO (Recovery Point Objective)**: 1 hour
- **MTTR (Mean Time To Recovery)**: 15 minutes

## Backup Strategy
- **Frequency**: Daily automated backups
- **Retention**: 30 days
- **PITR**: Enabled for 7 days
- **Cross-region**: Enabled for critical data

## Monitoring
- Health checks every 15 minutes
- Slack alerts for failures
- Sentry error tracking
- Uptime monitoring

---
*Last updated: [Current Date]*
*Next review: [Next Month]*
