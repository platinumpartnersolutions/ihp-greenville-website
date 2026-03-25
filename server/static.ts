import express, { type Express } from "express";
import path from "path";

export function serveStatic(app: Express) {
  const publicPath = path.resolve("public");
  const assetsPath = path.resolve("attached_assets");

  app.use(express.static(publicPath));
  app.use("/assets", express.static(assetsPath));
}
