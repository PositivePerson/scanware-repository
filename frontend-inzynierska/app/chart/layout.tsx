import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Chart Page | Automated Vulnerability Scanner",
  description: "This is Chart page for GUI for Scanner Next.js",
  // other metadata
};
type Props = {
  children: React.ReactNode;
};

const layout = (props: Props) => {
  return <div>{props.children}</div>;
};
export default layout;
