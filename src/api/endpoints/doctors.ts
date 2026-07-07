export const doctorEndpoints = {
  create: "/doctors",
  list: "/doctors",
  get: (doctorId: string) => `/doctors/${doctorId}`,
  update: (doctorId: string) => `/doctors/${doctorId}`,
  updateStatus: (doctorId: string) => `/doctors/${doctorId}/status`,
  remove: (doctorId: string) => `/doctors/${doctorId}`,
} as const;