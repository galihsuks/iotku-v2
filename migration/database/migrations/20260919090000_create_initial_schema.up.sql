CREATE TABLE IF NOT EXISTS app_users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(100) NULL UNIQUE,
  full_name VARCHAR(100) NULL,
  email VARCHAR(150) NULL UNIQUE,
  password VARCHAR(255) NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS app_roles (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS app_user_roles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  UNIQUE KEY uq_app_user_roles_user_role (user_id, role_id),
  CONSTRAINT fk_app_user_roles_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_app_user_roles_role FOREIGN KEY (role_id) REFERENCES app_roles(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS app_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token TEXT NOT NULL,
  expired_time DATETIME NOT NULL,
  ip VARCHAR(45) NULL,
  device VARCHAR(100) NULL,
  platform VARCHAR(50) NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  KEY idx_app_tokens_user_id (user_id),
  CONSTRAINT fk_app_tokens_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS app_menus (
  id VARCHAR(36) PRIMARY KEY,
  parent_menu_id VARCHAR(36) NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  url VARCHAR(255) NULL,
  `group` ENUM('main', 'system') NOT NULL DEFAULT 'main',
  icon VARCHAR(100) NULL,
  display TINYINT(1) NOT NULL DEFAULT 1,
  sort INT NOT NULL DEFAULT 0,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  KEY idx_app_menus_parent (parent_menu_id),
  CONSTRAINT fk_app_menus_parent FOREIGN KEY (parent_menu_id) REFERENCES app_menus(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS app_menu_controls (
  id VARCHAR(36) PRIMARY KEY,
  menu_id VARCHAR(36) NOT NULL,
  code VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  UNIQUE KEY uq_app_menu_controls_menu_code (menu_id, code),
  CONSTRAINT fk_app_menu_controls_menu FOREIGN KEY (menu_id) REFERENCES app_menus(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS app_role_menu_controls (
  id VARCHAR(36) PRIMARY KEY,
  role_id VARCHAR(36) NOT NULL,
  menu_id VARCHAR(36) NOT NULL,
  menu_control_id VARCHAR(36) NOT NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  UNIQUE KEY uq_app_role_menu_controls (role_id, menu_id, menu_control_id),
  CONSTRAINT fk_app_role_menu_controls_role FOREIGN KEY (role_id) REFERENCES app_roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_app_role_menu_controls_menu FOREIGN KEY (menu_id) REFERENCES app_menus(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_app_role_menu_controls_control FOREIGN KEY (menu_control_id) REFERENCES app_menu_controls(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS app_parameters (
  id VARCHAR(36) PRIMARY KEY,
  `key` VARCHAR(120) NOT NULL UNIQUE,
  `value` TEXT NOT NULL,
  datatype ENUM('string', 'number', 'json', 'boolean') NOT NULL DEFAULT 'string',
  created_at DATETIME NULL,
  updated_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS app_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  level ENUM('info', 'warning', 'error') NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  context TEXT NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS sensor_units (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  value_type ENUM('number', 'string') NOT NULL DEFAULT 'number',
  created_at DATETIME NULL,
  updated_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS sensors (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  label VARCHAR(150) NOT NULL,
  unit_id VARCHAR(36) NOT NULL,
  owner_user_id VARCHAR(36) NOT NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  KEY idx_sensors_owner (owner_user_id),
  KEY idx_sensors_unit (unit_id),
  CONSTRAINT fk_sensors_unit FOREIGN KEY (unit_id) REFERENCES sensor_units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_sensors_owner FOREIGN KEY (owner_user_id) REFERENCES app_users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS sensor_shared_users (
  id VARCHAR(36) PRIMARY KEY,
  sensor_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  UNIQUE KEY uq_sensor_shared_users (sensor_id, user_id),
  CONSTRAINT fk_sensor_shared_users_sensor FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_sensor_shared_users_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS sensor_readings (
  id VARCHAR(36) PRIMARY KEY,
  sensor_id VARCHAR(36) NOT NULL,
  recorded_at_ms BIGINT NOT NULL,
  value VARCHAR(255) NOT NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  KEY idx_sensor_readings_sensor_time (sensor_id, recorded_at_ms),
  CONSTRAINT fk_sensor_readings_sensor FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS websocket_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  level ENUM('info', 'warning', 'error') NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  context TEXT NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL
);
