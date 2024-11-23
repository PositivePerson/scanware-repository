import React from "react";
import Link from "next/link";
import { useSidebar } from "./use-sidebar";

type Props = {
  icon?: React.ReactNode;
  title: string;
  href: string;
  disabled?: boolean;
};

const LinkItem = (props: Props) => {
  const { title } = props;
  const isSidebarOpen = useSidebar((state) => state.isSidebarOpen);
  return (
    <Link
      href={props.disabled ? "#" : props.href} // Prevent navigation if disabled
      aria-disabled={props.disabled}
      className={`group relative flex items-center gap-2.5  rounded-sm px-3 py-2 font-medium text-gray-3  duration-300 ease-in-out   
      ${
        props.disabled
          ? "cursor-not-allowed text-gray-4" // Disabled state styles
          : " dark:hover:text-white"
      } 
      duration-300 ease-in-out`}
      onClick={(e) => props.disabled && e.preventDefault()} // Prevent click action if disabled
    >
      <div className="">{props.icon}</div>
      <p>{isSidebarOpen && title}</p>
    </Link>
  );
};

export default LinkItem;
