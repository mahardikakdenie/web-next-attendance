"use client";

import dynamic from "next/dynamic";
import type { Props } from "react-apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Chart(props: Props) {
  return <ReactApexChart {...props} />;
}
