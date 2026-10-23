-- Which run first ingested each job, so a run's summary can list its new jobs (FR-11, FR-13; DEC-025).
-- Jobs stored before this migration keep NULL.

ALTER TABLE jobs ADD COLUMN first_run_id INTEGER REFERENCES runs(id);
CREATE INDEX idx_jobs_first_run ON jobs(first_run_id);
