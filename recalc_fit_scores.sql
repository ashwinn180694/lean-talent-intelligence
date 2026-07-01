-- Recalculate lean_fit_score as simple average of 5 dimensions
-- and update priority_tier thresholds: Tier 1 ≥8, Tier 2 ≥5, Tier 3 <5

UPDATE companies
SET
  lean_fit_score = ROUND(
    (
      (fit_breakdown->>'culture_fit')::numeric +
      (fit_breakdown->>'growth_stage')::numeric +
      (fit_breakdown->>'function_overlap')::numeric +
      (fit_breakdown->>'geo_relevance')::numeric +
      (fit_breakdown->>'talent_density')::numeric
    ) / 5.0, 1
  ),
  priority_tier = CASE
    WHEN (
      (fit_breakdown->>'culture_fit')::numeric +
      (fit_breakdown->>'growth_stage')::numeric +
      (fit_breakdown->>'function_overlap')::numeric +
      (fit_breakdown->>'geo_relevance')::numeric +
      (fit_breakdown->>'talent_density')::numeric
    ) / 5.0 >= 8 THEN 'Tier 1'
    WHEN (
      (fit_breakdown->>'culture_fit')::numeric +
      (fit_breakdown->>'growth_stage')::numeric +
      (fit_breakdown->>'function_overlap')::numeric +
      (fit_breakdown->>'geo_relevance')::numeric +
      (fit_breakdown->>'talent_density')::numeric
    ) / 5.0 >= 5 THEN 'Tier 2'
    ELSE 'Tier 3'
  END
WHERE fit_breakdown IS NOT NULL;
