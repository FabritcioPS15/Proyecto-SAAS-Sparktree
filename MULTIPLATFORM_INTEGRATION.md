# Multi-Platform Integration Guide

This document explains how to use the multi-platform messaging system that now supports Telegram, Instagram, and TikTok in addition to WhatsApp.

## Overview

The system has been extended to support multiple messaging platforms independently. Each platform has its own service, configuration, and webhook handling, but they all integrate with the existing flow/chatbot engine.

## Supported Platforms

### 1. WhatsApp (Existing)
- Uses Baileys library
- QR code authentication
- Full support for text, media, and interactive messages

### 2. Telegram (New)
- Uses Telegram Bot API
- Bot token authentication
- Webhook-based message receiving
- Supports text, media, and inline keyboard buttons

### 3. Instagram (New)
- Uses Instagram Graph API (Facebook)
- Access token authentication
- Webhook-based message receiving
- Supports text, media, and quick replies

### 4. TikTok (New - Limited)
- Uses TikTok Business API
- Access token authentication
- **Note**: TikTok's messaging API is limited and requires special business verification. The implementation is a placeholder for future API availability.

## Database Migration

Before using the multi-platform features, you need to run the database migration:

```bash
# Navigate to the database directory
cd database

# Run the migration script
psql -U your_user -d your_database -f schema_multiplatform.sql
```

The migration will:
- Create a generic `platform_connections` table
- Add platform-specific columns to existing tables
- Migrate existing WhatsApp connections to the new structure
- Create platform-specific config tables (telegram_bot_configs, instagram_configs, tiktok_configs)

## Installation

Install the new dependencies:

```bash
cd backend
npm install
```

New dependencies added:
- `node-telegram-bot-api`: For Telegram Bot API integration
- `@types/node-telegram-bot-api`: TypeScript types

## API Endpoints

### Platform Connections

#### GET /api/platform/connections
Get all platform connections for the current organization.

**Headers:**
- `X-Organization-ID`: Your organization ID
- `Authorization`: Bearer token

**Response:**
```json
[
  {
    "id": "uuid",
    "platformType": "telegram",
    "status": "connected",
    "displayName": "My Telegram Bot",
    "platformAccountId": "@mybot",
    "lastConnectedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/platform/connections
Create a new platform connection.

**Headers:**
- `X-Organization-ID`: Your organization ID
- `X-User-ID`: Your user ID
- `Authorization`: Bearer token

**Body:**
```json
{
  "platformType": "telegram",
  "displayName": "My Telegram Bot",
  "config": {
    "bot_token": "your_bot_token",
    "bot_username": "@mybot",
    "webhook_verify_token": "verify_token"
  }
}
```

**Platform-specific config requirements:**

**Telegram:**
```json
{
  "bot_token": "required",
  "bot_username": "required",
  "webhook_verify_token": "optional"
}
```

**Instagram:**
```json
{
  "instagram_business_account_id": "required",
  "facebook_page_id": "required",
  "access_token": "required",
  "webhook_verify_token": "required"
}
```

**TikTok:**
```json
{
  "advertiser_id": "optional",
  "access_token": "required",
  "refresh_token": "optional",
  "webhook_secret": "optional"
}
```

#### POST /api/platform/connections/:id/start
Start a platform connection (sets up webhooks, verifies tokens).

#### POST /api/platform/connections/:id/delete
Delete a platform connection.

### Webhooks

Webhook endpoints are public (no authentication required) for platform callbacks:

- `GET /api/webhooks/telegram` - Telegram webhook verification
- `POST /api/webhooks/telegram` - Telegram webhook handler
- `GET /api/webhooks/instagram` - Instagram webhook verification
- `POST /api/webhooks/instagram` - Instagram webhook handler
- `GET /api/webhooks/tiktok` - TikTok webhook verification
- `POST /api/webhooks/tiktok` - TikTok webhook handler

## Platform Setup Guides

### Telegram Setup

1. **Create a Telegram Bot:**
   - Open Telegram and search for @BotFather
   - Send `/newbot` and follow the instructions
   - Save the bot token and username

2. **Create Connection:**
   ```bash
   curl -X POST http://localhost:3000/api/platform/connections \
     -H "Content-Type: application/json" \
     -H "X-Organization-ID: your_org_id" \
     -H "X-User-ID: your_user_id" \
     -H "Authorization: Bearer your_token" \
     -d '{
       "platformType": "telegram",
       "displayName": "My Telegram Bot",
       "config": {
         "bot_token": "your_bot_token",
         "bot_username": "@your_bot_username"
       }
     }'
   ```

3. **Start Connection:**
   ```bash
   curl -X POST http://localhost:3000/api/platform/connections/{connection_id}/start \
     -H "X-Organization-ID: your_org_id" \
     -H "Authorization: Bearer your_token"
   ```

### Instagram Setup

1. **Create Facebook App:**
   - Go to https://developers.facebook.com/apps
   - Create a new app
   - Add "Messenger" product
   - Configure webhook settings

2. **Get Instagram Business Account:**
   - Link your Instagram account to a Facebook Page
   - Get the Instagram Business Account ID and Facebook Page ID
   - Generate an access token with appropriate permissions

3. **Create Connection:**
   ```bash
   curl -X POST http://localhost:3000/api/platform/connections \
     -H "Content-Type: application/json" \
     -H "X-Organization-ID: your_org_id" \
     -H "X-User-ID: your_user_id" \
     -H "Authorization: Bearer your_token" \
     -d '{
       "platformType": "instagram",
       "displayName": "My Instagram Business",
       "config": {
         "instagram_business_account_id": "your_ig_id",
         "facebook_page_id": "your_page_id",
         "access_token": "your_access_token",
         "webhook_verify_token": "your_verify_token"
       }
     }'
   ```

4. **Configure Facebook Webhook:**
   - Set your webhook URL to: `https://your-domain.com/api/webhooks/instagram`
   - Use the same verify token you provided in the config
   - Subscribe to `messages` and `messaging_postbacks` fields

### TikTok Setup

**Note**: TikTok's messaging API is currently limited and requires special business verification. The implementation is a placeholder for future availability.

1. **Create TikTok Developer Account:**
   - Go to https://developers.tiktok.com
   - Create a developer account
   - Apply for messaging API access (if available)

2. **Create Connection:**
   ```bash
   curl -X POST http://localhost:3000/api/platform/connections \
     -H "Content-Type: application/json" \
     -H "X-Organization-ID: your_org_id" \
     -H "X-User-ID: your_user_id" \
     -H "Authorization: Bearer your_token" \
     -d '{
       "platformType": "tiktok",
       "displayName": "My TikTok Business",
       "config": {
         "advertiser_id": "your_advertiser_id",
         "access_token": "your_access_token"
       }
     }'
   ```

## Flow Engine Integration

The existing flow/chatbot engine now works across all platforms. When creating flows:

1. **Platform Assignment:**
   - Flows can be assigned to specific platform connections
   - The flow engine automatically detects the platform and uses the appropriate service adapter

2. **Message Types:**
   - All platforms support text messages
   - Button/quick reply support varies by platform:
     - WhatsApp: Numeric buttons
     - Telegram: Inline keyboards
     - Instagram: Quick replies
     - TikTok: Limited (placeholder)

3. **Platform-Specific Handling:**
   - The flow engine automatically adapts button formats for each platform
   - Media handling is platform-aware

## Architecture

### Service Structure

```
backend/src/services/platform/
├── basePlatformService.ts       # Base interface for all platforms
├── telegramService.ts           # Telegram Bot API implementation
├── instagramService.ts          # Instagram Graph API implementation
├── tiktokService.ts             # TikTok API implementation (limited)
└── multiPlatformService.ts      # Unified platform manager
```

### Route Structure

```
backend/src/routes/
├── platform.ts                  # Platform connection management
└── webhooks.ts                  # Platform webhook endpoints
```

### Database Tables

- `platform_connections` - Generic platform connections
- `telegram_bot_configs` - Telegram-specific configuration
- `instagram_configs` - Instagram-specific configuration
- `tiktok_configs` - TikTok-specific configuration

## Environment Variables

Add these to your `.env` file:

```env
# Backend URL for webhooks
BACKEND_URL=https://your-domain.com

# Optional: Platform-specific settings
TELEGRAM_WEBHOOK_PATH=/api/webhooks/telegram
INSTAGRAM_WEBHOOK_PATH=/api/webhooks/instagram
TIKTOK_WEBHOOK_PATH=/api/webhooks/tiktok
```

## Troubleshooting

### Telegram Webhook Not Working
- Verify bot token is correct
- Check that the webhook URL is publicly accessible
- Ensure the bot token has proper permissions

### Instagram Webhook Verification Failed
- Verify the verify token matches in both Facebook app and your config
- Check that the webhook URL is publicly accessible
- Ensure the access token has proper permissions

### Connection Status Shows "Error"
- Check the platform-specific credentials
- Verify the API tokens are valid and not expired
- Check the server logs for specific error messages

## Limitations

### TikTok
- Messaging API is limited and requires special business verification
- Full implementation is pending API availability
- Current implementation is a placeholder

### Instagram
- Requires Facebook Developer account
- Access tokens expire and need refresh
- Some features may require additional permissions

### Telegram
- Bot tokens are permanent but can be revoked
- File size limits for media messages
- Rate limiting applies

## Future Enhancements

- [ ] Add support for more platforms (e.g., Facebook Messenger, Twitter DM)
- [ ] Implement TikTok full messaging API when available
- [ ] Add platform-specific analytics
- [ ] Implement token refresh for Instagram
- [ ] Add platform-specific flow templates
- [ ] Support for platform-native features (e.g., Telegram inline queries)

## Support

For issues or questions:
1. Check the server logs in `backend/debug_requests.log`
2. Verify database migration was successful
3. Ensure all dependencies are installed
4. Check platform-specific API documentation
