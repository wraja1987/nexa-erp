"use client";
import React from "react";
function __getNavigator(){ return typeof window !== "undefined" ? window.navigator : undefined; }
export default function POSClient(){
  const nav = __getNavigator();
  return <div className="p-6">POS is ready{nav ? "" : " (no navigator at build)"}.</div>;
}
export {};
