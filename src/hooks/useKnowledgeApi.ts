'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Node, Link, Project } from '@/types/knowledge';
import { useGraphStore } from '@/store/useGraphStore';

export const graphKeys = {
  all: ['graph'] as const,
  projects: () => [...graphKeys.all, 'projects'] as const,
  project: (id: string) => [...graphKeys.projects(), id] as const,
  nodes: (projectId?: string) => [...graphKeys.all, 'nodes', projectId] as const,
  node: (id: string) => [...graphKeys.all, 'node', id] as const,
  links: () => [...graphKeys.all, 'links'] as const,
  search: (query: string) => [...graphKeys.all, 'search', query] as const,
};

export function useProjects(userId: string | null) {
  const setProjects = useGraphStore((s) => s.setProjects);

  return useQuery({
    queryKey: graphKeys.projects(),
    queryFn: async () => {
      if (!userId) return [];
      const projects = await api.projects.getByUser(userId);
      setProjects(projects);
      return projects;
    },
    enabled: !!userId && !userId.startsWith('guest-'),
  });
}

export function useProject(id: string) {
  const setCurrentProject = useGraphStore((s) => s.setCurrentProject);

  return useQuery({
    queryKey: graphKeys.project(id),
    queryFn: async () => {
      const project = await api.projects.getById(Number(id));
      setCurrentProject(project);
      return project;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const addProject = useGraphStore((s) => s.addProject);

  return useMutation({
    mutationFn: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.projects.create(project),
    onSuccess: (newProject: Project) => {
      addProject(newProject);
      queryClient.invalidateQueries({ queryKey: graphKeys.projects() });
    },
  });
}

export function useProjectNodes(projectId: string | undefined) {
  const setNodes = useGraphStore((s) => s.setNodes);

  return useQuery({
    queryKey: graphKeys.nodes(projectId),
    queryFn: async () => {
      if (!projectId) return [];
      const nodes = await api.nodes.getByProject(Number(projectId));
      setNodes(nodes);
      return nodes;
    },
    enabled: !!projectId,
  });
}

export function useNode(id: string) {
  return useQuery({
    queryKey: graphKeys.node(id),
    queryFn: () => api.nodes.getById(Number(id)),
    enabled: !!id,
  });
}

export function useCreateNode() {
  const queryClient = useQueryClient();
  const addNode = useGraphStore((s) => s.addNode);
  const currentProject = useGraphStore((s) => s.currentProject);

  return useMutation({
    mutationFn: (node: Omit<Node, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.nodes.create(node),
    onSuccess: (newNode: Node) => {
      addNode(newNode);
      queryClient.invalidateQueries({ queryKey: graphKeys.nodes(String(currentProject?.id)) });
    },
  });
}

export function useUpdateNode() {
  const queryClient = useQueryClient();
  const updateNode = useGraphStore((s) => s.updateNode);

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Node> }) =>
      api.nodes.update(Number(id), updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: graphKeys.node(id) });
      const previousNode = queryClient.getQueryData(graphKeys.node(id));
      updateNode(Number(id), updates);
      return { previousNode };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousNode) {
        queryClient.setQueryData(graphKeys.node(id), context.previousNode);
      }
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: graphKeys.node(id) });
    },
  });
}

export function useDeleteNode() {
  const queryClient = useQueryClient();
  const deleteNode = useGraphStore((s) => s.deleteNode);
  const currentProject = useGraphStore((s) => s.currentProject);

  return useMutation({
    mutationFn: (id: string) => api.nodes.delete(Number(id)),
    onSuccess: (_, id) => {
      deleteNode(Number(id));
      queryClient.invalidateQueries({ queryKey: graphKeys.nodes(String(currentProject?.id)) });
    },
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();
  const addLink = useGraphStore((s) => s.addLink);

  return useMutation({
    mutationFn: (data: { sourceId: number; targetId: number; relationshipType?: string; userId?: string }) =>
      api.links.create(data),
    onSuccess: (newLink: Link) => {
      addLink(newLink);
      queryClient.invalidateQueries({ queryKey: graphKeys.links() });
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();
  const deleteLink = useGraphStore((s) => s.deleteLink);

  return useMutation({
    mutationFn: (id: string) => api.links.delete(Number(id)),
    onSuccess: (_, id) => {
      deleteLink(Number(id));
      queryClient.invalidateQueries({ queryKey: graphKeys.links() });
    },
  });
}

export function useSearchNodes(query: string) {
  return useQuery({
    queryKey: graphKeys.search(query),
    queryFn: () => api.nodes.search(query),
    enabled: query.length >= 2,
  });
}
