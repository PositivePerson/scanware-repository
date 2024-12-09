// import Dashboard from "@/components/Dashboard";
import ECommerce from "@/components/Dashboard/E-commerce-deprecated";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scanner | Automated Vulnerability Scanner",
  description: "This is Next.js GUI for Scanner scanner",
  // other metadata
};

export default function Home() {
  return (
    <>
      <ECommerce />
      {/* <Dashboard /> */}
    </>
  );
}
