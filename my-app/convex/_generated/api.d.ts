/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as categories from "../categories.js";
import type * as chat from "../chat.js";
import type * as cleanup from "../cleanup.js";
import type * as crons from "../crons.js";
import type * as customers from "../customers.js";
import type * as debug from "../debug.js";
import type * as helpers_auth from "../helpers/auth.js";
import type * as helpers_orders from "../helpers/orders.js";
import type * as http from "../http.js";
import type * as inventory from "../inventory.js";
import type * as myFunctions from "../myFunctions.js";
import type * as orders from "../orders.js";
import type * as organizationMembers from "../organizationMembers.js";
import type * as organizations from "../organizations.js";
import type * as permissions from "../permissions.js";
import type * as platformAdmins from "../platformAdmins.js";
import type * as productActivities from "../productActivities.js";
import type * as productVariants from "../productVariants.js";
import type * as products from "../products.js";
import type * as public_cart from "../public/cart.js";
import type * as public_categories from "../public/categories.js";
import type * as public_orders from "../public/orders.js";
import type * as public_organizations from "../public/organizations.js";
import type * as public_products from "../public/products.js";
import type * as seed from "../seed.js";
import type * as stripe from "../stripe.js";
import type * as upload from "../upload.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  categories: typeof categories;
  chat: typeof chat;
  cleanup: typeof cleanup;
  crons: typeof crons;
  customers: typeof customers;
  debug: typeof debug;
  "helpers/auth": typeof helpers_auth;
  "helpers/orders": typeof helpers_orders;
  http: typeof http;
  inventory: typeof inventory;
  myFunctions: typeof myFunctions;
  orders: typeof orders;
  organizationMembers: typeof organizationMembers;
  organizations: typeof organizations;
  permissions: typeof permissions;
  platformAdmins: typeof platformAdmins;
  productActivities: typeof productActivities;
  productVariants: typeof productVariants;
  products: typeof products;
  "public/cart": typeof public_cart;
  "public/categories": typeof public_categories;
  "public/orders": typeof public_orders;
  "public/organizations": typeof public_organizations;
  "public/products": typeof public_products;
  seed: typeof seed;
  stripe: typeof stripe;
  upload: typeof upload;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
