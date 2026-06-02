# Multi-Agent and Omnichannel Features Documentation

This document describes the multi-agent and omnichannel features implemented in the Sparktree SaaS system.

## Overview

The system now supports:
- **Omnichannel messaging**: WhatsApp, Instagram, Facebook Messenger, Mercado Libre, Telegram, TikTok
- **Multi-agent support**: Multiple agents can work simultaneously
- **Chat assignment**: Manual, Round Robin, and Load Balance
- **Conversation transfer**: Between agents and departments
- **Internal notes**: Private notes for team collaboration
- **Unified inbox**: Centralized view of all conversations

## Requirements Compliance

### RF-01: Integración de APIs de Mensajería ✅
- **WhatsApp Business Cloud**: Implemented via Baileys library
- **Instagram Direct**: Implemented via Instagram Graph API
- **Facebook Messenger**: Implemented via Facebook Messenger API
- **Mercado Libre**: Implemented via Mercado Libre API
- **Telegram**: Implemented via Telegram Bot API
- **TikTok**: Implemented (limited API availability)

### RF-02: Bandeja de Entrada Unificada (Inbox) ✅
- Centralized API endpoint: `GET /api/inbox`
- Filters by platform, status, assignment, priority, department
- Statistics endpoint: `GET /api/inbox/stats`
- Platform breakdown and priority breakdown

### RF-03: Concurrencia Multiagente ✅
- Multi-tenant architecture with organizations
- Multiple users can log in simultaneously
- Agent workload tracking
- Online/availability status management
- Single WhatsApp/account origin shared among agents

### RF-04: Enrutamiento y Asignación de Chats ✅
- **Manual assignment**: `POST /api/assignment/assign`
- **Round Robin**: `POST /api/assignment/round-robin`
- **Load Balance**: `POST /api/assignment/load-balance`
- **Unassignment**: `POST /api/assignment/unassign`

### RF-05: Transferencia Interna de Conversaciones ✅
- **Transfer to agent**: `POST /api/assignment/transfer`
- **Transfer to department**: `POST /api/assignment/transfer-department`
- Transfer history logged in `conversation_transfers` table
- Full conversation history preserved during transfer

### RF-06: Notas Internas ✅
- **Create note**: `POST /api/internal-notes`
- **Get conversation notes**: `GET /api/internal-notes/:conversationId`
- **Update note**: `PUT /api/internal-notes/:noteId`
- **Delete note**: `DELETE /api/internal-notes/:noteId`
- Notes are private to internal team, not visible to customers

## Database Schema

### New Tables

#### `agent_workload`
Tracks agent workload and availability:
- `active_conversations`: Current number of active conversations
- `total_conversations_today`: Total conversations handled today
- `avg_response_time_seconds`: Average response time
- `is_online`: Agent online status
- `is_available`: Agent availability for new assignments

#### `internal_notes`
Private notes for team collaboration:
- `conversation_id`: Associated conversation
- `user_id`: Note author
- `note`: Note content
- `is_visible_to_all`: Whether note is visible to all team members

#### `departments`
Organization departments:
- `name`: Department name
- `description`: Department description
- `color`: UI color for department

#### `department_members`
Department membership:
- `department_id`: Department reference
- `user_id`: User reference
- `is_manager`: Whether user is department manager

#### `assignment_rules`
Assignment automation rules:
- `rule_type`: round_robin, load_balance, manual, priority, skill_based
- `conditions`: JSON conditions for rule application
- `priority`: Rule priority order

#### `conversation_transfers`
Transfer history:
- `from_user_id`: Original agent
- `to_user_id`: Target agent
- `to_department_id`: Target department
- `reason`: Transfer reason

#### `facebook_messenger_configs`
Facebook Messenger configuration:
- `page_id`: Facebook Page ID
- `page_access_token`: Page access token
- `app_id`: Facebook App ID
- `app_secret`: Facebook App Secret

#### `mercadolibre_configs`
Mercado Libre configuration:
- `seller_id`: Mercado Libre seller ID
- `access_token`: API access token
- `refresh_token`: Token refresh
- `app_id`: Mercado Libre App ID
- `app_secret`: Mercado Libre App Secret

### Updated Tables

#### `conversations`
Added multi-agent fields:
- `assigned_to`: Assigned user ID
- `assigned_at`: Assignment timestamp
- `assignment_type`: manual, round_robin, load_balance, auto
- `department`: Department assignment
- `priority`: low, normal, high, urgent
- `is_transferred`: Whether conversation was transferred
- `transferred_from`: Original agent before transfer
- `transferred_at`: Transfer timestamp
- `transfer_reason`: Reason for transfer

## API Endpoints

### Assignment Management

#### POST /api/assignment/assign
Manually assign a conversation to an agent.

**Body:**
```json
{
  "conversationId": "uuid",
  "userId": "uuid"
}
```

#### POST /api/assignment/round-robin
Assign conversation using Round Robin algorithm.

**Body:**
```json
{
  "conversationId": "uuid"
}
```

#### POST /api/assignment/load-balance
Assign conversation using Load Balance algorithm (agent with lowest workload).

**Body:**
```json
{
  "conversationId": "uuid"
}
```

#### POST /api/assignment/unassign
Unassign a conversation.

**Body:**
```json
{
  "conversationId": "uuid"
}
```

#### POST /api/assignment/transfer
Transfer conversation to another agent.

**Body:**
```json
{
  "conversationId": "uuid",
  "toUserId": "uuid",
  "reason": "Optional reason"
}
```

#### POST /api/assignment/transfer-department
Transfer conversation to a department.

**Body:**
```json
{
  "conversationId": "uuid",
  "departmentId": "uuid",
  "reason": "Optional reason"
}
```

#### GET /api/assignment/workload/:userId
Get agent workload statistics.

#### POST /api/assignment/availability
Set agent availability status.

**Body:**
```json
{
  "isAvailable": true
}
```

#### POST /api/assignment/online-status
Set agent online status.

**Body:**
```json
{
  "isOnline": true
}
```

#### GET /api/assignment/agents
Get all agents in organization with workload data.

### Internal Notes

#### POST /api/internal-notes
Create an internal note.

**Body:**
```json
{
  "conversationId": "uuid",
  "note": "Note content",
  "isVisibleToAll": false
}
```

#### GET /api/internal-notes/:conversationId
Get all notes for a conversation.

#### PUT /api/internal-notes/:noteId
Update a note.

**Body:**
```json
{
  "note": "Updated note content",
  "isVisibleToAll": true
}
```

#### DELETE /api/internal-notes/:noteId
Delete a note.

#### GET /api/internal-notes
Get all organization notes (admin view).

### Unified Inbox

#### GET /api/inbox
Get unified inbox with filters.

**Query Parameters:**
- `platform`: Filter by platform (whatsapp, instagram, facebook_messenger, mercadolibre, telegram, tiktok)
- `status`: Filter by status (open, closed, archived)
- `assignedTo`: Filter by assigned agent
- `priority`: Filter by priority (low, normal, high, urgent)
- `department`: Filter by department
- `limit`: Pagination limit (default: 50)
- `offset`: Pagination offset (default: 0)

#### GET /api/inbox/stats
Get inbox statistics.

**Response:**
```json
{
  "total": 100,
  "open": 45,
  "assigned": 30,
  "unassigned": 15,
  "byPlatform": {
    "whatsapp": 50,
    "instagram": 20,
    "facebook_messenger": 15,
    "mercadolibre": 10,
    "telegram": 5
  },
  "byPriority": {
    "low": 20,
    "normal": 50,
    "high": 20,
    "urgent": 10
  }
}
```

#### GET /api/inbox/:conversationId
Get conversation with messages and notes.

#### PATCH /api/inbox/:conversationId/priority
Update conversation priority.

**Body:**
```json
{
  "priority": "high"
}
```

#### PATCH /api/inbox/:conversationId/status
Update conversation status.

**Body:**
```json
{
  "status": "closed"
}
```

## Platform-Specific Setup

### Facebook Messenger

1. Create a Facebook App at https://developers.facebook.com/apps
2. Add "Messenger" product
3. Create a Page and get the Page ID
4. Generate a Page Access Token
5. Configure webhook

**API Connection:**
```bash
curl -X POST http://localhost:3000/api/platform/connections \
  -H "Content-Type: application/json" \
  -H "X-Organization-ID: your_org_id" \
  -H "X-User-ID: your_user_id" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "platformType": "facebook_messenger",
    "displayName": "My Facebook Page",
    "config": {
      "page_id": "your_page_id",
      "page_access_token": "your_page_access_token",
      "app_id": "your_app_id",
      "app_secret": "your_app_secret",
      "webhook_verify_token": "your_verify_token"
    }
  }'
```

### Mercado Libre

1. Create a Mercado Libre Developer account at https://developers.mercadolibre.com
2. Create an application
3. Get your App ID and App Secret
4. Generate access token

**API Connection:**
```bash
curl -X POST http://localhost:3000/api/platform/connections \
  -H "Content-Type: application/json" \
  -H "X-Organization-ID: your_org_id" \
  -H "X-User-ID: your_user_id" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "platformType": "mercadolibre",
    "displayName": "My Mercado Libre",
    "config": {
      "seller_id": "your_seller_id",
      "access_token": "your_access_token",
      "app_id": "your_app_id",
      "app_secret": "your_app_secret"
    }
  }'
```

## Database Migration

Before using the multi-agent features, run the migration:

```bash
cd database
psql -U your_user -d your_database -f schema_multiagent.sql
```

This migration:
- Adds assignment fields to conversations table
- Creates agent_workload table
- Creates internal_notes table
- Creates departments and department_members tables
- Creates assignment_rules table
- Creates conversation_transfers table
- Adds Facebook Messenger and Mercado Libre to platform types
- Creates platform-specific config tables

## Usage Examples

### Assign a conversation manually

```bash
curl -X POST http://localhost:3000/api/assignment/assign \
  -H "Content-Type: application/json" \
  -H "X-Organization-ID: your_org_id" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "conversationId": "conv-uuid",
    "userId": "agent-uuid"
  }'
```

### Assign using Round Robin

```bash
curl -X POST http://localhost:3000/api/assignment/round-robin \
  -H "Content-Type: application/json" \
  -H "X-Organization-ID: your_org_id" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "conversationId": "conv-uuid"
  }'
```

### Transfer conversation to department

```bash
curl -X POST http://localhost:3000/api/assignment/transfer-department \
  -H "Content-Type: application/json" \
  -H "X-Organization-ID: your_org_id" \
  -H "X-User-ID: your_user_id" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "conversationId": "conv-uuid",
    "departmentId": "dept-uuid",
    "reason": "Customer needs technical support"
  }'
```

### Create internal note

```bash
curl -X POST http://localhost:3000/api/internal-notes \
  -H "Content-Type: application/json" \
  -H "X-Organization-ID: your_org_id" \
  -H "X-User-ID: your_user_id" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "conversationId": "conv-uuid",
    "note": "Customer mentioned they prefer email communication",
    "isVisibleToAll": true
  }'
```

### Get unified inbox

```bash
curl -X GET "http://localhost:3000/api/inbox?platform=whatsapp&status=open&assignedTo=agent-uuid" \
  -H "X-Organization-ID: your_org_id" \
  -H "Authorization: Bearer your_token"
```

## Best Practices

### Assignment Strategies

1. **Manual Assignment**: Use for VIP customers or complex cases requiring specific expertise
2. **Round Robin**: Use for general inquiries to distribute workload evenly
3. **Load Balance**: Use when agents have different capacities or when some are on break

### Transfer Best Practices

1. Always include a transfer reason for context
2. Use department transfers for specialized support
3. Check agent availability before transferring
3. Review transfer history to identify patterns

### Internal Notes

1. Use notes for customer preferences, context, and follow-up reminders
2. Mark important notes as visible to all team members
3. Keep notes concise and actionable
4. Update notes when customer situation changes

### Agent Availability

1. Set agents to unavailable when on break or in meetings
2. Use online status to indicate presence
3. Monitor workload to prevent burnout
4. Balance assignments based on agent capacity

## Troubleshooting

### Assignment not working
- Verify agent is online and available
- Check agent workload limits
- Ensure organization has active agents
- Review assignment rules configuration

### Transfer failed
- Verify target agent exists and is available
- Check department has active members
- Ensure conversation is not already assigned to target
- Review transfer history for errors

### Notes not visible
- Check note visibility settings
- Verify user has permission to view notes
- Ensure conversation ID is correct
- Check database for note existence

### Inbox not showing conversations
- Verify platform connection is active
- Check conversation status filters
- Ensure user has permission to view conversations
- Review platform-specific webhook configuration

## Future Enhancements

- [ ] Skill-based assignment
- [ ] Automatic assignment based on customer history
- [ ] Agent performance metrics
- [ ] SLA tracking and alerts
- [ ] Bulk assignment operations
- [ ] Assignment rule builder UI
- [ ] Real-time agent presence indicators
- [ ] Conversation tagging and categorization
- [ ] Automated escalation rules
- [ ] Agent capacity planning
