BEGIN;

-- Patch: alternative name matches for companies where CSV name ≠ DB name

-- TRANSFERWISE
UPDATE companies SET lean_fit_score=7.9, priority_tier='Tier 2', fit_breakdown='{"culture_fit": 8, "growth_stage": 7, "function_overlap": 9, "geo_relevance": 7, "talent_density": 8}'::jsonb
  WHERE (name ILIKE 'Wise' OR name ILIKE 'TransferWise' OR name ILIKE 'Transferwise') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- STARLING
UPDATE companies SET lean_fit_score=7.3, priority_tier='Tier 2', fit_breakdown='{"culture_fit": 8, "growth_stage": 8, "function_overlap": 9, "geo_relevance": 7, "talent_density": 7}'::jsonb
  WHERE (name ILIKE 'Starling Bank' OR name ILIKE 'Starling') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- ZOPA
UPDATE companies SET lean_fit_score=6.1, priority_tier='Tier 2', fit_breakdown='{"culture_fit": 7, "growth_stage": 6, "function_overlap": 7, "geo_relevance": 7, "talent_density": 5}'::jsonb
  WHERE (name ILIKE 'Zopa' OR name ILIKE 'ZOPA Bank') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- CLEARSCORE
UPDATE companies SET lean_fit_score=6.1, priority_tier='Tier 2', fit_breakdown='{"culture_fit": 7, "growth_stage": 6, "function_overlap": 7, "geo_relevance": 7, "talent_density": 5}'::jsonb
  WHERE (name ILIKE 'ClearScore' OR name ILIKE 'Clear Score' OR name ILIKE 'Clearscore') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- CURVE
UPDATE companies SET lean_fit_score=6.1, priority_tier='Tier 2', fit_breakdown='{"culture_fit": 7, "growth_stage": 7, "function_overlap": 7, "geo_relevance": 7, "talent_density": 5}'::jsonb
  WHERE (name ILIKE 'Curve') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- MONESE
UPDATE companies SET lean_fit_score=6.1, priority_tier='Tier 2', fit_breakdown='{"culture_fit": 7, "growth_stage": 6, "function_overlap": 7, "geo_relevance": 7, "talent_density": 5}'::jsonb
  WHERE (name ILIKE 'Monese') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- TRUSTLY
UPDATE companies SET lean_fit_score=6.5, priority_tier='Tier 2', fit_breakdown='{"culture_fit": 7, "growth_stage": 6, "function_overlap": 8, "geo_relevance": 5, "talent_density": 6}'::jsonb
  WHERE (name ILIKE 'Trustly') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- ASTROPAY
UPDATE companies SET lean_fit_score=5.7, priority_tier='Tier 2', fit_breakdown='{"culture_fit": 6, "growth_stage": 6, "function_overlap": 7, "geo_relevance": 5, "talent_density": 5}'::jsonb
  WHERE (name ILIKE 'AstroPay' OR name ILIKE 'Astropay') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- CHROMAWAY
UPDATE companies SET lean_fit_score=4.5, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 6, "growth_stage": 5, "function_overlap": 5, "geo_relevance": 4, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'ChromaWay' OR name ILIKE 'Chromaway') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- PERENA
UPDATE companies SET lean_fit_score=3.9, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 6, "growth_stage": 6, "function_overlap": 4, "geo_relevance": 3, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'Perena') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- LAMBDA
UPDATE companies SET lean_fit_score=4.5, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 6, "growth_stage": 5, "function_overlap": 5, "geo_relevance": 4, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'Lambda') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- HARAKA
UPDATE companies SET lean_fit_score=5.3, priority_tier='Tier 2', fit_breakdown='{"culture_fit": 7, "growth_stage": 6, "function_overlap": 6, "geo_relevance": 5, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'Haraka') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- SALT
UPDATE companies SET lean_fit_score=5.3, priority_tier='Tier 2', fit_breakdown='{"culture_fit": 6, "growth_stage": 6, "function_overlap": 6, "geo_relevance": 5, "talent_density": 5}'::jsonb
  WHERE (name ILIKE 'Salt' OR name ILIKE 'Salt Bank' OR name ILIKE 'Salt Edge') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- BLAST
UPDATE companies SET lean_fit_score=3.9, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 5, "growth_stage": 5, "function_overlap": 4, "geo_relevance": 3, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'Blast') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- BITWAVE
UPDATE companies SET lean_fit_score=4.5, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 6, "growth_stage": 5, "function_overlap": 5, "geo_relevance": 3, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'Bitwave') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- MANSA
UPDATE companies SET lean_fit_score=4.5, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 6, "growth_stage": 6, "function_overlap": 5, "geo_relevance": 4, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'Mansa') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- BVNK
UPDATE companies SET lean_fit_score=6.5, priority_tier='Tier 2', fit_breakdown='{"culture_fit": 8, "growth_stage": 8, "function_overlap": 8, "geo_relevance": 4, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'BVNK') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- PPRO
UPDATE companies SET lean_fit_score=6.9, priority_tier='Tier 2', fit_breakdown='{"culture_fit": 8, "growth_stage": 7, "function_overlap": 9, "geo_relevance": 6, "talent_density": 5}'::jsonb
  WHERE (name ILIKE 'PPRO') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- ONRAMP
UPDATE companies SET lean_fit_score=4.1, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 6, "growth_stage": 5, "function_overlap": 5, "geo_relevance": 3, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'OnRamp' OR name ILIKE 'Onramp') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- MURAL
UPDATE companies SET lean_fit_score=4.5, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 6, "growth_stage": 5, "function_overlap": 5, "geo_relevance": 4, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'Mural') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- AGORA
UPDATE companies SET lean_fit_score=4.5, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 6, "growth_stage": 5, "function_overlap": 5, "geo_relevance": 4, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'Agora') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- PARFIN
UPDATE companies SET lean_fit_score=4.5, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 6, "growth_stage": 6, "function_overlap": 5, "geo_relevance": 4, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'Parfin') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- MESH
UPDATE companies SET lean_fit_score=5.3, priority_tier='Tier 2', fit_breakdown='{"culture_fit": 7, "growth_stage": 6, "function_overlap": 6, "geo_relevance": 4, "talent_density": 4}'::jsonb
  WHERE (name ILIKE 'Mesh' OR name ILIKE 'Mesh Payments') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- 1MONEY
UPDATE companies SET lean_fit_score=5.3, priority_tier='Tier 2', fit_breakdown='{"culture_fit": 7, "growth_stage": 6, "function_overlap": 6, "geo_relevance": 6, "talent_density": 3}'::jsonb
  WHERE (name ILIKE '1Money' OR name ILIKE '1 Money') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- TOKU
UPDATE companies SET lean_fit_score=4.5, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 6, "growth_stage": 5, "function_overlap": 5, "geo_relevance": 4, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'Toku') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- CODEX
UPDATE companies SET lean_fit_score=4.1, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 5, "growth_stage": 5, "function_overlap": 5, "geo_relevance": 4, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'Codex') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- KAST
UPDATE companies SET lean_fit_score=4.1, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 5, "growth_stage": 5, "function_overlap": 5, "geo_relevance": 3, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'Kast') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- RESOLV
UPDATE companies SET lean_fit_score=3.9, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 5, "growth_stage": 5, "function_overlap": 4, "geo_relevance": 3, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'Resolv' OR name ILIKE 'Resolv Protocol') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- TORCH
UPDATE companies SET lean_fit_score=4.1, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 5, "growth_stage": 5, "function_overlap": 5, "geo_relevance": 4, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'Torch') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

-- LIMITED
UPDATE companies SET lean_fit_score=4.1, priority_tier='Tier 3', fit_breakdown='{"culture_fit": 5, "growth_stage": 5, "function_overlap": 5, "geo_relevance": 4, "talent_density": 3}'::jsonb
  WHERE (name ILIKE 'Limited') AND (fit_breakdown IS NULL OR lean_fit_score IS NULL);

COMMIT;
