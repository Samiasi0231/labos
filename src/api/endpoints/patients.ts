export const patientEndpoints = {
  create: "/patients",
  list: "/patients",
  get: (patientId: string) => `/patients/${patientId}`,
  update: (patientId: string) => `/patients/${patientId}`,
  remove: (patientId: string) => `/patients/${patientId}`,
} as const;