# Copart selection

One catalogue sync rotates one of 21 targets, consumes one request, and does not paginate or retry. At two syncs daily a complete cycle takes about 10.5 days. Availability is not guaranteed.

Provider filters: Copart, 2014–2025, 1,000–80,000 mi, Open/upcoming, make/model. OpenAPI does not enumerate Front end or Normal wear for damage, so primary damage is checked locally. Missing mileage/damage is rejected. BMW 3/5 Series use local family matching; exact chassis cannot be guaranteed without VIN/spec data.

Following successful import, existing real inventory outside the selection is deactivated, not deleted. Failed provider requests do not deactivate inventory. Single imports use the same eligibility rule; IAAI catalogue sync is skipped.

Deploy and run one sync to apply to the database. Local checks do not prove live deployment or availability of matching lots.
