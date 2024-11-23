import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableTargets from "@/components/Tables/TableTargets";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Target Page | Automated Vulnerability Scanner",
  description: "This is Target page for GUI for Scanner Next.js",
  // other metadata
};

type Props = {};

const TargetsPage = (props: Props) => {
  return (
    <>
      <Breadcrumb pageName="Targets" />

      <div className="flex flex-col gap-10">
        <TableTargets />
      </div>
    </>
  );
};

export default TargetsPage;
