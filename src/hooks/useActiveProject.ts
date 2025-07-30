import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import browser from 'webextension-polyfill';
import { Gist } from '@/types/gist';
import { STORAGE_KEYS } from '@/services/config';

// Storage functions
async function getActiveProjectFn(): Promise<Gist | null> {
    const result = await browser.storage.local.get([STORAGE_KEYS.ACTIVE_PROJECT]);
    return result[STORAGE_KEYS.ACTIVE_PROJECT] || null;
}

async function setActiveProjectFn(project: Gist | null): Promise<Gist | null> {
    await browser.storage.local.set({ [STORAGE_KEYS.ACTIVE_PROJECT]: project });
    return project;
}

export function useActiveProject() {
    const queryClient = useQueryClient();

    const { data: activeProject, isLoading } = useQuery({
        queryKey: ['active-project'],
        queryFn: getActiveProjectFn,
    });

    const { mutate: setActiveProject, isPending: isSettingProject } = useMutation({
        mutationFn: setActiveProjectFn,
        onSuccess: (project) => {
            queryClient.setQueryData(['active-project'], project);
        },
    });

    return {
        activeProject,
        isLoading,
        setActiveProject,
        isSettingProject,
    };
} 