ALTER TABLE sensor_units
  ADD COLUMN widget_type ENUM('numeric_card', 'chart', 'gauge', 'switch', 'status') NOT NULL DEFAULT 'numeric_card' AFTER value_type;

UPDATE sensor_units SET widget_type = 'gauge' WHERE id = 'unit-temperature-celsius';
UPDATE sensor_units SET widget_type = 'chart' WHERE id = 'unit-humidity-percent';
UPDATE sensor_units SET widget_type = 'status' WHERE id = 'unit-status-text';

