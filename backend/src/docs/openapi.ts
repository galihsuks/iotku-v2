import { env } from "../config/env.js";

const jsonContent = {
  "application/json": {
    schema: {
      type: "object",
    },
  },
};

const paginatedQuery = [
  { name: "page", in: "query", schema: { type: "integer", default: 1 } },
  { name: "page_size", in: "query", schema: { type: "integer", default: 10 } },
  { name: "keywords", in: "query", schema: { type: "string" } },
];

const idParam = (name = "id") => ({
  name,
  in: "path",
  required: true,
  schema: { type: "string" },
});

const ok = (description = "Success") => ({
  description,
  content: jsonContent,
});

const jsonBody = (example: Record<string, unknown>) => ({
  required: true,
  content: {
    "application/json": {
      schema: { type: "object" },
      example,
    },
  },
});

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Iotku V2 Backend API",
    version: "0.1.0",
    description: [
      "Express + TypeScript API for Iotku V2.",
      "",
      "Authentication uses an `auth_token` HTTP-only cookie. Run `POST /api/auth/login` first from this Swagger page, then protected endpoints can be tried from the same browser session.",
      "",
      "WebSocket server runs separately at `ws://localhost:4002` by default.",
      "",
      "Device socket:",
      "`ws://localhost:4002?idsensor=00001&is_device=1`",
      "",
      "Send sensor reading as raw text like `27.5` or JSON:",
      "```json",
      '{ "value": "27.5", "recorded_at_ms": 1760000000000 }',
      "```",
      "",
      "Admin monitor socket:",
      "`ws://localhost:4002?idsensor=ADMIN&is_device=0`",
      "",
      "Send admin handshake:",
      "```json",
      '{ "isAdmin": true, "key": "change-this-ws-key" }',
      "```",
    ].join("\n"),
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: "Local backend",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Access" },
    { name: "Role" },
    { name: "User" },
    { name: "Menu" },
    { name: "Menu Control" },
    { name: "Role Menu Control" },
    { name: "Parameter" },
    { name: "Dropdown" },
    { name: "Log" },
    { name: "Sensor Unit" },
    { name: "Sensor" },
    { name: "Sensor Reading" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: env.AUTH_COOKIE_NAME,
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          data: {},
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer" },
              page_size: { type: "integer" },
              total_items: { type: "integer" },
              total_pages: { type: "integer" },
              has_next: { type: "boolean" },
              has_prev: { type: "boolean" },
            },
          },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "API welcome",
        responses: { 200: ok() },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and set auth cookie",
        requestBody: jsonBody({ username: "superadmin", password: "password123" }),
        responses: { 200: ok("Login successfully") },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get authenticated user",
        security: [{ cookieAuth: [] }],
        responses: { 200: ok() },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        security: [{ cookieAuth: [] }],
        responses: { 200: ok() },
      },
    },
    "/api/auth/password": {
      put: {
        tags: ["Auth"],
        summary: "Change own password",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody({
          current_password: "password123",
          new_password: "password123",
          confirm_password: "password123",
        }),
        responses: { 200: ok() },
      },
    },
    "/api/access/menu": {
      get: {
        tags: ["Access"],
        summary: "Get accessible menu tree",
        security: [{ cookieAuth: [] }],
        responses: { 200: ok() },
      },
    },
    "/api/access/control/{menuId}": {
      get: {
        tags: ["Access"],
        summary: "Get allowed control codes for menu",
        security: [{ cookieAuth: [] }],
        parameters: [idParam("menuId")],
        responses: { 200: ok() },
      },
    },
    "/api/role": {
      get: {
        tags: ["Role"],
        summary: "List roles",
        security: [{ cookieAuth: [] }],
        parameters: paginatedQuery,
        responses: { 200: ok() },
      },
      post: {
        tags: ["Role"],
        summary: "Create role",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody({ code: "T", name: "Tester", description: "Role for testing" }),
        responses: { 200: ok() },
      },
    },
    "/api/role/{id}": {
      get: {
        tags: ["Role"],
        summary: "Get role detail",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        responses: { 200: ok() },
      },
      put: {
        tags: ["Role"],
        summary: "Update role",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        requestBody: jsonBody({ code: "U", name: "User", description: "Regular user" }),
        responses: { 200: ok() },
      },
      delete: {
        tags: ["Role"],
        summary: "Delete role",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        responses: { 200: ok() },
      },
    },
    "/api/user": {
      get: {
        tags: ["User"],
        summary: "List users",
        security: [{ cookieAuth: [] }],
        parameters: paginatedQuery,
        responses: { 200: ok() },
      },
      post: {
        tags: ["User"],
        summary: "Create user",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody({
          username: "demo_user",
          full_name: "Demo User",
          email: "demo.user@iotku.test",
          password: "password123",
          role_id: "role-user",
        }),
        responses: { 200: ok() },
      },
    },
    "/api/user/{id}": {
      get: {
        tags: ["User"],
        summary: "Get user detail",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        responses: { 200: ok() },
      },
      put: {
        tags: ["User"],
        summary: "Update user",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        requestBody: jsonBody({
          username: "superadmin",
          full_name: "Super Admin",
          email: "admin@iotku.test",
          role_id: "role-super-admin",
        }),
        responses: { 200: ok() },
      },
      delete: {
        tags: ["User"],
        summary: "Delete user",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        responses: { 200: ok() },
      },
    },
    "/api/user/password/{id}": {
      put: {
        tags: ["User"],
        summary: "Change user password",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        requestBody: jsonBody({
          new_password: "password123",
          confirm_password: "password123",
        }),
        responses: { 200: ok() },
      },
    },
    "/api/menu": {
      get: {
        tags: ["Menu"],
        summary: "List menu tree",
        security: [{ cookieAuth: [] }],
        responses: { 200: ok() },
      },
      post: {
        tags: ["Menu"],
        summary: "Create menu",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody({
          parent_menu_id: null,
          name: "Sensor",
          description: "Manage IoT sensors",
          url: "/sensor",
          group: "main",
          icon: "RadioTower",
          display: "1",
          sort: 10,
        }),
        responses: { 200: ok() },
      },
    },
    "/api/menu/{id}": {
      get: {
        tags: ["Menu"],
        summary: "Get menu detail",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        responses: { 200: ok() },
      },
      put: {
        tags: ["Menu"],
        summary: "Update menu",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        requestBody: jsonBody({
          parent_menu_id: null,
          name: "User",
          description: "Manage application users.",
          url: "/system/user",
          group: "system",
          icon: "Users",
          display: "1",
          sort: 30,
        }),
        responses: { 200: ok() },
      },
      delete: {
        tags: ["Menu"],
        summary: "Delete menu",
        security: [{ cookieAuth: [] }],
        parameters: [
          idParam(),
          { name: "force_delete", in: "query", schema: { type: "string", enum: ["0", "1"] } },
        ],
        responses: { 200: ok() },
      },
    },
    "/api/menu-control/{menuId}": {
      get: {
        tags: ["Menu Control"],
        summary: "List menu controls",
        security: [{ cookieAuth: [] }],
        parameters: [idParam("menuId")],
        responses: { 200: ok() },
      },
    },
    "/api/menu-control": {
      post: {
        tags: ["Menu Control"],
        summary: "Create menu control",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody({ menu_id: "menu-system-user", code: "X", name: "Export" }),
        responses: { 200: ok() },
      },
    },
    "/api/menu-control/{id}": {
      put: {
        tags: ["Menu Control"],
        summary: "Update menu control",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        requestBody: jsonBody({ menu_id: "menu-system-user", code: "R", name: "Read" }),
        responses: { 200: ok() },
      },
      delete: {
        tags: ["Menu Control"],
        summary: "Delete menu control",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        responses: { 200: ok() },
      },
    },
    "/api/role-menu-control/{roleId}": {
      get: {
        tags: ["Role Menu Control"],
        summary: "List role menu access tree",
        security: [{ cookieAuth: [] }],
        parameters: [idParam("roleId")],
        responses: { 200: ok() },
      },
    },
    "/api/role-menu-control": {
      post: {
        tags: ["Role Menu Control"],
        summary: "Apply role menu access changes",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody({
          role_id: "role-user",
          data: [
            {
              menu_id: "menu-system-user",
              menu_control_id: "ctrl-menu-system-user-R",
              value: true,
            },
          ],
        }),
        responses: { 200: ok() },
      },
    },
    "/api/parameter": {
      get: {
        tags: ["Parameter"],
        summary: "List parameters",
        security: [{ cookieAuth: [] }],
        parameters: paginatedQuery,
        responses: { 200: ok() },
      },
      post: {
        tags: ["Parameter"],
        summary: "Create parameter",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody({ key: "demo_parameter", value: "true", datatype: "boolean" }),
        responses: { 200: ok() },
      },
    },
    "/api/parameter/{id}": {
      get: {
        tags: ["Parameter"],
        summary: "Get parameter detail",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        responses: { 200: ok() },
      },
      put: {
        tags: ["Parameter"],
        summary: "Update parameter",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        requestBody: jsonBody({ key: "app_name", value: "Iotku V2", datatype: "string" }),
        responses: { 200: ok() },
      },
      delete: {
        tags: ["Parameter"],
        summary: "Delete parameter",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        responses: { 200: ok() },
      },
    },
    "/api/dropdown/role": {
      get: {
        tags: ["Dropdown"],
        summary: "Role dropdown",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "keywords", in: "query", schema: { type: "string" } }],
        responses: { 200: ok() },
      },
    },
    "/api/dropdown/user": {
      get: {
        tags: ["Dropdown"],
        summary: "User dropdown",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "keywords", in: "query", schema: { type: "string" } }],
        responses: { 200: ok() },
      },
    },
    "/api/log": {
      get: {
        tags: ["Log"],
        summary: "List logs",
        security: [{ cookieAuth: [] }],
        parameters: paginatedQuery,
        responses: { 200: ok() },
      },
      post: {
        tags: ["Log"],
        summary: "Create frontend log",
        requestBody: jsonBody({
          level: "info",
          message: "Swagger log test",
          context: { source: "swagger" },
        }),
        responses: { 200: ok() },
      },
      delete: {
        tags: ["Log"],
        summary: "Clear logs",
        security: [{ cookieAuth: [] }],
        responses: { 200: ok() },
      },
    },
    "/api/sensor/units": {
      get: {
        tags: ["Sensor Unit"],
        summary: "List sensor units",
        security: [{ cookieAuth: [] }],
        parameters: paginatedQuery,
        responses: { 200: ok() },
      },
      post: {
        tags: ["Sensor Unit"],
        summary: "Create sensor unit",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody({ name: "Voltage", unit: "V", value_type: "number" }),
        responses: { 200: ok() },
      },
    },
    "/api/sensor/units/{id}": {
      put: {
        tags: ["Sensor Unit"],
        summary: "Update sensor unit",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        requestBody: jsonBody({ name: "Temperature", unit: "C", value_type: "number" }),
        responses: { 200: ok() },
      },
      delete: {
        tags: ["Sensor Unit"],
        summary: "Delete sensor unit",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        responses: { 200: ok() },
      },
    },
    "/api/sensor": {
      get: {
        tags: ["Sensor"],
        summary: "List sensors",
        security: [{ cookieAuth: [] }],
        parameters: paginatedQuery,
        responses: { 200: ok() },
      },
      post: {
        tags: ["Sensor"],
        summary: "Create sensor",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody({
          label: "Living Room Temperature",
          unit_id: "unit-temperature-celsius",
          owner_user_id: "user-super-admin",
          shared_user_ids: [],
        }),
        responses: { 200: ok() },
      },
    },
    "/api/sensor/{id}": {
      get: {
        tags: ["Sensor"],
        summary: "Get sensor detail",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        responses: { 200: ok() },
      },
      put: {
        tags: ["Sensor"],
        summary: "Update sensor",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        requestBody: jsonBody({
          label: "Living Room Temperature Updated",
          unit_id: "unit-temperature-celsius",
          owner_user_id: "user-super-admin",
          shared_user_ids: [],
        }),
        responses: { 200: ok() },
      },
      delete: {
        tags: ["Sensor"],
        summary: "Delete sensor",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        responses: { 200: ok() },
      },
    },
    "/api/sensor/{id}/readings": {
      get: {
        tags: ["Sensor Reading"],
        summary: "List sensor readings",
        security: [{ cookieAuth: [] }],
        parameters: [
          idParam(),
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "page_size", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: { 200: ok() },
      },
      post: {
        tags: ["Sensor Reading"],
        summary: "Create sensor reading",
        security: [{ cookieAuth: [] }],
        parameters: [idParam()],
        requestBody: jsonBody({ recorded_at_ms: 1760000000000, value: "27.5" }),
        responses: { 200: ok() },
      },
    },
    "/api/sensor/{id}/readings/public": {
      post: {
        tags: ["Sensor Reading"],
        summary: "Create sensor reading publicly by sensor ID or code",
        parameters: [idParam()],
        requestBody: jsonBody({ recorded_at_ms: 1760000000000, value: "28.1" }),
        responses: { 200: ok() },
      },
    },
  },
} as const;
