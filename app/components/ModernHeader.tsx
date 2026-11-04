import React from "react";
import { ScreenHeader } from "@/components/ui/Kit";

interface SimpleHeaderProps {
  title: string;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({ title }) => (
  <ScreenHeader title={title} />
);
