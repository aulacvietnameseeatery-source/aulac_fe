# Reservation Workflow (Public Auto-Assign, Admin Confirm-Only)

## Goal
- Public creates reservation and tables are assigned immediately.
- Reservation status remains `PENDING` after public create.
- Admin confirms reservation without assigning tables in confirm step.
- Admin can still edit reservation (including changing tables) before confirmation.

## End-to-End Flow
1. Public fit-check
- Client sends `reservedTime` and `partySize`.
- Server checks table combinations in this order:
  - Single table (smallest capacity that fits)
  - Contiguous tables in same zone
  - Same-zone best-fit combination

2. Public create reservation
- Server re-evaluates candidate tables at create time.
- If no candidate exists: reject with online booking unavailable message.
- If candidates exist:
  - Create reservation with status `PENDING`
  - Assign selected tables directly to reservation
  - Return reservation summary including assigned `TableCode` and `Zone`

3. Admin confirm reservation
- Admin calls confirm endpoint.
- Server only updates status `PENDING -> CONFIRMED`.
- No table assignment is required in confirm call.
- If reservation has no assigned tables, confirm is rejected.

4. Admin edit reservation
- Admin may update customer info, time, party size, notes, and table list.
- If date/time/party size changes, admin should reselect suitable tables before confirm.

## Why this design
- Avoids the race where two pending reservations try to claim the same table at confirm time.
- Keeps admin experience simple in the confirmation step.
- Still preserves admin flexibility through edit-before-confirm.

## API behavior updates
- Public `POST /api/public/reservations`
  - Creates `PENDING` reservation
  - Auto-assigns tables during create
- Admin `PATCH /api/reservations/{id}/assign-and-confirm`
  - Backward compatible route
  - Confirm-only behavior
  - `TableIds` payload is optional

## Notes
- For stronger concurrency guarantees under very high traffic, consider adding transaction isolation improvements around table selection and reservation creation.
