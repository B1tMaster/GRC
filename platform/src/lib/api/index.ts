import type { RelatedTestCases, RelatedTestSuitesResponse } from './types'

class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = new Headers({
      'Accept': 'application/json',
      credentials: 'include',
      ...options.headers as Record<string, string>,
    })

    // Only set Content-Type if it's not a FormData request
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async uploadFile(id: number, file: File, filename: string): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('filename', filename)
    
    return this.request<string>(`/input-files/${id}/upload`, {
      method: 'POST',
      body: formData,
    })
  }

  async getRelatedTestCases(id: number, choosedTestSuites: string[]): Promise<RelatedTestCases> {
    return this.request<RelatedTestCases>(`/test-runs/${id}/completions/related-test-cases`, {
      method: 'POST',
      body: JSON.stringify({ choosedTestSuites }),
    })
  }

  async getRelatedTestSuites(id: number): Promise<RelatedTestSuitesResponse> {
    return this.request<RelatedTestSuitesResponse>(`/test-runs/${id}/completions/related-test-suites`, {
      method: 'POST'
    })
  }

  async startAnalysis(id: number, choosedTestSuites: { authoritativeDocument: 'nist' | 'pci-dss', choosedTestSuitesIds: number[] }): Promise<void> {
    return this.request<void>(`/test-runs/${id}/start`, {
      method: 'POST',
      body: JSON.stringify(choosedTestSuites),
    })
  }

}

export const api = new ApiService()
