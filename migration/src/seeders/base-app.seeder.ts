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
      ('menu-system-menu', NULL, 'Menu', 'Manage application menus.', '/system/menu', 'system', 'Menu', 1, 10, @now, @now),
      ('menu-system-role', NULL, 'Role', 'Manage roles and access.', '/system/role', 'system', 'ShieldCheck', 1, 20, @now, @now),
      ('menu-system-user', NULL, 'User', 'Manage application users.', '/system/user', 'system', 'Users', 1, 30, @now, @now),
      ('menu-system-parameter', NULL, 'Parameter', 'Manage app configuration.', '/system/parameter', 'system', 'Settings', 1, 40, @now, @now),
      ('menu-system-log', NULL, 'Log', 'View application logs.', '/system/log', 'system', 'ScrollText', 1, 50, @now, @now);

      INSERT IGNORE INTO app_menu_controls (id, menu_id, code, name, created_at, updated_at)
      SELECT CONCAT('ctrl-', id, '-R'), id, 'R', 'Read', @now, @now FROM app_menus;
      INSERT IGNORE INTO app_menu_controls (id, menu_id, code, name, created_at, updated_at)
      SELECT CONCAT('ctrl-', id, '-C'), id, 'C', 'Create', @now, @now FROM app_menus;
      INSERT IGNORE INTO app_menu_controls (id, menu_id, code, name, created_at, updated_at)
      SELECT CONCAT('ctrl-', id, '-U'), id, 'U', 'Update', @now, @now FROM app_menus;
      INSERT IGNORE INTO app_menu_controls (id, menu_id, code, name, created_at, updated_at)
      SELECT CONCAT('ctrl-', id, '-D'), id, 'D', 'Delete', @now, @now FROM app_menus;
      INSERT IGNORE INTO app_menu_controls (id, menu_id, code, name, created_at, updated_at) VALUES
      ('ctrl-menu-system-role-AC', 'menu-system-role', 'AC', 'Access Control', @now, @now);

      INSERT IGNORE INTO app_role_menu_controls (id, role_id, menu_id, menu_control_id, created_at, updated_at)
      SELECT CONCAT('rmc-super-', mc.id), 'role-super-admin', mc.menu_id, mc.id, @now, @now
      FROM app_menu_controls mc;

      INSERT IGNORE INTO app_parameters (id, \`key\`, \`value\`, datatype, created_at, updated_at) VALUES
      ('param-app-name', 'app_name', 'Iotku V2', 'string', @now, @now);
    `);
  },
};
