var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.2.0",
  "engineVersion": "0c8ef2ce45c83248ab3df073180d5eda9e8be7a3",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id            String                @id\n  name          String\n  email         String\n  emailVerified Boolean               @default(false)\n  image         String?\n  cards         Card[]\n  contacts      Contact[]\n  ownerShares   VisitorContactShare[] @relation("OwnerShares")\n  visitorShares VisitorContactShare[] @relation("VisitorShares")\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  sessions  Session[]\n  accounts  Account[]\n\n  phoneNumber         String?\n  phoneNumberVerified Boolean?\n\n  @@unique([email])\n  @@unique([phoneNumber])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Card {\n  id                String                @id @default(cuid())\n  userId            String\n  user              User                  @relation(fields: [userId], references: [id], onDelete: Cascade)\n  cardTitle         String                @default("ConactX")\n  cardColor         String                @default("black")\n  logo              String?\n  profile           String?\n  cover             String?\n  imagesAndLayouts  Json?\n  isFavorite        Boolean               @default(false)\n  personalInfo      PersonalInfo?\n  socialLinks       socialLinks?\n  qrCode            String?\n  qrImage           String?\n  scan              cardScan[]\n  contacts          Contact[]\n  ownerCardShares   VisitorContactShare[] @relation("OwnerCardShares")\n  visitorCardShares VisitorContactShare[] @relation("VisitorCardShares")\n  setting           Json?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([userId])\n  @@map("cards")\n}\n\nmodel PersonalInfo {\n  id          String  @id @default(cuid())\n  cardId      String  @unique\n  card        Card    @relation(fields: [cardId], references: [id], onDelete: Cascade)\n  firstName   String?\n  lastName    String?\n  jobTitle    String?\n  phoneNumber String? @unique\n  email       String? @unique\n  company     String?\n  image       String?\n  logo        String?\n  note        String?\n  banner      String?\n  profile_img String?\n  middleName  String?\n  prefix      String?\n  suffix      String?\n  pronoun     String?\n  preferred   String?\n  maidenName  String?\n\n  @@index([cardId])\n  @@map("personal_info")\n}\n\nmodel socialLinks {\n  id     String @id @default(cuid())\n  cardId String @unique\n  card   Card   @relation(fields: [cardId], references: [id], onDelete: Cascade)\n  links  Json[]\n\n  @@index([cardId])\n  @@map("social_links")\n}\n\nmodel cardScan {\n  id               String  @id @default(cuid())\n  cardId           String\n  card             Card    @relation(fields: [cardId], references: [id], onDelete: Cascade)\n  ip               String?\n  userAgent        String?\n  source           String  @default("qr") // "qr" | "link"\n  latitude         Float?\n  longitude        Float?\n  city             String?\n  country          String?\n  street           String?\n  streetNumber     String?\n  district         String?\n  region           String?\n  subregion        String?\n  postalCode       String?\n  addressName      String? // village / place name\n  formattedAddress String?\n  isoCountryCode   String?\n  banner           String?\n  profile_img      String?\n\n  createdAt DateTime @default(now())\n\n  @@index([cardId])\n  @@map("card_scans")\n}\n\nmodel Contact {\n  id               String  @id @default(uuid())\n  userId           String\n  cardId           String?\n  firstName        String?\n  lastName         String?\n  phone            String?\n  email            String?\n  company          String?\n  jobTitle         String?\n  image            String?\n  logo             String?\n  banner           String?\n  note             String?\n  profile_img      String?\n  latitude         Float?\n  longitude        Float?\n  city             String?\n  country          String?\n  street           String?\n  streetNumber     String?\n  district         String?\n  region           String?\n  subregion        String?\n  postalCode       String?\n  addressName      String? // village / place name\n  formattedAddress String?\n  isoCountryCode   String?\n\n  user User  @relation(fields: [userId], references: [id], onDelete: Cascade)\n  card Card? @relation(fields: [cardId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([userId])\n  @@index([cardId])\n  @@map("contacts")\n}\n\nmodel VisitorContactShare {\n  id               String   @id @default(uuid())\n  ownerCardId      String\n  visitorCardId    String\n  ownerId          String\n  visitorId        String\n  status           String   @default("pending_owner_approval") // "pending_owner_approval" | "approved" | "rejected"\n  latitude         Float?\n  longitude        Float?\n  city             String?\n  country          String?\n  street           String?\n  streetNumber     String?\n  district         String?\n  region           String?\n  subregion        String?\n  postalCode       String?\n  addressName      String?\n  formattedAddress String?\n  isoCountryCode   String?\n  createdAt        DateTime @default(now())\n  updatedAt        DateTime @updatedAt\n\n  // Relations\n  ownerCard   Card @relation("OwnerCardShares", fields: [ownerCardId], references: [id], onDelete: Cascade)\n  visitorCard Card @relation("VisitorCardShares", fields: [visitorCardId], references: [id], onDelete: Cascade)\n  owner       User @relation("OwnerShares", fields: [ownerId], references: [id])\n  visitor     User @relation("VisitorShares", fields: [visitorId], references: [id])\n\n  @@index([ownerId])\n  @@index([visitorId])\n  @@index([ownerCardId])\n  @@index([visitorCardId])\n  @@index([status])\n  @@map("visitor_contact_shares")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"cards","kind":"object","type":"Card","relationName":"CardToUser"},{"name":"contacts","kind":"object","type":"Contact","relationName":"ContactToUser"},{"name":"ownerShares","kind":"object","type":"VisitorContactShare","relationName":"OwnerShares"},{"name":"visitorShares","kind":"object","type":"VisitorContactShare","relationName":"VisitorShares"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"phoneNumber","kind":"scalar","type":"String"},{"name":"phoneNumberVerified","kind":"scalar","type":"Boolean"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Card":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"CardToUser"},{"name":"cardTitle","kind":"scalar","type":"String"},{"name":"cardColor","kind":"scalar","type":"String"},{"name":"logo","kind":"scalar","type":"String"},{"name":"profile","kind":"scalar","type":"String"},{"name":"cover","kind":"scalar","type":"String"},{"name":"imagesAndLayouts","kind":"scalar","type":"Json"},{"name":"isFavorite","kind":"scalar","type":"Boolean"},{"name":"personalInfo","kind":"object","type":"PersonalInfo","relationName":"CardToPersonalInfo"},{"name":"socialLinks","kind":"object","type":"socialLinks","relationName":"CardTosocialLinks"},{"name":"qrCode","kind":"scalar","type":"String"},{"name":"qrImage","kind":"scalar","type":"String"},{"name":"scan","kind":"object","type":"cardScan","relationName":"CardTocardScan"},{"name":"contacts","kind":"object","type":"Contact","relationName":"CardToContact"},{"name":"ownerCardShares","kind":"object","type":"VisitorContactShare","relationName":"OwnerCardShares"},{"name":"visitorCardShares","kind":"object","type":"VisitorContactShare","relationName":"VisitorCardShares"},{"name":"setting","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"cards"},"PersonalInfo":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"cardId","kind":"scalar","type":"String"},{"name":"card","kind":"object","type":"Card","relationName":"CardToPersonalInfo"},{"name":"firstName","kind":"scalar","type":"String"},{"name":"lastName","kind":"scalar","type":"String"},{"name":"jobTitle","kind":"scalar","type":"String"},{"name":"phoneNumber","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"company","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"logo","kind":"scalar","type":"String"},{"name":"note","kind":"scalar","type":"String"},{"name":"banner","kind":"scalar","type":"String"},{"name":"profile_img","kind":"scalar","type":"String"},{"name":"middleName","kind":"scalar","type":"String"},{"name":"prefix","kind":"scalar","type":"String"},{"name":"suffix","kind":"scalar","type":"String"},{"name":"pronoun","kind":"scalar","type":"String"},{"name":"preferred","kind":"scalar","type":"String"},{"name":"maidenName","kind":"scalar","type":"String"}],"dbName":"personal_info"},"socialLinks":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"cardId","kind":"scalar","type":"String"},{"name":"card","kind":"object","type":"Card","relationName":"CardTosocialLinks"},{"name":"links","kind":"scalar","type":"Json"}],"dbName":"social_links"},"cardScan":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"cardId","kind":"scalar","type":"String"},{"name":"card","kind":"object","type":"Card","relationName":"CardTocardScan"},{"name":"ip","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"source","kind":"scalar","type":"String"},{"name":"latitude","kind":"scalar","type":"Float"},{"name":"longitude","kind":"scalar","type":"Float"},{"name":"city","kind":"scalar","type":"String"},{"name":"country","kind":"scalar","type":"String"},{"name":"street","kind":"scalar","type":"String"},{"name":"streetNumber","kind":"scalar","type":"String"},{"name":"district","kind":"scalar","type":"String"},{"name":"region","kind":"scalar","type":"String"},{"name":"subregion","kind":"scalar","type":"String"},{"name":"postalCode","kind":"scalar","type":"String"},{"name":"addressName","kind":"scalar","type":"String"},{"name":"formattedAddress","kind":"scalar","type":"String"},{"name":"isoCountryCode","kind":"scalar","type":"String"},{"name":"banner","kind":"scalar","type":"String"},{"name":"profile_img","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"card_scans"},"Contact":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"cardId","kind":"scalar","type":"String"},{"name":"firstName","kind":"scalar","type":"String"},{"name":"lastName","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"company","kind":"scalar","type":"String"},{"name":"jobTitle","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"logo","kind":"scalar","type":"String"},{"name":"banner","kind":"scalar","type":"String"},{"name":"note","kind":"scalar","type":"String"},{"name":"profile_img","kind":"scalar","type":"String"},{"name":"latitude","kind":"scalar","type":"Float"},{"name":"longitude","kind":"scalar","type":"Float"},{"name":"city","kind":"scalar","type":"String"},{"name":"country","kind":"scalar","type":"String"},{"name":"street","kind":"scalar","type":"String"},{"name":"streetNumber","kind":"scalar","type":"String"},{"name":"district","kind":"scalar","type":"String"},{"name":"region","kind":"scalar","type":"String"},{"name":"subregion","kind":"scalar","type":"String"},{"name":"postalCode","kind":"scalar","type":"String"},{"name":"addressName","kind":"scalar","type":"String"},{"name":"formattedAddress","kind":"scalar","type":"String"},{"name":"isoCountryCode","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ContactToUser"},{"name":"card","kind":"object","type":"Card","relationName":"CardToContact"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"contacts"},"VisitorContactShare":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"ownerCardId","kind":"scalar","type":"String"},{"name":"visitorCardId","kind":"scalar","type":"String"},{"name":"ownerId","kind":"scalar","type":"String"},{"name":"visitorId","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"latitude","kind":"scalar","type":"Float"},{"name":"longitude","kind":"scalar","type":"Float"},{"name":"city","kind":"scalar","type":"String"},{"name":"country","kind":"scalar","type":"String"},{"name":"street","kind":"scalar","type":"String"},{"name":"streetNumber","kind":"scalar","type":"String"},{"name":"district","kind":"scalar","type":"String"},{"name":"region","kind":"scalar","type":"String"},{"name":"subregion","kind":"scalar","type":"String"},{"name":"postalCode","kind":"scalar","type":"String"},{"name":"addressName","kind":"scalar","type":"String"},{"name":"formattedAddress","kind":"scalar","type":"String"},{"name":"isoCountryCode","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ownerCard","kind":"object","type":"Card","relationName":"OwnerCardShares"},{"name":"visitorCard","kind":"object","type":"Card","relationName":"VisitorCardShares"},{"name":"owner","kind":"object","type":"User","relationName":"OwnerShares"},{"name":"visitor","kind":"object","type":"User","relationName":"VisitorShares"}],"dbName":"visitor_contact_shares"}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_bg.postgresql.js"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_bg.postgresql.wasm-base64.js");
    return await decodeBase64AsWasm(wasm);
  }
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  CardScalarFieldEnum: () => CardScalarFieldEnum,
  CardScanScalarFieldEnum: () => CardScanScalarFieldEnum,
  ContactScalarFieldEnum: () => ContactScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PersonalInfoScalarFieldEnum: () => PersonalInfoScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SocialLinksScalarFieldEnum: () => SocialLinksScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  VisitorContactShareScalarFieldEnum: () => VisitorContactShareScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.2.0",
  engine: "0c8ef2ce45c83248ab3df073180d5eda9e8be7a3"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Card: "Card",
  PersonalInfo: "PersonalInfo",
  socialLinks: "socialLinks",
  cardScan: "cardScan",
  Contact: "Contact",
  VisitorContactShare: "VisitorContactShare"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  phoneNumber: "phoneNumber",
  phoneNumberVerified: "phoneNumberVerified"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CardScalarFieldEnum = {
  id: "id",
  userId: "userId",
  cardTitle: "cardTitle",
  cardColor: "cardColor",
  logo: "logo",
  profile: "profile",
  cover: "cover",
  imagesAndLayouts: "imagesAndLayouts",
  isFavorite: "isFavorite",
  qrCode: "qrCode",
  qrImage: "qrImage",
  setting: "setting",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var PersonalInfoScalarFieldEnum = {
  id: "id",
  cardId: "cardId",
  firstName: "firstName",
  lastName: "lastName",
  jobTitle: "jobTitle",
  phoneNumber: "phoneNumber",
  email: "email",
  company: "company",
  image: "image",
  logo: "logo",
  note: "note",
  banner: "banner",
  profile_img: "profile_img",
  middleName: "middleName",
  prefix: "prefix",
  suffix: "suffix",
  pronoun: "pronoun",
  preferred: "preferred",
  maidenName: "maidenName"
};
var SocialLinksScalarFieldEnum = {
  id: "id",
  cardId: "cardId",
  links: "links"
};
var CardScanScalarFieldEnum = {
  id: "id",
  cardId: "cardId",
  ip: "ip",
  userAgent: "userAgent",
  source: "source",
  latitude: "latitude",
  longitude: "longitude",
  city: "city",
  country: "country",
  street: "street",
  streetNumber: "streetNumber",
  district: "district",
  region: "region",
  subregion: "subregion",
  postalCode: "postalCode",
  addressName: "addressName",
  formattedAddress: "formattedAddress",
  isoCountryCode: "isoCountryCode",
  banner: "banner",
  profile_img: "profile_img",
  createdAt: "createdAt"
};
var ContactScalarFieldEnum = {
  id: "id",
  userId: "userId",
  cardId: "cardId",
  firstName: "firstName",
  lastName: "lastName",
  phone: "phone",
  email: "email",
  company: "company",
  jobTitle: "jobTitle",
  image: "image",
  logo: "logo",
  banner: "banner",
  note: "note",
  profile_img: "profile_img",
  latitude: "latitude",
  longitude: "longitude",
  city: "city",
  country: "country",
  street: "street",
  streetNumber: "streetNumber",
  district: "district",
  region: "region",
  subregion: "subregion",
  postalCode: "postalCode",
  addressName: "addressName",
  formattedAddress: "formattedAddress",
  isoCountryCode: "isoCountryCode",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VisitorContactShareScalarFieldEnum = {
  id: "id",
  ownerCardId: "ownerCardId",
  visitorCardId: "visitorCardId",
  ownerId: "ownerId",
  visitorId: "visitorId",
  status: "status",
  latitude: "latitude",
  longitude: "longitude",
  city: "city",
  country: "country",
  street: "street",
  streetNumber: "streetNumber",
  district: "district",
  region: "region",
  subregion: "subregion",
  postalCode: "postalCode",
  addressName: "addressName",
  formattedAddress: "formattedAddress",
  isoCountryCode: "isoCountryCode",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
var PrismaClient = getPrismaClientClass();

// src/lib/logger.ts
import pino from "pino";
var isDevelopment = process.env.NODE_ENV !== "production";
var loggerConfig = {
  // Log level: 'debug' | 'info' | 'warn' | 'error'
  // Can be overridden with LOG_LEVEL environment variable
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  // Base logger configuration
  base: {
    env: process.env.NODE_ENV
  },
  // Formatters
  formatters: {
    level: (label) => {
      return { level: label };
    }
  },
  // Serializers for errors, requests, responses
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  }
};
if (isDevelopment) {
  loggerConfig.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
      singleLine: false,
      messageFormat: "{msg}",
      errorLikeObjectKeys: ["err", "error"]
    }
  };
}
var pinoLogger = pino(loggerConfig);
var Logger = class {
  info(message, data) {
    if (data && typeof data === "object") {
      pinoLogger.info(data, message);
    } else if (data) {
      pinoLogger.info({ data }, message);
    } else {
      pinoLogger.info(message);
    }
  }
  warn(message, data) {
    if (data && typeof data === "object") {
      pinoLogger.warn(data, message);
    } else if (data) {
      pinoLogger.warn({ data }, message);
    } else {
      pinoLogger.warn(message);
    }
  }
  error(message, error, data) {
    if (error instanceof Error) {
      if (data && typeof data === "object") {
        pinoLogger.error({ err: error, ...data }, message);
      } else if (data) {
        pinoLogger.error({ err: error, data }, message);
      } else {
        pinoLogger.error({ err: error }, message);
      }
    } else if (error) {
      if (data && typeof data === "object") {
        pinoLogger.error({ ...error, ...data }, message);
      } else if (data) {
        pinoLogger.error({ ...error, data }, message);
      } else {
        pinoLogger.error(error, message);
      }
    } else {
      if (data && typeof data === "object") {
        pinoLogger.error(data, message);
      } else if (data) {
        pinoLogger.error({ data }, message);
      } else {
        pinoLogger.error(message);
      }
    }
  }
  debug(message, data) {
    if (isDevelopment) {
      if (data && typeof data === "object") {
        pinoLogger.debug(data, message);
      } else if (data) {
        pinoLogger.debug({ data }, message);
      } else {
        pinoLogger.debug(message);
      }
    }
  }
};
var logger = new Logger();

// src/lib/prisma.ts
var connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  const error = new Error(
    "DATABASE_URL environment variable is not set. Please ensure DATABASE_URL is configured in your environment variables."
  );
  logger.error("Prisma initialization error", error);
  throw error;
}
var adapter;
var prisma;
try {
  adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });
} catch (error) {
  logger.error("Failed to initialize Prisma client", error);
  throw new Error(
    `Prisma client initialization failed: ${error instanceof Error ? error.message : String(error)}`
  );
}

// src/lib/auth.ts
import { phoneNumber } from "better-auth/plugins";

// src/lib/twilio.ts
import twilio from "twilio";

// src/lib/otpRateLimiter.ts
var rateLimitStore = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1e3);

// src/lib/twilio.ts
var getTwilioStatus = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber2 = process.env.TWILIO_PHONE_NUMBER;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  return {
    configured: !!(accountSid && authToken && phoneNumber2),
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
    hasPhoneNumber: !!phoneNumber2,
    hasVerifyServiceSid: !!verifyServiceSid,
    phoneNumber: phoneNumber2 || "Not set",
    verifyServiceSid: verifyServiceSid || "Not set"
  };
};
var getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    logger.warn("Twilio credentials not found. SMS will not be sent.", {
      missing: {
        accountSid: !accountSid ? "TWILIO_ACCOUNT_SID" : null,
        authToken: !authToken ? "TWILIO_AUTH_TOKEN" : null
      }
    });
    return null;
  }
  return twilio(accountSid, authToken);
};
var formatBangladeshPhoneNumber = (phone) => {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.startsWith("880")) {
    return "+" + cleaned;
  } else if (cleaned.startsWith("1") && cleaned.length === 10) {
    return "+880" + cleaned;
  } else if (cleaned.startsWith("+880")) {
    return cleaned;
  }
  if (cleaned.length === 10 && cleaned.startsWith("1")) {
    return "+880" + cleaned;
  }
  return cleaned;
};
var formatUSAPhoneNumber = (phone) => {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("1") && cleaned.length === 11) {
    return "+" + cleaned;
  } else if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
    return "+1" + cleaned;
  } else if (cleaned.startsWith("+1")) {
    return cleaned;
  }
  return cleaned;
};
var formatPhoneNumber = (phone) => {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("+880")) {
    return formatBangladeshPhoneNumber(cleaned);
  }
  if (cleaned.startsWith("+1")) {
    return formatUSAPhoneNumber(cleaned);
  }
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return formatBangladeshPhoneNumber(cleaned);
  }
  if (cleaned.startsWith("880") && cleaned.length === 13) {
    return formatBangladeshPhoneNumber(cleaned);
  }
  if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
    return formatUSAPhoneNumber(cleaned);
  }
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return formatUSAPhoneNumber(cleaned);
  }
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  return "+" + cleaned;
};
var VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID || "VAc66c779f03a7c204d05b7a429787deec";
var sendOTPViaWhatsApp = async (phoneNumber2, otpCode, options) => {
  const whatsappFromNumber = options?.from || process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+15558678965";
  const contentSid = options?.contentSid || process.env.TWILIO_WHATSAPP_OTP_CONTENT_SID || "HX9e03d7b01e72c48bb5c29161d3efc107";
  try {
    const client = getTwilioClient();
    if (!client) {
      logger.warn("Twilio client not initialized. WhatsApp OTP not sent.");
      return { success: false, errorMessage: "Twilio client not initialized" };
    }
    const formattedPhone = formatPhoneNumber(phoneNumber2);
    const whatsappTo = formattedPhone.startsWith("whatsapp:") ? formattedPhone : `whatsapp:${formattedPhone}`;
    logger.info("Sending OTP via WhatsApp", {
      to: whatsappTo,
      contentSid,
      otpCodeLength: otpCode.length
    });
    const messageParams = {
      from: whatsappFromNumber,
      to: whatsappTo,
      contentSid,
      contentVariables: JSON.stringify({
        "1": otpCode
        // OTP code as variable
      })
    };
    const result = await client.messages.create(messageParams);
    logger.info("OTP sent successfully via WhatsApp", {
      sid: result.sid,
      to: whatsappTo,
      status: result.status,
      contentSid
    });
    return {
      success: true,
      messageSid: result.sid,
      status: result.status
    };
  } catch (error) {
    logger.error("Error sending OTP via WhatsApp", error, {
      phoneNumber: phoneNumber2,
      errorCode: error.code,
      errorMessage: error.message
    });
    return {
      success: false,
      errorCode: error.code,
      errorMessage: error.message
    };
  }
};

// src/lib/auth.ts
var ESSENTIAL_WEB_ORIGINS = [
  "http://localhost:8081",
  // Expo dev server (web)
  "https://salonx--wtbnn1wdao.expo.app"
  // EAS web deploy
];
var getTrustedOrigins = () => {
  const envOrigins = process.env.AUTH_TRUSTED_ORIGINS;
  let origins = [];
  if (envOrigins) {
    origins = envOrigins.includes(",") ? envOrigins.split(",").map((origin) => origin.trim()) : [envOrigins.trim()];
  } else {
    origins = [
      "http://localhost:3000",
      "http://localhost:3004",
      "http://localhost:8081",
      // Expo dev server (web)
      "http://127.0.0.1:3004",
      "http://10.26.38.18:3004",
      // Mobile app origin (update IP if it changes)
      "https://contactx.xsalonx.com",
      // Production domain - mobile apps use this as origin
      "https://salonx--wtbnn1wdao.expo.app",
      // EAS web deploy
      process.env.BETTER_AUTH_URL,
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
    ].filter(Boolean);
  }
  for (const origin of ESSENTIAL_WEB_ORIGINS) {
    if (origin && !origins.includes(origin)) {
      origins.push(origin);
    }
  }
  logger.info("Better Auth Trusted Origins", { origins });
  return origins;
};
var trustedOriginsList = getTrustedOrigins();
var getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.CLOUDFLARE_TUNNEL_URL) {
    return process.env.CLOUDFLARE_TUNNEL_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://contactx.xsalonx.com";
  }
  return "https://hwy-editorial-updates-talked.trycloudflare.com";
};
var auth;
try {
  const baseURL = getBaseURL();
  logger.info("Better Auth Base URL", { baseURL });
  const twilioStatus = getTwilioStatus();
  if (twilioStatus.configured) {
    logger.info("Twilio is configured and ready", {
      note: "Better Auth generates OTP \u2192 WhatsApp only. Verification by Better Auth only."
    });
  } else {
    logger.warn("Twilio is not fully configured", {
      hasAccountSid: twilioStatus.hasAccountSid,
      hasAuthToken: twilioStatus.hasAuthToken,
      hasPhoneNumber: twilioStatus.hasPhoneNumber,
      note: "OTP codes will be logged to console instead of sent via WhatsApp"
    });
  }
  auth = betterAuth({
    trustedOrigins: trustedOriginsList,
    baseURL,
    database: prismaAdapter(prisma, {
      provider: "postgresql"
    }),
    plugins: [
      phoneNumber({
        sendOTP: async ({ phoneNumber: phoneNumber2, code }, ctx) => {
          const bypassCode = process.env.OTP_BYPASS_CODE;
          if (bypassCode) {
            logger.info("OTP bypass mode - skip Twilio. Use code for testing", {
              phoneNumber: phoneNumber2,
              bypassCode,
              note: "Set OTP_BYPASS_CODE in env for testing without Twilio"
            });
            return;
          }
          logger.info("Sending OTP (Better Auth generated) via WhatsApp only", { phoneNumber: phoneNumber2 });
          logger.debug("Better Auth OTP code", { codeLength: code?.length });
          const whatsappResult = await sendOTPViaWhatsApp(phoneNumber2, code);
          if (whatsappResult.success) {
            logger.info("OTP sent successfully via WhatsApp (Better Auth code)", {
              phoneNumber: phoneNumber2,
              messageSid: whatsappResult.messageSid,
              note: "Better Auth generated code sent via WhatsApp"
            });
          } else {
            logger.error("Failed to send OTP via WhatsApp", {
              phoneNumber: phoneNumber2,
              whatsappError: whatsappResult.errorMessage,
              code
            });
            throw new Error(whatsappResult.errorMessage || "Failed to send OTP via WhatsApp");
          }
        },
        // Only override verifyOTP when OTP_BYPASS_CODE is set - otherwise Better Auth uses default
        ...process.env.OTP_BYPASS_CODE && {
          verifyOTP: async ({ phoneNumber: phoneNumber2, code }) => {
            if (code?.trim() === process.env.OTP_BYPASS_CODE) {
              logger.info("OTP bypass accepted", { phoneNumber: phoneNumber2 });
              return true;
            }
            return false;
          }
        },
        signUpOnVerification: {
          getTempEmail: (phone) => `${phone}@temp.yoursite.com`,
          getTempName: (phone) => `User_${phone}`
        }
      })
    ]
  });
} catch (error) {
  logger.error("Failed to initialize Better Auth", error);
  throw new Error(
    `Better Auth initialization failed: ${error instanceof Error ? error.message : String(error)}. Please check your DATABASE_URL and BETTER_AUTH_SECRET environment variables.`
  );
}

// src/middleware/requireAuth.ts
import { fromNodeHeaders } from "better-auth/node";
async function requireAuth(req, res, next) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = session.user;
  req.session = session.session;
  next();
}

// src/modules/cards/card.routes.ts
import { Router } from "express";

// src/lib/qr.ts
import QRCode from "qrcode";

// src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
var env = process.env.NODE_ENV || "development";
if (env !== "production") {
  dotenv.config({
    path: path.join(process.cwd(), `.env.${env}`)
  });
}
var config2 = {
  env,
  port: process.env.PORT || "3004",
  authOrigin: process.env.AUTH_TRUSTED_ORIGINS || "",
  databaseUrl: process.env.DATABASE_URL || "",
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
  betterAuthUrl: process.env.BETTER_AUTH_URL || "",
  cloudinaryCloudName: process.env.CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUD_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUD_API_SECRET || ""
};

// src/lib/cloudinary.ts
cloudinary.config({
  cloud_name: config2.cloudinaryCloudName,
  api_key: config2.cloudinaryApiKey,
  api_secret: config2.cloudinaryApiSecret
});

// src/lib/qr.ts
var generateQRCode = async (cardId) => {
  const publicUrl = `${config2.authOrigin}/card/${cardId}`;
  const qrBase64 = await QRCode.toDataURL(publicUrl, {
    width: 300,
    margin: 2
  });
  const uploaded = await cloudinary.uploader.upload(qrBase64, {
    folder: "contactx/qr",
    public_id: cardId,
    overwrite: true
  });
  return {
    qrCode: publicUrl,
    qrImage: uploaded.secure_url
  };
};

// src/modules/cards/card.services.ts
var createCard = async (userId, cardTitle, cardColor, logo, profile, cover, imagesAndLayouts, isFavorite, personalInfo, socialLinks) => {
  if (!userId) throw new Error("userId is required");
  if (personalInfo && !personalInfo.phoneNumber) {
    throw new Error("phoneNumber is required in personalInfo");
  }
  const card = await prisma.card.create({
    data: {
      userId,
      cardTitle: cardTitle ?? "ConactX",
      cardColor: cardColor ?? "black",
      logo: logo ?? null,
      profile: profile ?? null,
      cover: cover ?? null,
      qrCode: null,
      qrImage: null,
      imagesAndLayouts,
      isFavorite: isFavorite ?? false,
      ...personalInfo && {
        personalInfo: {
          create: {
            firstName: personalInfo.firstName ?? null,
            lastName: personalInfo.lastName ?? null,
            jobTitle: personalInfo.jobTitle ?? null,
            phoneNumber: personalInfo.phoneNumber,
            email: personalInfo.email ?? null,
            company: personalInfo.company ?? null,
            image: personalInfo.image ?? null,
            logo: personalInfo.logo ?? null,
            note: personalInfo.note ?? null,
            banner: personalInfo.banner ?? null,
            profile_img: personalInfo.profile_img ?? null,
            middleName: personalInfo.middleName ?? null,
            prefix: personalInfo.prefix ?? null,
            suffix: personalInfo.suffix ?? null,
            pronoun: personalInfo.pronoun ?? null,
            preferred: personalInfo.preferred ?? null,
            maidenName: personalInfo.maidenName ?? null
          }
        }
      },
      ...socialLinks && socialLinks.length > 0 ? { socialLinks: { create: { links: socialLinks.slice(0, 5) } } } : {}
    }
  });
  const { qrCode, qrImage } = await generateQRCode(card.id);
  const updatedCard = await prisma.card.update({
    where: { id: card.id },
    data: { qrCode, qrImage },
    include: {
      personalInfo: true,
      socialLinks: true
    }
  });
  return updatedCard;
};
var getAllCard = async (userId) => {
  if (!userId) {
    throw new Error("userId is required");
  }
  try {
    logger.debug("Fetching cards for userId", { userId });
    const cards = await prisma.card.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc"
      }
    });
    logger.debug("Found cards (basic)", { count: cards.length });
    if (!cards || cards.length === 0) {
      logger.debug("No cards found for userId", { userId });
      return [];
    }
    const cardsWithRelations = await Promise.all(
      cards.map(async (card) => {
        const result = { ...card };
        try {
          const personalInfo = await prisma.personalInfo.findUnique({
            where: { cardId: card.id }
          });
          result.personalInfo = personalInfo;
        } catch (e) {
          logger.warn(`personalInfo fetch failed for card`, e, { cardId: card.id });
          result.personalInfo = null;
        }
        try {
          const socialLinks = await prisma.socialLinks.findUnique({
            where: { cardId: card.id }
          });
          result.socialLinks = socialLinks;
        } catch (e) {
          logger.warn(`socialLinks fetch failed for card`, e, { cardId: card.id });
          result.socialLinks = null;
        }
        return result;
      })
    );
    logger.debug("Cards with relations", { count: cardsWithRelations.length });
    if (cardsWithRelations.length > 0) {
      logger.debug("Card IDs", { cardIds: cardsWithRelations.map((c) => c.id) });
    }
    return cardsWithRelations;
  } catch (error) {
    logger.error("Error fetching cards", error, {
      userId
    });
    if (error.message?.includes("column") || error.message?.includes("does not exist") || error.message?.includes("(not available)") || error.code === "P2001") {
      return [];
    }
    throw error;
  }
};
var updateCard = async (cardId, userId, payload) => {
  if (!cardId || !userId) {
    throw new Error("cardId and userId are required");
  }
  const existing = await prisma.card.findFirst({
    where: { id: cardId, userId }
  });
  if (!existing) {
    throw new Error("Card not found or unauthorized");
  }
  const existingPersonalInfo = await prisma.personalInfo.findUnique({
    where: { cardId }
  });
  if (payload.personalInfo && !existingPersonalInfo && !payload.personalInfo.phoneNumber) {
    throw new Error("phoneNumber is required when creating personalInfo");
  }
  const updated = await prisma.card.update({
    where: { id: cardId },
    data: {
      ...payload.cardTitle && { cardTitle: payload.cardTitle },
      ...payload.cardColor && { cardColor: payload.cardColor },
      ...payload.logo !== void 0 && { logo: payload.logo },
      ...payload.profile !== void 0 && { profile: payload.profile },
      ...payload.cover !== void 0 && { cover: payload.cover },
      ...payload.imagesAndLayouts !== void 0 && {
        imagesAndLayouts: payload.imagesAndLayouts
      },
      ...payload.isFavorite !== void 0 && {
        isFavorite: payload.isFavorite
      },
      ...payload.personalInfo && {
        personalInfo: {
          upsert: {
            create: {
              firstName: payload.personalInfo.firstName ?? null,
              lastName: payload.personalInfo.lastName ?? null,
              jobTitle: payload.personalInfo.jobTitle ?? null,
              phoneNumber: payload.personalInfo.phoneNumber,
              // Already validated above
              email: payload.personalInfo.email ?? null,
              company: payload.personalInfo.company ?? null,
              image: payload.personalInfo.image ?? null,
              logo: payload.personalInfo.logo ?? null,
              note: payload.personalInfo.note ?? null,
              banner: payload.personalInfo.banner ?? null,
              profile_img: payload.personalInfo.profile_img ?? null,
              middleName: payload.personalInfo.middleName ?? null,
              prefix: payload.personalInfo.prefix ?? null,
              suffix: payload.personalInfo.suffix ?? null,
              pronoun: payload.personalInfo.pronoun ?? null,
              preferred: payload.personalInfo.preferred ?? null,
              maidenName: payload.personalInfo.maidenName ?? null
            },
            update: {
              ...payload.personalInfo.firstName !== void 0 && { firstName: payload.personalInfo.firstName },
              ...payload.personalInfo.lastName !== void 0 && { lastName: payload.personalInfo.lastName },
              ...payload.personalInfo.jobTitle !== void 0 && { jobTitle: payload.personalInfo.jobTitle },
              ...payload.personalInfo.phoneNumber !== void 0 && { phoneNumber: payload.personalInfo.phoneNumber },
              ...payload.personalInfo.email !== void 0 && { email: payload.personalInfo.email },
              ...payload.personalInfo.company !== void 0 && { company: payload.personalInfo.company },
              ...payload.personalInfo.image !== void 0 && { image: payload.personalInfo.image },
              ...payload.personalInfo.logo !== void 0 && { logo: payload.personalInfo.logo },
              ...payload.personalInfo.note !== void 0 && { note: payload.personalInfo.note },
              ...payload.personalInfo.banner !== void 0 && { banner: payload.personalInfo.banner },
              ...payload.personalInfo.profile_img !== void 0 && { profile_img: payload.personalInfo.profile_img },
              ...payload.personalInfo.middleName !== void 0 && { middleName: payload.personalInfo.middleName },
              ...payload.personalInfo.prefix !== void 0 && { prefix: payload.personalInfo.prefix },
              ...payload.personalInfo.suffix !== void 0 && { suffix: payload.personalInfo.suffix },
              ...payload.personalInfo.pronoun !== void 0 && { pronoun: payload.personalInfo.pronoun },
              ...payload.personalInfo.preferred !== void 0 && { preferred: payload.personalInfo.preferred },
              ...payload.personalInfo.maidenName !== void 0 && { maidenName: payload.personalInfo.maidenName }
            }
          }
        }
      },
      ...payload.socialLinks && {
        socialLinks: {
          upsert: {
            create: {
              links: payload.socialLinks.slice(0, 5)
            },
            update: {
              links: payload.socialLinks.slice(0, 5)
            }
          }
        }
      }
    },
    include: {
      personalInfo: true,
      socialLinks: true
    }
  });
  return updated;
};
var getCardById = async (cardId, userId) => {
  const card = await prisma.card.findFirst({
    where: { id: cardId, userId },
    include: {
      personalInfo: true,
      socialLinks: true
    }
  });
  if (!card) {
    throw new Error("Card not found or unauthorized");
  }
  return card;
};
var deleteCard = async (cardId, userId) => {
  if (!cardId || !userId) {
    throw new Error("cardId and userId are required");
  }
  const existing = await prisma.card.findFirst({
    where: { id: cardId, userId }
  });
  if (!existing) {
    throw new Error("Card not found or unauthorized");
  }
  await prisma.card.delete({
    where: { id: cardId }
  });
  return true;
};
var cardServices = {
  createCard,
  getAllCard,
  updateCard,
  deleteCard,
  getCardById
};

// src/lib/upload.ts
import { v2 as cloudinary2 } from "cloudinary";
var uploadImageToCloudinary = async (file, folder = "contactx/cards", publicId) => {
  try {
    const uploadOptions = {
      folder,
      resource_type: "image",
      overwrite: true
    };
    if (publicId) {
      uploadOptions.public_id = publicId;
    }
    let uploadResult;
    if (typeof file === "string") {
      uploadResult = await cloudinary2.uploader.upload(file, uploadOptions);
    } else {
      const base64 = file.toString("base64");
      const dataUri = `data:image/jpeg;base64,${base64}`;
      uploadResult = await cloudinary2.uploader.upload(dataUri, uploadOptions);
    }
    return uploadResult.secure_url;
  } catch (error) {
    console.error("\u274C Cloudinary upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};
var deleteImageFromCloudinary = async (publicId) => {
  try {
    let extractedPublicId = publicId;
    if (publicId.includes("cloudinary.com")) {
      const urlParts = publicId.split("/");
      const filename = urlParts[urlParts.length - 1];
      if (filename) {
        const nameWithoutExt = filename.split(".")[0];
        extractedPublicId = nameWithoutExt || publicId;
        const folderIndex = urlParts.findIndex((part) => part === "upload");
        if (folderIndex !== -1 && folderIndex + 2 < urlParts.length) {
          const folderParts = urlParts.slice(folderIndex + 2, -1);
          if (folderParts.length > 0 && nameWithoutExt) {
            extractedPublicId = `${folderParts.join("/")}/${nameWithoutExt}`;
          }
        }
      }
    }
    await cloudinary2.uploader.destroy(extractedPublicId);
  } catch (error) {
    console.error("\u274C Cloudinary delete error:", error);
  }
};

// src/modules/cards/card.controller.ts
var handleFileUpload = async (file, folder) => {
  if (!file) return null;
  try {
    const url = await uploadImageToCloudinary(file.buffer, folder);
    return url;
  } catch (error) {
    logger.error(`Failed to upload ${folder}`, error);
    throw new Error(`Failed to upload ${folder}: ${error.message}`);
  }
};
var createCard2 = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.user.id;
    const files = req.files;
    let logo = null;
    let profile = null;
    let cover = null;
    if (files) {
      logo = await handleFileUpload(files["logo"]?.[0], "contactx/cards/logos");
      profile = await handleFileUpload(files["profile"]?.[0], "contactx/cards/profiles");
      cover = await handleFileUpload(files["cover"]?.[0], "contactx/cards/covers");
    }
    const {
      cardTitle,
      cardColor,
      logo: logoUrl,
      // Can be URL or base64
      profile: profileUrl,
      cover: coverUrl,
      imagesAndLayouts,
      isFavorite,
      personalInfo,
      socialLinks
    } = req.body;
    let finalLogo = logo;
    let finalProfile = profile;
    let finalCover = cover;
    if (!finalLogo && logoUrl) {
      if (logoUrl.startsWith("data:image") || logoUrl.startsWith("http") && !logoUrl.includes("cloudinary.com")) {
        finalLogo = await uploadImageToCloudinary(logoUrl, "contactx/cards/logos");
      } else {
        finalLogo = logoUrl;
      }
    }
    if (!finalProfile && profileUrl) {
      if (profileUrl.startsWith("data:image") || profileUrl.startsWith("http") && !profileUrl.includes("cloudinary.com")) {
        finalProfile = await uploadImageToCloudinary(profileUrl, "contactx/cards/profiles");
      } else {
        finalProfile = profileUrl;
      }
    }
    if (!finalCover && coverUrl) {
      if (coverUrl.startsWith("data:image") || coverUrl.startsWith("http") && !coverUrl.includes("cloudinary.com")) {
        finalCover = await uploadImageToCloudinary(coverUrl, "contactx/cards/covers");
      } else {
        finalCover = coverUrl;
      }
    }
    let personalInfoWithImages = personalInfo;
    if (personalInfo && files) {
      const personalFiles = files;
      personalInfoWithImages = { ...personalInfo };
      if (personalFiles["image"]?.[0]) {
        personalInfoWithImages.image = await handleFileUpload(
          personalFiles["image"][0],
          "contactx/personal-info/images"
        );
      }
      if (personalFiles["logo"]?.[0]) {
        personalInfoWithImages.logo = await handleFileUpload(
          personalFiles["logo"][0],
          "contactx/personal-info/logos"
        );
      }
      if (personalFiles["banner"]?.[0]) {
        personalInfoWithImages.banner = await handleFileUpload(
          personalFiles["banner"][0],
          "contactx/personal-info/banners"
        );
      }
      if (personalFiles["profile_img"]?.[0]) {
        personalInfoWithImages.profile_img = await handleFileUpload(
          personalFiles["profile_img"][0],
          "contactx/personal-info/profiles"
        );
      }
    }
    if (personalInfoWithImages) {
      if (personalInfoWithImages.image && personalInfoWithImages.image.startsWith("data:image")) {
        personalInfoWithImages.image = await uploadImageToCloudinary(
          personalInfoWithImages.image,
          "contactx/personal-info/images"
        );
      }
      if (personalInfoWithImages.logo && personalInfoWithImages.logo.startsWith("data:image")) {
        personalInfoWithImages.logo = await uploadImageToCloudinary(
          personalInfoWithImages.logo,
          "contactx/personal-info/logos"
        );
      }
      if (personalInfoWithImages.banner && personalInfoWithImages.banner.startsWith("data:image")) {
        personalInfoWithImages.banner = await uploadImageToCloudinary(
          personalInfoWithImages.banner,
          "contactx/personal-info/banners"
        );
      }
      if (personalInfoWithImages.profile_img && personalInfoWithImages.profile_img.startsWith("data:image")) {
        personalInfoWithImages.profile_img = await uploadImageToCloudinary(
          personalInfoWithImages.profile_img,
          "contactx/personal-info/profiles"
        );
      }
    }
    const socialLinksArray = socialLinks?.links || (Array.isArray(socialLinks) ? socialLinks : void 0);
    const result = await cardServices.createCard(
      userId,
      cardTitle,
      cardColor,
      finalLogo || void 0,
      finalProfile || void 0,
      finalCover || void 0,
      imagesAndLayouts,
      isFavorite,
      personalInfoWithImages,
      socialLinksArray
    );
    res.status(201).json({
      success: true,
      message: "Card created successfully",
      data: result
    });
  } catch (error) {
    logger.error("Create card error", error);
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message || "Something went wrong"
      });
    }
    next(error);
  }
};
var getAllCard2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    logger.debug("getAllCard called", { userId, user: req.user });
    if (!userId) {
      logger.warn("No userId found in request");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const result = await cardServices.getAllCard(userId);
    logger.debug("getAllCard result", { count: result.length });
    res.status(200).json({
      success: true,
      message: "Card details",
      data: result
    });
  } catch (error) {
    logger.error("Error in getAllCard controller", error, {
      userId: req.user?.id
    });
    res.status(200).json({ success: true, data: [] });
  }
};
var updateCard2 = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { id } = req.params;
    const files = req.files;
    let cardToUpdate;
    try {
      cardToUpdate = await cardServices.getCardById(id, req.user.id);
    } catch (error) {
    }
    let logo = void 0;
    let profile = void 0;
    let cover = void 0;
    if (files) {
      if (files["logo"]?.[0]) {
        if (cardToUpdate?.logo) {
          await deleteImageFromCloudinary(cardToUpdate.logo);
        }
        logo = await handleFileUpload(files["logo"][0], "contactx/cards/logos");
      }
      if (files["profile"]?.[0]) {
        if (cardToUpdate?.profile) {
          await deleteImageFromCloudinary(cardToUpdate.profile);
        }
        profile = await handleFileUpload(files["profile"][0], "contactx/cards/profiles");
      }
      if (files["cover"]?.[0]) {
        if (cardToUpdate?.cover) {
          await deleteImageFromCloudinary(cardToUpdate.cover);
        }
        cover = await handleFileUpload(files["cover"][0], "contactx/cards/covers");
      }
    }
    const payload = { ...req.body };
    if (!logo && payload.logo !== void 0) {
      if (payload.logo === null || payload.logo === "") {
        if (cardToUpdate?.logo) {
          await deleteImageFromCloudinary(cardToUpdate.logo);
        }
        logo = null;
      } else if (payload.logo.startsWith("data:image")) {
        if (cardToUpdate?.logo) {
          await deleteImageFromCloudinary(cardToUpdate.logo);
        }
        logo = await uploadImageToCloudinary(payload.logo, "contactx/cards/logos");
      } else if (payload.logo.startsWith("http") && !payload.logo.includes("cloudinary.com")) {
        if (cardToUpdate?.logo) {
          await deleteImageFromCloudinary(cardToUpdate.logo);
        }
        logo = await uploadImageToCloudinary(payload.logo, "contactx/cards/logos");
      } else {
        logo = payload.logo;
      }
    }
    if (!profile && payload.profile !== void 0) {
      if (payload.profile === null || payload.profile === "") {
        if (cardToUpdate?.profile) {
          await deleteImageFromCloudinary(cardToUpdate.profile);
        }
        profile = null;
      } else if (payload.profile.startsWith("data:image")) {
        if (cardToUpdate?.profile) {
          await deleteImageFromCloudinary(cardToUpdate.profile);
        }
        profile = await uploadImageToCloudinary(payload.profile, "contactx/cards/profiles");
      } else if (payload.profile.startsWith("http") && !payload.profile.includes("cloudinary.com")) {
        if (cardToUpdate?.profile) {
          await deleteImageFromCloudinary(cardToUpdate.profile);
        }
        profile = await uploadImageToCloudinary(payload.profile, "contactx/cards/profiles");
      } else {
        profile = payload.profile;
      }
    }
    if (!cover && payload.cover !== void 0) {
      if (payload.cover === null || payload.cover === "") {
        if (cardToUpdate?.cover) {
          await deleteImageFromCloudinary(cardToUpdate.cover);
        }
        cover = null;
      } else if (payload.cover.startsWith("data:image")) {
        if (cardToUpdate?.cover) {
          await deleteImageFromCloudinary(cardToUpdate.cover);
        }
        cover = await uploadImageToCloudinary(payload.cover, "contactx/cards/covers");
      } else if (payload.cover.startsWith("http") && !payload.cover.includes("cloudinary.com")) {
        if (cardToUpdate?.cover) {
          await deleteImageFromCloudinary(cardToUpdate.cover);
        }
        cover = await uploadImageToCloudinary(payload.cover, "contactx/cards/covers");
      } else {
        cover = payload.cover;
      }
    }
    if (logo !== void 0) payload.logo = logo;
    if (profile !== void 0) payload.profile = profile;
    if (cover !== void 0) payload.cover = cover;
    if (payload.personalInfo && files) {
      const personalFiles = files;
      const existingPersonalInfo = cardToUpdate?.personalInfo;
      if (personalFiles["image"]?.[0]) {
        if (existingPersonalInfo?.image) {
          await deleteImageFromCloudinary(existingPersonalInfo.image);
        }
        payload.personalInfo.image = await handleFileUpload(
          personalFiles["image"][0],
          "contactx/personal-info/images"
        );
      }
      if (personalFiles["logo"]?.[0]) {
        if (existingPersonalInfo?.logo) {
          await deleteImageFromCloudinary(existingPersonalInfo.logo);
        }
        payload.personalInfo.logo = await handleFileUpload(
          personalFiles["logo"][0],
          "contactx/personal-info/logos"
        );
      }
      if (personalFiles["banner"]?.[0]) {
        if (existingPersonalInfo?.banner) {
          await deleteImageFromCloudinary(existingPersonalInfo.banner);
        }
        payload.personalInfo.banner = await handleFileUpload(
          personalFiles["banner"][0],
          "contactx/personal-info/banners"
        );
      }
      if (personalFiles["profile_img"]?.[0]) {
        if (existingPersonalInfo?.profile_img) {
          await deleteImageFromCloudinary(existingPersonalInfo.profile_img);
        }
        payload.personalInfo.profile_img = await handleFileUpload(
          personalFiles["profile_img"][0],
          "contactx/personal-info/profiles"
        );
      }
    }
    if (payload.personalInfo) {
      const existingPersonalInfo = cardToUpdate?.personalInfo;
      if (payload.personalInfo.image) {
        if (payload.personalInfo.image.startsWith("data:image")) {
          if (existingPersonalInfo?.image) {
            await deleteImageFromCloudinary(existingPersonalInfo.image);
          }
          payload.personalInfo.image = await uploadImageToCloudinary(
            payload.personalInfo.image,
            "contactx/personal-info/images"
          );
        } else if (payload.personalInfo.image.startsWith("http") && !payload.personalInfo.image.includes("cloudinary.com")) {
          if (existingPersonalInfo?.image) {
            await deleteImageFromCloudinary(existingPersonalInfo.image);
          }
          payload.personalInfo.image = await uploadImageToCloudinary(
            payload.personalInfo.image,
            "contactx/personal-info/images"
          );
        }
      }
      if (payload.personalInfo.logo) {
        if (payload.personalInfo.logo.startsWith("data:image")) {
          if (existingPersonalInfo?.logo) {
            await deleteImageFromCloudinary(existingPersonalInfo.logo);
          }
          payload.personalInfo.logo = await uploadImageToCloudinary(
            payload.personalInfo.logo,
            "contactx/personal-info/logos"
          );
        } else if (payload.personalInfo.logo.startsWith("http") && !payload.personalInfo.logo.includes("cloudinary.com")) {
          if (existingPersonalInfo?.logo) {
            await deleteImageFromCloudinary(existingPersonalInfo.logo);
          }
          payload.personalInfo.logo = await uploadImageToCloudinary(
            payload.personalInfo.logo,
            "contactx/personal-info/logos"
          );
        }
      }
      if (payload.personalInfo.banner) {
        if (payload.personalInfo.banner.startsWith("data:image")) {
          if (existingPersonalInfo?.banner) {
            await deleteImageFromCloudinary(existingPersonalInfo.banner);
          }
          payload.personalInfo.banner = await uploadImageToCloudinary(
            payload.personalInfo.banner,
            "contactx/personal-info/banners"
          );
        } else if (payload.personalInfo.banner.startsWith("http") && !payload.personalInfo.banner.includes("cloudinary.com")) {
          if (existingPersonalInfo?.banner) {
            await deleteImageFromCloudinary(existingPersonalInfo.banner);
          }
          payload.personalInfo.banner = await uploadImageToCloudinary(
            payload.personalInfo.banner,
            "contactx/personal-info/banners"
          );
        }
      }
      if (payload.personalInfo.profile_img) {
        if (payload.personalInfo.profile_img.startsWith("data:image")) {
          if (existingPersonalInfo?.profile_img) {
            await deleteImageFromCloudinary(existingPersonalInfo.profile_img);
          }
          payload.personalInfo.profile_img = await uploadImageToCloudinary(
            payload.personalInfo.profile_img,
            "contactx/personal-info/profiles"
          );
        } else if (payload.personalInfo.profile_img.startsWith("http") && !payload.personalInfo.profile_img.includes("cloudinary.com")) {
          if (existingPersonalInfo?.profile_img) {
            await deleteImageFromCloudinary(existingPersonalInfo.profile_img);
          }
          payload.personalInfo.profile_img = await uploadImageToCloudinary(
            payload.personalInfo.profile_img,
            "contactx/personal-info/profiles"
          );
        }
      }
    }
    if (payload.socialLinks?.links) {
      payload.socialLinks = payload.socialLinks.links;
    }
    const result = await cardServices.updateCard(id, req.user.id, payload);
    res.status(200).json({
      success: true,
      message: "Card updated successfully",
      data: result
    });
  } catch (error) {
    logger.error("Update card error", error);
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message || "Something went wrong"
      });
    }
    next(error);
  }
};
var deleteCard2 = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { id } = req.params;
    try {
      const cardToDelete = await cardServices.getCardById(id, req.user.id);
      if (cardToDelete) {
        if (cardToDelete.logo) await deleteImageFromCloudinary(cardToDelete.logo);
        if (cardToDelete.profile) await deleteImageFromCloudinary(cardToDelete.profile);
        if (cardToDelete.cover) await deleteImageFromCloudinary(cardToDelete.cover);
        if (cardToDelete.personalInfo) {
          if (cardToDelete.personalInfo.image) await deleteImageFromCloudinary(cardToDelete.personalInfo.image);
          if (cardToDelete.personalInfo.logo) await deleteImageFromCloudinary(cardToDelete.personalInfo.logo);
          if (cardToDelete.personalInfo.banner) await deleteImageFromCloudinary(cardToDelete.personalInfo.banner);
          if (cardToDelete.personalInfo.profile_img) await deleteImageFromCloudinary(cardToDelete.personalInfo.profile_img);
        }
      }
    } catch (error) {
      logger.debug("Card not found for image cleanup, continuing with deletion");
    }
    await cardServices.deleteCard(id, req.user.id);
    res.status(200).json({
      success: true,
      message: "Card deleted successfully"
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message || "Something went wrong"
      });
    }
    next(error);
  }
};
var uploadCardImage = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { image, type } = req.body;
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image is required"
      });
    }
    if (!type || !["logo", "profile", "cover"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be 'logo', 'profile', or 'cover'"
      });
    }
    const folderMap = {
      logo: "contactx/cards/logos",
      profile: "contactx/cards/profiles",
      cover: "contactx/cards/covers"
    };
    const folder = folderMap[type];
    const url = await uploadImageToCloudinary(image, folder);
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url,
      imageUrl: url
      // Also include imageUrl for compatibility
    });
  } catch (error) {
    logger.error("Upload card image error", error);
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to upload image"
      });
    }
    next(error);
  }
};
var cardController = {
  createCard: createCard2,
  getAllCard: getAllCard2,
  updateCard: updateCard2,
  deleteCard: deleteCard2,
  uploadCardImage
};

// src/middleware/upload.ts
import multer from "multer";
var storage = multer.memoryStorage();
var fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};
var upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  }
});
var uploadCardImages = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "profile", maxCount: 1 },
  { name: "logo", maxCount: 1 }
]);
var uploadPersonalInfoImages = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "logo", maxCount: 1 },
  { name: "banner", maxCount: 1 },
  { name: "profile_img", maxCount: 1 }
]);

// src/modules/cards/card.routes.ts
var router = Router();
var uploadAllCardImages = (req, res, next) => {
  uploadCardImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    uploadPersonalInfoImages(req, res, next);
  });
};
router.post("/create", uploadAllCardImages, cardController.createCard);
router.get("/all", cardController.getAllCard);
router.put("/update/:id", uploadAllCardImages, cardController.updateCard);
router.delete("/delete/:id", cardController.deleteCard);
router.post("/upload-image", cardController.uploadCardImage);
var cardRoutes = router;

// src/modules/publicCard/publicCard.routes.ts
import { Router as Router2 } from "express";

// src/modules/publicCard/publicCard.services.ts
var getPublicCard = async (cardId) => {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      personalInfo: true,
      socialLinks: true
    }
  });
  if (!card) throw new Error("Card not found");
  return card;
};
var publicCardServices = {
  getPublicCard
};

// src/modules/publicCard/publicCard.controller.ts
var getPublicCardController = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Card ID is required" });
    }
    const card = await publicCardServices.getPublicCard(id);
    res.status(200).json({
      success: true,
      data: card
    });
  } catch (error) {
    next(error);
  }
};
var publicCardController = {
  getPublicCardController
};

// src/modules/publicCard/publicCard.routes.ts
var router2 = Router2();
router2.get("/:id", publicCardController.getPublicCardController);
var publicCardRoutes = router2;

// src/modules/analytics/scan.routes.ts
import { Router as Router3 } from "express";

// src/lib/ipGeolocation.ts
import axios from "axios";

// src/lib/getClientIP.ts
var getClientIP = (req) => {
  const sources = [
    req.headers["x-forwarded-for"],
    req.headers["x-real-ip"],
    req.ip,
    req.socket.remoteAddress,
    req.connection?.remoteAddress
  ];
  let ip = "";
  for (const source of sources) {
    if (source) {
      const ips = source.split(",").map((i) => i.trim());
      const firstIP = ips[0];
      if (firstIP) {
        ip = firstIP;
        break;
      }
    }
  }
  if (!ip) {
    ip = "unknown";
  }
  return ip;
};
var isLocalIP = (ip) => {
  if (!ip || ip === "unknown") return true;
  return ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.16.") || ip.startsWith("172.17.") || ip.startsWith("172.18.") || ip.startsWith("172.19.") || ip.startsWith("172.20.") || ip.startsWith("172.21.") || ip.startsWith("172.22.") || ip.startsWith("172.23.") || ip.startsWith("172.24.") || ip.startsWith("172.25.") || ip.startsWith("172.26.") || ip.startsWith("172.27.") || ip.startsWith("172.28.") || ip.startsWith("172.29.") || ip.startsWith("172.30.") || ip.startsWith("172.31.");
};

// src/lib/ipGeolocation.ts
var locationCache = /* @__PURE__ */ new Map();
var CACHE_DURATION = 24 * 60 * 60 * 1e3;
var getLocationFromIP = async (ip, req) => {
  try {
    if (!ip || ip === "unknown") {
      console.log("\u26A0\uFE0F Invalid IP, trying to detect from request headers");
      return detectLocationFromRequest(req);
    }
    if (isLocalIP(ip)) {
      console.log("\u{1F3E0} Local IP detected:", ip, "- Trying to detect from request headers");
      const headerLocation = detectLocationFromRequest(req);
      if (headerLocation) {
        return headerLocation;
      }
      return getFallbackLocation();
    }
    const realIP = ip.split(",")[0]?.trim() || ip.trim();
    const cached = locationCache.get(realIP);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("\u2705 Using cached location for IP:", realIP);
      return cached.data;
    }
    try {
      const response = await axios.get(
        `http://ip-api.com/json/${realIP}?fields=status,country,city,lat,lon`,
        {
          timeout: 5e3
          // 5 second timeout
        }
      );
      if (response.data.status === "success") {
        const locationData = {
          latitude: response.data.lat,
          longitude: response.data.lon,
          city: response.data.city || "",
          country: response.data.country || ""
        };
        locationCache.set(realIP, {
          data: locationData,
          timestamp: Date.now()
        });
        console.log("\u2705 Location fetched from API for IP:", realIP, locationData);
        return locationData;
      }
    } catch (apiError) {
      if (apiError.response?.status === 429) {
        console.warn("\u26A0\uFE0F Rate limit exceeded, checking cache...");
        const cached2 = locationCache.get(realIP);
        if (cached2) {
          console.log("\u2705 Returning expired cache due to rate limit");
          return cached2.data;
        }
      }
      console.error("\u274C IP geolocation API error:", apiError.message);
      return getFallbackLocation();
    }
    console.log("\u26A0\uFE0F API returned unsuccessful response, using fallback");
    return getFallbackLocation();
  } catch (error) {
    console.error("\u274C IP geolocation error:", error.message);
    return getFallbackLocation();
  }
};
var detectLocationFromRequest = (req) => {
  if (!req) return null;
  try {
    const timezone = req.headers["x-timezone"] || req.headers["timezone"];
    if (timezone) {
      const location = getLocationFromTimezone(timezone);
      if (location) {
        console.log("\u2705 Location detected from timezone:", timezone, location);
        return location;
      }
    }
    const acceptLanguage = req.headers["accept-language"];
    if (acceptLanguage) {
      const location = getLocationFromLanguage(acceptLanguage);
      if (location) {
        console.log("\u2705 Location detected from language:", acceptLanguage, location);
        return location;
      }
    }
    const city = req.headers["x-city"] || req.headers["city"];
    const country = req.headers["x-country"] || req.headers["country"];
    if (city || country) {
      console.log("\u2705 Location detected from custom headers:", { city, country });
      return {
        latitude: 0,
        // Unknown coordinates
        longitude: 0,
        city: city || "",
        country: country || ""
      };
    }
    return null;
  } catch (error) {
    console.error("Error detecting location from request:", error);
    return null;
  }
};
var getLocationFromTimezone = (timezone) => {
  const timezoneMap = {
    "Asia/Dhaka": { city: "Dhaka", country: "Bangladesh", lat: 23.8103, lon: 90.4125 },
    "Asia/Kolkata": { city: "Mumbai", country: "India", lat: 19.076, lon: 72.8777 },
    "Asia/Karachi": { city: "Karachi", country: "Pakistan", lat: 24.8607, lon: 67.0011 },
    "America/New_York": { city: "New York", country: "United States", lat: 40.7128, lon: -74.006 },
    "America/Los_Angeles": { city: "Los Angeles", country: "United States", lat: 34.0522, lon: -118.2437 },
    "Europe/London": { city: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 }
    // Add more timezones as needed
  };
  const location = timezoneMap[timezone];
  if (location) {
    return {
      latitude: location.lat,
      longitude: location.lon,
      city: location.city,
      country: location.country
    };
  }
  return null;
};
var getLocationFromLanguage = (acceptLanguage) => {
  const match = acceptLanguage.match(/-([A-Z]{2})/i);
  if (!match || !match[1]) return null;
  const countryCode = match[1].toUpperCase();
  const countryMap = {
    "BD": { country: "Bangladesh", city: "Dhaka" },
    "IN": { country: "India", city: "Mumbai" },
    "PK": { country: "Pakistan", city: "Karachi" },
    "US": { country: "United States", city: "New York" },
    "GB": { country: "United Kingdom", city: "London" }
    // Add more countries as needed
  };
  const location = countryMap[countryCode];
  if (location) {
    return {
      latitude: 0,
      // Unknown coordinates, but we have city/country
      longitude: 0,
      city: location.city,
      country: location.country
    };
  }
  return null;
};
var getFallbackLocation = () => {
  const fallback = {
    latitude: 0,
    // Unknown coordinates
    longitude: 0,
    city: "Dhaka",
    country: "Bangladesh"
  };
  if (process.env.DEFAULT_CITY && process.env.DEFAULT_COUNTRY) {
    return {
      latitude: parseFloat(process.env.DEFAULT_LATITUDE || "0"),
      longitude: parseFloat(process.env.DEFAULT_LONGITUDE || "0"),
      city: process.env.DEFAULT_CITY,
      country: process.env.DEFAULT_COUNTRY
    };
  }
  console.log("\u{1F4CD} Using fallback location:", fallback);
  return fallback;
};
setInterval(() => {
  const now = Date.now();
  let cleared = 0;
  for (const [ip, value] of locationCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      locationCache.delete(ip);
      cleared++;
    }
  }
  if (cleared > 0) {
    console.log(`\u{1F9F9} Cleared ${cleared} expired cache entries`);
  }
}, 60 * 60 * 1e3);

// src/modules/analytics/scan.services.ts
var trackScanAndFetchCard = async (cardId, meta) => {
  if (!cardId) throw new Error("cardId is required");
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { personalInfo: true, socialLinks: true }
  });
  if (!card) {
    throw new Error("Card not found");
  }
  let finalMeta = { ...meta };
  if (meta.ip && (!meta.latitude || !meta.city)) {
    console.log("\u{1F50D} Fetching location from IP:", meta.ip);
    const ipLocation = await getLocationFromIP(meta.ip);
    if (ipLocation) {
      console.log("\u2705 Location fetched:", ipLocation);
      finalMeta = {
        ...meta,
        latitude: meta.latitude ?? ipLocation.latitude ?? 0,
        longitude: meta.longitude ?? ipLocation.longitude ?? 0,
        city: meta.city ?? ipLocation.city ?? "",
        country: meta.country ?? ipLocation.country ?? ""
      };
    }
  }
  if (!finalMeta.city && !finalMeta.country) {
    console.log("\u26A0\uFE0F No location data, using fallback");
    const fallback = getFallbackLocation();
    finalMeta.city = finalMeta.city || fallback.city;
    finalMeta.country = finalMeta.country || fallback.country;
  }
  const scanRecord = await prisma.cardScan.create({
    data: {
      cardId: card.id,
      ip: finalMeta.ip ?? null,
      userAgent: finalMeta.userAgent ?? null,
      source: finalMeta.source ?? "qr",
      latitude: finalMeta.latitude ?? null,
      longitude: finalMeta.longitude ?? null,
      city: finalMeta.city ?? null,
      country: finalMeta.country ?? null
    }
  });
  console.log("\u{1F4CA} Scan tracked:", {
    ip: finalMeta.ip,
    city: finalMeta.city,
    country: finalMeta.country
  });
  return {
    ...card,
    scanLocation: {
      latitude: scanRecord.latitude,
      longitude: scanRecord.longitude,
      city: scanRecord.city,
      country: scanRecord.country
    }
  };
};
var scanServices = { trackScanAndFetchCard };

// src/modules/analytics/scan.controller.ts
var trackScanController = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    if (!cardId) return res.status(400).json({ success: false, message: "Card ID is required" });
    const ip = getClientIP(req);
    console.log("\u{1F310} Client IP detected:", ip);
    const meta = {
      ip: ip ?? void 0,
      userAgent: req.headers["user-agent"]?.toString(),
      source: req.query.source === "link" ? "link" : "qr",
      latitude: req.query.latitude ? parseFloat(req.query.latitude) : void 0,
      longitude: req.query.longitude ? parseFloat(req.query.longitude) : void 0,
      city: req.query.city,
      country: req.query.country
    };
    const card = await scanServices.trackScanAndFetchCard(cardId, meta);
    res.status(200).json({
      success: true,
      message: "Scan tracked successfully",
      data: card
    });
  } catch (error) {
    console.error("\u274C Scan controller error:", error);
    next(error);
  }
};
var scanController = { trackScanController };

// src/modules/analytics/scan.routes.ts
var router3 = Router3();
router3.get("/:cardId", scanController.trackScanController);
var scanRoutes = router3;

// src/modules/contacts/contacts.routes.ts
import { Router as Router4 } from "express";

// src/modules/contacts/contacts.services.ts
var normalizeEmail = (email) => {
  if (!email) return "";
  const trimmed = email.trim();
  if (!trimmed) return "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new Error("Invalid email format");
  }
  return trimmed.toLowerCase();
};
var saveContact = async (userId, cardId, data) => {
  if (!userId) throw new Error("Unauthorized");
  if (!cardId) throw new Error("cardId is required");
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { id: true, userId: true }
  });
  if (!card) throw new Error("Card not found");
  let normalizedEmail = "";
  if (data.email !== void 0) {
    try {
      normalizedEmail = normalizeEmail(data.email);
    } catch (error) {
      if (!data.phone) {
        throw error;
      }
      normalizedEmail = "";
    }
  }
  if (!data.phone && !normalizedEmail) throw new Error("Phone or email is required to save contact");
  const existing = await prisma.contact.findFirst({
    where: {
      userId,
      cardId,
      OR: [
        data.phone ? { phone: data.phone } : void 0,
        normalizedEmail ? { email: normalizedEmail } : void 0
      ].filter(Boolean)
    }
  });
  if (existing) return { alreadySaved: true, contact: existing };
  const contact = await prisma.contact.create({
    data: {
      userId,
      // Visitor's user ID
      cardId,
      // Owner's card ID
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      phone: data.phone ?? "",
      email: normalizedEmail,
      company: data.company ?? "",
      jobTitle: data.jobTitle ?? "",
      logo: data.logo ?? "",
      note: data.note ?? "",
      profile_img: data.profile_img ?? "",
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      city: data.city ?? "",
      country: data.country ?? ""
    }
  });
  return { alreadySaved: false, contact };
};
var getAllContacts = async (userId) => {
  if (!userId) throw new Error("userId is required");
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    return contacts || [];
  } catch (error) {
    logger.warn("Error fetching contacts, returning empty array", error);
    return [];
  }
};
var updateContact = async (contactId, userId, data) => {
  const existing = await prisma.contact.findFirst({
    where: { id: contactId, userId }
  });
  if (!existing) throw new Error("Contact not found or unauthorized");
  if (!data || Object.keys(data).length === 0) return existing;
  const updateData = {};
  if (data.firstName !== void 0) updateData.firstName = data.firstName;
  if (data.lastName !== void 0) updateData.lastName = data.lastName;
  if (data.phone !== void 0) updateData.phone = data.phone;
  if (data.email !== void 0) {
    try {
      updateData.email = normalizeEmail(data.email);
    } catch (error) {
      if (!data.email || data.email.trim() === "") {
        updateData.email = "";
      } else {
        throw error;
      }
    }
  }
  if (data.company !== void 0) updateData.company = data.company;
  if (data.jobTitle !== void 0) updateData.jobTitle = data.jobTitle;
  if (data.logo !== void 0) updateData.logo = data.logo;
  if (data.note !== void 0) updateData.note = data.note;
  if (data.profile_img !== void 0) updateData.profile_img = data.profile_img;
  if (data.latitude !== void 0) updateData.latitude = data.latitude;
  if (data.longitude !== void 0) updateData.longitude = data.longitude;
  if (data.city !== void 0) updateData.city = data.city;
  if (data.country !== void 0) updateData.country = data.country;
  return prisma.contact.update({
    where: { id: contactId },
    data: updateData
  });
};
var deleteContact = async (contactId, userId) => {
  if (!contactId) throw new Error("contactId is required");
  if (!userId) throw new Error("Unauthorized");
  const contact = await prisma.contact.findFirst({
    where: { id: contactId, userId },
    select: { id: true }
  });
  if (!contact) {
    return {
      success: false,
      message: "Contact already deleted or not found"
    };
  }
  await prisma.contact.delete({ where: { id: contactId } });
  return {
    success: true,
    message: "Contact deleted successfully"
  };
};
var shareVisitorContact = async (visitorId, ownerCardId, visitorCardId, scanLocation) => {
  if (!visitorId) throw new Error("Unauthorized");
  if (!ownerCardId) throw new Error("Owner card ID is required");
  if (!visitorCardId) throw new Error("Visitor card ID is required");
  const ownerCard = await prisma.card.findUnique({
    where: { id: ownerCardId },
    select: { id: true, userId: true }
  });
  if (!ownerCard) throw new Error("Scanned card not found");
  const visitorCard = await prisma.card.findUnique({
    where: { id: visitorCardId },
    include: { personalInfo: true }
  });
  if (!visitorCard) throw new Error("Your card not found");
  if (visitorCard.userId !== visitorId) throw new Error("You can only share your own cards");
  const ownerId = ownerCard.userId;
  const lat = scanLocation?.latitude ?? null;
  const lon = scanLocation?.longitude ?? null;
  const city = scanLocation?.city ?? "";
  const country = scanLocation?.country ?? "";
  const pi = visitorCard.personalInfo;
  const contactData = {
    firstName: pi?.firstName ?? "",
    lastName: pi?.lastName ?? "",
    phone: pi?.phoneNumber ?? "",
    email: pi?.email ?? "",
    company: pi?.company ?? "",
    jobTitle: pi?.jobTitle ?? "",
    logo: visitorCard.logo ?? "",
    profile_img: pi?.profile_img ?? visitorCard.profile ?? "",
    latitude: lat,
    longitude: lon,
    city,
    country
  };
  const existingShare = await prisma.visitorContactShare.findFirst({
    where: {
      ownerCardId,
      visitorCardId,
      status: "approved"
    }
  });
  if (existingShare) {
    return { alreadySaved: true, share: existingShare };
  }
  const share = await prisma.visitorContactShare.create({
    data: {
      ownerCardId,
      visitorCardId,
      ownerId,
      visitorId,
      status: "approved",
      latitude: lat,
      longitude: lon,
      city,
      country
    }
  });
  const existingContact = await prisma.contact.findFirst({
    where: { userId: ownerId, cardId: visitorCardId }
  });
  if (!existingContact) {
    await prisma.contact.create({
      data: {
        userId: ownerId,
        cardId: visitorCardId,
        ...contactData
      }
    });
  } else {
    await prisma.contact.update({
      where: { id: existingContact.id },
      data: contactData
    });
  }
  return { alreadySaved: false, share };
};
var contactServices = {
  saveContact,
  getAllContacts,
  updateContact,
  deleteContact,
  shareVisitorContact
};

// src/modules/contacts/contacts.controller.ts
var saveContactController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { cardId } = req.params;
    let contactData = req.body;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!cardId) {
      return res.status(400).json({ success: false, message: "Card ID is required" });
    }
    if (!contactData || Object.keys(contactData).length === 0) {
      return res.status(200).json({
        success: true,
        message: "No data provided, nothing to save",
        data: null
      });
    }
    const ip = getClientIP(req);
    logger.debug("Client IP for contact save", { ip });
    if (ip && (!contactData.latitude || !contactData.city)) {
      logger.debug("Fetching location from IP for contact", { ip });
      const ipLocation = await getLocationFromIP(ip, req);
      if (ipLocation) {
        logger.debug("Location fetched for contact", { ipLocation });
        contactData = {
          ...contactData,
          latitude: contactData.latitude ?? ipLocation.latitude ?? 0,
          longitude: contactData.longitude ?? ipLocation.longitude ?? 0,
          city: contactData.city ?? ipLocation.city ?? "",
          country: contactData.country ?? ipLocation.country ?? ""
        };
      }
    } else if (contactData.latitude || contactData.city) {
      logger.debug("Using provided scan location for contact", {
        latitude: contactData.latitude,
        longitude: contactData.longitude,
        city: contactData.city,
        country: contactData.country
      });
    }
    if (!contactData.city && !contactData.country) {
      logger.warn("No location data for contact, using fallback");
      const fallback = getFallbackLocation();
      contactData.city = contactData.city || fallback.city;
      contactData.country = contactData.country || fallback.country;
    }
    const result = await contactServices.saveContact(userId, cardId, contactData);
    if (result.alreadySaved) {
      return res.status(200).json({
        success: true,
        message: "Contact already saved",
        data: result.contact
      });
    }
    return res.status(201).json({
      success: true,
      message: "Contact saved successfully",
      data: result.contact
    });
  } catch (error) {
    logger.error("Save contact controller error", error);
    if (!res.headersSent) {
      return res.status(400).json({
        success: false,
        message: error.message || "Something went wrong"
      });
    }
    logger.error("Unhandled error after response", error);
  }
};
var getAllContactsController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const contacts = await contactServices.getAllContacts(userId);
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    logger.warn("Error in getAllContactsController", error);
    res.status(200).json({ success: true, data: [] });
  }
};
var updateContactController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { contactId } = req.params;
    let updateData = req.body;
    const ip = getClientIP(req);
    logger.debug("Client IP for contact update", { ip });
    if (ip && (!updateData.latitude || !updateData.city)) {
      logger.debug("Fetching location from IP for contact update", { ip });
      const ipLocation = await getLocationFromIP(ip, req);
      if (ipLocation) {
        logger.debug("Location fetched for contact update", { ipLocation });
        updateData = {
          ...updateData,
          latitude: updateData.latitude ?? ipLocation.latitude ?? 0,
          longitude: updateData.longitude ?? ipLocation.longitude ?? 0,
          city: updateData.city ?? ipLocation.city ?? "",
          country: updateData.country ?? ipLocation.country ?? ""
        };
      }
    }
    if (!updateData.city && !updateData.country) {
      logger.warn("No location data for contact update, using fallback");
      const fallback = getFallbackLocation();
      updateData.city = updateData.city || fallback.city;
      updateData.country = updateData.country || fallback.country;
    }
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!contactId) {
      return res.status(400).json({ success: false, message: "Contact ID is required" });
    }
    const updated = await contactServices.updateContact(contactId, userId, updateData);
    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: updated
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};
var deleteContactController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { contactId } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const result = await contactServices.deleteContact(contactId, userId);
    res.status(200).json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var shareVisitorContactController = async (req, res, next) => {
  try {
    const visitorId = req.user?.id;
    const { ownerCardId, visitorCardId, scanLocation } = req.body;
    if (!visitorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!ownerCardId) {
      return res.status(400).json({ success: false, message: "Owner card ID is required" });
    }
    if (!visitorCardId) {
      return res.status(400).json({ success: false, message: "Visitor card ID is required" });
    }
    const result = await contactServices.shareVisitorContact(
      visitorId,
      ownerCardId,
      visitorCardId,
      scanLocation
    );
    return res.status(201).json({
      success: true,
      message: result.alreadySaved ? "Already shared" : "Contact shared successfully",
      data: result.share,
      alreadySaved: result.alreadySaved
    });
  } catch (error) {
    logger.error("Share visitor contact error", error);
    if (!res.headersSent) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to share contact"
      });
    }
    next(error);
  }
};
var contactController = {
  saveContactController,
  getAllContactsController,
  updateContactController,
  deleteContactController,
  shareVisitorContactController
};

// src/modules/contacts/contacts.routes.ts
var router4 = Router4();
router4.post("/save/:cardId", contactController.saveContactController);
router4.get("/all", contactController.getAllContactsController);
router4.put("/update/:contactId", contactController.updateContactController);
router4.delete("/delete/:contactId", contactController.deleteContactController);
router4.post("/visitor/share-contact", contactController.shareVisitorContactController);
var contactRoutes = router4;

// src/modules/upload/upload.routes.ts
import { Router as Router5 } from "express";

// src/modules/upload/upload.services.ts
var uploadImage = async (params) => {
  const { file, folder, type, subFolder } = params;
  let finalFolder = folder;
  if (!finalFolder) {
    if (type === "card") {
      if (subFolder === "logo") {
        finalFolder = "contactx/cards/logos";
      } else if (subFolder === "profile") {
        finalFolder = "contactx/cards/profiles";
      } else if (subFolder === "cover") {
        finalFolder = "contactx/cards/covers";
      } else {
        finalFolder = "contactx/cards";
      }
    } else if (type === "personal-info") {
      if (subFolder === "logo") {
        finalFolder = "contactx/personal-info/logos";
      } else if (subFolder === "banner") {
        finalFolder = "contactx/personal-info/banners";
      } else if (subFolder === "profile_img") {
        finalFolder = "contactx/personal-info/profiles";
      } else if (subFolder === "image") {
        finalFolder = "contactx/personal-info/images";
      } else {
        finalFolder = "contactx/personal-info";
      }
    } else {
      finalFolder = "contactx/uploads";
    }
  }
  const url = await uploadImageToCloudinary(file, finalFolder);
  return url;
};
var uploadMultipleImages = async (files) => {
  const uploadPromises = files.map((fileData) => {
    const params = {
      file: fileData.file
    };
    if (fileData.folder !== void 0) {
      params.folder = fileData.folder;
    }
    if (fileData.type !== void 0) {
      params.type = fileData.type;
    }
    if (fileData.subFolder !== void 0) {
      params.subFolder = fileData.subFolder;
    }
    return uploadImage(params);
  });
  return Promise.all(uploadPromises);
};
var uploadServices = {
  uploadImage,
  uploadMultipleImages
};

// src/modules/upload/upload.controller.ts
var uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const file = req.file;
    const { folder, type, subFolder } = req.body;
    if (!file) {
      const { base64 } = req.body;
      if (!base64) {
        return res.status(400).json({
          success: false,
          message: "File or base64 image is required"
        });
      }
      const uploadParams2 = { file: base64 };
      if (folder !== void 0) uploadParams2.folder = folder;
      if (type !== void 0) uploadParams2.type = type;
      if (subFolder !== void 0) uploadParams2.subFolder = subFolder;
      const url2 = await uploadServices.uploadImage(uploadParams2);
      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: {
          url: url2,
          type: "base64"
        }
      });
    }
    const uploadParams = { file: file.buffer };
    if (folder !== void 0) uploadParams.folder = folder;
    if (type !== void 0) uploadParams.type = type;
    if (subFolder !== void 0) uploadParams.subFolder = subFolder;
    const url = await uploadServices.uploadImage(uploadParams);
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url,
        type: "file",
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }
    });
  } catch (error) {
    console.error("\u274C Upload image error:", error);
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to upload image"
      });
    }
    next(error);
  }
};
var uploadMultipleImages2 = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const files = req.files;
    const { images } = req.body;
    const uploadPromises = [];
    if (files && files.length > 0) {
      files.forEach((file) => {
        uploadPromises.push(
          uploadServices.uploadImage({
            file: file.buffer,
            type: "card"
            // Default type
          })
        );
      });
    }
    if (images && Array.isArray(images)) {
      images.forEach((imageData) => {
        const uploadParams = { file: imageData.base64 };
        if (imageData.folder !== void 0) uploadParams.folder = imageData.folder;
        if (imageData.type !== void 0) uploadParams.type = imageData.type;
        if (imageData.subFolder !== void 0) uploadParams.subFolder = imageData.subFolder;
        uploadPromises.push(uploadServices.uploadImage(uploadParams));
      });
    }
    if (uploadPromises.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided"
      });
    }
    const urls = await Promise.all(uploadPromises);
    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      data: {
        urls,
        count: urls.length
      }
    });
  } catch (error) {
    console.error("\u274C Upload multiple images error:", error);
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to upload images"
      });
    }
    next(error);
  }
};
var deleteImage = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required"
      });
    }
    await deleteImageFromCloudinary(url);
    res.status(200).json({
      success: true,
      message: "Image deleted successfully"
    });
  } catch (error) {
    console.error("\u274C Delete image error:", error);
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete image"
      });
    }
    next(error);
  }
};
var uploadController = {
  uploadSingleImage,
  uploadMultipleImages: uploadMultipleImages2,
  deleteImage
};

// src/modules/upload/upload.routes.ts
var router5 = Router5();
router5.post(
  "/single",
  upload.single("image"),
  // Optional file upload
  uploadController.uploadSingleImage
);
router5.post(
  "/multiple",
  upload.array("images", 10),
  // Max 10 images
  uploadController.uploadMultipleImages
);
router5.delete("/delete", uploadController.deleteImage);
var uploadRoutes = router5;

// src/middleware/notFoundRoute.ts
var notFoundRoute = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

// src/middleware/globalErrorHandler.ts
var handlePrismaError = (error) => {
  if (error instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        const target = error.meta?.target || [];
        const field = Array.isArray(target) ? target.join(", ") : target;
        return {
          statusCode: 409,
          message: `A record with this ${field} already exists.`,
          code: "UNIQUE_CONSTRAINT_VIOLATION"
        };
      case "P2025":
        return {
          statusCode: 404,
          message: "Record not found.",
          code: "RECORD_NOT_FOUND"
        };
      case "P2003":
        return {
          statusCode: 400,
          message: "Invalid reference. Related record does not exist.",
          code: "FOREIGN_KEY_VIOLATION"
        };
      case "P2000":
        return {
          statusCode: 400,
          message: "Invalid value provided.",
          code: "INVALID_VALUE"
        };
      case "P2001":
        return {
          statusCode: 400,
          message: "Value is too long for the field.",
          code: "VALUE_TOO_LONG"
        };
      case "P1001":
        return {
          statusCode: 503,
          message: "Database connection failed. Please try again later.",
          code: "DATABASE_CONNECTION_ERROR"
        };
      case "P1008":
      case "P2024":
        return {
          statusCode: 504,
          message: "Database query timeout. Please try again.",
          code: "DATABASE_TIMEOUT"
        };
      default:
        return {
          statusCode: 500,
          message: `Database error: ${error.message}`,
          code: error.code
        };
    }
  }
  if (error instanceof prismaNamespace_exports.PrismaClientValidationError) {
    return {
      statusCode: 400,
      message: "Invalid data provided. Please check your input.",
      code: "VALIDATION_ERROR"
    };
  }
  if (error instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    return {
      statusCode: 503,
      message: "Database connection failed. Please check your database configuration.",
      code: "DATABASE_INITIALIZATION_ERROR"
    };
  }
  if (error instanceof prismaNamespace_exports.PrismaClientRustPanicError) {
    return {
      statusCode: 500,
      message: "Database engine error. Please contact support.",
      code: "DATABASE_ENGINE_ERROR"
    };
  }
  if (error.code && typeof error.code === "string" && error.code.startsWith("P")) {
    return {
      statusCode: 500,
      message: `Database error: ${error.message || "Unknown database error"}`,
      code: error.code
    };
  }
  return null;
};
var globalErrorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    logger.error("Error after response sent", err);
    return next(err);
  }
  logger.error("Error occurred", err, {
    code: err.code,
    path: req.path,
    method: req.method,
    prismaError: err instanceof prismaNamespace_exports.PrismaClientKnownRequestError
  });
  const prismaError = handlePrismaError(err);
  if (prismaError) {
    return res.status(prismaError.statusCode).json({
      success: false,
      message: prismaError.message,
      code: prismaError.code,
      ...process.env.NODE_ENV === "development" && {
        details: err.meta,
        stack: err.stack
      }
    });
  }
  if (err.name === "OTPVerificationError" || err.message?.includes("OTP") || err.message?.includes("verification")) {
    return res.status(400).json({
      success: false,
      message: err.message || "OTP verification failed",
      code: "OTP_VERIFICATION_ERROR",
      error: err.message || "Invalid or expired OTP code"
    });
  }
  if (err.name === "ValidationError" || err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: err.message || "Validation error",
      code: "VALIDATION_ERROR",
      ...process.env.NODE_ENV === "development" && {
        details: err.errors || err.issues
      }
    });
  }
  if (err.statusCode === 401 || err.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      message: err.message || "Unauthorized",
      code: "UNAUTHORIZED"
    });
  }
  if (err.statusCode === 404 || err.name === "NotFoundError") {
    return res.status(404).json({
      success: false,
      message: err.message || "Resource not found",
      code: "NOT_FOUND"
    });
  }
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || "An error occurred",
      code: err.code || "APPLICATION_ERROR"
    });
  }
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "An unexpected error occurred. Please try again later." : message,
    code: "INTERNAL_SERVER_ERROR",
    ...process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err
    }
  });
};

// src/app.ts
import morgan from "morgan";
var app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
var allowedOrigins = [
  "http://localhost:3004",
  "http://127.0.0.1:3004",
  "http://10.153.79.18:3004",
  // ← নতুন Mac IP
  "exp://10.153.79.18:8081",
  // ← Expo dev server
  "http://10.153.79.18:8081",
  "http://localhost:8081",
  // Expo dev server (same machine)
  "https://contactx.xsalonx.com",
  // ← Production domain
  "https://salonx--wtbnn1wdao.expo.app",
  // ← EAS web deploy
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  "http://10.108.105.18:3004",
  "http://10.102.144.18:3004",
  process.env.FRONTEND_URL,
  process.env.EXPO_APP_URL
].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      logger.warn("CORS blocked origin", { origin });
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Origin", "X-Requested-Origin", "X-Forwarded-Origin", "Referer", "X-Timezone"]
}));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.get("/", (_, res) => {
  res.send("Hello World");
});
app.get("/api/health", (_, res) => {
  res.json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0"
  });
});
app.get("/api", (_, res) => {
  res.json({
    name: "ContactX API Server",
    version: process.env.npm_package_version || "1.0.0",
    status: "running",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      auth: "/api/auth",
      cards: "/api/card",
      publicCard: "/api/public-card",
      contacts: "/api/contacts",
      scan: "/api/scan",
      upload: "/api/upload",
      health: "/api/health"
    },
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB"
      }
    }
  });
});
app.get("/api/protected", requireAuth, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user,
    session: req.session
  });
});
app.use("/api/card", requireAuth, cardRoutes);
app.use("/api/public-card", publicCardRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/contacts", requireAuth, contactRoutes);
app.use("/api/upload", requireAuth, uploadRoutes);
app.use(notFoundRoute);
app.use(globalErrorHandler);

// src/server.ts
var PORT = Number(process.env.PORT) || 3004;
var HOST = "0.0.0.0";
async function start() {
  try {
    await prisma.$connect();
    logger.info("Connected to database");
    app.listen(PORT, HOST, () => {
      logger.info(`Server running on http://${HOST}:${PORT}`, {
        localAccess: `http://localhost:${PORT}`
      });
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}
var server_default = app;
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  start();
}
export {
  server_default as default
};
