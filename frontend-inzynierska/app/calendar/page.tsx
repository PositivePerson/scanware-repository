import Calendar from "@/components/Calender";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar Page | Automated Vulnerability Scanner",
  description: "This is Calendar page for GUI for Scanner Next.js",
  // other metadata
};

const CalendarPage = () => {
  return (
    <>
      <Calendar />
    </>
  );
};

export default CalendarPage;
