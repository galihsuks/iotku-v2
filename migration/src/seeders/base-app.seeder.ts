import type { Seeder } from "./seeder.types.js";

export const baseAppSeeder: Seeder = {
  name: "baseAppSeeder",
  run: async (db) => {
    await db.query(`
      SET @now = NOW();

      INSERT IGNORE INTO app_roles (id, code, name, description, created_at, updated_at) VALUES
      ('role-super-admin', 'S', 'Super Admin', 'Full access to every application menu.', @now, @now),
      ('role-admin', 'A', 'Admin', 'Administrator access.', @now, @now),
      ('role-user', 'U', 'User', 'Regular IoT user access.', @now, @now);

      INSERT IGNORE INTO app_users (id, username, full_name, email, password, created_at, updated_at) VALUES
      ('user-super-admin', 'superadmin', 'Super Admin', 'admin@iotku.test', '$2b$10$JYTcVlqqLlO9RoPZP/wWjubFAKotIUG/ijvPbjFh/WYASXtCo4hP6', @now, @now);

      INSERT IGNORE INTO app_user_roles (id, user_id, role_id, created_at, updated_at) VALUES
      ('user-role-super-admin', 'user-super-admin', 'role-super-admin', @now, @now);

      INSERT IGNORE INTO app_menus (id, parent_menu_id, name, description, url, \`group\`, icon, display, sort, created_at, updated_at) VALUES
      ('menu-user-dashboard', NULL, 'Dashboard', 'Monitor owned and shared devices.', '/u', 'main', 'LayoutDashboard', 1, 10, @now, @now),
      ('menu-user-add-device', NULL, 'Add Device', 'Connect a new or shared device.', '/u/add', 'main', 'Plus', 1, 20, @now, @now),
      ('menu-admin-dashboard', NULL, 'Dashboard', 'Review all device activity.', '/a/dashboard', 'main', 'LayoutDashboard', 1, 30, @now, @now),
      ('menu-admin-sensor-unit', NULL, 'Units', 'Manage sensor units and fixed values.', '/a/sensor-unit', 'main', 'Cpu', 1, 40, @now, @now),
      ('menu-system-menu', NULL, 'Menu', 'Manage application menus.', '/s/menu', 'system', 'FolderTree', 1, 10, @now, @now),
      ('menu-system-role', NULL, 'Role', 'Manage roles and access.', '/s/role', 'system', 'Shield', 1, 20, @now, @now),
      ('menu-system-user', NULL, 'User', 'Manage application users.', '/s/user', 'system', 'Users', 1, 30, @now, @now),
      ('menu-system-parameter', NULL, 'Parameter', 'Manage app configuration.', '/s/parameter', 'system', 'Settings', 1, 40, @now, @now),
      ('menu-system-profile', NULL, 'Profile', 'Manage signed-in profile.', '/s/profile', 'system', 'UserRound', 1, 50, @now, @now),
      ('menu-system-log-parent', NULL, 'Log', 'Review application logs.', '', 'system', 'Logs', 1, 60, @now, @now),
      ('menu-system-log', 'menu-system-log-parent', 'System Log', 'Review HTTP API logs.', '/s/log', 'system', 'Cpu', 1, 10, @now, @now),
      ('menu-system-websocket-log', 'menu-system-log-parent', 'Websocket Log', 'Review WebSocket logs.', '/s/websocket-log', 'system', 'Unplug', 1, 20, @now, @now);

      INSERT IGNORE INTO app_menu_controls (id, menu_id, code, name, created_at, updated_at) VALUES
      ('ctrl-menu-user-dashboard-C', 'menu-user-dashboard', 'C', 'Create', @now, @now),
      ('ctrl-menu-user-dashboard-R', 'menu-user-dashboard', 'R', 'Read', @now, @now),
      ('ctrl-menu-user-dashboard-U', 'menu-user-dashboard', 'U', 'Update', @now, @now),
      ('ctrl-menu-user-dashboard-D', 'menu-user-dashboard', 'D', 'Delete', @now, @now),
      ('ctrl-menu-user-dashboard-DT', 'menu-user-dashboard', 'DT', 'Detail', @now, @now),
      ('ctrl-menu-user-add-device-C', 'menu-user-add-device', 'C', 'Create', @now, @now),
      ('ctrl-menu-user-add-device-R', 'menu-user-add-device', 'R', 'Read', @now, @now),
      ('ctrl-menu-admin-dashboard-R', 'menu-admin-dashboard', 'R', 'Read', @now, @now),
      ('ctrl-menu-admin-dashboard-DT', 'menu-admin-dashboard', 'DT', 'Detail', @now, @now),
      ('ctrl-menu-admin-sensor-unit-C', 'menu-admin-sensor-unit', 'C', 'Create', @now, @now),
      ('ctrl-menu-admin-sensor-unit-R', 'menu-admin-sensor-unit', 'R', 'Read', @now, @now),
      ('ctrl-menu-admin-sensor-unit-U', 'menu-admin-sensor-unit', 'U', 'Update', @now, @now),
      ('ctrl-menu-admin-sensor-unit-D', 'menu-admin-sensor-unit', 'D', 'Delete', @now, @now),
      ('ctrl-menu-system-menu-C', 'menu-system-menu', 'C', 'Create', @now, @now),
      ('ctrl-menu-system-menu-R', 'menu-system-menu', 'R', 'Read', @now, @now),
      ('ctrl-menu-system-menu-U', 'menu-system-menu', 'U', 'Update', @now, @now),
      ('ctrl-menu-system-menu-D', 'menu-system-menu', 'D', 'Delete', @now, @now),
      ('ctrl-menu-system-menu-MC', 'menu-system-menu', 'MC', 'Menu Control', @now, @now),
      ('ctrl-menu-system-role-C', 'menu-system-role', 'C', 'Create', @now, @now),
      ('ctrl-menu-system-role-R', 'menu-system-role', 'R', 'Read', @now, @now),
      ('ctrl-menu-system-role-U', 'menu-system-role', 'U', 'Update', @now, @now),
      ('ctrl-menu-system-role-D', 'menu-system-role', 'D', 'Delete', @now, @now),
      ('ctrl-menu-system-role-AC', 'menu-system-role', 'AC', 'Access Control', @now, @now),
      ('ctrl-menu-system-user-C', 'menu-system-user', 'C', 'Create', @now, @now),
      ('ctrl-menu-system-user-R', 'menu-system-user', 'R', 'Read', @now, @now),
      ('ctrl-menu-system-user-U', 'menu-system-user', 'U', 'Update', @now, @now),
      ('ctrl-menu-system-user-D', 'menu-system-user', 'D', 'Delete', @now, @now),
      ('ctrl-menu-system-parameter-C', 'menu-system-parameter', 'C', 'Create', @now, @now),
      ('ctrl-menu-system-parameter-R', 'menu-system-parameter', 'R', 'Read', @now, @now),
      ('ctrl-menu-system-parameter-U', 'menu-system-parameter', 'U', 'Update', @now, @now),
      ('ctrl-menu-system-parameter-D', 'menu-system-parameter', 'D', 'Delete', @now, @now),
      ('ctrl-menu-system-profile-C', 'menu-system-profile', 'C', 'Create', @now, @now),
      ('ctrl-menu-system-profile-R', 'menu-system-profile', 'R', 'Read', @now, @now),
      ('ctrl-menu-system-profile-U', 'menu-system-profile', 'U', 'Update', @now, @now),
      ('ctrl-menu-system-profile-D', 'menu-system-profile', 'D', 'Delete', @now, @now),
      ('ctrl-menu-system-log-parent-R', 'menu-system-log-parent', 'R', 'Read', @now, @now),
      ('ctrl-menu-system-log-R', 'menu-system-log', 'R', 'Read', @now, @now),
      ('ctrl-menu-system-log-D', 'menu-system-log', 'D', 'Delete', @now, @now),
      ('ctrl-menu-system-websocket-log-R', 'menu-system-websocket-log', 'R', 'Read', @now, @now),
      ('ctrl-menu-system-websocket-log-D', 'menu-system-websocket-log', 'D', 'Delete', @now, @now);

      INSERT IGNORE INTO app_role_menu_controls (id, role_id, menu_id, menu_control_id, created_at, updated_at)
      SELECT CONCAT('rmc-', LEFT(MD5(CONCAT('role-super-admin:', mc.id)), 32)), 'role-super-admin', mc.menu_id, mc.id, @now, @now
      FROM app_menu_controls mc
      WHERE mc.menu_id IN (
        'menu-system-menu',
        'menu-system-role',
        'menu-system-user',
        'menu-system-parameter',
        'menu-system-profile',
        'menu-system-log-parent',
        'menu-system-log',
        'menu-system-websocket-log'
      );

      INSERT IGNORE INTO app_role_menu_controls (id, role_id, menu_id, menu_control_id, created_at, updated_at)
      SELECT CONCAT('rmc-', LEFT(MD5(CONCAT('role-admin:', mc.id)), 32)), 'role-admin', mc.menu_id, mc.id, @now, @now
      FROM app_menu_controls mc
      WHERE (mc.menu_id = 'menu-admin-dashboard' AND mc.code IN ('R', 'DT'))
         OR (mc.menu_id = 'menu-admin-sensor-unit' AND mc.code IN ('C', 'R', 'U'))
         OR (mc.menu_id = 'menu-system-profile' AND mc.code IN ('C', 'R', 'U', 'D'))
         OR (mc.menu_id = 'menu-system-log-parent' AND mc.code = 'R')
         OR (mc.menu_id = 'menu-system-websocket-log' AND mc.code = 'R');

      INSERT IGNORE INTO app_role_menu_controls (id, role_id, menu_id, menu_control_id, created_at, updated_at)
      SELECT CONCAT('rmc-', LEFT(MD5(CONCAT('role-user:', mc.id)), 32)), 'role-user', mc.menu_id, mc.id, @now, @now
      FROM app_menu_controls mc
      WHERE (mc.menu_id = 'menu-user-dashboard' AND mc.code IN ('C', 'R', 'U', 'D', 'DT'))
         OR (mc.menu_id = 'menu-user-add-device' AND mc.code IN ('C', 'R'))
         OR (mc.menu_id = 'menu-system-profile' AND mc.code IN ('C', 'R', 'U', 'D'));

      INSERT IGNORE INTO app_parameters (id, \`key\`, \`value\`, datatype, created_at, updated_at) VALUES
      ('param-app-name', 'app_name', 'Iotku V2', 'string', @now, @now);
    `);
  },
};
