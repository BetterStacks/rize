-- Fix experience and education dates that the resume import stored in 2001.
--
-- Cause: the import fell back to `new Date(str)`, and V8 reads "Sep 21" or
-- "09/21" as 21 September 2001. The month is right and the day of the month
-- is the two-digit year. Most rows were parsed in UTC+5:30, so they are stored
-- at 18:30 UTC on the day before; the local day is the stored day + 1.
--
-- Each new value is the first of that month at 00:00 UTC (the profile renders
-- dates in UTC). Each UPDATE also matches the current values, so it changes
-- nothing if the row has been edited since this was written: check that every
-- statement reports UPDATE 1 before COMMIT.
--
-- Not changed on purpose: profile efcb7dd0-7d2a-416e-8554-e6d2a66a0f81 (rows
-- from 1994 on, in order, with no 2001 pattern: a long career, not this bug),
-- and experience 4671361a-3546-4d35-821c-408015fa38cd (a year-only 2020 entry).
--
-- Review only. Tanay applies this to production.

BEGIN;

-- experience 58e59e5d-ba83-4e95-8116-d060a64bbf17: start 2001-01-19 18:30:00 -> 2020-01-01, end 2001-04-21 18:30:00 -> 2022-04-01
UPDATE experience SET start_date = '2020-01-01 00:00:00', end_date = '2022-04-01 00:00:00'
  WHERE id = '58e59e5d-ba83-4e95-8116-d060a64bbf17' AND start_date = '2001-01-19 18:30:00' AND end_date = '2001-04-21 18:30:00';

-- experience 764c2dab-18ef-4725-b4cb-7ce53384122a: start 2001-06-21 18:30:00 -> 2022-06-01, end 2001-06-22 18:30:00 -> 2023-06-01
UPDATE experience SET start_date = '2022-06-01 00:00:00', end_date = '2023-06-01 00:00:00'
  WHERE id = '764c2dab-18ef-4725-b4cb-7ce53384122a' AND start_date = '2001-06-21 18:30:00' AND end_date = '2001-06-22 18:30:00';

-- experience 32f99028-7fd1-4109-a6b1-7e41757236f8: start 2001-07-22 18:30:00 -> 2023-07-01, end 2001-06-23 18:30:00 -> 2024-06-01
UPDATE experience SET start_date = '2023-07-01 00:00:00', end_date = '2024-06-01 00:00:00'
  WHERE id = '32f99028-7fd1-4109-a6b1-7e41757236f8' AND start_date = '2001-07-22 18:30:00' AND end_date = '2001-06-23 18:30:00';

-- experience 9a91b849-9dc3-4b70-b922-8310ba291ce7: start 2001-08-16 18:30:00 -> 2017-08-01, end 2001-12-18 18:30:00 -> 2019-12-01
UPDATE experience SET start_date = '2017-08-01 00:00:00', end_date = '2019-12-01 00:00:00'
  WHERE id = '9a91b849-9dc3-4b70-b922-8310ba291ce7' AND start_date = '2001-08-16 18:30:00' AND end_date = '2001-12-18 18:30:00';

-- experience b3a1a274-e9b1-4964-91f3-fa05e8178d12: start 2001-08-23 18:30:00 -> 2024-08-01, end 2001-12-23 18:30:00 -> 2024-12-01
UPDATE experience SET start_date = '2024-08-01 00:00:00', end_date = '2024-12-01 00:00:00'
  WHERE id = 'b3a1a274-e9b1-4964-91f3-fa05e8178d12' AND start_date = '2001-08-23 18:30:00' AND end_date = '2001-12-23 18:30:00';

-- experience c3d88217-102f-499a-b26c-ec8239be823a: start NULL -> NULL, end 2001-01-24 18:30:00 -> 2025-01-01
UPDATE experience SET end_date = '2025-01-01 00:00:00'
  WHERE id = 'c3d88217-102f-499a-b26c-ec8239be823a' AND start_date IS NULL AND end_date = '2001-01-24 18:30:00';

-- experience c2894103-d18c-400e-a8a2-a72935647b49: start 2001-03-22 18:30:00 -> 2023-03-01, end 2001-02-23 18:30:00 -> 2024-02-01
UPDATE experience SET start_date = '2023-03-01 00:00:00', end_date = '2024-02-01 00:00:00'
  WHERE id = 'c2894103-d18c-400e-a8a2-a72935647b49' AND start_date = '2001-03-22 18:30:00' AND end_date = '2001-02-23 18:30:00';

-- experience 327d527a-7101-4c67-99f7-9f30268ac5f9: start 2001-05-20 18:30:00 -> 2021-05-01, end 2001-11-21 18:30:00 -> 2022-11-01
UPDATE experience SET start_date = '2021-05-01 00:00:00', end_date = '2022-11-01 00:00:00'
  WHERE id = '327d527a-7101-4c67-99f7-9f30268ac5f9' AND start_date = '2001-05-20 18:30:00' AND end_date = '2001-11-21 18:30:00';

-- experience b246ede5-ffae-4972-bb19-b80e437f2658: start 2001-06-16 18:30:00 -> 2017-06-01, end 2001-12-16 18:30:00 -> 2017-12-01
UPDATE experience SET start_date = '2017-06-01 00:00:00', end_date = '2017-12-01 00:00:00'
  WHERE id = 'b246ede5-ffae-4972-bb19-b80e437f2658' AND start_date = '2001-06-16 18:30:00' AND end_date = '2001-12-16 18:30:00';

-- experience e8901ae4-7e68-400a-9ebe-9b985361228e: start 2001-09-23 18:30:00 -> 2024-09-01, end 2001-10-24 18:30:00 -> 2025-10-01
UPDATE experience SET start_date = '2024-09-01 00:00:00', end_date = '2025-10-01 00:00:00'
  WHERE id = 'e8901ae4-7e68-400a-9ebe-9b985361228e' AND start_date = '2001-09-23 18:30:00' AND end_date = '2001-10-24 18:30:00';

-- experience 9254ac5b-5e1d-423d-90e8-8a9af80a4ee9: start 2001-12-21 18:30:00 -> 2022-12-01, end 2001-03-22 18:30:00 -> 2023-03-01
UPDATE experience SET start_date = '2022-12-01 00:00:00', end_date = '2023-03-01 00:00:00'
  WHERE id = '9254ac5b-5e1d-423d-90e8-8a9af80a4ee9' AND start_date = '2001-12-21 18:30:00' AND end_date = '2001-03-22 18:30:00';

-- education cfa32b7d-3f5d-4f39-a5a3-67170281dc9d: start 2001-08-23 00:00:00 -> 2023-08-01, end NULL (unchanged)
UPDATE education SET start_date = '2023-08-01 00:00:00'
  WHERE id = 'cfa32b7d-3f5d-4f39-a5a3-67170281dc9d' AND start_date = '2001-08-23 00:00:00' AND end_date IS NULL;

-- Expect 0 rows from both checks before COMMIT.
SELECT id, start_date, end_date FROM experience
  WHERE extract(year FROM start_date) = 2001 OR extract(year FROM end_date) = 2001 OR end_date < start_date;
SELECT id, start_date, end_date FROM education
  WHERE extract(year FROM start_date) = 2001 OR extract(year FROM end_date) = 2001 OR end_date < start_date;

COMMIT;
