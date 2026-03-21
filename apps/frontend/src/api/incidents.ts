import type { Incident } from '../models/incident'
import api from './client'

export type CreateIncidentPayload = {
    title: string
    description?: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    cveIds?: string[]
}

export async function listIncidents(): Promise<Incident[]> {
    return api.get<Incident[]>('/incidents').then((r) => r.data)
}

export async function createIncident(payload: CreateIncidentPayload): Promise<Incident> {
    return api.post<Incident>('/incidents', payload).then((r) => r.data)
}