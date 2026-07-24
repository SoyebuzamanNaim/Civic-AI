---
name: api-contracts
description: Creates and reviews consistent typed API/Server Action contracts, validation, HTTP semantics, safe errors, DTO redaction, and state-transition behavior.
---

# API Contracts

1. Read `docs/05_API_CONTRACTS.md`.
2. Define input schema, output DTO, error codes, authorization, idempotency, and side effects before implementation.
3. Keep controllers thin and call one application use case.
4. Return correct HTTP status codes for Route Handlers.
5. Never expose raw exceptions or database/provider payloads.
6. Use explicit public versus government DTOs.
7. Test validation, unauthenticated, unauthorized, not found, conflict, rate limit, upstream failure, and success paths.
8. Update API documentation when a contract changes.
