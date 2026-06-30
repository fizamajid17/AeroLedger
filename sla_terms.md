# SLA Terms — Single Source of Truth

Airport: Calicut International Airport (CCJ)
Contract period: 01-Apr-2026 to 31-Dec-2026

## Vendor 1: SkyServe Ground Handling Pvt Ltd
Service: Baggage Handling
- Metric: Baggage delivery time (first bag on belt after chock-on)
- Threshold: 30 minutes
- Penalty: ₹12,000 per breach
- Metric: Mishandled baggage rate
- Threshold: max 5 per 1000 bags
- Penalty: ₹8,000 per breach event (per day exceeding threshold)

## Vendor 2: AeroClean Facility Services
Service: Aircraft Cabin Cleaning
- Metric: Cabin cleaning turnaround time
- Threshold: 25 minutes
- Penalty: ₹9,000 per breach
- Metric: Cleaning quality audit score
- Threshold: min 90/100
- Penalty: ₹6,000 per breach event (per failed audit)

## Vendor 3: FuelTech Aviation Services
Service: Aircraft Fueling
- Metric: Fuel delivery start time (after request)
- Threshold: 20 minutes
- Penalty: ₹15,000 per breach
- Metric: Fueling completion time
- Threshold: 40 minutes
- Penalty: ₹10,000 per breach

## General clauses
- Force majeure exemption: weather events, ATC strikes
- Reporting: daily logs, monthly compliance report
- Renewal review: 90 days before expiry, based on trailing 12-month (or available) compliance score
- Compliance score formula: (Total Events − Breach Events) / Total Events × 100
  - Green: ≥95%
  - Yellow: 80–94.9%
  - Red: <80%
