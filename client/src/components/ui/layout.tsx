import * as React from "react";
import { cn } from "@/lib/utils";

const Layout = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex min-h-screen flex-col", className)}
    {...props}
  />
));
Layout.displayName = "Layout";

const LayoutHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("sticky top-0 z-30 bg-background", className)}
    {...props}
  />
));
LayoutHeader.displayName = "LayoutHeader";

interface LayoutSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
}

const LayoutSidebar = React.forwardRef<
  HTMLDivElement,
  LayoutSidebarProps
>(({ className, collapsed = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed left-0 top-0 z-20 h-full w-64 transform transition-all duration-300 ease-in-out lg:relative",
      collapsed && "w-16",
      className
    )}
    {...props}
  />
));
LayoutSidebar.displayName = "LayoutSidebar";

const LayoutContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 lg:ml-64", className)}
    {...props}
  />
));
LayoutContent.displayName = "LayoutContent";

export { Layout, LayoutHeader, LayoutSidebar, LayoutContent };