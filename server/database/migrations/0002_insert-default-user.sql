-- Migration number: 0001 	 2025-08-23T16:09:27.764Z
INSERT INTO users (name, email, password, avatar, created_at, is_admin) VALUES
  ('HoshinoSuzumi', 'master@uniiem.com', '$scrypt$n=16384,r=8,p=1$QaLKQI/LB+Kh7jgyeH4lGw$NuoxPwPvDZGK3F9oTNEgUNMAi24z/Wei6hWnJzNdscwKDHpQQVJfL1BlcNC+gHJtdJn4YsmQ9tWbVOCE4RgL1g', NULL, strftime('%s', 'now'), 1);