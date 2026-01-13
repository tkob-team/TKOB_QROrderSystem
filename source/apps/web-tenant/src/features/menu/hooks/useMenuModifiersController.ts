"use client";

import { useCreateModifier, useDeleteModifier, useModifiers, useUpdateModifier } from './queries/modifiers';

type ModifiersQueryParams = Parameters<typeof useModifiers>[0];
type CreateOptions = Parameters<typeof useCreateModifier>[0];
type UpdateOptions = Parameters<typeof useUpdateModifier>[0];
type DeleteOptions = Parameters<typeof useDeleteModifier>[0];

interface MenuModifiersControllerParams {
  query?: ModifiersQueryParams;
  createOptions?: CreateOptions;
  updateOptions?: UpdateOptions;
  deleteOptions?: DeleteOptions;
}

// Controller wrapper to keep modifier queries internal
export function useMenuModifiersController({
  query,
  createOptions,
  updateOptions,
  deleteOptions,
}: MenuModifiersControllerParams = {}) {
  const modifiersQuery = useModifiers(query);
  const createModifier = useCreateModifier(createOptions);
  const updateModifier = useUpdateModifier(updateOptions);
  const deleteModifier = useDeleteModifier(deleteOptions);

  return {
    modifiersQuery,
    createModifier,
    updateModifier,
    deleteModifier,
  };
}
