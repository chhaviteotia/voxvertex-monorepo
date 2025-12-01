# Database Utilities

This directory contains database-agnostic utilities to make migration from MongoDB to SQL/AWS easier.

## ID Utilities (`idUtils.js`)

Provides database-agnostic ID operations that abstract away MongoDB-specific ObjectId usage.

### Usage

```javascript
import { isValidId, createId, normalizeId, idToString, idsEqual } from '../utils/db/idUtils';

// Validate an ID
if (isValidId(userId)) {
  // ID is valid
}

// Create a new ID
const newId = createId();

// Normalize an ID (convert string to ObjectId for MongoDB, or keep as string for SQL)
const normalizedId = normalizeId(userId);

// Convert ID to string
const idString = idToString(userId);

// Compare two IDs
if (idsEqual(id1, id2)) {
  // IDs are equal
}
```

### Migration Strategy

When migrating from MongoDB to SQL/AWS:

1. **Set environment variable**: `DB_TYPE=sql` (or `postgresql`, `mysql`, etc.)
2. **Update `idUtils.js`**: The utility will automatically use the SQL ID provider
3. **No code changes needed**: All services using these utilities will work automatically

### Current Implementation

- **MongoDB**: Uses `mongoose.Types.ObjectId` for ID operations
- **SQL**: Uses UUID or numeric IDs (configurable)

### Future Enhancements

- Add support for AWS DynamoDB IDs
- Add support for other NoSQL databases
- Add ID generation strategies (UUID, auto-increment, etc.)

