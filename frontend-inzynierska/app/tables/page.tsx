import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableTimeline from "@/components/Tables/TableTimeline";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tables Page | Automated Vulnerability Scanner",
  description: "This is Tables page for GUI for Scanner Next.js",
  // other metadata
};

const TablesPage = () => {
  return (
    <>
      <Breadcrumb pageName="Tables" />

      <div className="flex flex-col gap-10">
        <TableTimeline />
        <TableOne />
        <TableTwo />
      </div>
    </>
  );
};

export default TablesPage;
