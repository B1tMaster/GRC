'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { TestRun } from '@/payload-types'

export const createTestRun = async (title: string) => {
  const payload = await getPayload({ config: configPromise })
  const { id } = await payload.create({
    collection: 'test-runs',
    data: {
      title,
    },
  })
  return id
}

export const updateTestRun = async (id: number, inputFileId: number, status: NonNullable<TestRun['status']>) => {
  const payload = await getPayload({ config: configPromise })
  await payload.update({
    collection: 'test-runs',
    id,
    data: {
      input: [inputFileId],
      status,
    },
  })
}

export const deleteTestRun = async (id: number): Promise<void> => {
  const payload = await getPayload({ config: configPromise })
  await payload.delete({
    collection: 'test-runs',
    id,
  })
}

export const getTestRuns = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'test-runs',
    depth: 1,
    page: 1,
    limit: 10,
    pagination: false,
  })
  return docs
}

export const getTestRunById = async (id: number) => {
  const payload = await getPayload({ config: configPromise })
  const data = await payload.findByID({
    collection: 'test-runs',
    depth: 2,
    id,
  })
  return data
}

export const createInputFile = async (title: string) => {
  const payload = await getPayload({ config: configPromise })
  const { id } = await payload.create({
    collection: 'input-files',
    data: {
      title,
    },
  })
  return id
}

export const deleteInputFile = async (id: number) => {
  const payload = await getPayload({ config: configPromise })
  await payload.delete({
    collection: 'input-files',
    id,
  })
}

export const getTestSuites = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'test-suites',
    depth: 1,
    page: 1,
    sort: 'alias',
    // TODO:
    limit: 100,
    pagination: false,
  })
  return docs
}

export const getTestCases = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'test-cases',
    depth: 1,
    page: 1,
    sort: 'id',
    // TODO:
    limit: 100,
    pagination: false,
  })
  return docs
}
