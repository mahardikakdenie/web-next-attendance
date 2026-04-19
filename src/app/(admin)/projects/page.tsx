import ProjectsView from "@/views/projects/Index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Management | Attendance Management",
  description: "Manage client projects and tasks.",
};

export default function ProjectsPage() {
  return <ProjectsView />;
}
