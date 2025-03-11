import "./LayoutContent.css";
import { ReactNode } from "react";

interface LayoutContentProps {
  children?: ReactNode;
}

function LayoutContent({ children }: LayoutContentProps) {
  return <div className="layout-content">{children}</div>;
}

export default LayoutContent;
