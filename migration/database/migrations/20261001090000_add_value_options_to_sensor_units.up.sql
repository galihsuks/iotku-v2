ALTER TABLE sensor_units
  ADD COLUMN value_options TEXT NULL AFTER widget_type;

UPDATE sensor_units
SET value_options = '[{"label":"On","value":"on"},{"label":"Off","value":"off"}]'
WHERE widget_type = 'switch';
