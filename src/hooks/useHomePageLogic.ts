import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGraphStore } from '@/store/useGraphStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useProjectCollectionStore } from '@/store/useProjectCollectionStore';
import { useToast } from '@/context/ToastContext';
import { useRecentVisits } from '@/hooks/useRecentVisits';
import { Project } from '@/types/knowledge';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/utils/errorUtils';

export function useHomePageLogic() {
  const router = useRouter();
  const { showToast, showConfirmation } = useToast();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();

  const collections = useProjectCollectionStore(state => state.collections);
  const fetchCollections = useProjectCollectionStore(state => state.fetchCollections);
  const isGroupsLoading = useProjectCollectionStore(state => state.isLoading);
  const updateCollection = useProjectCollectionStore(state => state.updateCollection);
  const createCollection = useProjectCollectionStore(state => state.createCollection);
  const deleteCollection = useProjectCollectionStore(state => state.deleteCollection);

  const {
    projects,
    setProjects,
    addProject,
    deleteProject,
    setCurrentProject,
    isCreateProjectOpen,
    toggleCreateProject,
    isLoading: isGraphLoading,
    setLoading: setGraphLoading,
    setCurrentUserId,
    setCurrentProjectId
  } = useGraphStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Group Features State
  const [activeTab, setActiveTab] = useState<'all' | 'groups' | 'recent'>('all');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const { recentVisits, isLoading: isRecentLoading } = useRecentVisits();
  
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const editingGroup = collections.find(c => c.id === editingGroupId);
  const [groupToDelete, setGroupToDelete] = useState<typeof collections[0] | null>(null);

  useEffect(() => {
    if (user?.id && isAuthenticated && !user.id.startsWith('guest-')) {
      setCurrentUserId(user.id);
      fetchCollections(user.id);
    }
  }, [user?.id, isAuthenticated, setCurrentUserId, fetchCollections]);

  useEffect(() => {
    const loadProjects = async () => {
      if (!user?.id) return;

      setGraphLoading(true);
      try {
        if (user.id.startsWith('guest-')) {
          const localStr = localStorage.getItem('nexus_local_projects');
          if (localStr) {
            try { setProjects(JSON.parse(localStr)); } catch (e) { setProjects([]); }
          } else {
            setProjects([]);
          }
          return;
        }

        const fetchedProjects = await api.projects.getByUser(user.id);
        setProjects(fetchedProjects);
      } catch (err) {
        const localStr = localStorage.getItem('nexus_local_projects');
        if (localStr) {
          try { setProjects(JSON.parse(localStr)); } catch (e) { setProjects([]); }
        } else {
          setProjects([]);
        }
      } finally {
        setGraphLoading(false);
      }
    };

    if (isAuthenticated && user) {
      loadProjects();
    }
  }, [user, isAuthenticated, setProjects, setGraphLoading]);

  const filteredProjects = projects
    .filter((p) =>
      (p.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (p.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const filteredGroups = collections
    .filter((g) =>
      (g.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (g.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleCreateProject = async (data: { name: string; description?: string; color: string }) => {
    if (!user?.id) return;
    setGraphLoading(true);

    const isGuest = user.id.startsWith('guest-');

    if (isGuest) {
      const newProject: Project = {
        id: Date.now(),
        name: data.name,
        description: data.description || '',
        color: data.color,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addProject(newProject);
      const localStr = localStorage.getItem('nexus_local_projects');
      const currentList: Project[] = localStr ? JSON.parse(localStr) : [];
      const updatedList = [newProject, ...currentList];
      localStorage.setItem('nexus_local_projects', JSON.stringify(updatedList));
      const defaultGroup = [{ id: 0, name: 'Group 1', color: '#8B5CF6', order: 0, projectId: newProject.id }];
      localStorage.setItem(`nexus_local_groups_${newProject.id}`, JSON.stringify(defaultGroup));
      toggleCreateProject(false);
      showToast('Local project created', 'success');
      setGraphLoading(false);
      return;
    }

    try {
      const newProject = await api.projects.create({
        name: data.name,
        description: data.description,
        color: data.color,
        userId: user.id,
      });
      addProject(newProject);
      api.groups.create({ name: 'Group 1', color: '#8B5CF6', projectId: newProject.id }).catch(() => {});
      toggleCreateProject(false);
    } catch (err) {
      console.error('Failed to create project:', err);
      const localProject: Project = {
        id: Date.now(),
        name: data.name,
        description: data.description || '',
        color: data.color,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addProject(localProject);
      const localStr = localStorage.getItem('nexus_local_projects');
      const currentList: Project[] = localStr ? JSON.parse(localStr) : [];
      const updatedList = [localProject, ...currentList];
      localStorage.setItem('nexus_local_projects', JSON.stringify(updatedList));
      const defaultGroup = [{ id: 0, name: 'Group 1', color: '#8B5CF6', order: 0, projectId: localProject.id }];
      localStorage.setItem(`nexus_local_groups_${localProject.id}`, JSON.stringify(defaultGroup));
      toggleCreateProject(false);
      showToast('Project created locally', 'info');
    } finally {
      setGraphLoading(false);
    }
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
    setCurrentProjectId(project.id);
    router.push('/project/editor');
  };

  const handleEditProjectClick = (project: Project) => {
    setEditingProject(project);
  };

  const handleUpdateProject = async (data: { name: string; description?: string }) => {
    if (!editingProject) return;

    setGraphLoading(true);
    const isGuest = user?.id?.startsWith('guest-');
    const updatedProject = { ...editingProject, ...data, updatedAt: new Date().toISOString() };

    if (isGuest) {
      setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
      const localStr = localStorage.getItem('nexus_local_projects');
      if (localStr) {
        const currentList: Project[] = JSON.parse(localStr);
        const updatedList = currentList.map(p => p.id === editingProject.id ? updatedProject : p);
        localStorage.setItem('nexus_local_projects', JSON.stringify(updatedList));
      }
      setEditingProject(null);
      showToast('Project updated');
      setGraphLoading(false);
      return;
    }

    try {
      await api.projects.update(editingProject.id, updatedProject);
      setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
      setEditingProject(null);
      showToast('Project updated successfully');
    } catch (err) {
      console.error('Failed to update project:', err);
      setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
      setEditingProject(null);
      showToast('Project updated (locally)', 'info');
    } finally {
      setGraphLoading(false);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!await showConfirmation(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }

    setGraphLoading(true);
    const isGuest = user?.id?.startsWith('guest-');

    if (isGuest) {
      deleteProject(project.id);
      const localStr = localStorage.getItem('nexus_local_projects');
      if (localStr) {
        const currentList: Project[] = JSON.parse(localStr);
        const updatedList = currentList.filter(p => p.id !== project.id);
        localStorage.setItem('nexus_local_projects', JSON.stringify(updatedList));
      }
      localStorage.removeItem(`nexus_local_nodes_${project.id}`);
      localStorage.removeItem(`nexus_local_links_${project.id}`);
      showToast('Project deleted');
      setGraphLoading(false);
      return;
    }

    try {
      await api.projects.delete(project.id);
      deleteProject(project.id);
      showToast('Project deleted');
    } catch (err) {
      console.error('Failed to delete project:', err);
      deleteProject(project.id);
      const localStr = localStorage.getItem('nexus_local_projects');
      if (localStr) {
        const currentList: Project[] = JSON.parse(localStr);
        const updatedList = currentList.filter(p => p.id !== project.id);
        localStorage.setItem('nexus_local_projects', JSON.stringify(updatedList));
      }
      showToast('Project deleted (local)', 'info');
    } finally {
      setGraphLoading(false);
    }
  };

  const handleCreateGroup = async (data: { name: string; description?: string; projectIds: number[]; pinnedProjectIds: number[] }) => {
    if (!user?.id) return;

    try {
      await createCollection({
        name: data.name,
        description: data.description,
        userId: user.id,
        projectIds: data.projectIds,
        pinnedProjectIds: data.pinnedProjectIds
      });
      setIsCreateGroupOpen(false);
      setActiveTab('groups');
      showToast('Collection created successfully');
    } catch (err) {
      showToast(getFriendlyErrorMessage(err), 'error');
    }
  };

  const handleEditGroupClick = (group: typeof collections[0]) => {
    setEditingGroupId(group.id);
  };

  const handleUpdateGroup = async (data: { name: string; description?: string; projectIds: number[]; pinnedProjectIds: number[] }) => {
    if (!editingGroup || !user?.id) return;

    try {
      await updateCollection(editingGroup.id, {
        name: data.name,
        description: data.description || "",
        projectIds: data.projectIds,
        pinnedProjectIds: data.pinnedProjectIds
      });
      setEditingGroupId(null);
      showToast('Collection updated successfully');
    } catch (err) {
      showToast(getFriendlyErrorMessage(err), 'error');
    }
  };

  const getGroupProjectIds = (g: any) => {
    if (g.projectIds && g.projectIds.length > 0) {
      return g.projectIds.map((id: any) => Number(id));
    }
    if (g.items && g.items.length > 0) return g.items.map((i: any) => Number(i.projectId));
    if (g.projects && g.projects.length > 0) return g.projects.map((p: any) => Number(p.id));
    const fallback = g.projectIds || g.items?.map((i: any) => i.projectId) || g.projects?.map((p: any) => p.id) || [];
    return fallback.map((id: any) => Number(id));
  };

  const handleDeleteGroupClick = (group: typeof collections[0]) => {
    setGroupToDelete(group);
  };

  const handleConfirmDeleteGroup = async (withProjects: boolean) => {
    if (!groupToDelete || !user?.id) return;

    try {
      if (withProjects && groupToDelete.items) {
        const projectIds1 = groupToDelete.items.map(item => item.projectId);
        await Promise.all(projectIds1.map(pid => api.projects.delete(pid)));
        projectIds1.forEach(pid => deleteProject(pid));
      }
      await deleteCollection(groupToDelete.id);
      setGroupToDelete(null);
      showToast('Collection deleted successfully');
    } catch (err) {
      console.error('Failed to delete group:', err);
      showToast('Failed to delete collection', 'error');
    }
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleGuestLogin = () => {
    const { login } = useAuthStore.getState();
    login({
      id: 'guest-local-user',
      displayName: 'Local Guest',
      email: 'guest@local.workspace',
      avatarUrl: null,
      provider: 'guest',
    } as any);
    showToast('Entered Local Workspace', 'info');
  };

  return {
    state: {
      hasHydrated, isAuthenticated, user, router, search: { query: searchQuery, setQuery: setSearchQuery },
      viewMode: { mode: viewMode, setMode: setViewMode },
      auth: { showModal: showAuthModal, setShowModal: setShowAuthModal, mode: authMode, open: openAuth },
      tabs: { active: activeTab, setActive: setActiveTab },
      projects: { all: projects, filtered: filteredProjects, isLoading: isGraphLoading },
      groups: { all: collections, filtered: filteredGroups, isLoading: isGroupsLoading },
      recent: { visits: recentVisits, isLoading: isRecentLoading },
      modals: {
        createProject: { isOpen: isCreateProjectOpen, toggle: toggleCreateProject },
        editProject: { project: editingProject, setProject: setEditingProject },
        createGroup: { isOpen: isCreateGroupOpen, setOpen: setIsCreateGroupOpen },
        editGroup: { group: editingGroup, setId: setEditingGroupId },
        deleteGroup: { group: groupToDelete, setGroup: setGroupToDelete }
      }
    },
    handlers: {
      guest: { enter: handleGuestLogin },
      project: {
        create: handleCreateProject, open: handleOpenProject,
        editClick: handleEditProjectClick, update: handleUpdateProject, del: handleDeleteProject
      },
      group: {
        create: handleCreateGroup, editClick: handleEditGroupClick, update: handleUpdateGroup,
        delClick: handleDeleteGroupClick, confirmDelete: handleConfirmDeleteGroup,
        getProjectIds: getGroupProjectIds
      }
    }
  };
}
