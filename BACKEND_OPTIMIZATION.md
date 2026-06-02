# Backend Optimization and Reorganization Guide

This document describes the reorganization and optimization improvements made to the Sparktree SaaS backend.

## Overview

The backend has been reorganized and optimized for better performance, maintainability, and faster processing. New utility files and services have been added to improve the application's efficiency.

## New File Structure

```
backend/src/
├── types/                    # Shared TypeScript types
│   └── index.ts
├── helpers/                  # Common helper functions
│   └── index.ts
├── validators/               # Data validation functions
│   └── index.ts
├── utils/                    # Utility functions
│   └── logger.ts
├── middleware/               # Express middleware
│   ├── auth.ts
│   ├── tenant.ts
│   ├── rateLimiter.ts        # NEW: Rate limiting
│   └── errorHandler.ts      # NEW: Centralized error handling
├── services/                 # Business logic services
│   ├── cacheService.ts       # NEW: Cache service
│   ├── queueService.ts       # NEW: Queue service for async tasks
│   ├── assignmentService.ts
│   ├── internalNotesService.ts
│   ├── platform/
│   └── ...
├── config/                   # Configuration files
│   ├── supabase.ts
│   └── database.ts           # NEW: Database optimization
└── routes/                   # API routes
    ├── assignment.ts
    ├── internalNotes.ts
    ├── inbox.ts
    └── ...
```

## New Features

### 1. Cache Service (`src/services/cacheService.ts`)

In-memory cache service for performance optimization.

**Features:**
- TTL (Time To Live) support
- Automatic cleanup of expired items
- Maximum size limit with LRU eviction
- Pattern-based key matching
- Get or set pattern

**Usage:**
```typescript
import { cacheService } from './services/cacheService';

// Set value with TTL (default 5 minutes)
cacheService.set('user:123', userData, 300);

// Get value
const user = cacheService.get('user:123');

// Get or set pattern
const user = cacheService.getOrSet('user:123', () => fetchUser(123), 300);

// Check if key exists
if (cacheService.has('user:123')) {
  // ...
}

// Delete key
cacheService.delete('user:123');

// Get multiple values
const users = cacheService.getMany(['user:123', 'user:456']);

// Clear all cache
cacheService.clear();
```

### 2. Rate Limiter Middleware (`src/middleware/rateLimiter.ts`)

Rate limiting to prevent API abuse.

**Features:**
- Configurable time windows
- Request limits per window
- Custom key generators
- Pre-configured limiters for different use cases

**Usage:**
```typescript
import { apiRateLimiter, authRateLimiter, strictRateLimiter } from './middleware/rateLimiter';

// Apply to routes
app.use('/api', apiRateLimiter.middleware());
app.use('/api/auth', authRateLimiter.middleware());
app.use('/api/sensitive', strictRateLimiter.middleware());

// Custom rate limiter
import { createRateLimiter } from './middleware/rateLimiter';
const customLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 50
});
app.use('/api/custom', customLimiter.middleware());
```

### 3. Error Handler (`src/middleware/errorHandler.ts`)

Centralized error handling with custom error classes.

**Features:**
- Custom error classes (ValidationError, NotFoundError, etc.)
- Consistent error responses
- Error logging
- Async handler wrapper

**Usage:**
```typescript
import { 
  AppError, 
  ValidationError, 
  NotFoundError,
  errorHandler,
  asyncHandler 
} from './middleware/errorHandler';

// Use in routes
router.get('/resource/:id', asyncHandler(async (req, res) => {
  const resource = await getResource(req.params.id);
  if (!resource) {
    throw new NotFoundError('Resource not found');
  }
  res.json(resource);
}));

// Apply error handler
app.use(errorHandler);
```

### 4. Validators (`src/validators/index.ts`)

Data validation functions and schema builder.

**Features:**
- Common validation functions
- Validation schema builder
- Pre-built schemas for common use cases

**Usage:**
```typescript
import { 
  validateEmail, 
  validateRequired,
  ValidationSchema 
} from './validators';

// Individual validations
validateEmail('user@example.com');
validateRequired(value, 'Field name');

// Schema builder
const schema = new ValidationSchema()
  .required('email')
  .email('email')
  .required('name')
  .minLength('name', 2)
  .maxLength('name', 100);

const result = schema.validate(data);
if (!result.valid) {
  console.error(result.errors);
}

// Pre-built schemas
import { userSchema, conversationSchema } from './validators';
const result = userSchema.validate(userData);
```

### 5. Helpers (`src/helpers/index.ts`)

Common helper functions for everyday tasks.

**Features:**
- String manipulation
- Date formatting
- Array operations
- Object manipulation
- Validation helpers
- And many more...

**Usage:**
```typescript
import {
  sleep,
  retry,
  debounce,
  throttle,
  formatPhoneNumber,
  validateEmail,
  generateRandomString,
  formatDate,
  getTimeAgo,
  chunk,
  groupBy,
  unique,
  sortBy,
  pick,
  omit,
  deepClone,
  merge,
  isEmpty,
  isObject,
  isArray
} from './helpers';

// Sleep
await sleep(1000);

// Retry with exponential backoff
const result = await retry(() => fetchData(), {
  retries: 3,
  delay: 1000
});

// Debounce
const debouncedSearch = debounce(searchFunction, 300);

// Format phone number
const formatted = formatPhoneNumber('+5491112345678');

// Generate random string
const token = generateRandomString(32);

// Format date
const formatted = formatDate(new Date());

// Get time ago
const timeAgo = getTimeAgo(date);

// Chunk array
const chunks = chunk([1,2,3,4,5,6], 2); // [[1,2], [3,4], [5,6]]

// Group by
const grouped = groupBy(items, 'category');

// Unique
const unique = unique([1,2,2,3,3,4]); // [1,2,3,4]

// Sort
const sorted = sortBy(items, 'name', 'asc');

// Pick properties
const picked = pick(obj, ['name', 'email']);

// Omit properties
const omitted = omit(obj, ['password', 'token']);

// Deep clone
const cloned = deepClone(obj);

// Merge objects
const merged = merge(obj1, obj2, obj3);
```

### 6. Logger (`src/utils/logger.ts`)

Improved logging utility with multiple log levels and context.

**Features:**
- Multiple log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- Context-specific loggers
- Request logging middleware
- File logging in production
- Structured logging

**Usage:**
```typescript
import { logger, apiLogger, dbLogger, authLogger, createLogger } from './utils/logger';

// Default logger
logger.info('Application started');
logger.error('Something went wrong', { error });
logger.debug('Debug information', { data });

// Context-specific loggers
apiLogger.info('API request received');
dbLogger.error('Database query failed');
authLogger.warn('Invalid login attempt');

// Create custom logger
const customLogger = createLogger('CUSTOM');
customLogger.info('Custom log message');

// Request logging middleware
app.use(Logger.requestLogger);
```

### 7. Database Optimization (`src/config/database.ts`)

Optimized database connection with pooling and caching.

**Features:**
- Connection pooling
- Health checks
- Query statistics
- Transaction helper
- Batch query execution
- Cached queries
- Backup helper
- Migration helper

**Usage:**
```typescript
import { 
  pool, 
  query, 
  transaction, 
  batchQuery,
  cachedQuery,
  checkDatabaseHealth,
  getPoolStats,
  initializePool,
  closePool
} from './config/database';

// Initialize pool
await initializePool();

// Execute query
const result = await query('SELECT * FROM users WHERE id = $1', [userId]);

// Transaction
const result = await transaction(async (client) => {
  await client.query('UPDATE accounts SET balance = balance - $1', [amount]);
  await client.query('UPDATE accounts SET balance = balance + $1', [amount]);
  return { success: true };
});

// Batch queries
const results = await batchQuery([
  { text: 'SELECT * FROM users WHERE id = $1', params: [1] },
  { text: 'SELECT * FROM users WHERE id = $1', params: [2] }
]);

// Cached query
const users = await cachedQuery('users', {
  filter: { organization_id: orgId },
  orderBy: { column: 'created_at', ascending: false },
  limit: 100,
  cacheKey: `users:${orgId}`,
  cacheTTL: 300
});

// Health check
const isHealthy = await checkDatabaseHealth();

// Get pool stats
const stats = getPoolStats();
console.log(stats); // { totalCount, idleCount, waitingCount }

// Close pool
await closePool();
```

### 8. Queue Service (`src/services/queueService.ts`)

Queue system for async task processing.

**Features:**
- Multiple queues
- Priority-based execution
- Retry with exponential backoff
- Scheduled tasks
- Queue statistics
- Pre-defined queue names

**Usage:**
```typescript
import { 
  queueService, 
  QUEUE_NAMES,
  queueEmail,
  queueNotification,
  queueWebhook
} from './services/queueService';

// Add task to queue
const taskId = queueService.addTask(
  QUEUE_NAMES.EMAIL,
  'send-welcome-email',
  () => sendEmail(user.email, 'Welcome', 'Body'),
  {
    priority: 10,
    maxAttempts: 3,
    delay: 1000
  }
);

// Pre-defined queue helpers
queueEmail(to, subject, body);
queueNotification(userId, message, type);
queueWebhook(url, payload);

// Get queue stats
const stats = queueService.getQueueStats(QUEUE_NAMES.EMAIL);
console.log(stats); // { pending: 5, processing: true }

// Get all stats
const allStats = queueService.getAllStats();

// Clear queue
queueService.clearQueue(QUEUE_NAMES.EMAIL);

// Stop queue service
queueService.stop();
```

### 9. Shared Types (`src/types/index.ts`)

Shared TypeScript types for consistency across the application.

**Features:**
- Organization, User, Contact types
- Conversation, Message types
- Flow, PlatformConnection types
- InternalNote, AgentWorkload types
- API response types
- Filter options types

**Usage:**
```typescript
import { 
  Organization, 
  User, 
  Contact, 
  Conversation,
  Message,
  ApiResponse,
  PaginatedResponse,
  FilterOptions
} from './types';

// Use in functions
function getUser(userId: string): Promise<User> {
  // ...
}

// Use in API responses
const response: ApiResponse<User> = {
  success: true,
  data: user,
  timestamp: new Date().toISOString()
};
```

## Performance Improvements

### 1. Caching
- In-memory cache for frequently accessed data
- Configurable TTL
- Automatic cleanup
- Reduces database load

### 2. Rate Limiting
- Prevents API abuse
- Configurable limits per endpoint
- Protects against DDoS attacks

### 3. Database Pooling
- Connection reuse
- Configurable pool size
- Automatic connection management
- Better resource utilization

### 4. Queue System
- Async task processing
- Non-blocking operations
- Retry mechanism
- Better throughput

### 5. Optimized Queries
- Batch operations
- Cached queries
- Transaction support
- Query statistics

## Environment Variables

Add these to your `.env` file:

```env
# Database Pool Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sparktree
DB_USER=postgres
DB_PASSWORD=your_password
DB_POOL_MAX=20
DB_POOL_MIN=5
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=10000
DB_STATEMENT_TIMEOUT=30000

# Queue Service
ENABLE_QUEUE_SERVICE=true

# Cache Configuration
CACHE_MAX_SIZE=1000
CACHE_DEFAULT_TTL=300

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Migration Guide

### 1. Update imports for new utilities

**Before:**
```typescript
// Old way - no caching
const user = await supabase.from('users').select('*').eq('id', userId).single();
```

**After:**
```typescript
// New way - with caching
import { cachedQuery } from './config/database';
const user = await cachedQuery('users', {
  filter: { id: userId },
  cacheKey: `user:${userId}`,
  cacheTTL: 300
});
```

### 2. Add rate limiting to sensitive routes

```typescript
import { authRateLimiter } from './middleware/rateLimiter';

router.post('/api/auth/login', authRateLimiter.middleware(), loginHandler);
```

### 3. Use error handler

```typescript
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandler';

app.use(errorHandler);
app.use(notFoundHandler);

router.get('/resource/:id', asyncHandler(async (req, res) => {
  // Your route logic
}));
```

### 4. Add logging

```typescript
import { logger } from './utils/logger';

logger.info('Processing request', { userId });
logger.error('Error occurred', { error });
```

### 5. Use validators

```typescript
import { userSchema } from './validators';

const result = userSchema.validate(userData);
if (!result.valid) {
  return res.status(400).json({ errors: result.errors });
}
```

### 6. Use helpers

```typescript
import { formatPhoneNumber, getTimeAgo } from './helpers';

const formattedPhone = formatPhoneNumber(phone);
const timeAgo = getTimeAgo(date);
```

## Best Practices

### 1. Caching
- Cache frequently accessed data
- Use appropriate TTL values
- Invalidate cache on updates
- Use cache keys that include relevant parameters

### 2. Rate Limiting
- Apply stricter limits to sensitive operations
- Use different limits for different user types
- Monitor rate limit violations
- Provide clear error messages

### 3. Error Handling
- Use specific error classes
- Include context in errors
- Log errors with sufficient detail
- Return user-friendly error messages

### 4. Database
- Use transactions for multi-step operations
- Batch queries when possible
- Use connection pooling
- Monitor slow queries

### 5. Queue System
- Use queues for non-critical operations
- Set appropriate retry limits
- Monitor queue statistics
- Use priority for important tasks

### 6. Logging
- Use appropriate log levels
- Include context in logs
- Use structured logging
- Monitor logs for issues

## Monitoring

### Health Checks
```typescript
import { checkDatabaseHealth, getPoolStats } from './config/database';
import { queueService } from './services/queueService';

// Database health
const dbHealthy = await checkDatabaseHealth();
const poolStats = getPoolStats();

// Queue stats
const queueStats = queueService.getAllStats();
```

### Performance Metrics
- Monitor cache hit rate
- Track rate limit violations
- Monitor queue processing time
- Track database query performance
- Monitor error rates

## Troubleshooting

### Cache Issues
- Check cache key format
- Verify TTL settings
- Monitor cache size
- Check for memory leaks

### Rate Limiting Issues
- Verify rate limit configuration
- Check key generation
- Monitor request patterns
- Adjust limits as needed

### Database Issues
- Check pool configuration
- Monitor connection count
- Review slow queries
- Check for connection leaks

### Queue Issues
- Monitor queue size
- Check task handlers
- Verify retry logic
- Monitor processing time

## Future Enhancements

- [ ] Redis integration for distributed cache
- [ ] Advanced queue features (dead letter queue, scheduled tasks)
- [ ] Performance monitoring dashboard
- [ ] Automatic cache invalidation
- [ ] Database query optimization suggestions
- [ ] Advanced logging with structured output
- [ ] Metrics collection and alerting
