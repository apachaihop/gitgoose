import { useMutation } from "@apollo/client";
import { UPDATE_USER } from "@/lib/graphql/mutations/user";
import type { UpdateUserData, UpdateUserVariables } from "@/lib/types/mutations";

export const useUpdateUser = () => {
  return useMutation<UpdateUserData, UpdateUserVariables>(UPDATE_USER);
};