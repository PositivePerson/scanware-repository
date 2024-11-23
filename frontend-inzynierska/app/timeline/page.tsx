import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableTimeline from "@/components/Tables/TableTimeline";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Timeline Page | Automated Vulnerability Scanner",
  description: "This is Tables page for GUI for Scanner Next.js",
  // other metadata
};

const TimelinePage = () => {
  return (
    <>
      <Breadcrumb pageName="Tasks Timeline" />

      <div className="flex flex-col gap-10">
        <TableTimeline />
        {/* <TableOne /> */}
        {/* <TableTwo /> */}
      </div>
    </>
  );
};

export default TimelinePage;
