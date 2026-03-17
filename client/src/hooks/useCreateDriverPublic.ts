import { trpc } from "@/lib/trpc";

export interface CreateDriverPublicInput {
  name: string;
  whatsapp: string;
  serviceType: string;
  region: string;
  vehicleModel?: string;
  vehicleColor?: string;
  plate?: string;
  capacity?: number;
  photoUrl?: string;
  notes?: string;
  area?: string;
}

export function useCreateDriverPublic() {
  return trpc.drivers.createPublic.useMutation();
}
