# Deployment Guide

## Production Deployment Checklist

### Pre-deployment Requirements

- [ ] TMDb API key obtained from [The Movie Database](https://www.themoviedb.org/settings/api)
- [ ] Vercel account created and CLI installed
- [ ] Environment variables configured
- [ ] All tests passing
- [ ] Code linted and formatted
- [ ] Performance optimizations verified

### Environment Variables Setup

#### Required Variables
```bash
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
```

#### Optional Variables
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_VERCEL_ANALYTICS=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### Deployment Steps

#### 1. Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Preview**
   ```bash
   npm run deploy:preview
   ```

4. **Deploy to Production**
   ```bash
   npm run deploy:vercel
   ```

#### 2. Manual Deployment Steps

1. **Pre-deployment Check**
   ```bash
   npm run pre-deploy
   ```

2. **Build for Production**
   ```bash
   npm run build:production
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

### Environment Configuration

#### Vercel Environment Variables

Set the following environment variables in your Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add the required variables:
   - `TMDB_API_KEY` (Production)
   - `TMDB_BASE_URL` (Production)
   - `NEXT_PUBLIC_APP_URL` (Production)

#### Local Production Testing

1. Copy environment template:
   ```bash
   cp .env.production.example .env.production.local
   ```

2. Fill in your production values
3. Test locally:
   ```bash
   npm run build:production
   npm start
   ```

### Security Considerations

#### API Key Security
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Monitor API usage for unusual activity

#### Headers and Security
The application includes the following security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS only)
- `Referrer-Policy: strict-origin-when-cross-origin`

### Performance Optimizations

#### Image Optimization
- WebP and AVIF format support
- Automatic image resizing
- 24-hour cache TTL for TMDb images

#### API Caching
- 5-minute cache for API responses
- 10-minute stale-while-revalidate

#### Bundle Optimization
- Tree shaking enabled
- Package imports optimized
- Bundle analysis available with `npm run build:analyze`

### Monitoring and Analytics

#### Performance Monitoring
- Vercel Analytics (optional)
- Core Web Vitals tracking
- API response time monitoring

#### Error Tracking
- Console error logging
- API error handling
- User-friendly error messages

### Troubleshooting

#### Common Issues

1. **TMDb API Key Issues**
   - Verify API key is valid
   - Check API key permissions
   - Ensure environment variable is set correctly

2. **Build Failures**
   - Run `npm run type-check` to check TypeScript errors
   - Run `npm run lint` to check code quality
   - Verify all dependencies are installed

3. **Performance Issues**
   - Use `npm run build:analyze` to check bundle size
   - Verify image optimization is working
   - Check API response times

#### Support Resources
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [TMDb API Documentation](https://developers.themoviedb.org/3)

### Post-deployment Verification

After deployment, verify the following:

- [ ] Application loads correctly
- [ ] Movie search functionality works
- [ ] Images load and display properly
- [ ] Error handling works as expected
- [ ] Performance metrics are acceptable
- [ ] Security headers are present
- [ ] Analytics tracking is working (if configured)

### Rollback Procedure

If issues occur after deployment:

1. **Vercel Rollback**
   ```bash
   vercel rollback [deployment-url]
   ```

2. **Manual Rollback**
   - Revert to previous commit
   - Redeploy previous version
   - Verify functionality

### Maintenance

#### Regular Tasks
- Monitor API usage and costs
- Update dependencies monthly
- Review and rotate API keys quarterly
- Monitor performance metrics
- Update security headers as needed

#### Updates
- Test all updates in preview environment first
- Use semantic versioning for releases
- Document all changes in changelog
- Notify users of major updates