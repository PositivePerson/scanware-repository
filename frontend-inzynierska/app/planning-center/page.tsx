import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TablePlanner from "@/components/Tables/TableFive";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Planning Center Page | Automated Vulnerability Scanner",
  description: "This is Planning Center page for GUI for Scanner Next.js",
  // other metadata
};

type Props = {};

const PlanningCenterPage = (props: Props) => {
  return (
    <>
      <Breadcrumb pageName="Planning Center" />

      <div className="flex flex-col gap-10">
        <TablePlanner />
      </div>
    </>
  );
};

export default PlanningCenterPage;
