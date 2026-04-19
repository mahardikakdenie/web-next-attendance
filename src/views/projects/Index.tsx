"use client";

import { useState, useMemo } from "react";
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar,
  Building2,
  AlertCircle,
  ChevronDown,
  Loader2,
  DollarSign,
  Users,
  UserPlus,
  X,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject,
  getProjectMembers,
  assignProjectMember,
  removeProjectMember
} from "@/service/projects";
import { getDataUserslist } from "@/service/users";
import { Project, CreateProjectPayload, UpdateProjectPayload, AssignMemberPayload, ProjectStatus } from "@/types/projects";
import { CustomApiError } from "@/types/api";
import { toast } from "sonner";
import dayjs from "dayjs";
import { usePermission, Can } from "@/components/auth/PermissionGuard";
import Image from "next/image";

export default function ProjectsView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectForTeam, setProjectForTeam] = useState<Project | null>(null);

  const canManage = usePermission("project.manage");

  // Queries
  const { data: projectsResp, isLoading } = useQuery({
    queryKey: ["projects", search, statusFilter],
    queryFn: () => getProjects({ search, status: statusFilter }),
  });

  const projects = projectsResp?.data || [];

  // Mutations
  const mutation = useMutation({
    mutationFn: (payload: CreateProjectPayload | UpdateProjectPayload) => {
      if (selectedProject) {
        return updateProject(selectedProject.id, payload as UpdateProjectPayload);
      }
      return createProject(payload as CreateProjectPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(selectedProject ? "Project updated" : "Project created");
      setIsModalOpen(false);
      setSelectedProject(null);
    },
    onError: (error: CustomApiError) => {
      toast.error(error?.response?.data?.meta?.message || "Operation failed");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete project");
    }
  });

  const columns: Column<Project>[] = useMemo(() => [
    {
      header: "Project Name",
      accessor: (item) => {
        const isPastDue = item.end_date && dayjs().isAfter(dayjs(item.end_date)) && item.status !== 'COMPLETED';
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Briefcase size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-slate-900 leading-none">{item.name}</p>
                {isPastDue && (
                  <div className="group relative">
                    <AlertCircle size={14} className="text-amber-500 animate-pulse cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      End date passed. Consider completing this project.
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tight">ID: PRJ-{item.id}</p>
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      header: "Client & Budget",
      accessor: (item) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-600">{item.client_name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit border border-emerald-100">
            <DollarSign size={10} strokeWidth={3} />
            <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.budget)}</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Duration",
      accessor: (item) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
            <Calendar size={12} />
            <span>{dayjs(item.start_date).format("MMM DD, YYYY")}</span>
          </div>
          {item.end_date && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
              <span className="w-1 h-1 rounded-full bg-slate-300 ml-1" />
              <span>{dayjs(item.end_date).format("MMM DD, YYYY")}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (item) => {
        const colors = {
          ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-100",
          COMPLETED: "bg-blue-50 text-blue-600 border-blue-100",
          ON_HOLD: "bg-amber-50 text-amber-600 border-amber-100",
        };
        return (
          <Badge className={`${colors[item.status]} font-black text-[10px] px-3 py-1 rounded-lg border`}>
            {item.status}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            title="Team Members"
            className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setProjectForTeam(item);
              setIsTeamModalOpen(true);
            }}
          >
            <Users size={16} />
          </Button>
          <Can permission="project.manage">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600"
              onClick={() => {
                setSelectedProject(item);
                setIsModalOpen(true);
              }}
            >
              <Edit size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0 rounded-xl hover:bg-rose-50 hover:text-rose-600"
              onClick={() => {
                if (confirm("Are you sure you want to delete this project?")) {
                  deleteMutation.mutate(item.id);
                }
              }}
            >
              <Trash2 size={16} />
            </Button>
          </Can>
        </div>
      ),
    },
  ], [deleteMutation]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Project Management</h1>
          <p className="text-slate-500 font-medium">Create and track projects for timesheet allocation.</p>
        </div>
        <Can permission="project.manage">
          <Button 
            onClick={() => {
              setSelectedProject(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 font-black flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            <span>New Project</span>
          </Button>
        </Can>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search projects or clients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-white border-slate-200 rounded-2xl"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-12 pl-10 pr-10 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none min-w-[160px]"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={projects} 
          loading={isLoading}
        />
      </div>

      {/* Project Modal */}
      {isModalOpen && (
        <ProjectFormModal 
          project={selectedProject}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => mutation.mutate(data)}
          isLoading={mutation.isPending}
        />
      )}

      {/* Team Modal */}
      {isTeamModalOpen && projectForTeam && (
        <TeamManagementModal
          project={projectForTeam}
          onClose={() => {
            setIsTeamModalOpen(false);
            setProjectForTeam(null);
          }}
          canManage={canManage}
        />
      )}
    </div>
  );
}

interface ProjectFormModalProps {
  project: Project | null;
  onClose: () => void;
  onSubmit: (data: CreateProjectPayload | UpdateProjectPayload) => void;
  isLoading: boolean;
}

function ProjectFormModal({ project, onClose, onSubmit, isLoading }: ProjectFormModalProps) {
  const [formData, setFormData] = useState<Partial<Project>>(
    project || {
      name: "",
      client_name: "",
      budget: 0,
      description: "",
      start_date: dayjs().format("YYYY-MM-DD"),
      status: "ACTIVE"
    }
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
              <Briefcase size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{project ? "Edit Project" : "Create Project"}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Details</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Project Name</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Website Redesign"
                className="h-12 rounded-2xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Client Name</label>
              <Input 
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="e.g. Acme Corp"
                className="h-12 rounded-2xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Budget (IDR)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  placeholder="0"
                  className="h-12 pl-10 rounded-2xl font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief project summary..."
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[100px] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Start Date</label>
                <Input 
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="h-12 rounded-2xl font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">End Date (Optional)</label>
                <Input 
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="h-12 rounded-2xl font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Project Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
              >
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-2xl font-black uppercase text-[11px]">Cancel</Button>
          <Button 
            disabled={isLoading || !formData.name || !formData.client_name}
            onClick={() => onSubmit(formData as CreateProjectPayload | UpdateProjectPayload)}
            className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] shadow-lg shadow-blue-200"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : (project ? "Update" : "Create")}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface TeamManagementModalProps {
  project: Project;
  onClose: () => void;
  canManage: boolean;
}

function TeamManagementModal({ project, onClose, canManage }: TeamManagementModalProps) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  const { data: membersResp, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["project-members", project.id],
    queryFn: () => getProjectMembers(project.id),
  });

  const { data: usersResp } = useQuery({
    queryKey: ["users-select"],
    queryFn: () => getDataUserslist({ limit: 50 }),
    enabled: isAdding
  });

  const members = membersResp?.data || [];
  const users = usersResp?.data || [];

  const [newMember, setNewMember] = useState<AssignMemberPayload>({
    user_id: 0,
    role: "Member",
    allocated_hours: 40
  });

  const assignMutation = useMutation({
    mutationFn: (data: AssignMemberPayload) => assignProjectMember(project.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-members", project.id] });
      toast.success("Member assigned successfully");
      setIsAdding(false);
      setNewMember({ user_id: 0, role: "Member", allocated_hours: 40 });
    },
    onError: (error: CustomApiError) => {
      toast.error(error?.response?.data?.meta?.message || "Failed to assign member");
    }
  });

  const removeMutation = useMutation({
    mutationFn: (userId: number) => removeProjectMember(project.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-members", project.id] });
      toast.success("Member removed");
    },
    onError: () => {
      toast.error("Failed to remove member");
    }
  });

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Project Team</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{project.name}</p>
              </div>
            </div>
            {canManage && !isAdding && (
              <Button 
                onClick={() => setIsAdding(true)}
                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl h-10 px-4 font-black text-[11px] flex items-center gap-2"
              >
                <UserPlus size={16} />
                <span>ASSIGN MEMBER</span>
              </Button>
            )}
          </div>

          {isAdding && (
            <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">Assign New Member</h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Employee</label>
                  <select 
                    value={newMember.user_id}
                    onChange={(e) => setNewMember({ ...newMember, user_id: Number(e.target.value) })}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5"
                  >
                    <option value={0}>Choose Employee...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.department})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Project Role</label>
                  <select 
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5"
                  >
                    <option value="Project Lead">Project Lead</option>
                    <option value="Member">Member</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Developer">Developer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Allocated Hours</label>
                  <div className="relative">
                    <Target size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input 
                      type="number"
                      value={newMember.allocated_hours}
                      onChange={(e) => setNewMember({ ...newMember, allocated_hours: Number(e.target.value) })}
                      className="h-11 pl-10 rounded-xl font-bold"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button 
                    disabled={!newMember.user_id || assignMutation.isPending}
                    onClick={() => assignMutation.mutate(newMember)}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[11px] shadow-lg shadow-indigo-100"
                  >
                    {assignMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : "ASSIGN TO TEAM"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {isLoadingMembers ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-xs font-bold uppercase tracking-widest">Loading team members...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-4 border-2 border-dashed border-slate-100 rounded-[2rem]">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                  <Users size={32} />
                </div>
                <p className="text-sm font-bold">No team members assigned yet.</p>
              </div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-50/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 relative">
                      {member.user?.media_url ? (
                        <Image src={member.user.media_url} alt={member.user.name || "User Avatar"} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-xs uppercase">
                          {member.user?.name?.substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 leading-tight">{member.user?.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{member.role}</span>
                        <span className="text-[10px] font-bold text-slate-400">• {member.allocated_hours} hrs allocated</span>
                      </div>
                    </div>
                  </div>
                  {canManage && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => {
                        if (confirm(`Remove ${member.user?.name} from this project?`)) {
                          removeMutation.mutate(member.user_id);
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} className="w-full h-12 rounded-2xl font-black uppercase text-[11px]">Close</Button>
        </div>
      </div>
    </div>
  );
}
