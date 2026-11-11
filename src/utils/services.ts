import type { ServiceOut, ServiceType } from '../api/types';

const TYPE_ORDER: ServiceType[] = ['meal', 'transfer', 'spa', 'other'];

export function groupServicesByType(services: ServiceOut[]): Array<[ServiceType, ServiceOut[]]> {
  const groups = new Map<ServiceType, ServiceOut[]>();
  for (const s of services) {
    const list = groups.get(s.type) ?? [];
    list.push(s);
    groups.set(s.type, list);
  }
  return TYPE_ORDER.filter((t) => groups.has(t)).map((t) => [t, groups.get(t)!]);
}
