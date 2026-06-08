import React from "react";
import { Phone, Mail, Calendar, FileText, CheckSquare } from "lucide-react";

interface ActivityIconProps {
  type: "call" | "email" | "meeting" | "note" | "task";
  className?: string;
}

export function ActivityIcon({ type, className }: ActivityIconProps) {
  const baseClass = "h-4 w-4";

  switch (type) {
    case "call":
      return <Phone className={className || baseClass} />;
    case "email":
      return <Mail className={className || baseClass} />;
    case "meeting":
      return <Calendar className={className || baseClass} />;
    case "note":
      return <FileText className={className || baseClass} />;
    case "task":
      return <CheckSquare className={className || baseClass} />;
    default:
      return <FileText className={className || baseClass} />;
  }
}
export default ActivityIcon;
