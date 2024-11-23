import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ScanDetails from "@/components/ScanDetails";
import TableOne from "@/components/Tables/TableOne";
import TableTimeline from "@/components/Tables/TableTimeline";
import TableTwo from "@/components/Tables/TableTwo";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tables Page | Automated Vulnerability Scanner",
  description: "This is Tables page for GUI for Scanner Next.js",
  // other metadata
};

const ScanPage = ({ params }: { params: { uid: string } }) => {
  return (
    <>
      <Breadcrumb pageName="Task Insight" />

      <div className="flex flex-col gap-10">
        {/* <TableTimeline />
        <TableOne />
        <TableTwo /> */}
        <ScanDetails uid={params.uid} />
      </div>
    </>
  );
};

export default ScanPage;
